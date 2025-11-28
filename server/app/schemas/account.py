from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# What the user sends to register
class AccountRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=8, description="Raw password from user")
    full_name: Optional[str] = None
    
class LoginPayload(BaseModel):
    email: EmailStr
    password: str
    
class UpdateAccountPayload(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    

# What you return to the frontend (Hides password!)
class AccountResponse(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    email: EmailStr
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    created_at: datetime
    
    class Config:
        # Allows Pydantic to read data from the Beanie Document
        from_attributes = True