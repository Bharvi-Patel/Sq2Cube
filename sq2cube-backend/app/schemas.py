from pydantic import BaseModel, validator
from typing import Optional
import os

from app.validation import (
    validate_data_url_image,
    validate_username,
)


MAX_PROFILE_IMAGE_BYTES = int(os.getenv("MAX_PROFILE_IMAGE_BYTES", 5 * 1024 * 1024))
MAX_HISTORY_IMAGE_BYTES = int(os.getenv("MAX_HISTORY_IMAGE_BYTES", 8 * 1024 * 1024))


class Signup(BaseModel):
    email: str
    password: str
    username: str


class Login(BaseModel):
    email: str
    password: str


class ProfileSetup(BaseModel):
    username: str
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None

    @validator("username")
    def validate_profile_username(cls, value: str) -> str:
        return validate_username(value)

    @validator("profile_image")
    def validate_profile_image_data_url(cls, value: Optional[str]) -> Optional[str]:
        return validate_data_url_image(
            value,
            max_size_bytes=MAX_PROFILE_IMAGE_BYTES,
            field_name="profile_image",
        )


class HistoryCreate(BaseModel):
    image: str
    prompt: Optional[str] = None

    @validator("image")
    def validate_history_image_data_url(cls, value: str) -> str:
        validated = validate_data_url_image(
            value,
            max_size_bytes=MAX_HISTORY_IMAGE_BYTES,
            field_name="image",
        )
        return validated or value

    @validator("prompt")
    def validate_prompt_size(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        if len(value.strip()) > 1000:
            raise ValueError("Prompt cannot exceed 1000 characters.")
        return value.strip()