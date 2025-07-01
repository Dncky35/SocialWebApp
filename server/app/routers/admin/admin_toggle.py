from fastapi import APIRouter, HTTPException, status, Depends
from app.models.account import Account
from app.core.oauth2 import get_current_admin_user
from beanie import PydanticObjectId
from bson.errors import InvalidId

router = APIRouter(
    prefix="/admin/toggles",
    tags=["Admin Toggles"]
)

def get_account_or_404(account_id:str) -> Account:
    try:
        return Account.get(PydanticObjectId(account_id))
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )   

@router.patch("/ban/{account_id}", status_code=status.HTTP_200_OK)
async def toggle_ban_account(account_id:str, admin:Account = Depends(get_current_admin_user)):
    account = get_account_or_404(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account.is_banned = not account.is_banned
    await account.save()
    return {"message": f"User {'banned' if account.is_banned else 'unbanned'} successfully."}

@router.patch("/verify/{account_id}", status_code=status.HTTP_200_OK)
async def toggle_verify_account(account_id:str, admin:Account = Depends(get_current_admin_user)):
    account = get_account_or_404(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account.is_verified = not account.is_verified
    await account.save()
    return {"message": f"User {'verified' if account.is_verified else 'unverified'} successfully."}

@router.patch("/promote/{account_id}")
async def toggle_promete_role(account_id:str, admin=Depends(get_current_admin_user)):
    pass

@router.patch("/demote/{account_id}")
async def demote_role(account_id: str, admin=Depends(get_current_admin_user)):
    pass

