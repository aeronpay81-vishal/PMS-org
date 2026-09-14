from datetime import datetime
import json

from app import db


class Subtask(db.Model):
    """A daily deliverable belonging to a parent task."""
    __tablename__ = 'subtasks'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False, index=True)
    created_by = db.Column('user_id', db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    work_date = db.Column('date', db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default='todo')
    attachments = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    task = db.relationship('Task', back_populates='subtasks')
    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self):
        try:
            attachments = json.loads(self.attachments or '[]')
        except (TypeError, ValueError):
            attachments = []

        return {
            'id': self.id,
            'task_id': self.task_id,
            'created_by': self.created_by,
            'title': self.title,
            'description': self.description,
            'date': self.work_date.isoformat()[:10] if self.work_date else None,
            'status': self.status,
            'attachments': attachments,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
