from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class User(db.Model):
    """User model"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(
        db.String(80),
        unique=True,
        nullable=False,
        index=True
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    full_name = db.Column(
        db.String(120),
        nullable=True
    )

    role = db.Column(
        db.String(50),
        nullable=False,
        default='user',
        index=True
    )

    is_active = db.Column(
        db.Boolean,
        default=True,
        index=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(
            password,
            method='pbkdf2:sha256'
        )

    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(
            self.password_hash,
            password
        )

    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<User {self.username}>'
# from app import db
# from werkzeug.security import generate_password_hash, check_password_hash
# from datetime import datetime

# class User(db.Model):
#     """User model"""
#     __tablename__ = 'users'
    
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False, index=True)
#     email = db.Column(db.String(120), unique=True, nullable=False, index=True)
#     password_hash = db.Column(db.String(255), nullable=False)
#     full_name = db.Column(db.String(120), nullable=True)
#     is_active = db.Column(db.Boolean, default=True, index=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
#     def set_password(self, password):
#         """Hash and set password"""
#         self.password_hash = generate_password_hash(
#             password, 
#             method='pbkdf2:sha256'
#         )
    
#     def check_password(self, password):
#         """Verify password against hash"""
#         return check_password_hash(self.password_hash, password)
    
#     def to_dict(self):
#         """Convert to dictionary"""
#         return {
#             'id': self.id,
#             'username': self.username,
#             'email': self.email,
#             'full_name': self.full_name,
#             'is_active': self.is_active,
#             'created_at': self.created_at.isoformat(),
#             'updated_at': self.updated_at.isoformat()
#         }
    
#     def __repr__(self):
#         return f'<User {self.username}>'