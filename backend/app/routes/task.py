from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers import TaskController
from app.utils.jwt_handler import get_current_user_id


task_bp = Blueprint('tasks', __name__)


@task_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    """
    POST /api/tasks
    {
      "summary": "Fix bug in login",
      "description": "The login API fails when password contains special chars.",
      "priority": "high",
      "status": "todo",
      "labels": ["bug", "backend"],
      "due_date": "2026-08-18T12:00:00",
      "start_date": "2026-08-12T08:30:00",
      "reporter": "john.doe@example.com",
      "attachment": "https://example.com/attachments/error-log.txt"
    }
    """
    current_user_id = get_current_user_id()
    response, status_code = TaskController.create_task(current_user_id)
    return jsonify(response), status_code


@task_bp.route('', methods=['GET'])
@jwt_required()
def list_tasks():
    """
    GET /api/tasks
    Headers: Authorization: Bearer <access_token>
    """
    current_user_id = get_current_user_id()
    response, status_code = TaskController.get_tasks(current_user_id)
    return jsonify(response), status_code


@task_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """
    GET /api/tasks/<task_id>
    """
    current_user_id = get_current_user_id()
    response, status_code = TaskController.get_task(current_user_id, task_id)
    return jsonify(response), status_code


@task_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """
    PUT /api/tasks/<task_id>
    """
    current_user_id = get_current_user_id()
    response, status_code = TaskController.update_task(current_user_id, task_id)
    return jsonify(response), status_code


@task_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """
    DELETE /api/tasks/<task_id>
    """
    current_user_id = get_current_user_id()
    response, status_code = TaskController.delete_task(current_user_id, task_id)
    return jsonify(response), status_code