from app.services.task_activity_service import TaskActivityService


class TaskActivityController:
    @staticmethod
    def get_task_activity(current_user_id, task_id):
        try:
            return {'success': True, 'data': TaskActivityService.get_task_activity(task_id)}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def get_project_activity(current_user_id, project_id):
        try:
            return {'success': True, 'data': TaskActivityService.get_project_activity(project_id)}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500
