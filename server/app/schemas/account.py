from pydantic import BaseModel, EmailStr, Field
from beanie import PydanticObjectId
from typing import Optional

class PublicAccount(BaseModel):
    id: PydanticObjectId
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    profile_image_url: Optional[str]
    followers_count: int
    following_count: int
    is_following: Optional[bool] = None  # Only set when viewing others

    class Config:
        orm_mode = True

class UpdateProfile(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=50)
    bio: Optional[str] = Field(None, max_length=160)
    profile_image_url: Optional[str] = Field(None, max_length=255)