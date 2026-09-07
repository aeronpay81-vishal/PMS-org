from app import db
from datetime import datetime


class Project(db.Model):
    """Project model for project management"""
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    summary = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(50), nullable=False, default='medium')
    status = db.Column(db.String(50), nullable=False, default='active')
    labels = db.Column(db.String(255), nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    reporter = db.Column(db.String(120), nullable=True)
    attachment = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref='projects')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='projects_assigned')
    reports = db.relationship('ProjectReport', backref='project', cascade='all, delete-orphan')
    members = db.relationship('ProjectMember', backref='project', cascade='all, delete-orphan', lazy='dynamic')
    invitations = db.relationship('ProjectInvitation', backref='project', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self):
        task_list = [t.to_dict() for t in self.tasks] if hasattr(self, 'tasks') and self.tasks else []
        members_list = [m.to_dict() for m in self.members] if self.members else []
        return {
            'id': self.id,
            'user_id': self.user_id,
            'assigned_to': self.assigned_to,
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
            'tasks': task_list,
            'members': members_list,
            'assignments': [
                {
                    'id': t['id'],
                    'assigned_to': t['assigned_to'],
                    'priority': t['priority'],
                    'status': t['status'],
                    'start_date': t['start_date'],
                    'due_date': t['due_date'],
                    'task_detail': t.get('description') or t.get('summary'),
                    'summary': t.get('summary'),
                    'assignee': t.get('assignee'),
                } for t in task_list
            ] if task_list else [],
            'task_count': len(task_list),
            'member_count': len(members_list),
        }


class ProjectMember(db.Model):
    """Project Member model — tracks who belongs to a project and their project-level role"""
    __tablename__ = 'project_members'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    # Project-level role: owner (creator), manager (can assign tasks/invite), member (can view/update assigned tasks)
    role = db.Column(db.String(50), nullable=False, default='member')
    invited_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', foreign_keys=[user_id], backref='project_memberships')
    inviter = db.relationship('User', foreign_keys=[invited_by], backref='sent_memberships')

    # Unique constraint: one user can only be a member of a project once
    __table_args__ = (
        db.UniqueConstraint('project_id', 'user_id', name='uq_project_member'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'role': self.role,
            'invited_by': self.invited_by,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
                'email': self.user.email,
            } if self.user else None,
            'inviter': {
                'id': self.inviter.id,
                'username': self.inviter.username,
                'full_name': self.inviter.full_name,
                'email': self.inviter.email,
            } if self.inviter else None,
        }


class ProjectInvitation(db.Model):
    """Project Invitation model — email-based invite system with UUID token"""
    __tablename__ = 'project_invitations'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, index=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=True, index=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    token = db.Column(db.String(100), nullable=False, unique=True, index=True)
    role = db.Column(db.String(50), nullable=False, default='member')
    # Status: pending, accepted, revoked, expired
    status = db.Column(db.String(50), nullable=False, default='pending', index=True)
    invited_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    accepted_at = db.Column(db.DateTime, nullable=True)

    inviter = db.relationship('User', foreign_keys=[invited_by], backref='sent_invitations')
    task = db.relationship('Task', foreign_keys=[task_id], backref='invitations')

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'task_id': self.task_id,
            'email': self.email,
            'token': self.token,
            'role': self.role,
            'status': self.status if not self.is_expired() else 'expired',
            'invited_by': self.invited_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'inviter': {
                'id': self.inviter.id,
                'username': self.inviter.username,
                'full_name': self.inviter.full_name,
                'email': self.inviter.email,
            } if self.inviter else None,
        }


class ProjectReport(db.Model):
    """Project Report model for tracking project reporting with files"""
    __tablename__ = 'project_reports'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=True)
    file_path = db.Column(db.String(255), nullable=True)
    file_name = db.Column(db.String(255), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'content': self.content,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
