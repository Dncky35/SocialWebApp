from pydantic import BaseModel

class TokenData(BaseModel):
    account_id: str
    role: str
