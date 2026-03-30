"""
app/routes/multi_image.py
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Literal, List
import logging

from app.services.fal_client import multi_image_to_3d
from app.utils.file_utils import uploads_to_base64
from app.utils.response_models import ConvertResponse, ModelUrls

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/convert/multi-image", response_model=ConvertResponse, summary="Multiple images → 3D")
async def multi_image_endpoint(
    files: List[UploadFile] = File(...),
    output_format: Literal["glb", "obj"] = Form("glb"),
):
    if not (1 <= len(files) <= 4):
        raise HTTPException(400, f"Upload 1–4 images. You sent {len(files)}.")

    image_uris = await uploads_to_base64(files)

    try:
        urls = await multi_image_to_3d(image_urls=image_uris, output_format=output_format)
        return ConvertResponse(status="success", mode="multi_image", model="Tripo3D v2.5 (fal.ai)", urls=ModelUrls(**urls))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    except TimeoutError as e:
        raise HTTPException(504, str(e))