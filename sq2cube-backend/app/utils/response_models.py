"""
utils/response_models.py
━━━━━━━━━━━━━━━━━━━━━━━━
Pydantic schemas for all API responses.
"""

from pydantic import BaseModel
from typing import Optional


class ModelUrls(BaseModel):
    glb:       Optional[str] = None
    obj:       Optional[str] = None
    fbx:       Optional[str] = None
    stl:       Optional[str] = None
    usdz:      Optional[str] = None
    thumbnail: Optional[str] = None


class ConvertResponse(BaseModel):
    status:    str           # "success"
    mode:      str           # "single_image" | "multi_image" | "text_prompt"
    model:     str           # "Meshy-6"
    urls:      ModelUrls     # download links returned by Meshy
    credits_used: Optional[int] = None


class BalanceResponse(BaseModel):
    balance: int             # remaining Meshy credits


class ErrorResponse(BaseModel):
    status:  str = "error"
    detail:  str