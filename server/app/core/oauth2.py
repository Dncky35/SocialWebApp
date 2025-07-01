from fastapi import Cookie, status, HTTPException
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timezone, timedelta
from beanie import PydanticObjectId
from .config import settings
from ..core import database
from bson import ObjectId
from ..schemas import token as token_schema
from .. import models

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_token(data: dict, is_access_token: bool = False):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) if is_access_token else timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({
        "exp": expire, 
        "sub": str(data.get("account_id")),
        "role": data.get("role", "user")
        })

    secret_key = settings.secret_key if is_access_token else settings.secret_key_refresh
    return jwt.encode(to_encode, secret_key, algorithm=settings.algorithm)

def verify_token(token: str, is_access_token: bool = False) -> token_schema.TokenData:
    secret_key = settings.secret_key_refresh if not is_access_token else settings.secret_key
    try:
        payload = jwt.decode(token, secret_key, algorithms=[settings.algorithm])
        id: str = payload.get("sub")
        role = payload.get("role", "user")

        if id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
        return token_schema.TokenData(account_id=id, role=role)

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(token = Cookie(None, alias="accessToken")):

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token missing")
    token_data = verify_token(token=token, is_access_token=True)
    account = await models.Account.find_one({"_id":ObjectId(token_data.account_id)})
    if account is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return token_data

async def get_logged_in_user(token = Cookie(None, alias="refreshToken")):

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    token_data = verify_token(token=token)
    account = await models.Account.find_one({"_id":ObjectId(token_data.account_id)})
    if account is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return token_data

async def get_current_admin_user(token = Cookie(None, alias="accessToken")) -> models.Account:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token missing")
    
    token_data = verify_token(token=token, is_access_token=True)
    
    try: 
        account = await models.Account.get(PydanticObjectId(token_data.account_id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid account ID")
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if not account.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    return account

ROLE_HIERARCHY = ["user", "moderator", "admin", "superadmin"]

def get_next_role(current_role:str, promote=True) -> str:
    try:
        idx = ROLE_HIERARCHY.index(current_role)
        if promote:
            return ROLE_HIERARCHY[idx + 1] if idx + 1 < len(ROLE_HIERARCHY) else current_role
        else:
            return ROLE_HIERARCHY[idx - 1] if idx > 0 else current_role
    except ValueError:
        return current_role