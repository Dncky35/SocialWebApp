from fastapi import APIRouter, Form, HTTPException, status, Response, Depends
from ..core import database, utils
from .. import models

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/signup")
async def create_account(response:Response, form_data: models.Account = Depends(models.Account.as_form)):

    if not all([form_data.email, form_data.password, form_data.username]):
        raise HTTPException(status_code=422, detail="All fields are required.")

    if len(form_data.username) < 5:
        raise HTTPException(status_code=422, detail="Username must be at least 5 characters.")

    if len(form_data.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")

    # Check if account is already exists
    account = await database.account_collection.find_one({"email":form_data.email.lower()})

    if account:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is already exists!")
    
    hashed_password = utils.hash_password(form_data.password)

    account_dict = {
        "email": form_data.email.lower(),
        "password": hashed_password,
        "username": form_data.username,
    }

    result = await database.account_collection.insert_one(account_dict)
    account_dict["id"] = str(result.inserted_id)

    refreshToken = oauth2.create_token(data={"account_id":account_dict["id"]})
    response.set_cookie(
        key="refreshToken",
        value=refreshToken,
        max_age= 60 * 60 * 24 * 7,
        **config.settings.cookie_config,
    )

    return{
        "Message" : "Account Creation Done"
    }

@router.post("/login", status_code=status.HTTP_202_ACCEPTED)
async def login_account(response:Response, credentials: OAuth2PasswordRequestForm = Depends()):
    
    if not credentials.username or not credentials.password:
        raise HTTPException(status_code=422, detail="Email and password are required.")

    account = database.account_collection.find_one({"email":credentials.email.lower()})

    if not account or not utils.verify_password(credentials.password, account.password):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    refreshToken = oauth2.create_token(data={"account_id": str(account["_id"]), "role" : account["role"]})    
    response.set_cookie(
        key="refreshToken",
        value=refreshToken,
        max_age= 60 * 60 * 24 * 7,
        **config.settings.cookie_config,
    )

    return{
        "Message" : "Login is Done"
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("accessToken")
    response.delete_cookie("refreshToken")
    return {"message": "Logged out successfully"}

@router.get("/verify_refresh_token")
async def verify_refresh_token(refresh_token: str = Cookie(None, alias="refreshToken")):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing.")
    oauth2.verify_token(refresh_token)
    return {"result": "Refresh token is valid."}

@router.post("/rotate_refresh_token")
async def rotate_refresh_token(response: Response, current_account=Depends(oauth2.get_logged_in_user)):
    new_refresh_token = oauth2.create_token(data={"account_id": current_account.id, "role":current_account.role})
    response.set_cookie(
        key="refreshToken",
        value=refreshToken,
        max_age= 60 * 60 * 24 * 7,
        **config.settings.cookie_config,
    )

@router.get("/verify_access_token")
async def verify_access_token(current_account=Depends(oauth2.get_current_user)):
    return {"result": "Access token is valid."}

@router.post("/access_token")
async def refresh_access_token(response: Response, current_account=Depends(oauth2.get_logged_in_user)):
    access_token = oauth2.create_token(data={"account_id": current_account.id, "role":current_account.role}, is_access_token=True)
    response.set_cookie(
        key="accessToken",
        value=access_token,
        max_age=60 * 15,
        **config.settings.cookie_config,
    )
    return {"result": "Access token refreshed."}