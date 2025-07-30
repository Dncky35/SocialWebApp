from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional, List

class Comment(Document):
    post_id: PydanticObjectId
    author_id: PydanticObjectId
    content: str = Field(min_length=1, max_length=500)
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    likes: List[PydanticObjectId] = Field(default_factory=list)
    parent_comment_id: Optional[PydanticObjectId] = None
    child_commets: List[PydanticObjectId] = Field(default_factory=list)

    class Settings:
        name = "comments"

    def pre_save(self):
        self.updated_at = datetime.now(timezone.utc)
        super().pre_save()

    class Config:
        arbitrary_types_allowed = True