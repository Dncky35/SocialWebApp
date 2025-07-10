from pydantic import BaseModel, EmailStr, Field
from beanie import PydanticObjectId
from typing import Literal, Optional

class PublicAccount(BaseModel):
    id: PydanticObjectId
    username: str
    bio: Optional[str]
    profile_image_url: Optional[str]
    followers_count: int
    following_count: int
    is_following: Optional[bool] = None  # Only set when viewing others

    class Config:
        orm_mode = True

class PrivateAccount(PublicAccount):
    email:str
    full_name: Optional[str]
    is_verified: bool = Field(default=False)

class UpdateProfile(BaseModel):
    bio: Optional[str] = Field(None, max_length=160)
    avatar_url: Optional[str] = Field(None, max_length=255)

class AccountAdminRequest(BaseModel):
    email: Optional[str] = Field(None, max_length=255)
    username: Optional[str] = Field(None, max_length=50)
    password: Optional[str] = Field(None, max_length=255)
    full_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=160)
    avatar_url: Optional[str] = Field(None, max_length=255)
    role: Optional[Literal["user", "admin", "moderator"]] = Field(None)
    is_verified: bool = Field(default=False)
    is_deleted: bool = Field(default=False)