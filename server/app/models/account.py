from fastapi import Form
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

class Account(BaseModel):
    id: Optional[str] = None
    email: str
    password: str
    username: str
    role: str = "user"
    is_verified: bool = False
    created_at: datetime = datetime.utcnow()

    @classmethod
    def as_form(cls, email:str = Form(...), password:str = Form(...), username:str=Form(...)):
        return cls(email=email, password=password, username=username)