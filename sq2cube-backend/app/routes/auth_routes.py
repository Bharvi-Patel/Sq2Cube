from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from datetime import datetime, timedelta, timezone
import random

from app.database import get_db
from app import models
from app.auth import (
    hash_password,
    verify_password,
    create_token,
    create_refresh_token_value,
    get_refresh_expiry,
)
from app.deps import get_current_user
from app.limiter import limiter
from app.validation import validate_email, validate_password, validate_username
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

    @validator("email")
    def _validate_email(cls, value: str) -> str:
        return validate_email(value)

    @validator("password")
    def _validate_password(cls, value: str) -> str:
        return validate_password(value)

    @validator("username")
    def _validate_username(cls, value: str) -> str:
        return validate_username(value)

class VerifyOTPRequest(BaseModel):
    email: str
    code: str

    @validator("email")
    def _validate_email(cls, value: str) -> str:
        return validate_email(value)

    @validator("code")
    def _validate_code(cls, value: str) -> str:
        code = value.strip()
        if not code.isdigit() or len(code) != 6:
            raise ValueError("OTP code must be 6 digits.")
        return code

class ResendOTPRequest(BaseModel):
    email: str

    @validator("email")
    def _validate_email(cls, value: str) -> str:
        return validate_email(value)

class LoginRequest(BaseModel):
    email: str
    password: str

    @validator("email")
    def _validate_email(cls, value: str) -> str:
        return validate_email(value)

    @validator("password")
    def _validate_password(cls, value: str) -> str:
        password = value.strip()
        if len(password) < 1 or len(password) > 128:
            raise ValueError("Invalid password format.")
        return password


class RefreshTokenRequest(BaseModel):
    refresh_token: str

    @validator("refresh_token")
    def _validate_refresh_token(cls, value: str) -> str:
        token = value.strip()
        if len(token) < 40:
            raise ValueError("Invalid refresh token.")
        return token


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
@limiter.limit("5/minute")
async def signup(
    request: Request,
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
@limiter.limit("20/minute")
def verify_otp(request: Request, data: VerifyOTPRequest, db: Session = Depends(get_db)):
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
@limiter.limit("5/minute")
async def resend_otp(
    request: Request,
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
@limiter.limit("10/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    attempt = db.query(models.LoginAttempt).filter(models.LoginAttempt.email == data.email).first()
    now = datetime.now(timezone.utc)
    if attempt and attempt.locked_until and attempt.locked_until > now:
        raise HTTPException(status_code=423, detail="Account temporarily locked. Try again later.")

    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not user.password or not verify_password(data.password, user.password):
        if not attempt:
            attempt = models.LoginAttempt(email=data.email, failed_attempts=1)
            db.add(attempt)
        else:
            attempt.failed_attempts += 1
            if attempt.failed_attempts >= 5:
                attempt.locked_until = now + timedelta(minutes=15)
                attempt.failed_attempts = 0
        db.commit()
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in.")

    if attempt:
        attempt.failed_attempts = 0
        attempt.locked_until = None
        db.commit()

    token = create_token({"sub": str(user.id)})
    refresh_token_value = create_refresh_token_value()
    refresh_token = models.RefreshToken(
        user_id=user.id,
        token=refresh_token_value,
        expires_at=get_refresh_expiry(),
    )
    db.add(refresh_token)
    db.commit()

    return {
        "token": token,
        "access_token": token,
        "refresh_token": refresh_token_value,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "profile_image": user.profile_image,
        }
    }


@router.post("/refresh")
@limiter.limit("20/minute")
def refresh_access_token(
    request: Request,
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    record = (
        db.query(models.RefreshToken)
        .filter(
            models.RefreshToken.token == data.refresh_token,
            models.RefreshToken.revoked == False,
        )
        .first()
    )
    if not record or record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    user = db.query(models.User).filter(models.User.id == record.user_id).first()
    if not user or user.is_banned:
        raise HTTPException(status_code=401, detail="User not available.")

    # Rotate refresh token to reduce replay risk.
    record.revoked = True
    new_refresh_token_value = create_refresh_token_value()
    new_record = models.RefreshToken(
        user_id=user.id,
        token=new_refresh_token_value,
        expires_at=get_refresh_expiry(),
    )
    db.add(new_record)
    db.commit()

    access_token = create_token({"sub": str(user.id)})
    return {
        "token": access_token,
        "access_token": access_token,
        "refresh_token": new_refresh_token_value,
        "token_type": "bearer",
    }