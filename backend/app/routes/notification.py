from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.notification_controller import NotificationController
from app.utils.jwt_handler import get_current_user_id

notification_bp = Blueprint('notifications', __name__)


@notification_bp.route('', methods=['GET'])
@jwt_required()
def list_notifications():
    current_user_id = get_current_user_id()
    response, status_code = NotificationController.get_notifications(current_user_id)
    return jsonify(response), status_code


@notification_bp.route('/<int:notification_id>/read', methods=['PATCH'])
@jwt_required()
def mark_read(notification_id):
    current_user_id = get_current_user_id()
    response, status_code = NotificationController.mark_as_read(current_user_id, notification_id)
    return jsonify(response), status_code


@notification_bp.route('/read-all', methods=['PATCH'])
@jwt_required()
def mark_all_read():
    current_user_id = get_current_user_id()
    response, status_code = NotificationController.mark_all_as_read(current_user_id)
    return jsonify(response), status_code
