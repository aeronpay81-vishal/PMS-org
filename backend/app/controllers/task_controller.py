from flask import request
from app.services import TaskService
from app.utils.permission_checker import RolePermissionError


class TaskController:
    """Controller for task endpoints"""

    @staticmethod
    def create_task(current_user_id):
        try:
            data = request.get_json()
            if not data:
                return {
                    'success': False,
                    'message': 'No data provided'
                }, 400

            task = TaskService.create_task(current_user_id, data)
            return {
                'success': True,
                'message': 'Task created successfully',
                'data': task
            }, 201
        except RolePermissionError as e:
            return {
                'success': False,
                'message': str(e)
            }, 403
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }, 400
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500

    @staticmethod
    def get_tasks(current_user_id):
        try:
            project_id = request.args.get('project_id')
            tasks = TaskService.get_tasks(current_user_id, project_id=project_id)
            return {
                'success': True,
                'data': tasks
            }, 200
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }, 400
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500

    @staticmethod
    def get_task(current_user_id, task_id):
        try:
            task = TaskService.get_task_by_id(current_user_id, task_id)
            return {
                'success': True,
                'data': task
            }, 200
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }, 404
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500

    @staticmethod
    def update_task(current_user_id, task_id):
        try:
            data = request.get_json()
            if not data:
                return {
                    'success': False,
                    'message': 'No data provided'
                }, 400

            task = TaskService.update_task(current_user_id, task_id, data)
            return {
                'success': True,
                'message': 'Task updated successfully',
                'data': task
            }, 200
        except RolePermissionError as e:
            return {
                'success': False,
                'message': str(e)
            }, 403
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }, 400
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500

    @staticmethod
    def delete_task(current_user_id, task_id):
        try:
            result = TaskService.delete_task(current_user_id, task_id)
            return result, 200
        except RolePermissionError as e:
            return {
                'success': False,
                'message': str(e)
            }, 403
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }, 404
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500
