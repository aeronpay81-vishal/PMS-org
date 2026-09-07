from flask import request
from app.services.notification_service import NotificationService


class NotificationController:
    @staticmethod
    def get_notifications(current_user_id):
        try:
            unread_only = request.args.get('unread_only', 'false').lower() == 'true'
            return {
                'success': True,
                'data': NotificationService.get_user_notifications(current_user_id, unread_only=unread_only)
            }, 200
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def mark_as_read(current_user_id, notification_id):
        try:
            return {
                'success': True,
                'data': NotificationService.mark_as_read(notification_id, current_user_id)
            }, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def mark_all_as_read(current_user_id):
        try:
            result = NotificationService.mark_all_as_read(current_user_id)
            return {'success': True, 'data': result}, 200
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500
