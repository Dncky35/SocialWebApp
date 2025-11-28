from pydantic import BaseModel
from typing import Optional

class PostCreation(BaseModel):
    content: str
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None

class PostUpdate(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None
    
class PostResponse(BaseModel):
    id: str
    content: str
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None
    created_at: str
    updated_at: str
    author_id: str
    likes_count: int
    comments_count: int
    reposts_count: int
    
class PaginatedPostResponse(BaseModel):
    posts: list[PostResponse]
    total: int
    page: int
    size: int
    has_more: bool

class PostLikeResponse(BaseModel):
    user_id: str
    post_id: str
    created_at: str

class CommentResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    content: str
    created_at: str
    updated_at: str
    
class CommentCreation(BaseModel):
    content: str
    
class CommentUpdate(BaseModel):
    content: Optional[str] = None
    
class SubCommentResponse(BaseModel):
    id: str
    comment_id: str
    author_id: str
    content: str
    created_at: str
    updated_at: str
    
class SubCommentCreation(BaseModel):
    content: str
    
class SubCommentUpdate(BaseModel):
    content: Optional[str] = None