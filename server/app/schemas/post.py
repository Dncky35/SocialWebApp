from pydantic import BaseModel
from typing import Optional
from app.schemas.account import PublicAccount
from app.schemas.comment import CommentResponse
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
    is_liked: Optional[bool] = None
    comments: Optional[list[CommentResponse]] = None
    created_at: datetime   
    updated_at: datetime
    owner: PublicAccount