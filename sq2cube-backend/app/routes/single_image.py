"""
app/routes/single_image.py
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Literal, Optional
import logging

from app.services.fal_client import image_to_3d
from app.utils.file_utils import upload_to_base64
from app.utils.response_models import ConvertResponse, ModelUrls

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/convert/single-image", response_model=ConvertResponse, summary="Single image → 3D")
async def single_image_endpoint(
    file: UploadFile = File(...),
    output_format: Literal["glb", "obj"] = Form("glb"),
    remove_background: bool = Form(True),
    mc_resolution: int = Form(256, ge=32, le=512),
    texture_prompt: Optional[str] = Form(None),
):
    image_uri = await upload_to_base64(file)

    try:
        urls = await image_to_3d(
            image_url          = image_uri,
            output_format      = output_format,
            remove_background  = remove_background,
            mc_resolution      = mc_resolution,
        )
        return ConvertResponse(status="success", mode="single_image", model="TripoSR (fal.ai)", urls=ModelUrls(**urls))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    except TimeoutError as e:
        raise HTTPException(504, str(e))