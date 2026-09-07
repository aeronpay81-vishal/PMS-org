from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers import ProjectController
from app.utils.jwt_handler import get_current_user_id

project_bp = Blueprint('project', __name__)


@project_bp.route('', methods=['GET'])
@jwt_required()
def get_projects():
    """Get all projects"""
    current_user_id = get_current_user_id()
    return ProjectController.get_projects(current_user_id)


@project_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    current_user_id = get_current_user_id()
    return ProjectController.create_project(current_user_id)


@project_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Get a specific project"""
    current_user_id = get_current_user_id()
    return ProjectController.get_project(current_user_id, project_id)


@project_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update a project"""
    current_user_id = get_current_user_id()
    return ProjectController.update_project(current_user_id, project_id)


@project_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete a project"""
    current_user_id = get_current_user_id()
    return ProjectController.delete_project(current_user_id, project_id)


# Member management routes
@project_bp.route('/<int:project_id>/members', methods=['GET'])
@jwt_required()
def get_members(project_id):
    """Get all members of a project"""
    current_user_id = get_current_user_id()
    response, status_code = ProjectController.get_members(current_user_id, project_id)
    return jsonify(response), status_code


@project_bp.route('/<int:project_id>/members/<int:target_user_id>', methods=['PUT'])
@jwt_required()
def update_member_role(project_id, target_user_id):
    """Update a project member's role"""
    current_user_id = get_current_user_id()
    response, status_code = ProjectController.update_member_role(current_user_id, project_id, target_user_id)
    return jsonify(response), status_code


@project_bp.route('/<int:project_id>/members/<int:target_user_id>', methods=['DELETE'])
@jwt_required()
def remove_member(project_id, target_user_id):
    """Remove a member from a project"""
    current_user_id = get_current_user_id()
    response, status_code = ProjectController.remove_member(current_user_id, project_id, target_user_id)
    return jsonify(response), status_code


# Report routes
@project_bp.route('/<int:project_id>/reports', methods=['POST'])
@jwt_required()
def create_report(project_id):
    """Create a project report with optional file upload"""
    current_user_id = get_current_user_id()
    return ProjectController.create_report(current_user_id, project_id)


@project_bp.route('/<int:project_id>/reports', methods=['GET'])
@jwt_required()
def get_reports(project_id):
    """Get all reports for a project"""
    current_user_id = get_current_user_id()
    return ProjectController.get_reports(current_user_id, project_id)


@project_bp.route('/<int:project_id>/reports/<int:report_id>', methods=['GET'])
@jwt_required()
def get_report(project_id, report_id):
    """Get a specific report"""
    current_user_id = get_current_user_id()
    return ProjectController.get_report(current_user_id, project_id, report_id)


@project_bp.route('/<int:project_id>/reports/<int:report_id>', methods=['DELETE'])
@jwt_required()
def delete_report(project_id, report_id):
    """Delete a report"""
    current_user_id = get_current_user_id()
    return ProjectController.delete_report(current_user_id, project_id, report_id)