from app import db
from app.models import Task, User, Project, ProjectMember
from app.utils.permission_checker import PermissionChecker, RolePermissionError
from datetime import datetime


class TaskService:
    """Service for task business logic"""

    ALLOWED_PRIORITIES = {'low', 'medium', 'high', 'critical'}
    ALLOWED_STATUS = {'backlog', 'todo', 'in_progress', 'review', 'testing', 'done'}

    @staticmethod
    def _validate_assignment(user_id, assigned_to, project_id=None):
        """Validate task assignment with project-member-aware permission check."""
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        if assigned_to is None or assigned_to == '':
            return None

        try:
            assigned_to_id = int(assigned_to)
        except (ValueError, TypeError):
            raise ValueError('Invalid assigned_to user ID')

        assigned_user = User.query.get(assigned_to_id)
        if not assigned_user:
            raise ValueError('Assigned user not found')

        if project_id:
            project_member = ProjectMember.query.filter_by(
                project_id=project_id,
                user_id=assigned_to_id
            ).first()
            if not project_member:
                raise ValueError('Assigned user must accept the project invitation first')

        # Global manager can always assign
        if current_user.role == 'manager':
            return assigned_user.id

        # Project-level: owner or manager can assign to others
        if project_id:
            requester_member = ProjectMember.query.filter_by(
                project_id=project_id, user_id=user_id
            ).first()
            if requester_member and requester_member.role in ('owner', 'manager'):
                return assigned_user.id

        # Otherwise, user can only assign to themselves
        if assigned_to_id != user_id:
            raise ValueError('Only project owners or managers can assign tasks to other users')

        return assigned_user.id

    @staticmethod
    def _validate_project(project_id):
        if project_id is None or project_id == '':
            return None
        try:
            p_id = int(project_id)
        except (ValueError, TypeError):
            raise ValueError('Invalid project ID')

        project = Project.query.get(p_id)
        if not project:
            raise ValueError('Associated project not found')
        return project.id

    @staticmethod
    def create_task(user_id, data):
        """Create a new task — only managers/owners can create tasks in projects"""
        summary = data.get('summary')
        if not summary or not str(summary).strip():
            raise ValueError('Task summary is required')

        priority = str(data.get('priority', 'medium')).strip().lower()
        status = str(data.get('status', 'todo')).strip().lower()
        labels = data.get('labels')
        description = data.get('description')
        reporter = data.get('reporter')
        attachment = data.get('attachment')
        due_date = TaskService._parse_date(data.get('due_date'))
        start_date = TaskService._parse_date(data.get('start_date'))
        assigned_to = data.get('assigned_to')
        project_id = data.get('project_id')

        if priority not in TaskService.ALLOWED_PRIORITIES:
            raise ValueError('Priority must be one of low, medium, high, critical')

        if status not in TaskService.ALLOWED_STATUS:
            raise ValueError('Status must be one of todo, in_progress, done')

        if isinstance(labels, list):
            labels = ','.join([str(label).strip() for label in labels if label is not None])
        elif labels is not None:
            labels = str(labels).strip()

        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        # Validate project ID if provided
        project_id = TaskService._validate_project(project_id)

        # Permission check: Only managers/owners can create tasks in a project
        if project_id:
            if not PermissionChecker.can_create_task(user_id, project_id):
                raise RolePermissionError('Only project owners or managers can create tasks in this project')

        assigned_to = TaskService._validate_assignment(user_id, assigned_to, project_id=project_id)

        task = Task(
            user_id=user_id,
            assigned_to=assigned_to,
            project_id=project_id,
            summary=str(summary).strip(),
            description=description,
            priority=priority,
            status=status,
            labels=labels,
            due_date=due_date,
            start_date=start_date,
            reporter=reporter,
            attachment=attachment
        )

        db.session.add(task)
        db.session.commit()

        return task.to_dict()

    @staticmethod
    def get_tasks(user_id, project_id=None):
        current_user = User.query.get(user_id)
        if not current_user:
            return []

        query = Task.query

        # If project_id filter is provided
        if project_id:
            try:
                p_id = int(project_id)
                query = query.filter(Task.project_id == p_id)
            except (ValueError, TypeError):
                pass

        if current_user.role == 'manager':
            # Global manager sees all tasks
            tasks = query.order_by(Task.created_at.desc()).all()
        else:
            # All project_ids where user is any kind of member
            all_member_project_ids = db.session.query(ProjectMember.project_id).filter(
                ProjectMember.user_id == user_id
            ).subquery()

            if project_id:
                try:
                    p_id = int(project_id)
                    member = ProjectMember.query.filter_by(project_id=p_id, user_id=user_id).first()
                    if member:
                        # Member of this project: see all tasks in it
                        tasks = query.order_by(Task.created_at.desc()).all()
                    else:
                        tasks = query.filter(
                            (Task.user_id == user_id) | (Task.assigned_to == user_id)
                        ).order_by(Task.created_at.desc()).all()
                except (ValueError, TypeError):
                    tasks = query.filter(
                        (Task.user_id == user_id) | (Task.assigned_to == user_id)
                    ).order_by(Task.created_at.desc()).all()
            else:
                # No filter: show tasks in all joined projects + personally assigned tasks
                tasks = query.filter(
                    (Task.user_id == user_id) | (Task.assigned_to == user_id) |
                    Task.project_id.in_(all_member_project_ids)
                ).order_by(Task.created_at.desc()).all()

        return [task.to_dict() for task in tasks]

    @staticmethod
    def get_task_by_id(user_id, task_id):
        """Get a task by ID with permission checks"""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')

        # Check if user has permission to view this task
        if not PermissionChecker.can_view_task(user_id, task_id):
            raise ValueError('Task not found')

        return task.to_dict()

    @staticmethod
    def update_task(user_id, task_id, data):
        """Update a task with proper permission checks"""
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')

        # Check if user has permission to update this task
        if not PermissionChecker.can_update_task(user_id, task_id):
            raise RolePermissionError('You do not have permission to update this task')

        # Determine what fields the user can update
        is_creator = task.user_id == user_id
        is_assignee = task.assigned_to == user_id
        is_manager = PermissionChecker.is_project_manager(user_id, task.project_id) if task.project_id else False
        can_manage_full_task = current_user.role == 'manager' or is_creator or is_manager

        # Restricted fields that only managers/creators can update
        restricted_fields = {'summary', 'priority', 'project_id', 'assigned_to', 'due_date', 'start_date', 'labels', 'reporter', 'attachment'}

        # Check if member is trying to update restricted fields
        if not can_manage_full_task:
            invalid_fields = [field for field in data.keys() if field in restricted_fields]
            if invalid_fields:
                raise ValueError(f'You can only update task status and description. Cannot modify: {", ".join(invalid_fields)}')

        # Update fields
        if 'summary' in data:
            if can_manage_full_task:
                task.summary = str(data.get('summary') or task.summary).strip()

        if 'description' in data:
            task.description = data.get('description')

        if 'priority' in data and can_manage_full_task:
            priority = str(data.get('priority', task.priority)).strip().lower()
            if priority not in TaskService.ALLOWED_PRIORITIES:
                raise ValueError('Priority must be one of low, medium, high, critical')
            task.priority = priority

        if 'status' in data:
            status = str(data.get('status', task.status)).strip().lower()
            if status not in TaskService.ALLOWED_STATUS:
                raise ValueError('Status must be one of backlog, todo, in_progress, review, testing, done')
            task.status = status

        if 'labels' in data and can_manage_full_task:
            labels = data.get('labels')
            if isinstance(labels, list):
                task.labels = ','.join([str(label).strip() for label in labels if label is not None])
            else:
                task.labels = str(labels).strip() if labels is not None else None

        if 'due_date' in data and can_manage_full_task:
            task.due_date = TaskService._parse_date(data.get('due_date'))

        if 'start_date' in data and can_manage_full_task:
            task.start_date = TaskService._parse_date(data.get('start_date'))

        if 'reporter' in data and can_manage_full_task:
            task.reporter = data.get('reporter')

        if 'attachment' in data and can_manage_full_task:
            task.attachment = data.get('attachment')

        if 'assigned_to' in data and can_manage_full_task:
            task.assigned_to = TaskService._validate_assignment(
                user_id, data.get('assigned_to'), project_id=task.project_id
            )

        if 'project_id' in data and can_manage_full_task:
            task.project_id = TaskService._validate_project(data.get('project_id'))

        task.updated_at = datetime.utcnow()
        db.session.commit()
        return task.to_dict()

    @staticmethod
    def delete_task(user_id, task_id):
        """Delete a task with permission checks"""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')

        # Check if user has permission to delete this task
        if not PermissionChecker.can_delete_task(user_id, task_id):
            raise RolePermissionError('You do not have permission to delete this task')

        db.session.delete(task)
        db.session.commit()

        return {
            'success': True,
            'message': 'Task deleted successfully'
        }

    @staticmethod
    def _parse_date(value):
        if value is None or value == '':
            return None
        if isinstance(value, datetime):
            return value

        try:
            str_val = str(value).strip()
            if str_val.endswith('Z'):
                str_val = str_val[:-1]
            if '.' in str_val:
                str_val = str_val.split('.')[0]
            return datetime.fromisoformat(str_val)
        except Exception:
            try:
                return datetime.strptime(str_val[:10], '%Y-%m-%d')
            except Exception:
                raise ValueError('Date must be a valid date format, e.g. YYYY-MM-DD or ISO 8601')