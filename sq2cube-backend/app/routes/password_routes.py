from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import secrets

from app.database import get_db
from app import models
from app.auth import hash_password
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ── Mail config (reads from .env) ──────────────────────────────────────────
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


# ── Schemas ────────────────────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ── POST /forgot-password ──────────────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    # Always return success — don't reveal if email exists
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}

    # Delete old unused tokens for this user
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False
    ).delete()

    # Create new token (expires in 1 hour)
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires
    )
    db.add(reset_token)
    db.commit()

    # Send email in background
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    message = MessageSchema(
        subject="Reset your Sq2Cube password",
        recipients=[user.email],
        body=f"""
Hi {user.username},

You requested a password reset for your Sq2Cube account.

Click the link below to reset your password (valid for 1 hour):

{reset_link}

If you did not request this, you can safely ignore this email.

— The Sq2Cube Team
        """,
        subtype="plain"
    )

    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)

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

    # Update password
    user = db.query(models.User).filter(models.User.id == record.user_id).first()
    user.password = hash_password(data.new_password)

    # Mark token as used
    record.used = True
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}