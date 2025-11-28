from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from fastapi.responses import Response
from app.schemas.account import AccountResponse, UpdatePayload
from app.models.account import Account
from app.core.oauth2 import get_logged_in_user, get_current_user, get_logged_in_user_from_session_token, get_current_user_from_access_token
from server.app.core import config

router = APIRouter(
    prefix="/profile/account",
    tags=["profile/account"],
    responses={404: {"description": "Not found"}},
)

@router.get("/me", status_code=status.HTTP_200_OK, response_model=AccountResponse)
async def get_my_profile(current_account=Depends(get_logged_in_user_from_session_token)):
    current_account.id = str(current_account.id)
    return current_account

@router.patch("/me", response_model=AccountResponse, status_code=status.HTTP_200_OK)
async def update_my_profile(payload: UpdatePayload, current_account=Depends(get_current_user_from_access_token)):
    
    account:Account = current_account
    if not account or account.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    
    if payload.username is not None:
        # check if username is taken
        existing_account = await Account.find_one(Account.username == payload.username, Account.id != account.id)
        if existing_account is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already taken")
        
        account.username = payload.username
    if payload.full_name is not None:
        account.full_name = payload.full_name
    if payload.bio is not None:
        account.bio = payload.bio
    if payload.avatar_url is not None:
        account.avatar_url = payload.avatar_url
    
    await account.save()
    account.id = str(account.id)
    return account

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_profile(response: Response, current_account=Depends(get_current_user_from_access_token)):
    # account = await Account.get(PydanticObjectId(current_account.id) if PydanticObjectId.is_valid(current_account.id) else None)
    account:Account = current_account
    if not account or account.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    
    account.is_deleted = True
    await account.save()
    
    response.delete_cookie(
        key="sessionToken",
        **config.settings.cookie_config,
    )
    
    response.delete_cookie(
        key="accessToken",
       **config.settings.cookie_config,
    )
    
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)
        
@router.get("/{account_id}", status_code=status.HTTP_200_OK, response_model=AccountResponse)
async def get_profile(account_id: str, current_user=Depends(get_current_user)):
    
    account = await Account.get(PydanticObjectId(account_id) if PydanticObjectId.is_valid(account_id) else None)
    if not account or account.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    
    return account