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

    @validator("name", "subject", "message")
    def validate_text_fields(cls, value: Optional[str], field):
        if value is None:
            return value
        cleaned = value.strip()
        limits = {"name": 80, "subject": 120, "message": 4000}
        if len(cleaned) > limits[field.name]:
            raise ValueError(f"{field.name} is too long.")
        if field.name == "message" and len(cleaned) < 2:
            raise ValueError("message is too short.")
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