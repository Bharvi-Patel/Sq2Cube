from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user

router = APIRouter()


# ── Profile ────────────────────────────────────────────────────────────────

@router.post("/profile/setup")
def profile_setup(
    profile: schemas.ProfileSetup,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_user.username = profile.username
    if profile.bio is not None:
        current_user.bio = profile.bio
    if profile.profile_image is not None:
        current_user.profile_image = profile.profile_image
    if profile.gender is not None:
        current_user.gender = profile.gender
    if profile.phone is not None:
        current_user.phone = profile.phone
    if profile.dob is not None:
        current_user.dob = profile.dob

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "profile_image": current_user.profile_image,
        "gender": current_user.gender,
        "phone": current_user.phone,
        "dob": current_user.dob,
    }


@router.get("/profile/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    total = db.query(models.History).filter(
        models.History.user_id == current_user.id
    ).count()

    recent = db.query(models.History).filter(
        models.History.user_id == current_user.id
    ).order_by(models.History.created_at.desc()).limit(4).all()

    activity_rows = (
        db.query(
            cast(models.History.created_at, Date).label("day"),
            func.count().label("count")
        )
        .filter(models.History.user_id == current_user.id)
        .group_by("day")
        .all()
    )
    activity = {str(row.day): row.count for row in activity_rows}

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "profile_image": current_user.profile_image,
        "gender": current_user.gender,
        "phone": current_user.phone,
        "dob": current_user.dob,
        "member_since": current_user.created_at.strftime("%B %Y") if current_user.created_at else "",
        "total_generations": total,
        "recent": [{"id": e.id, "image": e.image, "prompt": e.prompt} for e in recent],
        "activity": activity
    }


# ── History ─────────────────────────────────────────────────────────────────

@router.post("/history")
def add_history(
    entry: schemas.HistoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_entry = models.History(
        user_id=current_user.id,
        image=entry.image,
        prompt=entry.prompt
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": "Saved", "id": new_entry.id}


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    entries = (
        db.query(models.History)
        .filter(models.History.user_id == current_user.id)
        .order_by(models.History.created_at.desc())
        .all()
    )
    return [
        {
            "id": e.id,
            "image": e.image,
            "prompt": e.prompt,
            "date": e.created_at.strftime("%d %b %Y, %H:%M") if e.created_at else ""
        }
        for e in entries
    ]


@router.delete("/history/{entry_id}")
def delete_history(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    entry = db.query(models.History).filter(
        models.History.id == entry_id,
        models.History.user_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    db.delete(entry)
    db.commit()
    return {"message": "Deleted"}


# ── Delete Account ───────────────────────────────────────────────────────────

@router.delete("/account")
def delete_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.query(models.History).filter(
        models.History.user_id == current_user.id
    ).delete()
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}