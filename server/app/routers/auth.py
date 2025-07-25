from fastapi import APIRouter, Form, HTTPException, status, Response, Depends, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from app.core import oauth2, database, utils, config
from app import models
from app.schemas.account import PublicAccount, PrivateAccount
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/signup")
async def create_account(
    response: Response,
    form_data: models.Account = Depends(models.Account.as_form),
    response_model= PrivateAccount
):
    # Check if email already exists
    existing = await models.Account.find_one(models.Account.email == form_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    # Check if username already taken
    existing_username = await models.Account.find_one(models.Account.username == form_data.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken.")
    
    # Hash password
    hashed_pw = utils.hash_password(form_data.password)
    
    # Create Account document instance with hashed password
    account = models.Account(
        email=form_data.email,
        username=form_data.username,
        password=hashed_pw,
        full_name=form_data.full_name,
        # other fields will have default values
    )
    
    # Save to DB (insert)
    await account.insert()
    
    # Create token using inserted account id
    refreshToken = oauth2.create_token(data={"account_id": str(account.id)})
    response.set_cookie(
        key="refreshToken",
        value=refreshToken,
        max_age=60 * 60 * 24 * 7,  # 7 days
        **config.settings.cookie_config,
    )

    private_account = PrivateAccount(
        id=account.id,
        email=account.email,
        username=account.username,
        full_name=account.full_name,
        is_verified=account.is_verified,
        bio=account.bio,
        avatar_url=account.avatar_url,
        followers_count=len(account.followers),
        following_count=len(account.following),
        created_at=account.created_at,
        updated_at=account.updated_at,
    )
    
    return private_account

@router.post("/login", status_code=status.HTTP_202_ACCEPTED)
async def login_account(response:Response, credentials: OAuth2PasswordRequestForm = Depends(), response_model=PrivateAccount):

    account = await models.Account.find_one({"email": credentials.username})
    if not account or not utils.verify_password(credentials.password, account.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    refreshToken = oauth2.create_token(data={"account_id": str(account.id), "role" : account.role})    
    response.set_cookie(
        key="refreshToken",
        value=refreshToken,
        max_age= 60 * 60 * 24 * 7,
        **config.settings.cookie_config,
    )

    private_account = PrivateAccount(
        id=account.id,
        email=account.email,
        username=account.username,
        full_name=account.full_name,
        is_verified=account.is_verified,
        bio=account.bio,
        avatar_url=account.avatar_url,
        followers_count=len(account.followers),
        following_count=len(account.following),
        created_at=account.created_at,
        updated_at=account.updated_at,
    )

    return private_account

@router.post("/logout")
async def logout(response: Response):
    # CHECK IF ACCESS TOKEN INCLUDED

    response.delete_cookie(
        key="accessToken",
        # max_age=0,
        path="/"
    )

    response.delete_cookie(
        key="refreshToken",
        # max_age=0,
        path="/"
    )
    return {"message": "Logged out successfully"}

@router.get("/verify_refresh_token")
async def verify_refresh_token(refresh_token: str = Cookie(None, alias="refreshToken")):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing.")
    oauth2.verify_token(refresh_token)
    return {"result": "Refresh token is valid."}

@router.post("/rotate_refresh_token")
async def rotate_refresh_token(response: Response, current_account=Depends(oauth2.get_logged_in_user)):
    print(f"\nCurrent Account: {current_account}\n")
    new_refresh_token = oauth2.create_token(data={"account_id": current_account.account_id, "role":current_account.role})
    response.set_cookie(
        key="refreshToken",
        value=new_refresh_token,
        max_age= 60 * 60 * 24 * 7,
        **config.settings.cookie_config,
    )

    return {"result": "Refresh token rotated."}

@router.get("/verify_access_token")
async def verify_access_token(current_account=Depends(oauth2.get_current_user)):
    return {"result": "Access token is valid."}

@router.post("/create_access_token")
async def refresh_access_token(response: Response, current_account=Depends(oauth2.get_logged_in_user)):
    new_access_token = oauth2.create_token(data={"account_id": current_account.account_id, "role":current_account.role}, is_access_token=True)
    response.set_cookie(
        key="accessToken",
        value=new_access_token,
        max_age=60 * 15,
        **config.settings.cookie_config,
    )
    return {"result": "Access token refreshed/Created."}