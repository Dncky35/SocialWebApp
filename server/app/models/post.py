from typing import List, Optional
from beanie import Document, PydanticObjectId, before_event, SaveChanges, Replace
from pydantic import Field
from datetime import datetime, timezone

def get_utc_now():
    return datetime.now(timezone.utc)   

class Post(Document):
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    
    # Essential Fields
    author_id: PydanticObjectId
    content: str = Field(..., min_length=1, max_length=2000)
    
    # Media/Tags
    image_url : Optional[str] = None
    tags: List[str] = Field(default_factory=list, max_length=10)
    
    # Engagement Metrics (COUNTS ONLY for scalability)
    likes_count: int = Field(default=0, ge=0)
    comments_count: int = Field(default=0, ge=0)
    reposts_count: int = Field(default=0, ge=0)
    
    # Timestamps
    is_deleted: bool = Field(default=False)
    deleted_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)
    
    class Settings:
        name = "posts"  
        # Optional: Add a compound index on author_id and created_at for feeds
        # indexes = [("author_id", -1), ("created_at", -1)] 
    
    # Auto-update the updated_at field before every save
    @before_event(Replace, SaveChanges)
    def update_timestamp(self):
        self.updated_at = datetime.now(timezone.utc)
    
    # Handle soft-deletion timestamp update
    @before_event(SaveChanges)
    def update_deleted_at(self):
        if self.is_deleted and self.deleted_at is None:
            self.deleted_at = get_utc_now()
        elif not self.is_deleted and self.deleted_at is not None:
            self.deleted_at = None
    
# --- RECOMMENDED AUXILIARY COLLECTIONS (For Performance) ---

# This document tracks the N:M relationship between Posts and Users (who liked what)
# It's necessary for checking if a user liked a post and for retrieving a list of users who liked it.

class PostLike(Document):
    user_id: PydanticObjectId
    post_id: PydanticObjectId
    created_at: datetime = Field(default_factory=get_utc_now)
    
    class Settings:
        name = "post_likes"
        # Ensures a user can only like a post once (unique constraint)
        indexes = [
            ("user_id", "post_id"),
        ]
        
# This document tracks comments, which should be queryable by post ID
class Comment(Document):
    user_id: PydanticObjectId
    post_id: PydanticObjectId
    content: str = Field(..., min_length=1, max_length=280)
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=get_utc_now)
    
    class Settings:
        name = "comments"
        # Index comments by post ID for fast retrieval
        indexes = [
            ("post_id", -1), 
        ]
        
class SubComment(Document):
    user_id: PydanticObjectId
    comment_id: PydanticObjectId
    content: str = Field(..., min_length=1, max_length=280)
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=get_utc_now)
    
    class Settings:
        name = "subcomments"
        # Index subcomments by comment ID for fast retrieval
        indexes = [
            ("comment_id", -1), 
        ]