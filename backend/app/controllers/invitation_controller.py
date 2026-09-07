from flask import request


class InvitationController:
    
    @staticmethod
    def send_invitation(current_user_id, project_id):
        try:
            from app.services.invitation_service import InvitationService
            data = request.get_json() or {}
            email = data.get('email')
            role = data.get('role', 'member')
            if not email:
                return {'success': False, 'message': 'Email is required'}, 400
            result = InvitationService.send_invitation(
                inviter_user_id=current_user_id,
                project_id=project_id,
                email=email,
                role=role
            )
            return {'success': True, 'message': 'Invitation sent successfully', 'data': result}, 201
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 400
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def accept_invitation(current_user_id):
        try:
            from app.services.invitation_service import InvitationService
            data = request.get_json() or {}
            token = data.get('token')
            if not token:
                return {'success': False, 'message': 'Invitation token is required'}, 400
            result = InvitationService.accept_invitation(token=token, user_id=current_user_id)
            return {'success': True, 'message': 'Invitation accepted successfully', 'data': result}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 400
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def get_invitation_by_token():
        try:
            from app.services.invitation_service import InvitationService
            token = request.args.get('token')
            if not token:
                return {'success': False, 'message': 'Token is required'}, 400
            result = InvitationService.get_invitation_by_token(token)
            return {'success': True, 'data': result}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 404
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def get_project_invitations(current_user_id, project_id):
        try:
            from app.services.invitation_service import InvitationService
            result = InvitationService.get_project_invitations(current_user_id, project_id)
            return {'success': True, 'data': result}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 403
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def revoke_invitation(current_user_id, invitation_id):
        try:
            from app.services.invitation_service import InvitationService
            result = InvitationService.revoke_invitation(current_user_id, invitation_id)
            return {'success': True, 'message': 'Invitation revoked', 'data': result}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 400
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def get_user_invitations(current_user_id):
        try:
            from app.services.invitation_service import InvitationService
            result = InvitationService.get_user_invitations(current_user_id)
            return {'success': True, 'data': result}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 400
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500

    @staticmethod
    def decline_invitation(current_user_id, invitation_id):
        try:
            from app.services.invitation_service import InvitationService
            result = InvitationService.decline_invitation(current_user_id, invitation_id)
            return {'success': True, 'message': 'Invitation declined', 'data': result}, 200
        except ValueError as e:
            return {'success': False, 'message': str(e)}, 400
        except Exception as e:
            return {'success': False, 'message': str(e)}, 500
