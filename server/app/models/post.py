from typing import List, Optional
from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime, timezone
from pydantic import BaseModel

# TO DO: Add Tags for post but it could be optional

class Post(Document):
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    author_id: str
    content: str = Field(..., min_length=1, max_length=500)
    image_url: Optional[str] = None
    likes: List[PydanticObjectId] = Field(default_factory=list)
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class settings:
        name = "posts" # MongoDB collection name

