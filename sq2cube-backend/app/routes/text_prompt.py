"""
app/routes/text_prompt.py
"""

from fastapi import APIRouter, Form, HTTPException
from typing import Literal
import logging

from app.services.fal_client import text_to_3d
from app.utils.response_models import ConvertResponse, ModelUrls

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/convert/text-prompt", response_model=ConvertResponse, summary="Text prompt → 3D")
async def text_prompt_endpoint(
    prompt: str = Form(..., min_length=3, max_length=600),
    output_format: Literal["glb", "obj"] = Form("glb"),
):
    try:
        urls = await text_to_3d(prompt=prompt, output_format=output_format)
        return ConvertResponse(status="success", mode="text_prompt", model="Tripo3D v2.5 (fal.ai)", urls=ModelUrls(**urls))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    except TimeoutError as e:
        raise HTTPException(504, str(e))