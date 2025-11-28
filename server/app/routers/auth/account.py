from fastapi import APIRouter, HTTPException, requests, status, Response
from pymongo.errors import DuplicateKeyError
from app.models.account import Account
from app.schemas.account import AccountRegister, AccountResponse, LoginPayload
from app.core.utils import hash_password, verify_password
from app.core.oauth2 import create_token
from app.core import config
from app.schemas.token import GoogleToken
from google.oauth2 import id_token
from google.auth.transport import requests
import secrets

router = APIRouter(
    prefix="/auth/account",
    tags=["auth", "account"],
    responses={404: {"description": "Not found"}},
)

@router.post("/sign_up", status_code=status.HTTP_201_CREATED, response_model=AccountResponse)
async def create_account(response: Response, response_data: AccountRegister):
    # has password
    # response_data.password = hash_password(response_data.password)
    secure_password = hash_password(response_data.password)
    
    new_account = Account(
        email=response_data.email,
        username=response_data.username,
        password=secure_password,  # In a real app, hash the password before storing
        full_name=response_data.full_name
    )
    
    # validations for unique email and username
    existing_account = await Account.find_one(
        Account.email == response_data.email
    )
    if existing_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    existing_username = await Account.find_one(
        Account.username == response_data.username
    )
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this username already exists."
        )     
    
    # Save to DB (insert)
    # 3. Save to DB with Race Condition Handling
    try:
        await new_account.insert()
    except DuplicateKeyError:
        # This catches if someone registers the same email milliseconds before this request
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email or username already exists."
        )
    
    # Create token using inserted account id
    refreshToken = create_token(data={"account_id": str(new_account.id)}, is_access_token=False)
    response.set_cookie(
        key="sessionToken",
        value=refreshToken,
        max_age=60 * 60 * 24 * 7,  # 7 days
        **config.settings.cookie_config,
    )
    
    new_account.id = str(new_account.id)  # Convert ObjectId to str for response
    return new_account

@router.post("/login", status_code=status.HTTP_200_OK, response_model=AccountResponse)
async def login_account(response: Response, form_data: LoginPayload):
    # Find account by email
    account = await Account.find_one(Account.email == form_data.email)
    if not account:
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    
    # Verify password
    if not verify_password(form_data.password, account.password):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    
    if account.is_deleted or not account.is_banned:
        raise HTTPException(status_code=403, detail="Account is disabled.")
    
    # Create token
    refreshToken = create_token(data={"account_id": str(account.id)}, is_access_token=False)
    response.set_cookie(
        key="sessionToken",
        value=refreshToken,
        max_age=60 * 60 * 24 * 7,  # 7 days
        **config.settings.cookie_config,
    )
    
    account.id = str(account.id)  # Convert ObjectId to str for response
    return account

@router.post("/sign_in_with_google", status_code=status.HTTP_200_OK, response_model=AccountResponse)
async def sign_in_with_google(response: Response, google_token: GoogleToken):
    # Verify the token
    try:
        id_info = id_token.verify_oauth2_token(
            google_token.token,
            requests.Request(),
            config.settings.google_client_id
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    
    email = id_info.get("email")
    # Check if account exists
    account = await Account.find_one(Account.email == email)
    
    if not account:
        # Handle New User Logic
        
        # Generate a random suffix to ensure username is unique 
        base_username = email.split("@")[0]
        random_suffix = secrets.token_hex(3)
        unique_username = f"{base_username}_{random_suffix}"
        
        random_password = secrets.token_urlsafe(32)
        
        account = Account(
            email=email,
            username=unique_username,
            hashed_password=hash_password(random_password), # Satisfies min_length=8
            full_name=id_info.get("name", ""),
            avatar_url=id_info.get("picture", ""), # Corrected field name
            is_verified=True # Google emails are pre-verified
        )
        
        await account.insert()
        
    if account.is_deleted or account.is_banned:
        raise HTTPException(status_code=403, detail="Account is disabled.")
        
    # Common Login Logic (DRY)
    refreshToken = create_token(data={"account_id": str(account.id)}, is_access_token=False)
    
    response.set_cookie(
        key="sessionToken",
        value=refreshToken,
        max_age=60 * 60 * 24 * 7,
        httponly=True,
        samesite="lax",
        secure=True, # Set True in production
    )
    
    return account

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_account(response: Response):
    response.delete_cookie(
        key="sessionToken",
        **config.settings.cookie_config,
    )
    
    response.delete_cookie(
        key="accessToken",
       **config.settings.cookie_config,
    )
    
    return {"detail": "Successfully logged out."}