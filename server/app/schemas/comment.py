from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

class CommentResponse(BaseModel):
    id: int
    content: str
    author_id: int
    post_id: int
    created_at: datetime
    updated_at: datetime

class CommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_comment_id: Optional[PydanticObjectId] = None