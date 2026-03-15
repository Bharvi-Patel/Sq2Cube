from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import random

from app.database import get_db
from app import models
from app.auth import hash_password, verify_password, create_token
from app.deps import get_current_user
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os
from dotenv import load_dotenv

load_dotenv()

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


# ── Schemas ────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    email: str
    password: str
    username: str

class VerifyOTPRequest(BaseModel):
    email: str
    code: str

class ResendOTPRequest(BaseModel):
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str


# ── Helper: send OTP email ─────────────────────────────────────────────────
async def send_otp_email(email: str, username: str, code: str):
    message = MessageSchema(
        subject="Your Sq2Cube verification code",
        recipients=[email],
        body=f"""
Hi {username},

Your Sq2Cube verification code is:

{code}

This code expires in 10 minutes. Do not share it with anyone.

— The Sq2Cube Team
        """,
        subtype="plain"
    )
    fm = FastMail(conf)
    await fm.send_message(message)


# ── POST /signup ───────────────────────────────────────────────────────────
@router.post("/signup")
async def signup(
    data: SignupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Check if email already taken by a verified user
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing and existing.is_verified:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # If unverified user exists, delete and recreate
    if existing and not existing.is_verified:
        db.query(models.OTPCode).filter(models.OTPCode.user_id == existing.id).delete()
        db.delete(existing)
        db.commit()

    # Create user (unverified)
    user = models.User(
        email=data.email,
        password=hash_password(data.password),
        username=data.username,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate 6-digit OTP
    code = str(random.randint(100000, 999999))
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp = models.OTPCode(user_id=user.id, code=code, expires_at=expires)
    db.add(otp)
    db.commit()

    # Send OTP email in background
    background_tasks.add_task(send_otp_email, user.email, user.username, code)

    return {"message": "OTP sent to your email.", "email": user.email}


# ── POST /verify-otp ───────────────────────────────────────────────────────
@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    otp = (
        db.query(models.OTPCode)
        .filter(
            models.OTPCode.user_id == user.id,
            models.OTPCode.code == data.code,
            models.OTPCode.used == False,
        )
        .order_by(models.OTPCode.created_at.desc())
        .first()
    )

    if not otp:
        raise HTTPException(status_code=400, detail="Invalid code.")

    if otp.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Code expired. Please request a new one.")

    # Mark verified
    otp.used = True
    user.is_verified = True
    db.commit()

    token = create_token({"sub": str(user.id)})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "profile_image": user.profile_image,
        }
    }


# ── POST /resend-otp ───────────────────────────────────────────────────────
@router.post("/resend-otp")
async def resend_otp(
    data: ResendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Invalidate old OTPs
    db.query(models.OTPCode).filter(
        models.OTPCode.user_id == user.id,
        models.OTPCode.used == False
    ).delete()

    code = str(random.randint(100000, 999999))
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp = models.OTPCode(user_id=user.id, code=code, expires_at=expires)
    db.add(otp)
    db.commit()

    background_tasks.add_task(send_otp_email, user.email, user.username, code)
    return {"message": "New OTP sent."}


# ── POST /login ────────────────────────────────────────────────────────────
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not user.password or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in.")

    token = create_token({"sub": str(user.id)})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "profile_image": user.profile_image,
        }
    }