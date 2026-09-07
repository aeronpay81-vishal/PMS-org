# from app import db
# from app.models import Project, ProjectMember, ProjectInvitation, User
# from app.utils.email_utils import send_invitation_email
# from datetime import datetime, timedelta
# import uuid, os


# class InvitationService:
#     ALLOWED_ROLES = {'owner', 'manager', 'member'}
#     INVITATION_EXPIRY_DAYS = 7

#     @staticmethod
#     def _get_member_role(user_id, project_id):
#         m = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
#         return m.role if m else None

#     @staticmethod
#     def _can_invite(user_id, project_id):
#         return InvitationService._get_member_role(user_id, project_id) in ('owner', 'manager')

#     @staticmethod
#     def send_invitation(inviter_user_id, project_id, email, role='member'):
#         role = str(role).strip().lower()
#         if role not in InvitationService.ALLOWED_ROLES:
#             raise ValueError('Role must be owner, manager, or member')
#         if role == 'owner':
#             raise ValueError('Cannot invite as owner. Owner is project creator.')
#         inviter = User.query.get(inviter_user_id)
#         if not inviter:
#             raise ValueError('Inviter not found')
#         project = Project.query.get(project_id)
#         if not project:
#             raise ValueError('Project not found')
#         if not InvitationService._can_invite(inviter_user_id, project_id):
#             raise ValueError('Only project owners or managers can send invitations')
#         invited_user = User.query.filter_by(email=email).first()
#         if invited_user:
#             existing = ProjectMember.query.filter_by(project_id=project_id, user_id=invited_user.id).first()
#             if existing:
#                 raise ValueError('This user is already a member of this project')
#         existing_inv = ProjectInvitation.query.filter_by(project_id=project_id, email=email, status='pending').first()
#         if existing_inv and not existing_inv.is_expired():
#             raise ValueError('A pending invitation already exists for this email')
#         token = str(uuid.uuid4())
#         expires_at = datetime.utcnow() + timedelta(days=InvitationService.INVITATION_EXPIRY_DAYS)
#         invitation = ProjectInvitation(
#             project_id=project_id, email=email, token=token, role=role,
#             status='pending', invited_by=inviter_user_id, expires_at=expires_at)
#         db.session.add(invitation)
#         db.session.commit()
#         frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
#         accept_url = frontend_url + '/invite/accept?token=' + token
#         send_invitation_email(
#             to_email=email,
#             project_name=project.summary,
#             inviter_name=inviter.full_name or inviter.username,
#             role=role,
#             accept_url=accept_url)
#         return invitation.to_dict()

#     @staticmethod
#     def accept_invitation(token, user_id):
#         invitation = ProjectInvitation.query.filter_by(token=token).first()
#         if not invitation:
#             raise ValueError('Invalid invitation token')
#         if invitation.status == 'revoked':
#             raise ValueError('This invitation has been revoked')
#         if invitation.status == 'accepted':
#             raise ValueError('This invitation has already been accepted')
#         if invitation.is_expired():
#             invitation.status = 'expired'
#             db.session.commit()
#             raise ValueError('This invitation has expired')
#         user = User.query.get(user_id)
#         if not user:
#             raise ValueError('User not found')
#         if user.email.lower() != invitation.email.lower():
#             raise ValueError('Invitation was sent to a different email address')
#         existing = ProjectMember.query.filter_by(project_id=invitation.project_id, user_id=user_id).first()
#         if existing:
#             invitation.status = 'accepted'
#             invitation.accepted_at = datetime.utcnow()
#             db.session.commit()
#             raise ValueError('You are already a member of this project')
#         member = ProjectMember(
#             project_id=invitation.project_id,
#             user_id=user_id,
#             role=invitation.role,
#             invited_by=invitation.invited_by,
#             joined_at=datetime.utcnow())
#         db.session.add(member)
#         invitation.status = 'accepted'
#         invitation.accepted_at = datetime.utcnow()
#         db.session.commit()
#         project = Project.query.get(invitation.project_id)
#         return {'message': 'Invitation accepted', 'project': project.to_dict() if project else None, 'member': member.to_dict()}

