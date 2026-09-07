from flask import request
from app.services.task_comment_service import TaskCommentService


class TaskCommentController:
    @staticmethod
    def get_task_comments(current_user_id, task_id):
        try:
            return {
                'success': True,
                'data': TaskCommentService.get_task_comments(task_id)
            }, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def create_comment(current_user_id, task_id):
        try:
            data = request.get_json() or {}
            comment = data.get('comment')
            result = TaskCommentService.create_comment(current_user_id, task_id, comment)
            return {'success': True, 'message': 'Comment created successfully', 'data': result}, 201
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 400
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500
