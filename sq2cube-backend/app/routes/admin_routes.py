from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app import models
from app.deps import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Dashboard Stats ────────────────────────────────────────────────────────
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    total_users       = db.query(models.User).filter(models.User.is_admin == False).count()
    total_generations = db.query(models.History).count()
    failed_generations= db.query(models.History).filter(models.History.status == "failed").count()
    flagged_count     = db.query(models.History).filter(models.History.flagged == True).count()
    banned_users      = db.query(models.User).filter(models.User.is_banned == True).count()
    unread_feedback   = db.query(models.Feedback).filter(models.Feedback.is_read == False).count()

    # Signups per day for last 7 days
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    signups_raw = (
        db.query(cast(models.User.created_at, Date).label("day"), func.count().label("count"))
        .filter(models.User.created_at >= seven_days_ago)
        .group_by("day")
        .order_by("day")
        .all()
    )
    signups_per_day = [{"date": str(r.day), "count": r.count} for r in signups_raw]

    # Generations per day for last 7 days
    gens_raw = (
        db.query(cast(models.History.created_at, Date).label("day"), func.count().label("count"))
        .filter(models.History.created_at >= seven_days_ago)
        .group_by("day")
        .order_by("day")
        .all()
    )
    generations_per_day = [{"date": str(r.day), "count": r.count} for r in gens_raw]

    return {
        "total_users":        total_users,
        "total_generations":  total_generations,
        "failed_generations": failed_generations,
        "flagged_count":      flagged_count,
        "banned_users":       banned_users,
        "unread_feedback":    unread_feedback,
        "signups_per_day":    signups_per_day,
        "generations_per_day": generations_per_day,
    }


# ── Users ──────────────────────────────────────────────────────────────────
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    users = db.query(models.User).filter(models.User.is_admin == False).order_by(models.User.created_at.desc()).all()
    return [
        {
            "id":            u.id,
            "username":      u.username,
            "email":         u.email,
            "is_verified":   u.is_verified,
            "is_banned":     u.is_banned,
            "oauth_provider": u.oauth_provider,
            "total_generations": db.query(models.History).filter(models.History.user_id == u.id).count(),
            "joined":        u.created_at.strftime("%d %b %Y") if u.created_at else "",
        }
        for u in users
    ]


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    db.query(models.History).filter(models.History.user_id == user_id).delete()
    db.query(models.OTPCode).filter(models.OTPCode.user_id == user_id).delete()
    db.query(models.PasswordResetToken).filter(models.PasswordResetToken.user_id == user_id).delete()
    db.query(models.Feedback).filter(models.Feedback.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted."}


@router.patch("/users/{user_id}/ban")
def ban_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_banned = not user.is_banned
    db.commit()
    return {"message": "Banned." if user.is_banned else "Unbanned.", "is_banned": user.is_banned}


# ── Generations ────────────────────────────────────────────────────────────
@router.get("/generations")
def get_all_generations(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    entries = (
        db.query(models.History)
        .order_by(models.History.created_at.desc())
        .limit(200)
        .all()
    )
    return [
        {
            "id":       e.id,
            "user_id":  e.user_id,
            "username": e.user.username if e.user else "deleted",
            "email":    e.user.email if e.user else "",
            "image":    e.image,
            "prompt":   e.prompt,
            "status":   e.status,
            "flagged":  e.flagged,
            "date":     e.created_at.strftime("%d %b %Y, %H:%M") if e.created_at else "",
        }
        for e in entries
    ]


@router.delete("/generations/{entry_id}")
def delete_generation(
    entry_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    entry = db.query(models.History).filter(models.History.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Generation not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted."}


@router.patch("/generations/{entry_id}/flag")
def flag_generation(
    entry_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    entry = db.query(models.History).filter(models.History.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Generation not found.")
    entry.flagged = not entry.flagged
    db.commit()
    return {"message": "Flagged." if entry.flagged else "Unflagged.", "flagged": entry.flagged}


# ── Feedback ───────────────────────────────────────────────────────────────
@router.get("/feedback")
def get_all_feedback(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    items = db.query(models.Feedback).order_by(models.Feedback.created_at.desc()).all()
    return [
        {
            "id":      f.id,
            "name":    f.name,
            "email":   f.email,
            "subject": f.subject,
            "message": f.message,
            "is_read": f.is_read,
            "date":    f.created_at.strftime("%d %b %Y, %H:%M") if f.created_at else "",
        }
        for f in items
    ]


@router.patch("/feedback/{feedback_id}/read")
def mark_feedback_read(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    f = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Feedback not found.")
    f.is_read = True
    db.commit()
    return {"message": "Marked as read."}


@router.delete("/feedback/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    f = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Feedback not found.")
    db.delete(f)
    db.commit()
    return {"message": "Deleted."}