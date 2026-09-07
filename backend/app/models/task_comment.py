from app import db
from datetime import datetime


class TaskComment(db.Model):
    """Task comment model"""
    __tablename__ = 'task_comments'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    task = db.relationship('Task', foreign_keys=[task_id], backref=db.backref('comments', cascade='all, delete-orphan', lazy='dynamic'))
    user = db.relationship('User', foreign_keys=[user_id], backref='task_comments')

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'user_id': self.user_id,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
                'email': self.user.email,
            } if self.user else None,
        }
