from app import db
from datetime import datetime


class Notification(db.Model):
    """User notification model"""
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(80), nullable=False, default='info', index=True)
    related_project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True, index=True)
    related_task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=True, index=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = db.relationship('User', foreign_keys=[user_id], backref='notifications')
    project = db.relationship('Project', foreign_keys=[related_project_id], backref='notifications')
    task = db.relationship('Task', foreign_keys=[related_task_id], backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.notification_type,
            'related_project_id': self.related_project_id,
            'related_task_id': self.related_task_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
