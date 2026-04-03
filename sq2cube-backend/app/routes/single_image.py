from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Literal, Optional
import logging

from app.services.fal_client import image_to_3d
from app.utils.file_utils import upload_to_base64
from app.utils.response_models import ConvertResponse, ModelUrls
from app.database import get_db
from app import models
from app.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/convert/single-image", response_model=ConvertResponse, summary="Single image → 3D")
async def single_image_endpoint(
    file: UploadFile = File(...),
    output_format: Literal["glb", "obj"] = Form("glb"),
    remove_background: bool = Form(True),
    mc_resolution: int = Form(256, ge=32, le=512),
    texture_prompt: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    image_uri = await upload_to_base64(file)

    try:
        urls = await image_to_3d(
            image_url         = image_uri,
            output_format     = output_format,
            remove_background = remove_background,
            mc_resolution     = mc_resolution,
        )

        # Save to history
        entry = models.History(
            user_id = current_user.id,
            image   = urls.get("glb") or urls.get("obj") or "",
            thumbnail = urls.get("thumbnail") or "", 
            prompt  = texture_prompt or "",
            status  = "success",
        )
        db.add(entry)
        db.commit()

        return ConvertResponse(
            status="success",
            mode="single_image",
            model="TripoSR (fal.ai)",
            urls=ModelUrls(**urls)
        )
    except RuntimeError as e:
        # Save failed generation too
        db.add(models.History(
            user_id = current_user.id,
            image   = "",
            prompt  = texture_prompt or "",
            status  = "failed",
        ))
        db.commit()
        raise HTTPException(500, str(e))
    except TimeoutError as e:
        raise HTTPException(504, str(e))