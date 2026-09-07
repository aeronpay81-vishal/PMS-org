from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.task_comment_controller import TaskCommentController
from app.controllers.task_activity_controller import TaskActivityController
from app.controllers.time_entry_controller import TimeEntryController
from app.utils.jwt_handler import get_current_user_id

extra_bp = Blueprint('task_extra', __name__)


@extra_bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(task_id):
    current_user_id = get_current_user_id()
    response, status_code = TaskCommentController.get_task_comments(current_user_id, task_id)
    return jsonify(response), status_code


@extra_bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(task_id):
    current_user_id = get_current_user_id()
    response, status_code = TaskCommentController.create_comment(current_user_id, task_id)
    return jsonify(response), status_code


@extra_bp.route('/tasks/<int:task_id>/activity', methods=['GET'])
@jwt_required()
def get_activity(task_id):
    current_user_id = get_current_user_id()
    response, status_code = TaskActivityController.get_task_activity(current_user_id, task_id)
    return jsonify(response), status_code


@extra_bp.route('/projects/<int:project_id>/activity', methods=['GET'])
@jwt_required()
def get_project_activity(project_id):
    current_user_id = get_current_user_id()
    response, status_code = TaskActivityController.get_project_activity(current_user_id, project_id)
    return jsonify(response), status_code


@extra_bp.route('/tasks/<int:task_id>/timer/start', methods=['POST'])
@jwt_required()
def start_timer(task_id):
    current_user_id = get_current_user_id()
    response, status_code = TimeEntryController.start_timer(current_user_id, task_id)
    return jsonify(response), status_code


@extra_bp.route('/tasks/<int:task_id>/timer/stop', methods=['POST'])
@jwt_required()
def stop_timer(task_id):
    current_user_id = get_current_user_id()
    response, status_code = TimeEntryController.stop_timer(current_user_id, task_id)
    return jsonify(response), status_code


@extra_bp.route('/tasks/<int:task_id>/time-entries', methods=['GET'])
@jwt_required()
def get_time_entries(task_id):
    current_user_id = get_current_user_id()
    response, status_code = TimeEntryController.get_task_time_entries(current_user_id, task_id)
    return jsonify(response), status_code


@extra_bp.route('/tasks/<int:task_id>/time-summary', methods=['GET'])
@jwt_required()
def get_time_summary(task_id):
    current_user_id = get_current_user_id()
    response, status_code = TimeEntryController.get_task_total_minutes(current_user_id, task_id)
    return jsonify(response), status_code
