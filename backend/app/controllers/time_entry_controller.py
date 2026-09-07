from flask import request
from app.services.time_entry_service import TimeEntryService


class TimeEntryController:
    @staticmethod
    def start_timer(current_user_id, task_id):
        try:
            data = request.get_json(silent=True) or {}
            note = data.get('note')
            return {'success': True, 'data': TimeEntryService.start_timer(current_user_id, task_id, note=note)}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 400
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def stop_timer(current_user_id, task_id):
        try:
            return {'success': True, 'data': TimeEntryService.stop_timer(current_user_id, task_id)}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 400
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def get_task_time_entries(current_user_id, task_id):
        try:
            return {'success': True, 'data': TimeEntryService.get_task_time_entries(task_id, user_id=current_user_id)}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def get_task_total_minutes(current_user_id, task_id):
        try:
            return {'success': True, 'data': TimeEntryService.get_task_total_minutes(task_id)}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500
