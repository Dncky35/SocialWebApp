from beanie import Document, PydanticObjectId
from pydantic import EmailStr, Field
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import Form

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
    followers: List[PydanticObjectId] = Field(default_factory=list)
    following: List[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "accounts"  # MongoDB collection name

    @classmethod
    def as_form(
        cls,
        email: EmailStr = Form(...),
        username: str = Form(...),
        password: str = Form(...),
        full_name: Optional[str] = Form(None),
    ):
        return cls(
            email=email,
            username=username,
            password=password,
            full_name=full_name
        )
