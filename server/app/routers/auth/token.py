from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from app.core.oauth2 import get_logged_in_user, get_current_user, get_current_admin_user, create_token
from app.core import config

router = APIRouter(
    prefix="/auth/token",
    tags=["auth", "token"],
    responses={404: {"description": "Not found"}},
)

@router.get("/validate_session", status_code=status.HTTP_200_OK)
async def validate_session(response: Response, token: str = Depends(get_logged_in_user)):
    return {"detail": "Session is valid."}

@router.get("/validate_admin_access", status_code=status.HTTP_200_OK)
async def validate_admin_session(response: Response, token: str = Depends(get_current_admin_user)):
    return {"detail": "Admin access is valid."}

@router.get("/validate_access", status_code=status.HTTP_200_OK)
async def validate_user_token(response: Response, token: str = Depends(get_current_user)):
    
    return {"detail": "Access token is valid."}

@router.get("/rotate_session", status_code=status.HTTP_200_OK)
async def rotate_session(response: Response, token: str = Depends(get_logged_in_user)):
    
    new_refresh_token = create_token(data={"account_id": token.account_id, "role":token.role}, is_access_token=False)
    response.set_cookie(
        key="sessionToken",
        value=new_refresh_token,
        max_age= 60 * 60 * 24 * 7,
        **config.settings.cookie_config,
    )
    
    return {"detail": "Session rotated."}

@router.get("/rotate_access_token", status_code=status.HTTP_200_OK)
async def rotate_access_token(response: Response, token: str = Depends(get_logged_in_user)):
    
    new_access_token = create_token(data={"account_id": token.account_id, "role":token.role}, is_access_token=True)
    response.set_cookie(
        key="accessToken",
        value=new_access_token,
        max_age=60 * 15,
        **config.settings.cookie_config,
    )
    
    return {"detail": "Access token rotated."}