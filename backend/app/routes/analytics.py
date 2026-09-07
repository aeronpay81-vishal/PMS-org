from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.analytics_controller import AnalyticsController
from app.utils.jwt_handler import get_current_user_id

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/projects/<int:project_id>/analytics', methods=['GET'])
@jwt_required()
def project_analytics(project_id):
    current_user_id = get_current_user_id()
    response, status_code = AnalyticsController.get_project_analytics(current_user_id, project_id)
    return jsonify(response), status_code


@analytics_bp.route('/projects/<int:project_id>/team-summary', methods=['GET'])
@jwt_required()
def team_summary(project_id):
    current_user_id = get_current_user_id()
    response, status_code = AnalyticsController.get_team_summary(current_user_id, project_id)
    return jsonify(response), status_code
