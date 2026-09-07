from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.invitation_controller import InvitationController
from app.utils.jwt_handler import get_current_user_id

invitation_bp = Blueprint('invitation', __name__)


@invitation_bp.route('/projects/<int:project_id>/invite', methods=['POST'])
@jwt_required()
def send_invitation(project_id):
    current_user_id = get_current_user_id()
    response, status_code = InvitationController.send_invitation(current_user_id, project_id)
    return jsonify(response), status_code


@invitation_bp.route('/invitations/accept', methods=['POST'])
@jwt_required()
def accept_invitation():
    current_user_id = get_current_user_id()
    response, status_code = InvitationController.accept_invitation(current_user_id)
    return jsonify(response), status_code


@invitation_bp.route('/invitations/info', methods=['GET'])
def get_invitation_info():
    response, status_code = InvitationController.get_invitation_by_token()
    return jsonify(response), status_code


@invitation_bp.route('/projects/<int:project_id>/invitations', methods=['GET'])
@jwt_required()
def get_project_invitations(project_id):
    current_user_id = get_current_user_id()
    response, status_code = InvitationController.get_project_invitations(current_user_id, project_id)
    return jsonify(response), status_code


@invitation_bp.route('/invitations/<int:invitation_id>', methods=['DELETE'])
@jwt_required()
def revoke_invitation(invitation_id):
    current_user_id = get_current_user_id()
    response, status_code = InvitationController.revoke_invitation(current_user_id, invitation_id)
    return jsonify(response), status_code


@invitation_bp.route('/invitations/me', methods=['GET'])
@jwt_required()
def get_user_invitations():
    current_user_id = get_current_user_id()
    response, status_code = InvitationController.get_user_invitations(current_user_id)
    return jsonify(response), status_code


@invitation_bp.route('/invitations/<int:invitation_id>/decline', methods=['POST'])
@jwt_required()
def decline_invitation(invitation_id):
    current_user_id = get_current_user_id()
    response, status_code = InvitationController.decline_invitation(current_user_id, invitation_id)
    return jsonify(response), status_code
