from app.services.analytics_service import AnalyticsService


class AnalyticsController:
    @staticmethod
    def get_project_analytics(current_user_id, project_id):
        try:
            return {'success': True, 'data': AnalyticsService.get_project_analytics(project_id)}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def get_team_summary(current_user_id, project_id):
        try:
            return {'success': True, 'data': AnalyticsService.get_team_summary(project_id)}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500
