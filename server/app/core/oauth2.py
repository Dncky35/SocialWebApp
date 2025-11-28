from fastapi import Cookie, status, HTTPException
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timezone, timedelta
from beanie import PydanticObjectId
from app.core.config import settings
from bson import ObjectId
from app.schemas import token as token_schema
from app import models
from app.models.account import UserRole

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
        "role": data.get("role", UserRole.USER.value)
        })

    secret_key = settings.secret_key if is_access_token else settings.secret_key_refresh
    return jwt.encode(to_encode, secret_key, algorithm=settings.algorithm)

def verify_token(token: str, is_access_token: bool = False) -> token_schema.TokenData:
    secret_key = settings.secret_key_refresh if not is_access_token else settings.secret_key
    try:
        payload = jwt.decode(token, secret_key, algorithms=[settings.algorithm])
        id: str = payload.get("sub")
        role = payload.get("role", UserRole.USER.value)

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
    if account is None or account.is_deleted or account.is_banned:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return token_data

async def get_logged_in_user(token = Cookie(None, alias="sessionToken")):

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    token_data = verify_token(token=token)
    account = await models.Account.find_one({"_id":ObjectId(token_data.account_id)})
    if account is None or account.is_deleted or account.is_banned:
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

    if not account.role == UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    return account

# --- Dependency Functions ---

async def get_current_user_from_access_token(token: str = Cookie(None, alias="accessToken")) -> models.Account:
    """Dependency that verifies Access Token and returns the full Account object."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token missing")
    
    token_data = verify_token(token=token, is_access_token=True)
    
    # FIX: Use PydanticObjectId directly with Beanie's .get()
    account = await models.Account.get(PydanticObjectId(token_data.account_id))
    
    if account is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    # Check if the user is banned or deleted
    if account.is_banned or account.is_deleted:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
         
    return account # Return the Account object

async def get_logged_in_user_from_session_token(token: str = Cookie(None, alias="sessionToken")) -> models.Account:
    """Dependency that verifies Refresh Token and returns the full Account object."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
        
    # Note: refresh tokens are not considered access tokens for verification
    token_data = verify_token(token=token, is_access_token=False) 
    
    # FIX: Use PydanticObjectId directly with Beanie's .get()
    account = await models.Account.get(PydanticObjectId(token_data.account_id))
    
    if account is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return account # Return the Account object (needed for session rotation)