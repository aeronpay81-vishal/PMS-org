from flask import request

from app.services.contact_service import ContactService


class ContactController:
    @staticmethod
    def create_submission():
        try:
            submission = ContactService.create_submission(request.get_json(silent=True))
            delivered = ContactService.send_submission_email(submission)
            return {
                'success': True,
                'message': 'Your message was saved and emailed.' if delivered else 'Your message was saved, but email delivery is not configured.',
                'data': submission.to_dict(),
            }, 201
        except ValueError as exc:
            return {'success': False, 'message': str(exc)}, 400
        except Exception as exc:
            return {'success': False, 'message': f'Unable to submit contact message: {exc}'}, 500

    @staticmethod
    def list_submissions():
        try:
            limit = min(max(int(request.args.get('limit', 50)), 1), 100)
            messages = ContactService.list_submissions(limit)
            return {'success': True, 'data': [message.to_dict() for message in messages]}, 200
        except (TypeError, ValueError):
            return {'success': False, 'message': 'limit must be a number'}, 400

    @staticmethod
    def mark_read(message_id):
        try:
            return {'success': True, 'data': ContactService.mark_read(message_id).to_dict()}, 200
        except ValueError as exc:
            return {'success': False, 'message': str(exc)}, 404
