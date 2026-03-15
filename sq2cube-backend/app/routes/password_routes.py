from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import secrets
import logging

from app.database import get_db
from app import models
from app.auth import hash_password
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter()

conf = ConnectionConfig(
    MAIL_USERNAME   = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD   = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM       = os.getenv("MAIL_FROM"),
    MAIL_PORT       = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER     = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS   = True,
    MAIL_SSL_TLS    = False,
    USE_CREDENTIALS = True,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ── Send email with full error logging ────────────────────────────────────
async def send_reset_email(email: str, username: str, reset_link: str):
    try:
        message = MessageSchema(
            subject="Reset your Sq2Cube password",
            recipients=[email],
            body=f"""Hi {username},

You requested a password reset for your Sq2Cube account.

Click the link below to reset your password (valid for 1 hour):

{reset_link}

If you did not request this, you can safely ignore this email.

— The Sq2Cube Team""",
            subtype="plain"
        )
        fm = FastMail(conf)
        await fm.send_message(message)
        logger.info(f"✅ Reset email sent successfully to {email}")
        print(f"✅ Reset email sent successfully to {email}")
    except Exception as e:
        logger.error(f"❌ Failed to send reset email to {email}: {str(e)}")
        print(f"❌ EMAIL ERROR: {str(e)}")


# ── POST /forgot-password ──────────────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    print(f"📧 Forgot password request for: {data.email}")

    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        print(f"⚠️  Email not found: {data.email}")
        return {"message": "If that email exists, a reset link has been sent."}

    # Delete old unused tokens
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False
    ).delete()

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires
    )
    db.add(reset_token)
    db.commit()

    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    print(f"🔗 Reset link generated: {reset_link}")

    background_tasks.add_task(send_reset_email, user.email, user.username, reset_link)

    return {"message": "If that email exists, a reset link has been sent."}


# ── POST /reset-password ───────────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == data.token,
        models.PasswordResetToken.used == False
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    if record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    user = db.query(models.User).filter(models.User.id == record.user_id).first()
    user.password = hash_password(data.new_password)
    record.used = True
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}