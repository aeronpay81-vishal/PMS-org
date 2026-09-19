from datetime import datetime

from app import db


class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(254), nullable=False, index=True)
    company = db.Column(db.String(160), nullable=True)
    subject = db.Column(db.String(40), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), nullable=False, default='pending', index=True)
    email_error = db.Column(db.Text, nullable=True)
    is_read = db.Column(db.Boolean, nullable=False, default=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'company': self.company,
            'subject': self.subject,
            'message': self.message,
            'status': self.status,
            'email_error': self.email_error,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
