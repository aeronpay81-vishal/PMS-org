from flask import current_app
from flask_mail import Message

from app import db, mail
from app.models.contact_message import ContactMessage


class EmailDeliveryError(Exception):
    pass


class ContactService:
    ALLOWED_SUBJECTS = {
        'Sales', 'Support', 'Billing', 'Partnership', 'Press', 'Other'
    }

    @staticmethod
    def validate_payload(data):
        data = data or {}
        full_name = str(data.get('full_name', data.get('name', ''))).strip()
        email = str(data.get('email', '')).strip().lower()
        company = str(data.get('company', '')).strip()
        subject = str(data.get('subject', data.get('topic', ''))).strip()
        message = str(data.get('message', '')).strip()

        subject_aliases = {
            'Sales inquiry': 'Sales',
            'Technical support': 'Support',
            'Billing question': 'Billing',
            'Partnership': 'Partnership',
            'Press & media': 'Press',
            'Something else': 'Other',
        }
        subject = subject_aliases.get(subject, subject)

        if not full_name:
            raise ValueError('Full name is required')
        if not email:
            raise ValueError('Email is required')
        if '@' not in email or len(email) > 254:
            raise ValueError('Enter a valid email address')
        if not subject:
            raise ValueError('Subject is required')
        if subject not in ContactService.ALLOWED_SUBJECTS:
            raise ValueError('Subject must be Sales, Support, Billing, Partnership, Press, or Other')
        if not message:
            raise ValueError('Message is required')
        if len(full_name) > 120 or len(company) > 160:
            raise ValueError('Full name or company is too long')
        if len(message) > 5000:
            raise ValueError('Message must be 5000 characters or fewer')

        return {
            'full_name': full_name,
            'email': email,
            'company': company or None,
            'subject': subject,
            'message': message,
        }

    @staticmethod
    def contact_recipient():
        return current_app.config.get('CONTACT_RECIPIENT_EMAIL') or current_app.config.get('MAIL_USERNAME')

    @staticmethod
    def create_submission(data):
        contact_message = ContactMessage(**ContactService.validate_payload(data))
        db.session.add(contact_message)
        db.session.commit()
        return contact_message

    @staticmethod
    def send_submission_email(contact_message):
        recipient = ContactService.contact_recipient()
        if not recipient:
            contact_message.status = 'email_failed'
            contact_message.email_error = 'Contact email delivery is not configured'
            db.session.commit()
            return False

        body = (
            'A new message was sent from the AeroPilot contact page.\n\n'
            f'To: {recipient}\n'
            f'From: {contact_message.email}\n'
            f'Full name: {contact_message.full_name}\n'
            f'Email: {contact_message.email}\n'
            f'Company: {contact_message.company or "Not provided"}\n'
            f'Category: {contact_message.subject}\n'
            f'Submitted: {contact_message.created_at.isoformat()}\n\n'
            f'Message sent by the user:\n{contact_message.message}\n'
        )
        try:
            sender = current_app.config.get('MAIL_DEFAULT_SENDER') or current_app.config.get('MAIL_FROM')
            mail.send(Message(
                subject=f'Contact form: {contact_message.subject} from {contact_message.full_name}',
                recipients=[recipient],
                body=body,
                sender=sender,
                reply_to=contact_message.email,
            ))
            contact_message.status = 'emailed'
            contact_message.email_error = None
            db.session.commit()
            return True
        except Exception as exc:
            current_app.logger.exception('Contact form email delivery failed')
            contact_message.status = 'email_failed'
            contact_message.email_error = str(exc)
            db.session.commit()
            return False

    @staticmethod
    def list_submissions(limit=50):
        return ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(limit).all()

    @staticmethod
    def mark_read(message_id):
        contact_message = db.session.get(ContactMessage, message_id)
        if not contact_message:
            raise ValueError('Contact message not found')
        contact_message.is_read = True
        db.session.commit()
        return contact_message
