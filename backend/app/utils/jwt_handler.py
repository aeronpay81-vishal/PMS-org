from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
from datetime import timedelta


class JWTHandler:
    """Utility class for JWT token operations"""
    
    @staticmethod
    def create_tokens(user_id, expires_in_hours=1):
        """
        Create both access and refresh tokens
        
        Args:
            user_id (int): User ID
            expires_in_hours (int): Access token expiration time
            
        Returns:
            dict: Tokens dictionary
        """
        access_token = create_access_token(
            identity=str(user_id),
            expires_delta=timedelta(hours=expires_in_hours)
        )
        
        refresh_token = create_refresh_token(identity=str(user_id))
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def create_access_token_only(user_id, expires_in_hours=1):
        """
        Create only access token
        
        Args:
            user_id (int): User ID
            expires_in_hours (int): Token expiration time
            
        Returns:
            str: Access token
        """
        return create_access_token(
            identity=str(user_id),
            expires_delta=timedelta(hours=expires_in_hours)
        )
    
    @staticmethod
    def get_current_user_id():
        """
        Get the current user ID from JWT token
        
        Returns:
            int: User ID from token
        """
        user_id_str = get_jwt_identity()
        return int(user_id_str) if user_id_str else None


def get_current_user_id():
    """Module-level helper used by route handlers."""
    return JWTHandler.get_current_user_id()
