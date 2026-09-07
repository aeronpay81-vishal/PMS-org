from app import db
from datetime import datetime


class TaskActivity(db.Model):
    """Activity log for task changes and actions"""
    __tablename__ = 'task_activity'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False, index=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    action = db.Column(db.String(120), nullable=False, index=True)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    task = db.relationship('Task', foreign_keys=[task_id], backref=db.backref('activity_logs', cascade='all, delete-orphan', lazy='dynamic'))
    project = db.relationship('Project', foreign_keys=[project_id], backref='task_activity')
    user = db.relationship('User', foreign_keys=[user_id], backref='task_activity')

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'action': self.action,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
            } if self.user else None,
        }
