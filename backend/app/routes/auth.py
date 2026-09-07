

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers import AuthController
from app.utils.jwt_handler import get_current_user_id

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
@auth_bp.route('/register', methods=['POST'])
def signup():
    """
    User signup endpoint
    
    POST /api/auth/signup
    POST /api/auth/register
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "password123",
        "full_name": "John Doe"
    }
    """
    response, status_code = AuthController.signup()
    return jsonify(response), status_code


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    
    POST /api/auth/login
    {
        "email": "john@example.com",
        "password": "password123"
    }
    """
    response, status_code = AuthController.login()
    return jsonify(response), status_code


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token
    
    POST /api/auth/refresh
    Headers: Authorization: Bearer <refresh_token>
    """
    current_user_id = get_current_user_id()
    response, status_code = AuthController.refresh(current_user_id)
    return jsonify(response), status_code


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """
    Get current user info
    
    GET /api/auth/me
    Headers: Authorization: Bearer <access_token>
    """
    current_user_id = get_current_user_id()
    response, status_code = AuthController.get_current_user(current_user_id)
    return jsonify(response), status_code


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user
    
    POST /api/auth/logout
    Headers: Authorization: Bearer <access_token>
    """
    response, status_code = AuthController.logout()
    return jsonify(response), status_code


@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """
    Get all active users (supports ?role=user or ?role=manager)
    
    GET /api/auth/users
    Headers: Authorization: Bearer <access_token>
    """
    response, status_code = AuthController.get_users()
    return jsonify(response), status_code


