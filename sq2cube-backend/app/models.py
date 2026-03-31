from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    email          = Column(String, unique=True, index=True)
    password       = Column(String, nullable=True)
    username       = Column(String)
    bio            = Column(String, nullable=True)
    profile_image  = Column(String, nullable=True)
    gender         = Column(String, nullable=True)
    phone          = Column(String, nullable=True)
    dob            = Column(String, nullable=True)
    is_verified    = Column(Boolean, default=False)
    is_admin       = Column(Boolean, default=False)
    is_banned      = Column(Boolean, default=False)
    is_public      = Column(Boolean, default=False) 
    is_featured = Column(Boolean, default=False)
    oauth_provider = Column(String, nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    history      = relationship("History", back_populates="user")
    reset_tokens = relationship("PasswordResetToken", back_populates="user")
    otp_codes    = relationship("OTPCode", back_populates="user")
    feedbacks    = relationship("Feedback", back_populates="user")


class History(Base):
    __tablename__ = "history"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    image        = Column(String, nullable=False)
    prompt       = Column(String, nullable=True)
    status       = Column(String, default="success")  # "success" | "failed"
    flagged      = Column(Boolean, default=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="history")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    token      = Column(String, unique=True, index=True)
    used       = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reset_tokens")


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    code       = Column(String, nullable=False)
    used       = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="otp_codes")


class SiteSetting(Base):
    __tablename__ = "site_settings"
    id    = Column(Integer, primary_key=True, index=True)
    key   = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)


class Feedback(Base):
    __tablename__ = "feedback"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    name       = Column(String, nullable=True)
    email      = Column(String, nullable=False)
    subject    = Column(String, nullable=True)
    message    = Column(Text, nullable=False)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="feedbacks")


class FeedbackReply(Base):
    __tablename__ = "feedback_replies"

    id          = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"), nullable=False, index=True)
    reply       = Column(Text, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token      = Column(String, unique=True, index=True, nullable=False)
    revoked    = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    failed_attempts = Column(Integer, default=0, nullable=False)
    locked_until    = Column(DateTime(timezone=True), nullable=True)
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())