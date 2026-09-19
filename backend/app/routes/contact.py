from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.controllers.contact_controller import ContactController


contact_bp = Blueprint('contact', __name__)


@contact_bp.route('/contact', methods=['POST'])
def create_contact_submission():
    response, status_code = ContactController.create_submission()
    return jsonify(response), status_code


@contact_bp.route('/contact/submissions', methods=['GET'])
@jwt_required()
def list_contact_submissions():
    response, status_code = ContactController.list_submissions()
    return jsonify(response), status_code


@contact_bp.route('/contact/submissions/<int:message_id>/read', methods=['PATCH'])
@jwt_required()
def mark_contact_read(message_id):
    response, status_code = ContactController.mark_read(message_id)
    return jsonify(response), status_code
