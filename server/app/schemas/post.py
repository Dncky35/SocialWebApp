from pydantic import BaseModel
from typing import Optional

class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = None

class PostUpdate(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None