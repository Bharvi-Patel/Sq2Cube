from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import Optional

from app.database import get_db
from app import models
from app.limiter import limiter
from app.validation import validate_email

router = APIRouter()

class FeedbackCreate(BaseModel):
    name: Optional[str] = None
    email: str
    subject: Optional[str] = None
    message: str

    @validator("email")
    def validate_feedback_email(cls, value: str) -> str:
        return validate_email(value)

    @validator("name")
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if len(cleaned) > 80:
            raise ValueError("name is too long.")
        return cleaned

    @validator("subject")
    def validate_subject(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if len(cleaned) > 120:
            raise ValueError("subject is too long.")
        return cleaned

    @validator("message")
    def validate_message(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("message is too short.")
        if len(cleaned) > 4000:
            raise ValueError("message is too long.")
        return cleaned

@router.post("/feedback")
@limiter.limit("10/minute")
def submit_feedback(request: Request, data: FeedbackCreate, db: Session = Depends(get_db)):
    fb = models.Feedback(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(fb)
    db.commit()
    return {"message": "Feedback received. Thank you!"}