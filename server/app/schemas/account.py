from pydantic import BaseModel, EmailStr
from typing import Optional

class PublicAccount(BaseModel):
    id:str
    username:str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None