from app import db
from datetime import datetime


class Task(db.Model):
    """Task model for project management items"""
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True, index=True)
    summary = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(50), nullable=False, default='medium')
    status = db.Column(db.String(50), nullable=False, default='todo')
    labels = db.Column(db.String(255), nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    reporter = db.Column(db.String(120), nullable=True)
    attachment = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref='tasks_created')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='tasks_assigned')
    project = db.relationship('Project', foreign_keys=[project_id], backref=db.backref('tasks', cascade='all, delete-orphan', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'assigned_to': self.assigned_to,
            'project_id': self.project_id,
            'project': {
                'id': self.project.id,
                'summary': self.project.summary,
                'status': self.project.status,
            } if self.project else None,
            'assignee': {
                'id': self.assignee.id,
                'username': self.assignee.username,
                'full_name': self.assignee.full_name,
                'email': self.assignee.email,
                'role': self.assignee.role,
            } if self.assignee else None,
            'creator': {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
                'email': self.user.email,
                'role': self.user.role,
            } if self.user else None,
            'summary': self.summary,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'labels': [l.strip() for l in self.labels.split(',') if l.strip()] if self.labels else [],
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'reporter': self.reporter,
            'attachment': self.attachment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
