from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

class CommentResponse(BaseModel):
    id:str
    content: str
    created_at: datetime
    updated_at: datetime
    author_id: PydanticObjectId
    post_id: PydanticObjectId
    parent_comment_id: Optional[PydanticObjectId] = None
    child_commets: List[PydanticObjectId] = Field(default_factory=list)
    likes: List[PydanticObjectId] = Field(default_factory=list)
    is_liked: Optional[bool] = None

class CommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_comment_id: Optional[PydanticObjectId] = None