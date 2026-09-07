from app import db
from app.models import Task, TaskComment
from app.utils.permission_checker import PermissionChecker


class TaskCommentService:
    """Service for task comments"""

    @staticmethod
    def get_task_comments(task_id):
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')
        comments = TaskComment.query.filter_by(task_id=task_id).order_by(TaskComment.created_at.asc()).all()
        return [c.to_dict() for c in comments]

    @staticmethod
    def create_comment(user_id, task_id, comment):
        task = Task.query.get(task_id)
        if not task:
            raise ValueError('Task not found')
        if not PermissionChecker.can_view_task(user_id, task_id):
            raise ValueError('You do not have permission to comment on this task')

        text = str(comment or '').strip()
        if not text:
            raise ValueError('Comment text is required')

        task_comment = TaskComment(
            task_id=task_id,
            user_id=user_id,
            comment=text,
        )
        db.session.add(task_comment)
        db.session.commit()
        return task_comment.to_dict()
