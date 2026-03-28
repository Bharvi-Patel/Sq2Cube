from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from datetime import datetime, timedelta, timezone
import random
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.database import get_db
from app import models
from app.auth import hash_password, verify_password, create_token
from app.limiter import limiter
from app.validation import validate_email, validate_password, validate_username
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM     = os.getenv("MAIL_FROM")
MAIL_SERVER   = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT     = int(os.getenv("MAIL_PORT", 587))


# ── Schemas ────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    email: str
    password: str
    username: str

    @validator("email")
    def _email(cls, v): return validate_email(v)

    @validator("password")
    def _password(cls, v): return validate_password(v)

    @validator("username")
    def _username(cls, v): return validate_username(v)


class VerifyOTPRequest(BaseModel):
    email: str
    code: str

    @validator("email")
    def _email(cls, v): return validate_email(v)

    @validator("code")
    def _code(cls, v):
        v = v.strip()
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP must be 6 digits.")
        return v


class ResendOTPRequest(BaseModel):
    email: str

    @validator("email")
    def _email(cls, v): return validate_email(v)


class LoginRequest(BaseModel):
    email: str
    password: str

    @validator("email")
    def _email(cls, v): return validate_email(v)


# ── Send OTP via smtplib ───────────────────────────────────────────────────
def send_otp_email(email: str, username: str, code: str):
    try:
        msg = MIMEMultipart()
        msg["From"]    = MAIL_FROM
        msg["To"]      = email
        msg["Subject"] = "Your Sq2Cube verification code"
        msg.attach(MIMEText(f"""Hi {username},

Your Sq2Cube verification code is:

{code}

This code expires in 10 minutes. Do not share it with anyone.

— The Sq2Cube Team""", "plain"))

        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, email, msg.as_string())
        server.quit()
        print(f"✅ OTP sent to {email}")
    except Exception as e:
        print(f"❌ OTP email error: {str(e)}")


# ── POST /signup ───────────────────────────────────────────────────────────
@router.post("/signup")
@limiter.limit("5/minute")
def signup(
    request: Request,
    data: SignupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing and existing.is_verified:
        raise HTTPException(status_code=400, detail="Email already registered.")
    if existing and not existing.is_verified:
        db.query(models.OTPCode).filter(models.OTPCode.user_id == existing.id).delete()
        db.delete(existing)
        db.commit()

    user = models.User(
        email=data.email,
        password=hash_password(data.password),
        username=data.username,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    code = str(random.randint(100000, 999999))
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp = models.OTPCode(user_id=user.id, code=code, expires_at=expires)
    db.add(otp)
    db.commit()

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
def resend_otp(
    request: Request,
    data: ResendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

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
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not user.password or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in.")

    if user.is_banned:
        raise HTTPException(status_code=403, detail="Your account has been suspended.")

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