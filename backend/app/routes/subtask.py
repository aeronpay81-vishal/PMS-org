from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import SubtaskService
from app.utils.jwt_handler import get_current_user_id
from app.utils.permission_checker import RolePermissionError


subtask_bp = Blueprint('subtasks', __name__)


def _data():
    return request.form if request.form else (request.get_json(silent=True) or {})


def _files():
    return request.files.getlist('files')


@subtask_bp.route('/tasks/<int:task_id>/subtasks', methods=['GET'])
@jwt_required()
def list_subtasks(task_id):
    try:
        data = SubtaskService.list_subtasks(get_current_user_id(), task_id)
        return jsonify({'success': True, 'data': data}), 200
    except RolePermissionError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 403
    except ValueError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 404


@subtask_bp.route('/tasks/<int:task_id>/subtasks', methods=['POST'])
@jwt_required()
def create_subtask(task_id):
    try:
        data = SubtaskService.create_subtask(
            get_current_user_id(), task_id, _data(), _files()
        )
        return jsonify({'success': True, 'message': 'Subtask created successfully', 'data': data}), 201
    except RolePermissionError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 403
    except ValueError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 400
    except Exception as exc:
        return jsonify({'success': False, 'message': str(exc)}), 500


@subtask_bp.route('/tasks/<int:task_id>/subtasks/<int:subtask_id>', methods=['PUT'])
@jwt_required()
def update_subtask(task_id, subtask_id):
    try:
        data = SubtaskService.update_subtask(
            get_current_user_id(), task_id, subtask_id, _data(), _files()
        )
        return jsonify({'success': True, 'message': 'Subtask updated successfully', 'data': data}), 200
    except RolePermissionError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 403
    except ValueError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 400
    except Exception as exc:
        return jsonify({'success': False, 'message': str(exc)}), 500


@subtask_bp.route('/tasks/<int:task_id>/subtasks/<int:subtask_id>', methods=['DELETE'])
@jwt_required()
def delete_subtask(task_id, subtask_id):
    try:
        return jsonify(SubtaskService.delete_subtask(get_current_user_id(), task_id, subtask_id)), 200
    except RolePermissionError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 403
    except ValueError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 404
