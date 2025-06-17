from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

class Account(BaseModel):
    id: Optional[str] = None  # MongoDB ObjectId as string
    email: EmailStr  # validates email format automatically
    username: str = Field(..., min_length=3, max_length=30, regex="^[a-zA-Z0-9_]+$")
    password: str  # hashed password
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None  # profile picture
    role: str = "user"  # roles: user, admin, moderator, etc.
    is_verified: bool = False  # email verified or not
    followers: Optional[List[str]] = []  # list of user IDs
    following: Optional[List[str]] = []  # list of user IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

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
