from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx, os
from dotenv import load_dotenv

from app.database import get_db
from app import models
from app.auth import create_token

load_dotenv()

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Google ─────────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")

@router.get("/auth/google")
def google_login():
    params = (
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
    )
    return RedirectResponse("https://accounts.google.com/o/oauth2/v2/auth" + params)

@router.get("/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Google OAuth failed.")

        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        info = user_res.json()

    email    = info.get("email")
    username = info.get("name", email.split("@")[0])
    picture  = info.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from Google.")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email, username=username,
            profile_image=picture, is_verified=True, oauth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.profile_image and picture:
            user.profile_image = picture
            db.commit()

    token = create_token({"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/oauth-success?token={token}")


# ── GitHub ─────────────────────────────────────────────────────────────────
GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI  = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/auth/github/callback")

@router.get("/auth/github")
def github_login():
    params = (
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=user:email"
    )
    return RedirectResponse("https://github.com/login/oauth/authorize" + params)

@router.get("/auth/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"}
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="GitHub OAuth failed.")

        # Get user profile
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        info = user_res.json()

        # Get user emails (GitHub may not return email in profile if private)
        email = info.get("email")
        if not email:
            emails_res = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            emails = emails_res.json()
            # Pick primary verified email
            for e in emails:
                if e.get("primary") and e.get("verified"):
                    email = e.get("email")
                    break

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from GitHub.")

    username = info.get("name") or info.get("login") or email.split("@")[0]
    picture  = info.get("avatar_url")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email, username=username,
            profile_image=picture, is_verified=True, oauth_provider="github",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.profile_image and picture:
            user.profile_image = picture
            db.commit()

    token = create_token({"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/oauth-success?token={token}")