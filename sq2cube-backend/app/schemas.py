from pydantic import BaseModel
from typing import Optional


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


class HistoryCreate(BaseModel):
    image: str
    prompt: Optional[str] = None