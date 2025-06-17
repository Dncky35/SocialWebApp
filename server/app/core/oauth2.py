from fastapi import Cookie, Request, Depends, HTTPException
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from .config import settings
from bson import ObjectId
from ..schemas import Token as tokenSchema

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_token(data: dict, is_access_token: bool = False):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) if is_access_token else timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({
        "exp": expire, 
        "sub": str(data.get("account_id")),
        "role": data.get("role", "user")
        })

    secret_key = settings.secret_key if is_access_token else settings.refresh_secret_key
    return jwt.encode(to_encode, secret_key, algorithm=settings.algorithm)

def verify_token(token: str, is_access_token: bool = False) -> tokenSchema.TokenData:
    secret_key = settings.secret_key_refresh if token_type == "refresh" else settings.secret_key
    try:
        payload = jwt.decode(token, secret_key, algorithms=[settings.algorithm])
        id: str = payload.get("sub")
        role = payload.get("role", "user")

        if id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
        return tokenSchema.TokenData(account_id=account_id, role=role)

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(token = Cookie(None, alias="accessToken")):

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token missing")
    token_data = verify_token(token=token, is_access_token=True)
    account = await database.accounts_collection.find_one({"_id":ObjectId(token.account_id)})
    if account is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return account

def get_logged_in_user(token = Cookie(None, alias="refreshToken")):

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    token_data = verify_token(token=token)
    account = await database.accounts_collection.find_one({"_id":ObjectId(token.account_id)})
    if account is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return account