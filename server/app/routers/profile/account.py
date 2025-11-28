from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from fastapi.responses import Response
from app.schemas.account import AccountResponse, UpdatePayload
from app.models.account import Account
from app.core.oauth2 import get_logged_in_user, get_current_user

router = APIRouter(
    prefix="/profile/account",
    tags=["profile/account"],
    responses={404: {"description": "Not found"}},
)

@router.get("/me", status_code=status.HTTP_200_OK, response_model=AccountResponse)
async def get_my_profile(current_user=Depends(get_logged_in_user)):
    
    account = await Account.get(PydanticObjectId(current_user.id) if PydanticObjectId.is_valid(current_user.account_id) else None)
    if not account or account.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    
    return account

@router.patch("/me", response_model=AccountResponse, status_code=status.HTTP_200_OK)
async def update_my_profile(payload: UpdatePayload, current_user=Depends(get_current_user)):
    
    account = await Account.get(PydanticObjectId(current_user.id) if PydanticObjectId.is_valid(current_user.account_id) else None)
    if not account or account.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    
    update_dict = payload.model_dump(exclude_none=True, exclude_unset=True)
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update."
        )
        
    # Handle username uniqueness check
    if 'username' in update_dict:
        new_username = update_dict['username']
        
        # Only check if the new username is different from the current one
        if new_username != account.username:
            existing_user = await Account.find_one(Account.username == new_username)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This username is already taken."
                )
                
    # 3. Apply updates to the Beanie model
    # The ** operator unpacks the dictionary fields into the model
    account.set(update_dict) 

    # 4. Save the changes to the database
    await account.save()
    return account

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_profile(current_user=Depends(get_current_user)):
    account = await Account.get(PydanticObjectId(current_user.id) if PydanticObjectId.is_valid(current_user.account_id) else None)
    if not account or account.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    
    account.is_deleted = True
    await account.save()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
        
@router.get("/{account_id}", status_code=status.HTTP_200_OK, response_model=AccountResponse)
async def get_profile(account_id: str, current_user=Depends(get_current_user)):
    
    account = await Account.get(PydanticObjectId(account_id) if PydanticObjectId.is_valid(account_id) else None)
    if not account or account.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    
    return account