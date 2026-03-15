from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from typing import List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

from app.database import get_db
from app import models
from app.deps import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM     = os.getenv("MAIL_FROM")
MAIL_SERVER   = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT     = int(os.getenv("MAIL_PORT", 587))


# ── Dashboard Stats ────────────────────────────────────────────────────────
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    total_users        = db.query(models.User).filter(models.User.is_admin == False).count()
    total_generations  = db.query(models.History).count()
    failed_generations = db.query(models.History).filter(models.History.status == "failed").count()
    flagged_count      = db.query(models.History).filter(models.History.flagged == True).count()
    banned_users       = db.query(models.User).filter(models.User.is_banned == True).count()
    unread_feedback    = db.query(models.Feedback).filter(models.Feedback.is_read == False).count()

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

    signups_raw = (
        db.query(cast(models.User.created_at, Date).label("day"), func.count().label("count"))
        .filter(models.User.created_at >= seven_days_ago)
        .group_by("day").order_by("day").all()
    )
    signups_per_day = [{"date": str(r.day), "count": r.count} for r in signups_raw]

    gens_raw = (
        db.query(cast(models.History.created_at, Date).label("day"), func.count().label("count"))
        .filter(models.History.created_at >= seven_days_ago)
        .group_by("day").order_by("day").all()
    )
    generations_per_day = [{"date": str(r.day), "count": r.count} for r in gens_raw]

    # Retention: users who signed up 7+ days ago and generated something in last 7 days
    older_users = db.query(models.User.id).filter(
        models.User.created_at < datetime.now(timezone.utc) - timedelta(days=7),
        models.User.is_admin == False,
        models.User.is_verified == True,
    ).subquery()

    returned = db.query(func.count(func.distinct(models.History.user_id))).filter(
        models.History.user_id.in_(older_users),
        models.History.created_at >= seven_days_ago
    ).scalar()

    total_older = db.query(func.count(models.User.id)).filter(
        models.User.created_at < datetime.now(timezone.utc) - timedelta(days=7),
        models.User.is_admin == False,
        models.User.is_verified == True,
    ).scalar()

    retention_rate = round((returned / total_older) * 100, 1) if total_older > 0 else 0

    # Maintenance mode
    setting = db.query(models.SiteSetting).filter(models.SiteSetting.key == "maintenance_mode").first()
    maintenance_mode = setting.value == "true" if setting else False

    return {
        "total_users":         total_users,
        "total_generations":   total_generations,
        "failed_generations":  failed_generations,
        "flagged_count":       flagged_count,
        "banned_users":        banned_users,
        "unread_feedback":     unread_feedback,
        "signups_per_day":     signups_per_day,
        "generations_per_day": generations_per_day,
        "retention_rate":      retention_rate,
        "retained_users":      returned,
        "total_older_users":   total_older,
        "maintenance_mode":    maintenance_mode,
    }


# ── Maintenance Mode ───────────────────────────────────────────────────────
@router.patch("/maintenance")
def toggle_maintenance(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    setting = db.query(models.SiteSetting).filter(models.SiteSetting.key == "maintenance_mode").first()
    if not setting:
        setting = models.SiteSetting(key="maintenance_mode", value="true")
        db.add(setting)
    else:
        setting.value = "false" if setting.value == "true" else "true"
    db.commit()
    return {"maintenance_mode": setting.value == "true"}


@router.get("/maintenance")
def get_maintenance(db: Session = Depends(get_db)):
    setting = db.query(models.SiteSetting).filter(models.SiteSetting.key == "maintenance_mode").first()
    return {"maintenance_mode": setting.value == "true" if setting else False}


# ── Users ──────────────────────────────────────────────────────────────────
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    users = db.query(models.User).filter(models.User.is_admin == False).order_by(models.User.created_at.desc()).all()
    return [
        {
            "id":                u.id,
            "username":          u.username,
            "email":             u.email,
            "bio":               u.bio,
            "profile_image":     u.profile_image,
            "gender":            u.gender,
            "phone":             u.phone,
            "dob":               u.dob,
            "is_verified":       u.is_verified,
            "is_banned":         u.is_banned,
            "oauth_provider":    u.oauth_provider,
            "total_generations": db.query(models.History).filter(models.History.user_id == u.id).count(),
            "joined":            u.created_at.strftime("%d %b %Y") if u.created_at else "",
        }
        for u in users
    ]


@router.get("/users/{user_id}")
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found.")

    recent = db.query(models.History).filter(
        models.History.user_id == user_id
    ).order_by(models.History.created_at.desc()).limit(6).all()

    return {
        "id":                u.id,
        "username":          u.username,
        "email":             u.email,
        "bio":               u.bio,
        "profile_image":     u.profile_image,
        "gender":            u.gender,
        "phone":             u.phone,
        "dob":               u.dob,
        "is_verified":       u.is_verified,
        "is_banned":         u.is_banned,
        "is_admin":          u.is_admin,
        "oauth_provider":    u.oauth_provider,
        "total_generations": db.query(models.History).filter(models.History.user_id == u.id).count(),
        "joined":            u.created_at.strftime("%d %b %Y") if u.created_at else "",
        "recent":            [{"id": e.id, "image": e.image, "prompt": e.prompt} for e in recent],
    }


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
    return {"is_banned": user.is_banned}


# ── Generations ────────────────────────────────────────────────────────────
@router.get("/generations")
def get_all_generations(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    entries = db.query(models.History).order_by(models.History.created_at.desc()).limit(200).all()
    return [
        {
            "id":      e.id,
            "user_id": e.user_id,
            "username": e.user.username if e.user else "deleted",
            "email":   e.user.email if e.user else "",
            "image":   e.image,
            "prompt":  e.prompt,
            "status":  e.status,
            "flagged": e.flagged,
            "date":    e.created_at.strftime("%d %b %Y, %H:%M") if e.created_at else "",
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
        raise HTTPException(status_code=404, detail="Not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted."}


class BulkDeleteRequest(BaseModel):
    ids: List[int]

@router.delete("/generations/bulk/delete")
def bulk_delete_generations(
    data: BulkDeleteRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    db.query(models.History).filter(models.History.id.in_(data.ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"Deleted {len(data.ids)} generations."}


@router.patch("/generations/{entry_id}/flag")
def flag_generation(
    entry_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    entry = db.query(models.History).filter(models.History.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found.")
    entry.flagged = not entry.flagged
    db.commit()
    return {"flagged": entry.flagged}


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
        raise HTTPException(status_code=404, detail="Not found.")
    f.is_read = True
    db.commit()
    return {"message": "Marked as read."}


class ReplyRequest(BaseModel):
    reply: str

@router.post("/feedback/{feedback_id}/reply")
def reply_to_feedback(
    feedback_id: int,
    data: ReplyRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    f = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Not found.")

    try:
        msg = MIMEMultipart()
        msg["From"]    = MAIL_FROM
        msg["To"]      = f.email
        msg["Subject"] = f"Re: {f.subject or 'Your message to Sq2Cube'}"
        body = f"""Hi {f.name or 'there'},

{data.reply}

---
This is a reply to your message:
"{f.message}"

— The Sq2Cube Team"""
        msg.attach(MIMEText(body, "plain"))
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, f.email, msg.as_string())
        server.quit()

        f.is_read = True
        db.commit()
        return {"message": "Reply sent."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


@router.delete("/feedback/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    f = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Not found.")
    db.delete(f)
    db.commit()
    return {"message": "Deleted."}