
from app import db
from app.models import User
from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy.exc import IntegrityError
from datetime import datetime


class AuthService:
    """Service for authentication business logic"""
    
    @staticmethod
    def signup(username, email, password, full_name=None, role='user'):
        """
        Create a new user
        
        Args:
            username (str): User's username
            email (str): User's email
            password (str): User's password
            full_name (str): User's full name
            role (str): Optional user role, like 'user' or 'manager'
            
        Returns:
            dict: User data with tokens
            
        Raises:
            ValueError: If validation fails
            IntegrityError: If user already exists
        """
        # Validation
        if not username or not email or not password:
            raise ValueError('Username, email, and password are required')
        
        if len(password) < 6:
            raise ValueError('Password must be at least 6 characters long')
        
        if len(username) < 3:
            raise ValueError('Username must be at least 3 characters long')

        normalized_role = str(role or 'user').lower().strip()
        if normalized_role not in {'user', 'manager'}:
            raise ValueError('Role must be either user or manager')
        
        # Check existing user
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            if existing_user.username == username:
                raise ValueError('Username already exists')
            else:
                raise ValueError('Email already exists')
        
        try:
            # Create user
            user = User(
                username=username,
                email=email,
                full_name=full_name,
                role=normalized_role
            )
            user.set_password(password)
            
            # Save to database
            db.session.add(user)
            db.session.commit()
            
            # Generate tokens
            tokens = AuthService.generate_tokens(user.id)
            
            return {
                'user': user.to_dict(),
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token']
            }
        except IntegrityError:
            db.session.rollback()
            raise ValueError('User with this username or email already exists')
        except Exception as e:
            db.session.rollback()
            raise Exception(f'Error creating user: {str(e)}')
    
    @staticmethod
    def login(email=None, username=None, password=None):
        """
        Authenticate user and return tokens
        
        Args:
            email (str): User's email
            username (str): User's username
            password (str): User's password
            
        Returns:
            dict: User data with tokens
            
        Raises:
            ValueError: If validation fails
        """
        if not password or not (email or username):
            raise ValueError('Email/username and password are required')
        
        # Find user
        user = None
        if email:
            user = User.query.filter_by(email=email).first()
        elif username:
            user = User.query.filter_by(username=username).first()
        
        # Validate credentials
        if not user or not user.check_password(password):
            raise ValueError('Invalid email/username or password')
        
        if not user.is_active:
            raise ValueError('User account is inactive')
        
        # Generate tokens
        tokens = AuthService.generate_tokens(user.id)
        
        return {
            'user': user.to_dict(),
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token']
        }
    
    @staticmethod
    def generate_tokens(user_id):
        """
        Generate JWT tokens
        
        Args:
            user_id (int): User ID
            
        Returns:
            dict: Access and refresh tokens
        """
        access_token = create_access_token(identity=str(user_id))
        refresh_token = create_refresh_token(identity=str(user_id))
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def get_user_by_id(user_id):
        """
        Get user by ID
        
        Args:
            user_id (int): User ID
            
        Returns:
            User: User object
            
        Raises:
            ValueError: If user not found
        """
        user = User.query.get(user_id)
        
        if not user:
            raise ValueError('User not found')
        
        return user
    
    @staticmethod
    def refresh_access_token(user_id):
        """
        Create new access token
        
        Args:
            user_id (int): User ID
            
        Returns:
            dict: New access token
            
        Raises:
            ValueError: If user not found or inactive
        """
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            raise ValueError('User not found or inactive')
        
        access_token = create_access_token(identity=str(user_id))
        
        return {'access_token': access_token}

    @staticmethod
    def get_users(role=None):
        """
        Get all active users, optionally filtered by role
        
        Args:
            role (str, optional): Role to filter by ('user' or 'manager')
            
        Returns:
            list: List of User dicts
        """
        query = User.query.filter_by(is_active=True)
        if role:
            query = query.filter_by(role=role.lower().strip())
        
        users = query.order_by(User.full_name.asc(), User.username.asc()).all()
        return [user.to_dict() for user in users]