import pyotp
from datetime import datetime, timedelta
from flask import current_app
from flask_mail import Message
from app import db, mail
from app.models.email_verification import EmailVerification

class OtpService:
    """Service for handling Email OTP generation, database verification logs, and Flask-Mail delivery"""

    OTP_EXPIRY_MINUTES = 15
    MAX_ATTEMPTS = 5

    @staticmethod
    def generate_and_send_otp(email, purpose='login'):
        """
        Generate PyOTP code, store in database, and send via Flask-Mail
        """
        if not email:
            raise ValueError('Email address is required')

        clean_email = email.lower().strip()

        # Generate a random base32 secret for PyOTP
        secret_key = pyotp.random_base32()
        
        # Create TOTP instance with 15 minutes window
        totp = pyotp.TOTP(secret_key, digits=6, interval=OtpService.OTP_EXPIRY_MINUTES * 60)
        otp_code = totp.now()

        expires_at = datetime.utcnow() + timedelta(minutes=OtpService.OTP_EXPIRY_MINUTES)

        # Invalidate any previous unverified OTPs for this email and purpose
        EmailVerification.query.filter_by(
            email=clean_email,
            purpose=purpose,
            is_verified=False
        ).delete()

        # Store in database table
        verification = EmailVerification(
            email=clean_email,
            otp_code=otp_code,
            secret_key=secret_key,
            purpose=purpose,
            attempts=0,
            is_verified=False,
            expires_at=expires_at
        )

        db.session.add(verification)
        db.session.commit()

        # Send email via Flask-Mail
        try:
            msg = Message(
                subject=f"Your Verification Code - AeroPilot",
                recipients=[clean_email]
            )

            html_body = f"""
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">AeroPilot Verification</h2>
                    <p style="color: #64748b; font-size: 14px; margin-t: 4px;">Use the code below to complete your {purpose}</p>
                </div>
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff; display: inline-block;">{otp_code}</span>
                </div>
                <p style="color: #475569; font-size: 13px; line-height: 1.5; text-align: center;">
                    This code is valid for <strong>{OtpService.OTP_EXPIRY_MINUTES} minutes</strong>. If you did not request this code, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center;">© 2026 AeroPilot Project Management. All rights reserved.</p>
            </div>
            """
            msg.html = html_body
            msg.body = f"Your AeroPilot verification code for {purpose} is: {otp_code}. Valid for {OtpService.OTP_EXPIRY_MINUTES} minutes."

            mail.send(msg)

        except Exception as e:
            current_app.logger.error(f"Flask-Mail sending error: {str(e)}")
            # Even if SMTP is misconfigured in local dev, we log it, but the DB record is already persisted
            return {
                'success': True,
                'message': f"Verification code generated (stored in DB log). Mail status: {str(e)}"
            }

        return {
            'success': True,
            'message': f"Verification code sent to {clean_email}"
        }

    @staticmethod
    def verify_otp(email, otp_code, purpose='login'):
        """
        Verify user-submitted OTP code against the database record using PyOTP
        """
        if not email or not otp_code:
            raise ValueError('Email and OTP code are required')

        clean_email = email.lower().strip()
        clean_otp = str(otp_code).strip()

        # Retrieve latest unverified record
        verification = EmailVerification.query.filter_by(
            email=clean_email,
            purpose=purpose,
            is_verified=False
        ).order_by(EmailVerification.created_at.desc()).first()

        if not verification:
            raise ValueError('No active OTP found. Please request a new code.')

        # Check expiration
        if datetime.utcnow() > verification.expires_at:
            db.session.delete(verification)
            db.session.commit()
            raise ValueError('Code expired. Please request a new code.')

        # Check max attempts
        if verification.attempts >= OtpService.MAX_ATTEMPTS:
            db.session.delete(verification)
            db.session.commit()
            raise ValueError('Too many failed attempts. Please request a new code.')

        # Increment attempts
        verification.attempts += 1

        # Verify using PyOTP & fallback code check
        totp = pyotp.TOTP(verification.secret_key, digits=6, interval=OtpService.OTP_EXPIRY_MINUTES * 60)
        is_valid = totp.verify(clean_otp) or verification.otp_code == clean_otp

        if not is_valid:
            db.session.commit()
            raise ValueError('Invalid verification code. Please try again.')

        # Mark verified and save
        verification.is_verified = True
        db.session.commit()

        return {
            'success': True,
            'message': 'Email verified successfully'
        }
