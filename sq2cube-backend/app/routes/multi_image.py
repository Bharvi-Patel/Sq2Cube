from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Literal, List
import logging

from app.services.fal_client import multi_image_to_3d
from app.utils.file_utils import uploads_to_base64
from app.utils.response_models import ConvertResponse, ModelUrls
from app.database import get_db
from app import models
from app.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/convert/multi-image", response_model=ConvertResponse, summary="Multiple images → 3D")
async def multi_image_endpoint(
    files: List[UploadFile] = File(...),
    output_format: Literal["glb", "obj"] = Form("glb"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not (1 <= len(files) <= 4):
        raise HTTPException(400, f"Upload 1–4 images. You sent {len(files)}.")

    image_uris = await uploads_to_base64(files)

    try:
        urls = await multi_image_to_3d(image_urls=image_uris, output_format=output_format)

        # Save to history
        entry = models.History(
            user_id = current_user.id,
            image   = urls.get("glb") or urls.get("obj") or "",
            prompt  = "multi-image generation",
            status  = "success",
        )
        db.add(entry)
        db.commit()

        return ConvertResponse(
            status="success",
            mode="multi_image",
            model="TripoSR (fal.ai)",
            urls=ModelUrls(**urls)
        )
    except RuntimeError as e:
        db.add(models.History(
            user_id = current_user.id,
            image   = "",
            prompt  = "multi-image generation",
            status  = "failed",
        ))
        db.commit()
        raise HTTPException(500, str(e))
    except TimeoutError as e:
        raise HTTPException(504, str(e))