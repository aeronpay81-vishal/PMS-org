
from flask import request
from app.services import ProjectService
from app.utils.permission_checker import RolePermissionError
from werkzeug.utils import secure_filename
import json
import os


class ProjectController:
    """Controller for project endpoints"""

    @staticmethod
    def create_project(current_user_id):
        """Create a new project with optional file upload"""
        try:
            # Handle both JSON and multipart/form-data
            data = {}
            file = None

            if request.is_json:
                # JSON data
                data = request.get_json() or {}
            else:
                # Form data (multipart/form-data)
                data = request.form.to_dict() if request.form else {}
                file = request.files.get('attachment') if 'attachment' in request.files else None

                # Parse labels if it's JSON string in form data
                if 'labels' in data and isinstance(data['labels'], str):
                    try:
                        data['labels'] = json.loads(data['labels'])
                    except:
                        data['labels'] = []

                # Parse assignments if it's JSON string in form data
                if 'assignments' in data and isinstance(data['assignments'], str):
                    try:
                        data['assignments'] = json.loads(data['assignments'])
                    except:
                        data['assignments'] = []

            if not data:
                return {
                    'success': False,
                    'message': 'No data provided'
                }, 400

            try:
                project = ProjectService.create_project(current_user_id, data, file)
                return {
                    'success': True,
                    'message': 'Project created successfully',
                    'data': project
                }, 201
            except ValueError as e:
                if str(e) == 'User not found':
                    return {
                        'success': False,
                        'message': 'Your login session is no longer valid. Please log in again.'
                    }, 401
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
    def get_projects(current_user_id):
        """Get all projects for current user"""
        try:
            projects = ProjectService.get_projects(current_user_id)
            return {
                'success': True,
                'data': projects
            }, 200
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500

    @staticmethod
    def get_project(current_user_id, project_id):
        """Get a specific project"""
        try:
            project = ProjectService.get_project_by_id(current_user_id, project_id)
            return {
                'success': True,
                'data': project
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
    def update_project(current_user_id, project_id):
        """Update a project with optional file upload"""
        try:
            # Handle both JSON and multipart/form-data
            data = {}
            file = None

            if request.is_json:
                # JSON data
                data = request.get_json() or {}
            else:
                # Form data (multipart/form-data)
                data = request.form.to_dict() if request.form else {}
                file = request.files.get('attachment') if 'attachment' in request.files else None

                # Parse labels if it's JSON string in form data
                if 'labels' in data and isinstance(data['labels'], str):
                    try:
                        data['labels'] = json.loads(data['labels'])
                    except:
                        data['labels'] = []

                # Parse assignments if it's JSON string in form data
                if 'assignments' in data and isinstance(data['assignments'], str):
                    try:
                        data['assignments'] = json.loads(data['assignments'])
                    except:
                        data['assignments'] = []

            if not data:
                return {
                    'success': False,
                    'message': 'No data provided'
                }, 400

            try:
                project = ProjectService.update_project(current_user_id, project_id, data, file)
                return {
                    'success': True,
                    'message': 'Project updated successfully',
                    'data': project
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
                }, 404
            except Exception as e:
                return {
                    'success': False,
                    'message': str(e)
                }, 500
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500

    @staticmethod
    def delete_project(current_user_id, project_id):
        """Delete a project"""
        try:
            ProjectService.delete_project(current_user_id, project_id)
            return {
                'success': True,
                'message': 'Project deleted successfully'
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
            }, 404
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500

    @staticmethod
    def create_report(current_user_id, project_id):
        """Create a project report"""
        try:
            data = request.form.to_dict() if request.form else {}
            file = request.files.get('file') if 'file' in request.files else None

            if not data.get('title'):
                return {
                    'success': False,
                    'message': 'Report title is required'
                }, 400

            report = ProjectService.create_report(current_user_id, project_id, data, file)
            return {
                'success': True,
                'message': 'Report created successfully',
                'data': report
            }, 201
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
    def get_reports(current_user_id, project_id):
        """Get all reports for a project"""
        try:
            reports = ProjectService.get_reports(current_user_id, project_id)
            return {
                'success': True,
                'data': reports
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
    def get_report(current_user_id, project_id, report_id):
        """Get a specific report"""
        try:
            report = ProjectService.get_report_by_id(current_user_id, project_id, report_id)
            return {
                'success': True,
                'data': report
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
    def delete_report(current_user_id, project_id, report_id):
        """Delete a report"""
        try:
            ProjectService.delete_report(current_user_id, project_id, report_id)
            return {
                'success': True,
                'message': 'Report deleted successfully'
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
    def get_members(current_user_id, project_id):
        """Get all members of a project"""
        try:
            from app.services import ProjectService
            members = ProjectService.get_members(current_user_id, project_id)
            return {
                'success': True,
                'data': members
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
            }, 404
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500

    @staticmethod
    def update_member_role(current_user_id, project_id, target_user_id):
        """Update a project member's role"""
        try:
            from app.services import ProjectService
            data = request.get_json() or {}
            new_role = data.get('role')
            if not new_role:
                return {
                    'success': False,
                    'message': 'Role is required'
                }, 400
            result = ProjectService.update_member_role(
                current_user_id, project_id, target_user_id, new_role
            )
            return {
                'success': True,
                'message': 'Member role updated successfully',
                'data': result
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
    def remove_member(current_user_id, project_id, target_user_id):
        """Remove a member from a project"""
        try:
            from app.services import ProjectService
            result = ProjectService.remove_member(
                current_user_id, project_id, target_user_id
            )
            return {
                'success': True,
                'message': 'Member removed successfully',
                'data': result
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
            }, 404
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 500
