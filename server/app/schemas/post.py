from pydantic import BaseModel
from typing import Optional
from app.schemas.account import PublicAccount
from datetime import datetime

class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None

class PostUpdate(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None

class PostPublic(BaseModel):
    id: str
    content: str
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None
    likes: list[str]
    created_at: datetime   
    updated_at: datetime
    owner: PublicAccount