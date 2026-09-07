from app import db
from datetime import datetime


class TimeEntry(db.Model):
    """Time tracking entries for tasks"""
    __tablename__ = 'time_entries'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False, index=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    started_at = db.Column(db.DateTime, nullable=False, index=True)
    ended_at = db.Column(db.DateTime, nullable=True, index=True)
    duration_minutes = db.Column(db.Integer, default=0, nullable=False)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    task = db.relationship('Task', foreign_keys=[task_id], backref=db.backref('time_entries', cascade='all, delete-orphan', lazy='dynamic'))
    project = db.relationship('Project', foreign_keys=[project_id], backref='time_entries')
    user = db.relationship('User', foreign_keys=[user_id], backref='time_entries')

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'duration_minutes': self.duration_minutes,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
            } if self.user else None,
        }