#     @staticmethod
#     def get_project_invitations(user_id, project_id):
#         if not InvitationService._can_invite(user_id, project_id):
#             raise ValueError('Only project owners or managers can view invitations')
#         invs = ProjectInvitation.query.filter_by(project_id=project_id).order_by(ProjectInvitation.created_at.desc()).all()
#         return [i.to_dict() for i in invs]

#     @staticmethod
#     def revoke_invitation(user_id, invitation_id):
#         inv = ProjectInvitation.query.get(invitation_id)
#         if not inv:
#             raise ValueError('Invitation not found')
#         if not InvitationService._can_invite(user_id, inv.project_id):
#             raise ValueError('Only project owners or managers can revoke invitations')
#         if inv.status != 'pending':
#             raise ValueError('Only pending invitations can be revoked')
#         inv.status = 'revoked'
#         db.session.commit()
#         return inv.to_dict()

#     @staticmethod
#     def get_invitation_by_token(token):
#         inv = ProjectInvitation.query.filter_by(token=token).first()
#         if not inv:
#             raise ValueError('Invalid invitation token')
#         if inv.is_expired() and inv.status == 'pending':
#             inv.status = 'expired'
#             db.session.commit()
#         return inv.to_dict()

#     @staticmethod
#     def get_user_invitations(user_id):
#         user = User.query.get(user_id)
#         if not user:
#             raise ValueError('User not found')
        
#         # Find pending invitations for this user's email
#         invitations = ProjectInvitation.query.filter_by(email=user.email, status='pending').all()
        
#         result = []
#         for inv in invitations:
#             if not inv.is_expired():
#                 # Add project details to the invitation response
#                 project = Project.query.get(inv.project_id)
#                 inviter = User.query.get(inv.invited_by)
                
#                 inv_dict = inv.to_dict()
#                 inv_dict['project_summary'] = project.summary if project else 'Unknown Project'
#                 inv_dict['inviter_name'] = (inviter.full_name or inviter.username) if inviter else 'Unknown User'
#                 result.append(inv_dict)
                
#         return result

#     @staticmethod
#     def decline_invitation(user_id, invitation_id):
#         user = User.query.get(user_id)
#         if not user:
#             raise ValueError('User not found')
            
#         invitation = ProjectInvitation.query.get(invitation_id)
#         if not invitation:
#             raise ValueError('Invitation not found')
            
#         if invitation.email.lower() != user.email.lower():
#             raise ValueError('You can only decline your own invitations')
            
#         if invitation.status != 'pending':
#             raise ValueError(f'Cannot decline invitation that is already {invitation.status}')
            
#         invitation.status = 'declined'
#         db.session.commit()
#         return {'message': 'Invitation declined successfully'}
from app import db
from app.models import Project, ProjectMember, ProjectInvitation, User, Task
from app.utils.email_utils import send_invitation_email
from datetime import datetime, timedelta
import uuid, os


