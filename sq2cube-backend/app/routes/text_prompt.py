from fastapi import APIRouter, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Literal
import logging

from app.services.fal_client import text_to_3d
from app.utils.response_models import ConvertResponse, ModelUrls
from app.database import get_db
from app import models
from app.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/convert/text-prompt", response_model=ConvertResponse, summary="Text prompt → 3D")
async def text_prompt_endpoint(
    prompt: str = Form(..., min_length=3, max_length=600),
    output_format: Literal["glb", "obj"] = Form("glb"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        urls = await text_to_3d(prompt=prompt, output_format=output_format)

        # Save to history
        entry = models.History(
            user_id = current_user.id,
            image   = urls.get("glb") or urls.get("obj") or "",
            prompt  = prompt,
            status  = "success",
        )
        db.add(entry)
        db.commit()

        return ConvertResponse(
            status="success",
            mode="text_prompt",
            model="Tripo3D v2.5 (fal.ai)",
            urls=ModelUrls(**urls)
        )
    except RuntimeError as e:
        db.add(models.History(
            user_id = current_user.id,
            image   = "",
            prompt  = prompt,
            status  = "failed",
        ))
        db.commit()
        raise HTTPException(500, str(e))
    except TimeoutError as e:
        raise HTTPException(504, str(e))