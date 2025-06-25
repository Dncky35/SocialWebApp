from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime, timezone
from fastapi import Form

class Post(Document):
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    author_id: str
    content: str = Field(..., min_length=1, max_length=500)
    image_url: Optional[str] = None
    likes: List[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class settings:
        name = "posts" # MongoDB collection name