class InvitationService:
    ALLOWED_ROLES = {'owner', 'manager', 'member'}
    INVITATION_EXPIRY_DAYS = 7

    @staticmethod
    def _get_member_role(user_id, project_id):
        m = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
        return m.role if m else None

    @staticmethod
    def _can_invite(user_id, project_id):
        return InvitationService._get_member_role(user_id, project_id) in ('owner', 'manager')

    @staticmethod
    def send_invitation(inviter_user_id, project_id, email, role='member', task_id=None):
        """
        Send invitation to email for project membership or specific task assignment.
        If task_id is provided, invitation is for assigning that specific task.
        """
        email = str(email or '').strip().lower()
        if not email:
            raise ValueError('Email is required')
        role = str(role).strip().lower()
        if role not in InvitationService.ALLOWED_ROLES:
            raise ValueError('Role must be owner, manager, or member')
        if role == 'owner':
            raise ValueError('Cannot invite as owner. Owner is project creator.')

        if role == 'manager':
            manager_member = ProjectMember.query.filter_by(
                project_id=project_id,
                role='manager'
            ).first()
            manager_invitation = ProjectInvitation.query.filter_by(
                project_id=project_id,
                role='manager',
                status='pending'
            ).first()
            if manager_member or (manager_invitation and not manager_invitation.is_expired()):
                raise ValueError('This project can have only one manager')
        
        inviter = User.query.get(inviter_user_id)
        if not inviter:
            raise ValueError('Inviter not found')
        
        project = Project.query.get(project_id)
        if not project:
            raise ValueError('Project not found')
        
        if not InvitationService._can_invite(inviter_user_id, project_id):
            raise ValueError('Only project owners or managers can send invitations')
        
        # Validate task if provided
        if task_id:
            task = Task.query.get(task_id)
            if not task or task.project_id != project_id:
                raise ValueError('Task not found in this project')
        
        # Check if email is already a project member
        invited_user = User.query.filter_by(email=email).first()
        if invited_user:
            existing = ProjectMember.query.filter_by(project_id=project_id, user_id=invited_user.id).first()
            if existing:
                if role == 'manager' and existing.role != 'manager':
                    existing.role = 'manager'
                    db.session.commit()
                    return {
                        'id': existing.id,
                        'email': email,
                        'status': 'role_updated',
                        'role': 'manager',
                        'message': 'Existing member promoted to manager'
                    }
                # User already member - if task specified, just assign the task
                if task_id:
                    task = Task.query.get(task_id)
                    if task:
                        task.assigned_to = invited_user.id
                        db.session.commit()
                    return {
                        'id': None,
                        'email': email,
                        'status': 'already_member',
                        'message': f'User already member, task assigned directly',
                        'task_id': task_id
                    }
                raise ValueError('This user is already a member of this project')
        
        # Check for existing pending invitation for this email + project + task combination
        # For task-specific invites, multiple invites to same email for different tasks are OK
        if task_id:
            existing_inv = ProjectInvitation.query.filter_by(
                project_id=project_id, 
                email=email, 
                task_id=task_id,
                status='pending'
            ).first()
        else:
            existing_inv = ProjectInvitation.query.filter_by(
                project_id=project_id, 
                email=email, 
                task_id=None,  # Only check project-level invites
                status='pending'
            ).first()
        
        if existing_inv and not existing_inv.is_expired():
            raise ValueError('A pending invitation already exists for this email and scope')
        
        token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(days=InvitationService.INVITATION_EXPIRY_DAYS)
        
        invitation = ProjectInvitation(
            project_id=project_id,
            task_id=task_id,  # NEW: Store task_id for task-specific invitations
            email=email,
            token=token,
            role=role,
            status='pending',
            invited_by=inviter_user_id,
            expires_at=expires_at
        )
        db.session.add(invitation)
        db.session.commit()
        
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        accept_url = frontend_url + '/invite/accept?token=' + token
        
        # Customize email message based on whether this is task-specific
        task_info = ""
        if task_id:
            task = Task.query.get(task_id)
            if task:
                task_info = f" for task: {task.summary}"
        
        send_invitation_email(
            to_email=email,
            project_name=project.summary,
            inviter_name=inviter.full_name or inviter.username,
            role=role,
            accept_url=accept_url,
            task_info=task_info
        )
        
        return invitation.to_dict()

    @staticmethod
    def accept_invitation(token, user_id):
        """Accept invitation and add to project. If task_id present, assign task."""
        invitation = ProjectInvitation.query.filter_by(token=token).first()
        if not invitation:
            raise ValueError('Invalid invitation token')
        
        if invitation.status == 'revoked':
            raise ValueError('This invitation has been revoked')
        
        if invitation.status == 'accepted':
            raise ValueError('This invitation has already been accepted')
        
        if invitation.is_expired():
            invitation.status = 'expired'
            db.session.commit()
            raise ValueError('This invitation has expired')
        
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        
        if user.email.lower() != invitation.email.lower():
            raise ValueError('Invitation was sent to a different email address')
        
        # Check if already a project member
        existing = ProjectMember.query.filter_by(
            project_id=invitation.project_id, 
            user_id=user_id
        ).first()
        
        if not existing:
            # Add as project member
            member = ProjectMember(
                project_id=invitation.project_id,
                user_id=user_id,
                role=invitation.role,
                invited_by=invitation.invited_by,
                joined_at=datetime.utcnow()
            )
            db.session.add(member)
        
        # If task-specific invitation, assign the task
        if invitation.task_id:
            task = Task.query.get(invitation.task_id)
            if task and task.assigned_to is None:
                task.assigned_to = user_id
        
        invitation.status = 'accepted'
        invitation.accepted_at = datetime.utcnow()
        db.session.commit()
        
        project = Project.query.get(invitation.project_id)
        result = {
            'message': 'Invitation accepted',
            'project': project.to_dict() if project else None,
        }
        
        if invitation.task_id:
            task = Task.query.get(invitation.task_id)
            result['task'] = task.to_dict() if task else None
            result['message'] = 'Invitation accepted and task assigned'
        
        return result

    @staticmethod
    def get_project_invitations(user_id, project_id):
        """Get all invitations for a project (admin view)"""
        if not InvitationService._can_invite(user_id, project_id):
            raise ValueError('Only project owners or managers can view invitations')
        
        invs = ProjectInvitation.query.filter_by(project_id=project_id).order_by(
            ProjectInvitation.created_at.desc()
        ).all()
        return [i.to_dict() for i in invs]

    @staticmethod
    def revoke_invitation(user_id, invitation_id):
        """Revoke a pending invitation"""
        inv = ProjectInvitation.query.get(invitation_id)
        if not inv:
            raise ValueError('Invitation not found')
        
        if not InvitationService._can_invite(user_id, inv.project_id):
            raise ValueError('Only project owners or managers can revoke invitations')
        
        if inv.status != 'pending':
            raise ValueError('Only pending invitations can be revoked')
        
        inv.status = 'revoked'
        db.session.commit()
        return inv.to_dict()

    @staticmethod
    def get_invitation_by_token(token):
        """Get invitation details by token (before accepting)"""
        inv = ProjectInvitation.query.filter_by(token=token).first()
        if not inv:
            raise ValueError('Invalid invitation token')
        
        if inv.is_expired() and inv.status == 'pending':
            inv.status = 'expired'
            db.session.commit()
        
        return inv.to_dict()

    @staticmethod
    def get_user_invitations(user_id):
        """Get pending invitations for current user (by email)"""
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        
        # Find pending invitations for this user's email
        invitations = ProjectInvitation.query.filter_by(
            email=user.email, 
            status='pending'
        ).all()
        
        result = []
        for inv in invitations:
            if not inv.is_expired():
                project = Project.query.get(inv.project_id)
                inviter = User.query.get(inv.invited_by)
                task = Task.query.get(inv.task_id) if inv.task_id else None
                
                inv_dict = inv.to_dict()
                inv_dict['project_summary'] = project.summary if project else 'Unknown Project'
                inv_dict['inviter_name'] = (inviter.full_name or inviter.username) if inviter else 'Unknown'
                
                # Add task details if task-specific invitation
                if task:
                    inv_dict['task_summary'] = task.summary
                    inv_dict['task_priority'] = task.priority
                    inv_dict['task_due_date'] = task.due_date.isoformat() if task.due_date else None
                
                result.append(inv_dict)
        
        return result

    @staticmethod
    def decline_invitation(user_id, invitation_id):
        """Decline an invitation"""
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        
        invitation = ProjectInvitation.query.get(invitation_id)
        if not invitation:
            raise ValueError('Invitation not found')
        
        if invitation.email.lower() != user.email.lower():
            raise ValueError('You can only decline your own invitations')
        
        if invitation.status != 'pending':
            raise ValueError(f'Cannot decline invitation that is already {invitation.status}')
        
        invitation.status = 'declined'
        db.session.commit()
        return {'message': 'Invitation declined successfully'}