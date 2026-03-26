import base64
import re
from typing import Optional

from fastapi import HTTPException


DATA_URL_IMAGE_RE = re.compile(r"^data:(image\/[a-zA-Z0-9.+-]+);base64,")
ALLOWED_IMAGE_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}


def validate_email(email: str) -> str:
    value = email.strip().lower()
    if not value or len(value) > 254:
        raise ValueError("Invalid email.")
    if "@" not in value or value.startswith("@") or value.endswith("@"):
        raise ValueError("Invalid email.")
    return value


def validate_password(password: str) -> str:
    value = password.strip()
    if len(value) < 8 or len(value) > 128:
        raise ValueError("Password must be 8-128 characters.")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must include at least one uppercase letter.")
    if not re.search(r"[a-z]", value):
        raise ValueError("Password must include at least one lowercase letter.")
    if not re.search(r"[0-9]", value):
        raise ValueError("Password must include at least one number.")
    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError("Password must include at least one special character.")
    return value


def validate_username(username: str) -> str:
    value = username.strip()
    if len(value) < 2 or len(value) > 40:
        raise ValueError("Username must be 2-40 characters.")
    return value


def validate_data_url_image(
    image_value: Optional[str],
    *,
    max_size_bytes: int,
    field_name: str,
) -> Optional[str]:
    if image_value is None:
        return None

    value = image_value.strip()
    if not value:
        raise ValueError(f"{field_name} cannot be empty.")

    match = DATA_URL_IMAGE_RE.match(value)
    if not match:
        raise ValueError(f"{field_name} must be a base64 image data URL.")

    mime_type = match.group(1).lower()
    if mime_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise ValueError(
            f"{field_name} type not allowed. Use PNG, JPEG, or WEBP."
        )

    encoded = value.split(",", 1)[1]
    try:
        decoded = base64.b64decode(encoded, validate=True)
    except Exception as exc:  # noqa: BLE001
        raise ValueError(f"{field_name} has invalid base64 encoding.") from exc

    if len(decoded) > max_size_bytes:
        raise ValueError(
            f"{field_name} exceeds max size of {max_size_bytes // (1024 * 1024)}MB."
        )

    signature_valid = (
        (mime_type == "image/png" and decoded.startswith(b"\x89PNG\r\n\x1a\n"))
        or (mime_type in {"image/jpeg", "image/jpg"} and decoded.startswith(b"\xff\xd8\xff"))
        or (
            mime_type == "image/webp"
            and len(decoded) >= 12
            and decoded.startswith(b"RIFF")
            and decoded[8:12] == b"WEBP"
        )
    )
    if not signature_valid:
        raise ValueError(f"{field_name} content does not match MIME type.")
    return value


def enforce_content_length(content_length: Optional[str], max_bytes: int) -> None:
    if content_length is None:
        return
    try:
        size = int(content_length)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid Content-Length header.") from exc

    if size > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Request too large. Maximum allowed is {max_bytes // (1024 * 1024)}MB.",
        )
