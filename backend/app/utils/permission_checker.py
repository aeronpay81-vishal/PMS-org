"""
Role-based Access Control utility for work organization
Ensures proper permission enforcement based on user roles in projects
"""
from app import db
from app.models import User, Project, ProjectMember, Task


class RolePermissionError(Exception):
    """Raised when user doesn't have required permission"""
    pass


class PermissionChecker:
    """Utility class for checking role-based permissions"""

    # Project-level roles and their capabilities
    ROLE_HIERARCHY = {
        'owner': {'level': 3, 'permissions': ['owner', 'manager', 'member']},
        'manager': {'level': 2, 'permissions': ['manager', 'member']},
        'member': {'level': 1, 'permissions': ['member']},
    }

    @staticmethod
    def get_user_project_role(user_id, project_id):
        """Get user's role in a specific project"""
        member = ProjectMember.query.filter_by(
            project_id=project_id,
            user_id=user_id
        ).first()
        return member.role if member else None

    @staticmethod
    def is_project_owner(user_id, project_id):
        """Check if user is project owner"""
        return PermissionChecker.get_user_project_role(user_id, project_id) == 'owner'

    @staticmethod
    def is_project_manager(user_id, project_id):
        """Check if user is project manager or owner"""
        role = PermissionChecker.get_user_project_role(user_id, project_id)
        return role in ('owner', 'manager')

    @staticmethod
    def is_project_member(user_id, project_id):
        """Check if user is any member of the project"""
        return ProjectMember.query.filter_by(
            project_id=project_id,
            user_id=user_id
        ).first() is not None

    @staticmethod
    def can_manage_project(user_id, project_id):
        """Check if user can manage project (create/update/delete)"""
        user = User.query.get(user_id)
        if not user:
            return False

        # Global manager (admin) can manage any project
        if user.role == 'manager':
            return True

        # Project owner or manager can manage
        return PermissionChecker.is_project_manager(user_id, project_id)

    @staticmethod
    def can_assign_tasks(user_id, project_id):
        """Check if user can assign tasks in project"""
        user = User.query.get(user_id)
        if not user:
            return False

        # Global manager can assign in any project
        if user.role == 'manager':
            return True

        # Project owner or manager can assign
        return PermissionChecker.is_project_manager(user_id, project_id)

    @staticmethod
    def can_manage_members(user_id, project_id):
        """Check if user can manage project members (invite/remove/change role)"""
        user = User.query.get(user_id)
        if not user:
            return False

        # Global manager can manage members in any project
        if user.role == 'manager':
            return True

        # Only project owner can manage members
        return PermissionChecker.is_project_owner(user_id, project_id)

    @staticmethod
    def can_create_task(user_id, project_id):
        """Check if user can create task in project"""
        user = User.query.get(user_id)
        if not user:
            return False

        # Global manager can create tasks in any project
        if user.role == 'manager':
            return True

        # Project owner or manager can create tasks
        return PermissionChecker.is_project_manager(user_id, project_id)

    @staticmethod
    def can_update_task(user_id, task_id):
        """Check if user can update a task"""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')

        user = User.query.get(user_id)
        if not user:
            return False

        # Global manager can update any task
        if user.role == 'manager':
            return True

        # If task is in a project
        if task.project_id:
            # Project owner/manager can update any task
            if PermissionChecker.is_project_manager(user_id, task.project_id):
                return True

        # Task creator can update their own task
        if task.user_id == user_id:
            return True

        # Task assignee can update their assigned task
        if task.assigned_to == user_id:
            return True

        return False

    @staticmethod
    def can_view_task(user_id, task_id):
        """Check if user can view a task"""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')

        user = User.query.get(user_id)
        if not user:
            return False

        # Global manager can view any task
        if user.role == 'manager':
            return True

        # If task is in a project
        if task.project_id:
            # Any project member can view all tasks in the project
            if PermissionChecker.is_project_member(user_id, task.project_id):
                return True

        # Task creator can view their own task
        if task.user_id == user_id:
            return True

        # Task assignee can view their assigned task
        if task.assigned_to == user_id:
            return True

        return False

    @staticmethod
    def can_delete_task(user_id, task_id):
        """Check if user can delete a task"""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')

        user = User.query.get(user_id)
        if not user:
            return False

        # Global manager can delete any task
        if user.role == 'manager':
            return True

        # If task is in a project
        if task.project_id:
            # Project owner/manager can delete tasks
            if PermissionChecker.is_project_manager(user_id, task.project_id):
                return True

        # Task creator can delete their own task
        if task.user_id == user_id:
            return True

        return False

    @staticmethod
    def require_permission(condition, error_message="Permission denied"):
        """Helper to raise error if permission check fails"""
        if not condition:
            raise RolePermissionError(error_message)

    @staticmethod
    def get_accessible_projects(user_id):
        """Get all projects accessible to user based on role"""
        user = User.query.get(user_id)
        if not user:
            return []

        # Global manager sees all projects
        if user.role == 'manager':
            return Project.query.order_by(Project.created_at.desc()).all()

        # Regular users see only projects they're members of
        member_project_ids = db.session.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == user_id
        ).subquery()

        return Project.query.filter(
            Project.id.in_(member_project_ids)
        ).order_by(Project.created_at.desc()).all()

    @staticmethod
    def get_accessible_tasks(user_id, project_id=None):
        """Get all tasks accessible to user based on role"""
        user = User.query.get(user_id)
        if not user:
            return []

        query = Task.query

        # If project_id filter is provided
        if project_id:
            query = query.filter(Task.project_id == project_id)

        # Global manager sees all tasks
        if user.role == 'manager':
            return query.order_by(Task.created_at.desc()).all()

        # Get all projects where user is a member
        member_project_ids = db.session.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == user_id
        ).subquery()

        # If specific project_id filter
        if project_id:
            # Verify user is member of this project
            if not PermissionChecker.is_project_member(user_id, project_id):
                return []
            # User can see all tasks in the project they're a member of
            return query.order_by(Task.created_at.desc()).all()

        # Otherwise, return tasks they're involved with
        return query.filter(
            db.or_(
                Task.project_id.in_(member_project_ids),  # Tasks in their projects
                Task.user_id == user_id,                   # Tasks they created
                Task.assigned_to == user_id                # Tasks assigned to them
            )
        ).order_by(Task.created_at.desc()).all()
