from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import Signup, Login
from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/signup")
def signup(user: schemas.Signup, db: Session = Depends(get_db)):

    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        email=user.email,
        password=hash_password(user.password),
        username=user.username
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue token immediately — user is now logged in
    token = create_access_token(new_user.id, new_user.email)

    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
            "profile_image": new_user.profile_image
        }
    }


@router.post("/login")
def login(user: Login, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(db_user.id, db_user.email)

    return {
        "token": token,
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username,
            "profile_image": db_user.profile_image
        }
    }