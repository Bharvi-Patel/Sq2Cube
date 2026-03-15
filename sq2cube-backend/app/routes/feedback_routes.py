from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app import models

router = APIRouter()

class FeedbackCreate(BaseModel):
    name: Optional[str] = None
    email: str
    subject: Optional[str] = None
    message: str

@router.post("/feedback")
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    fb = models.Feedback(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(fb)
    db.commit()
    return {"message": "Feedback received. Thank you!"}