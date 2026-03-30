"""
utils/file_utils.py
━━━━━━━━━━━━━━━━━━━
Helpers for:
  - Validating uploaded images
  - Converting UploadFile → base64 data URI (for Meshy API)
  - Converting UploadFile → CDN URL (if you host uploads yourself)
"""

import base64
import os
import logging
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_MB", 20)) * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "jpeg",
    "image/jpg":  "jpeg",
    "image/png":  "png",
    "image/webp": "webp",
}


async def upload_to_base64(file: UploadFile) -> str:
    """
    Read an UploadFile and return a base64 data URI string.
    Meshy accepts:  data:image/png;base64,<data>

    Use this if you don't have a CDN / public file hosting.
    Meshy will receive the raw image data without needing a public URL.
    """
    _validate_type(file)
    content = await file.read()
    _validate_size(content, file.filename)

    mime = file.content_type
    b64  = base64.b64encode(content).decode("utf-8")
    data_uri = f"data:{mime};base64,{b64}"
    logger.info(f"Encoded '{file.filename}' → base64 data URI ({len(content)//1024} KB)")
    return data_uri


async def uploads_to_base64(files: list[UploadFile]) -> list[str]:
    """Convert multiple UploadFiles to base64 data URIs."""
    return [await upload_to_base64(f) for f in files]


def _validate_type(file: UploadFile):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{file.content_type}'. "
                f"Allowed: {', '.join(ALLOWED_CONTENT_TYPES.keys())}"
            ),
        )


def _validate_size(content: bytes, filename: str):
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File '{filename}' is too large "
                f"({len(content)//1024//1024} MB). "
                f"Max allowed: {MAX_UPLOAD_BYTES//1024//1024} MB."
            ),
        )