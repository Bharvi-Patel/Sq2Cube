from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    email          = Column(String, unique=True, index=True)
    password       = Column(String)
    username       = Column(String)
    bio            = Column(String, nullable=True)
    profile_image  = Column(String, nullable=True)
    gender         = Column(String, nullable=True)
    phone          = Column(String, nullable=True)
    dob            = Column(String, nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    history        = relationship("History", back_populates="user")


class History(Base):
    __tablename__ = "history"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    image      = Column(String, nullable=False)
    prompt     = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="history")