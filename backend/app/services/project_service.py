"""
Project Service - Handles all project business logic with role-based access control
"""
from app import db
from app.models import Project, ProjectMember, User, Task, ProjectInvitation
from app.utils.permission_checker import PermissionChecker, RolePermissionError
from app.services.task_service import TaskService
from datetime import datetime
import json
import os
from werkzeug.utils import secure_filename


class ProjectService:
    """Service for project business logic with role-based access control"""

    ALLOWED_PRIORITIES = {'low', 'medium', 'high', 'critical'}
    ALLOWED_STATUS = {'open', 'in_progress', 'review', 'closed', 'cancelled', 'active', 'on_hold', 'completed'}
    UPLOAD_FOLDER = 'instance/uploads/projects'
    ALLOWED_EXTENSIONS = {'pdf'}

    @staticmethod
    def _allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ProjectService.ALLOWED_EXTENSIONS

    @staticmethod
    def _save_file(file, project_id):
        """Save uploaded file and return filename"""
        if not file or file.filename == '':
            return None

        if not ProjectService._allowed_file(file.filename):
            raise ValueError('Only PDF files are allowed')

        # Create upload folder if it doesn't exist
        os.makedirs(ProjectService.UPLOAD_FOLDER, exist_ok=True)

        # Generate secure filename
        filename = secure_filename(file.filename)
        filename = f"project_{project_id}_{filename}"
        filepath = os.path.join(ProjectService.UPLOAD_FOLDER, filename)

        # Save file
        file.save(filepath)
        return filename

    @staticmethod
    def _parse_date(value):
        """Parse date string to datetime object"""
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

    @staticmethod
    def create_project(user_id, data, file=None):
        """Create a new project — any authenticated user can create"""
        summary = data.get('summary')
        if not summary:
            raise ValueError('Project summary is required')

        priority = str(data.get('priority', 'medium')).strip().lower()
        status = str(data.get('status', 'active')).strip().lower()
        labels = data.get('labels')
        description = data.get('description')
        reporter = data.get('reporter')
        due_date = ProjectService._parse_date(data.get('due_date'))
        start_date = ProjectService._parse_date(data.get('start_date'))
        assigned_to_raw = data.get('assigned_to')

        # Parse assignments list if passed as string (from FormData)
        assignments = data.get('assignments')
        if isinstance(assignments, str):
            try:
                assignments = json.loads(assignments)
            except Exception:
                assignments = []

        # If assignments provided, pick values from first assignment if top-level fields are omitted
        if isinstance(assignments, list) and len(assignments) > 0:
            first_a = assignments[0]
            if not assigned_to_raw and first_a.get('assigned_to'):
                assigned_to_raw = first_a.get('assigned_to')
            if not data.get('priority') and first_a.get('priority'):
                priority = str(first_a.get('priority')).strip().lower()
            if not data.get('status') and first_a.get('status'):
                status = str(first_a.get('status')).strip().lower()
            if not start_date and first_a.get('start_date'):
                start_date = ProjectService._parse_date(first_a.get('start_date'))
            if not due_date and first_a.get('due_date'):
                due_date = ProjectService._parse_date(first_a.get('due_date'))

        if priority not in ProjectService.ALLOWED_PRIORITIES:
            raise ValueError('Priority must be one of low, medium, high, critical')

        if status not in ProjectService.ALLOWED_STATUS:
            raise ValueError('Status must be one of open, in_progress, review, closed, cancelled, active, on_hold, completed')

        if isinstance(labels, list):
            labels = ','.join([str(label).strip() for label in labels if label is not None])
        elif labels is not None:
            labels = str(labels).strip()

        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        assigned_to = None
        if assigned_to_raw is not None and str(assigned_to_raw).strip() != '' and str(assigned_to_raw).strip() != '0':
            try:
                assigned_user_id = int(assigned_to_raw)
                assigned_user = User.query.get(assigned_user_id)
                if not assigned_user:
                    raise ValueError('Assigned user not found')
                assigned_to = assigned_user.id
            except (ValueError, TypeError) as e:
                if 'Assigned user not found' in str(e):
                    raise
                pass

        # Create the project
        project = Project(
            user_id=user_id,
            assigned_to=assigned_to,
            summary=str(summary).strip(),
            description=description,
            priority=priority,
            status=status,
            labels=labels,
            due_date=due_date,
            start_date=start_date,
            reporter=reporter or current_user.full_name or current_user.username,
            attachment=None,
        )

        db.session.add(project)
        db.session.flush()

        # Auto-add creator as project owner in ProjectMember table
        owner_member = ProjectMember(
            project_id=project.id,
            user_id=user_id,
            role='owner',
            invited_by=None,
        )
        db.session.add(owner_member)

        # Handle file upload if provided
        if file:
            try:
                attachment_filename = ProjectService._save_file(file, project.id)
                project.attachment = attachment_filename
            except Exception as e:
                db.session.rollback()
                raise ValueError(f'File upload failed: {str(e)}')

        # Create Task records for each task assignment
        if isinstance(assignments, list) and len(assignments) > 0:
            for idx, a in enumerate(assignments):
                if not isinstance(a, dict):
                    continue

                a_user_id = a.get('assigned_to')
                assigned_email = str(a.get('assigned_email') or '').strip().lower()
                if not a_user_id and assigned_email:
                    assigned_by_email = User.query.filter_by(email=assigned_email).first()
                    a_user_id = assigned_by_email.id if assigned_by_email else None
                try:
                    a_user_id = int(a_user_id) if a_user_id else None
                except (ValueError, TypeError):
                    a_user_id = None

                task_detail = a.get('task_detail')
                task_summary = (
                    task_detail.strip()
                    if task_detail and task_detail.strip()
                    else f"Task {idx + 1}: {project.summary}"
                )

                task_priority = str(a.get('priority') or priority or 'medium').strip().lower()
                if task_priority not in TaskService.ALLOWED_PRIORITIES:
                    task_priority = 'medium'

                task_status = str(a.get('status') or 'todo').strip().lower()
                if task_status in {'open', 'active'}:
                    task_status = 'todo'
                elif task_status in {'closed', 'completed'}:
                    task_status = 'done'
                elif task_status in {'review', 'in_review'}:
                    task_status = 'in_progress'
                elif task_status not in TaskService.ALLOWED_STATUS:
                    task_status = 'todo'

                task_start = ProjectService._parse_date(a.get('start_date')) or start_date
                task_due = ProjectService._parse_date(a.get('due_date')) or due_date

                # Creator is already a member (owner), other assignees must be invited
                is_member = False
                assigned_user = None
                if a_user_id:
                    assigned_user = User.query.get(a_user_id)
                    if assigned_user:
                        is_member = (a_user_id == user_id)

                task = Task(
                    user_id=user_id,
                    assigned_to=a_user_id if is_member else None,
                    project_id=project.id,
                    summary=task_summary,
                    description=task_detail or description,
                    priority=task_priority,
                    status=task_status,
                    labels=labels,
                    due_date=task_due,
                    start_date=task_start,
                    reporter=project.reporter
                )
                db.session.add(task)

                # Invite non-member assignees to join the project
                if a_user_id and assigned_user and not is_member:
                    db.session.flush()
                    try:
                        from app.services.invitation_service import InvitationService
                        # Check if a pending invitation already exists
                        existing_inv = ProjectInvitation.query.filter_by(
                            project_id=project.id,
                            email=assigned_user.email,
                            task_id=task.id,
                            status='pending'
                        ).first()
                        if not (existing_inv and not existing_inv.is_expired()):
                            InvitationService.send_invitation(
                                inviter_user_id=user_id,
                                project_id=project.id,
                                email=assigned_user.email,
                                role=str(a.get('role') or 'member').strip().lower(),
                                task_id=task.id
                            )
                    except Exception as e:
                        print(f"Failed to send task invitation to {assigned_user.email}: {e}")

        db.session.commit()
        return project.to_dict()

    @staticmethod
    def get_projects(user_id):
        """Get all projects accessible to the user"""
        projects = PermissionChecker.get_accessible_projects(user_id)
        result = []
        for project in projects:
            project_dict = project.to_dict()
            membership = ProjectMember.query.filter_by(
                project_id=project.id,
                user_id=user_id
            ).first()
            project_dict['my_role'] = membership.role if membership else None
            result.append(project_dict)
        return result

    @staticmethod
    def get_project_by_id(user_id, project_id):
        """Get a specific project by ID"""
        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        # Check if user has access to this project
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        # Global managers can see all projects
        if current_user.role != 'manager':
            # Non-managers must be members of the project
            if not PermissionChecker.is_project_member(user_id, project_id):
                raise ValueError('Project not found')

        project_dict = project.to_dict()
        project_dict['reports'] = [report.to_dict() for report in project.reports]
        # Include user's role in this project
        member = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
        project_dict['my_role'] = member.role if member else None
        return project_dict

    @staticmethod
    def update_project(user_id, project_id, data, file=None):
        """Update a project; members may change only status and description."""
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        is_project_manager = PermissionChecker.can_manage_project(user_id, project_id)
        is_project_member = PermissionChecker.is_project_member(user_id, project_id)
        if not is_project_manager and not is_project_member:
            raise RolePermissionError('You must be a member of this project to update it')
        if not is_project_manager:
            restricted_fields = set(data) - {'status', 'description'}
            if restricted_fields:
                raise RolePermissionError('Members can only update project status and description')

        # Update fields if provided
        if 'summary' in data:
            project.summary = str(data['summary']).strip()
        if 'description' in data:
            project.description = data['description']
        if 'priority' in data:
            priority = str(data['priority']).strip().lower()
            if priority not in ProjectService.ALLOWED_PRIORITIES:
                raise ValueError('Priority must be one of low, medium, high, critical')
            project.priority = priority
        if 'status' in data:
            status = str(data['status']).strip().lower()
            if status not in ProjectService.ALLOWED_STATUS:
                raise ValueError('Status must be one of open, in_progress, review, closed, cancelled, active, on_hold, completed')
            project.status = status
        if 'labels' in data:
            labels = data['labels']
            if isinstance(labels, list):
                project.labels = ','.join([str(label).strip() for label in labels if label is not None])
            else:
                project.labels = str(labels).strip() if labels is not None else None
        if 'due_date' in data:
            project.due_date = ProjectService._parse_date(data['due_date'])
        if 'start_date' in data:
            project.start_date = ProjectService._parse_date(data['start_date'])
        if 'reporter' in data:
            project.reporter = data['reporter']

        # Handle file upload if provided
        if file:
            try:
                attachment_filename = ProjectService._save_file(file, project.id)
                project.attachment = attachment_filename
            except Exception as e:
                db.session.rollback()
                raise ValueError(f'File upload failed: {str(e)}')

        project.updated_at = datetime.utcnow()
        db.session.commit()
        return project.to_dict()

    @staticmethod
    def delete_project(user_id, project_id):
        """Delete a project — only owner can delete"""
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        # Check project-level role: only owner can delete
        if not PermissionChecker.is_project_owner(user_id, project_id):
            if current_user.role != 'manager':  # global manager fallback
                raise RolePermissionError('Only the project owner can delete this project')

        if project.attachment:
            file_path = os.path.join(ProjectService.UPLOAD_FOLDER, project.attachment)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass

        db.session.delete(project)
        db.session.commit()
        return True

    @staticmethod
    def get_members(user_id, project_id):
        """Get all members of a project"""
        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        # Check if user is a member of this project
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        # Allow project members and global managers to view members
        if current_user.role != 'manager' and not PermissionChecker.is_project_member(user_id, project_id):
            raise ValueError('You are not a member of this project')

        members = ProjectMember.query.filter_by(project_id=project_id).all()
        return [m.to_dict() for m in members]

    @staticmethod
    def update_member_role(user_id, project_id, target_user_id, new_role):
        """Update a member's project role — only owner can do this"""
        new_role = str(new_role).strip().lower()
        if new_role not in ('owner', 'manager', 'member'):
            raise ValueError('Role must be owner, manager, or member')

        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        # Only owner can change member roles
        if not PermissionChecker.can_manage_members(user_id, project_id):
            raise RolePermissionError('Only the project owner can change member roles')

        member = ProjectMember.query.filter_by(project_id=project_id, user_id=target_user_id).first()
        if not member:
            raise ValueError('User is not a member of this project')

        member.role = new_role
        db.session.commit()
        return member.to_dict()

    @staticmethod
    def remove_member(user_id, project_id, target_user_id):
        """Remove a member from a project — only owner can do this"""
        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        # Only owner can remove members
        if not PermissionChecker.can_manage_members(user_id, project_id):
            raise RolePermissionError('Only the project owner can remove members')

        # Cannot remove the project owner
        if PermissionChecker.is_project_owner(target_user_id, project_id):
            raise ValueError('Cannot remove the project owner')

        member = ProjectMember.query.filter_by(project_id=project_id, user_id=target_user_id).first()
        if not member:
            raise ValueError('User is not a member of this project')

        db.session.delete(member)
        db.session.commit()
        return {'success': True, 'message': 'Member removed successfully'}

    @staticmethod
    def create_report(user_id, project_id, data, file=None):
        """Create a project report — any project member can create"""
        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        # Check if user is member of this project
        if not PermissionChecker.is_project_member(user_id, project_id):
            current_user = User.query.get(user_id)
            if not current_user or current_user.role != 'manager':
                raise ValueError('You are not a member of this project')

        # Import the ProjectReport model
        from app.models import ProjectReport
        
        title = data.get('title')
        if not title:
            raise ValueError('Report title is required')

        report = ProjectReport(
            project_id=project_id,
            user_id=user_id,
            title=title,
            content=data.get('content'),
            file_path=None
        )

        # Handle file upload if provided
        if file:
            try:
                filename = secure_filename(file.filename)
                os.makedirs('instance/uploads/reports', exist_ok=True)
                filepath = f"instance/uploads/reports/report_{project_id}_{filename}"
                file.save(filepath)
                report.file_path = filepath
            except Exception as e:
                raise ValueError(f'File upload failed: {str(e)}')

        db.session.add(report)
        db.session.commit()
        return report.to_dict()

    @staticmethod
    def get_reports(user_id, project_id):
        """Get all reports for a project"""
        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        # Check if user is member of this project
        if not PermissionChecker.is_project_member(user_id, project_id):
            current_user = User.query.get(user_id)
            if not current_user or current_user.role != 'manager':
                raise ValueError('You are not a member of this project')

        from app.models import ProjectReport
        reports = ProjectReport.query.filter_by(project_id=project_id).order_by(ProjectReport.created_at.desc()).all()
        return [report.to_dict() for report in reports]

    @staticmethod
    def get_report(user_id, project_id, report_id):
        """Get a specific report"""
        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        # Check if user is member of this project
        if not PermissionChecker.is_project_member(user_id, project_id):
            current_user = User.query.get(user_id)
            if not current_user or current_user.role != 'manager':
                raise ValueError('You are not a member of this project')

        from app.models import ProjectReport
        report = ProjectReport.query.filter_by(id=report_id, project_id=project_id).first()
        if not report:
            raise ValueError('Report not found')

        return report.to_dict()

    @staticmethod
    def delete_report(user_id, project_id, report_id):
        """Delete a report — only creator or project owner can delete"""
        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')

        from app.models import ProjectReport
        report = ProjectReport.query.filter_by(id=report_id, project_id=project_id).first()
        if not report:
            raise ValueError('Report not found')

        # Only creator or project owner can delete
        is_creator = report.user_id == user_id
        is_owner = PermissionChecker.is_project_owner(user_id, project_id)
        current_user = User.query.get(user_id)

        if not (is_creator or is_owner or (current_user and current_user.role == 'manager')):
            raise RolePermissionError('You do not have permission to delete this report')

        if report.file_path and os.path.exists(report.file_path):
            try:
                os.remove(report.file_path)
            except Exception:
                pass

        db.session.delete(report)
        db.session.commit()
        return {'success': True, 'message': 'Report deleted successfully'}
