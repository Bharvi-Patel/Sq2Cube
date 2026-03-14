from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import JWTError

from app.database import get_db
from app.auth import decode_token
from app import models


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """
    Reads the Authorization header, decodes the JWT,
    and returns the User row from the database.
    Every protected route uses this as a dependency.
    """
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid token format")

        token = authorization.split(" ")[1]
        user_id = decode_token(token)

    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user