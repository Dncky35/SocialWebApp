from fastapi import APIRouter, HTTPException, status, Depends
from app.models.account import Account
from app.core.oauth2 import get_current_admin_user
from app.core.utils import get_next_role
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
    account = get_account_or_404(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if admin.role != "superadmin" and account.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can promote admins."
        )
    
    new_role = get_next_role(account.role, promote=True)
    if not new_role  == account.role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot promote to a higher role."
        )

    account.role = new_role
    await account.save()
    return {"message": f"User promoted to {new_role} successfully."}

@router.patch("/demote/{account_id}")
async def demote_role(account_id: str, admin=Depends(get_current_admin_user)):
    account = get_account_or_404(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account.role == "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin cannot be demoted.")

    if admin.role != "superadmin" and account.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can demote admins."
        )
    
    # Get the next role in the hierarchy for demotion
    new_role = get_next_role(account.role, promote=False)
    if not new_role or new_role == account.role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote to a lower role."
        )
    
    account.role = new_role
    await account.save()
    return {"message": f"User demoted to {new_role} successfully."}