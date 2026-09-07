
from flask import request
from app.services import AuthService


class AuthController:
    """Controller for authentication endpoints"""
    
    @staticmethod
    def signup():
        """
        Handle user signup
        
        Returns:
            tuple: (response_dict, status_code)
        """
        try:
            data = request.get_json()
            
            if not data:
                return {
                    'success': False,
                    'message': 'No data provided'
                }, 400
            
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            full_name = data.get('full_name', '')
            role = data.get('role', 'user')
            
            # Call service
            result = AuthService.signup(
                username=username,
                email=email,
                password=password,
                full_name=full_name,
                role=role
            )
            
            return {
                'success': True,
                'message': 'User created successfully',
                'data': result
            }, 201
            
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }, 400
        except Exception as e:
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }, 500
    
    @staticmethod
    def login():
        """
        Handle user login
        
        Returns:
            tuple: (response_dict, status_code)
        """
        try:
            data = request.get_json()
            
            if not data:
                return {
                    'success': False,
                    'message': 'No data provided'
                }, 400
            
            password = data.get('password')
            email = data.get('email')
            username = data.get('username')
            
            # Call service
            result = AuthService.login(
                email=email,
                username=username,
                password=password
            )
            
            return {
                'success': True,
                'message': 'Login successful',
                'data': result
            }, 200
            
        except ValueError as e:
            # Don't expose whether user exists or not
            return {
                'success': False,
                'message': 'Invalid credentials'
            }, 401
        except Exception as e:
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }, 500
    
    @staticmethod
    def refresh(current_user_id):
        """
        Handle token refresh
        
        Args:
            current_user_id (int): Current user ID from JWT
            
        Returns:
            tuple: (response_dict, status_code)
        """
        try:
            result = AuthService.refresh_access_token(current_user_id)
            
            return {
                'success': True,
                'message': 'Token refreshed successfully',
                'data': result
            }, 200
            
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }, 401
        except Exception as e:
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }, 500
    
    @staticmethod
    def get_current_user(current_user_id):
        """
        Get current user info
        
        Args:
            current_user_id (int): Current user ID from JWT
            
        Returns:
            tuple: (response_dict, status_code)
        """
        try:
            user = AuthService.get_user_by_id(current_user_id)
            
            return {
                'success': True,
                'data': {
                    'user': user.to_dict()
                }
            }, 200
            
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }, 404
        except Exception as e:
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }, 500
    
    @staticmethod
    def logout():
        """
        Handle user logout
        
        Returns:
            tuple: (response_dict, status_code)
        """
        return {
            'success': True,
            'message': 'Logged out successfully'
        }, 200

    @staticmethod
    def get_users():
        """
        Get all active users optionally filtered by role query param
        
        Returns:
            tuple: (response_dict, status_code)
        """
        try:
            role = request.args.get('role')
            users = AuthService.get_users(role=role)
            return {
                'success': True,
                'data': users
            }, 200
        except Exception as e:
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }, 500