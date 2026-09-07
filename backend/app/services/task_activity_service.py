from app import db
from app.models import Task, TaskActivity


class TaskActivityService:
    """Service for task activity logs"""

    @staticmethod
    def log_activity(task_id, user_id, action, details=None):
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')
        if task.project_id is None:
            raise ValueError('Task is not associated to a project')

        activity = TaskActivity(
            task_id=task_id,
            project_id=task.project_id,
            user_id=user_id,
            action=str(action).strip(),
            details=str(details).strip() if details is not None else None,
        )
        db.session.add(activity)
        db.session.commit()
        return activity.to_dict()

    @staticmethod
    def get_task_activity(task_id):
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')
        activities = TaskActivity.query.filter_by(task_id=task_id).order_by(TaskActivity.created_at.desc()).all()
        return [a.to_dict() for a in activities]

    @staticmethod
    def get_project_activity(project_id):
        activities = TaskActivity.query.filter_by(project_id=project_id).order_by(TaskActivity.created_at.desc()).all()
        return [a.to_dict() for a in activities]
