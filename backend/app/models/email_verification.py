from app import db
from datetime import datetime

class EmailVerification(db.Model):
    """
    Model for storing OTP codes, secret keys, and verification status for Email Login/Signup.
    """
    __tablename__ = 'email_verifications'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    otp_code = db.Column(db.String(10), nullable=False)
    secret_key = db.Column(db.String(64), nullable=False)
    purpose = db.Column(db.String(50), nullable=False, default='login')
    attempts = db.Column(db.Integer, nullable=False, default=0)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'purpose': self.purpose,
            'attempts': self.attempts,
            'is_verified': self.is_verified,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<EmailVerification {self.email} - {self.purpose} - Verified: {self.is_verified}>'
