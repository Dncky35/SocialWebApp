from beanie import Document, PydanticObjectId, Replace, SaveChanges, before_event
from pydantic import EmailStr, Field
from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from server.app.models.post import get_utc_now

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class Account(Document):
    
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8, max_length=255)
    
    full_name: Optional[str] = Field(..., min_length=4, max_length=50)
    bio: Optional[str] = Field(None, max_length=160)
    avatar_url: Optional[str] = Field(None, max_length=255)
    
    role: str = Field(default="user")
    is_verified: bool = Field(default=False)
    is_deleted: bool = Field(default=False)
    is_banned: bool = Field(default=False)
    deleted_at: Optional[datetime] = Field(default=None)
    # SCALABILITY: Store counts, not lists of IDs
    follower_count: int = Field(default=0)
    following_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "accounts"
        
    # Automatically update 'updated_at' on save
    @before_event(Replace, SaveChanges)
    def update_timestamp(self):
        self.updated_at = datetime.now(timezone.utc)
        
    @before_event(SaveChanges)
    def update_deleted_at(self):
        if self.is_deleted and self.deleted_at is None:
            self.deleted_at = get_utc_now()
        elif not self.is_deleted and self.deleted_at is not None:
            self.deleted_at = None
