from fastapi import APIRouter, Form, HTTPException, status, Response, Depends, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from ..core import database, utils
from .. import models
from ..core import oauth2, config

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/signup")
async def create_account(response:Response, form_data: models.Account = Depends(models.Account.as_form)):

    existing = await database.account_collection.find_one({"email": form_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed_pw = utils.hash_password(form_data.password)
    account_dict = form_data.dict()
    account_dict.pop("id")
    account_dict["password"] = hashed_pw

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

    account = await database.account_collection.find_one({"email": credentials.username})
    if not account or not utils.verify_password(credentials.password, account["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

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