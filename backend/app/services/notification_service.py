from app import db
from app.models import Notification, User, Task, Project


class NotificationService:
    """Service for in-app notifications"""

    @staticmethod
    def create_notification(user_id, title, message, notification_type='info', related_project_id=None, related_task_id=None):
        if not user_id:
            raise ValueError('User ID is required')
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')

        notification = Notification(
            user_id=user_id,
            title=str(title).strip(),
            message=str(message).strip(),
            notification_type=str(notification_type).strip().lower() or 'info',
            related_project_id=related_project_id,
            related_task_id=related_task_id,
        )
        db.session.add(notification)
        db.session.commit()
        return notification.to_dict()

    @staticmethod
    def get_user_notifications(user_id, unread_only=False):
        query = Notification.query.filter_by(user_id=user_id)
        if unread_only:
            query = query.filter_by(is_read=False)
        return [n.to_dict() for n in query.order_by(Notification.created_at.desc()).all()]

    @staticmethod
    def mark_as_read(notification_id, user_id):
        notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        if not notification:
            raise ValueError('Notification not found')
        notification.is_read = True
        db.session.commit()
        return notification.to_dict()

    @staticmethod
    def mark_all_as_read(user_id):
        notifications = Notification.query.filter_by(user_id=user_id, is_read=False).all()
        for item in notifications:
            item.is_read = True
        db.session.commit()
        return {'success': True, 'count': len(notifications)}

    @staticmethod
    def notify_task_assignment(task_id, assigned_user_id):
        task = Task.query.get(task_id)
        if not task:
            return None
        project = Project.query.get(task.project_id) if task.project_id else None
        title = 'New task assigned'
        message = f'You have been assigned to task: {task.summary}'
        if project:
            message = f'You have been assigned to task: {task.summary} in project {project.summary}'
        return NotificationService.create_notification(
            user_id=assigned_user_id,
            title=title,
            message=message,
            notification_type='task',
            related_project_id=task.project_id,
            related_task_id=task.id,
        )
