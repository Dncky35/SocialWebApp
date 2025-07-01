from fastapi import APIRouter, Depends, status, Query, HTTPException
from typing import List
from app.core.oauth2 import get_current_admin_user
from app.models.account import Account
from app.schemas.account import AccountAdminRequest
from app.core import utils
from beanie import PydanticObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/accounts", status_code=status.HTTP_200_OK)
async def get_all_accounts(offset:int = Query(0, ge=1), limit:int = Query(20, le=100), admin = Depends(get_current_admin_user)):
    # fetch all users from Account collection
    all_accounts = await Account.find_all().sort("-created_at").skip(offset).limit(limit).to_list()
    return all_accounts

@router.get("/accounts/{account_id}", status_code=status.HTTP_200_OK)
async def get_account(account_id:str, admin = Depends(get_current_admin_user)):
    try:
        account = await Account.get(PydanticObjectId(account_id))
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Account ID")
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account
    
@router.get("/deleted_accounts", status_code=status.HTTP_200_OK)
async def get_deleted_accounts(offset:int = Query(0, ge=1), limit:int = Query(20, le=100), admin = Depends(get_current_admin_user)):
    deleted_accounts = await Account.find(Account.is_deleted == True).sort("-created_at").skip(offset).limit(limit).to_list()
    return deleted_accounts

@router.patch("/accounts/{account_id}", status_code=status.HTTP_200_OK)
async def update_account(account_id:str, account_data:AccountAdminRequest, admin = Depends(get_current_admin_user)):
    try:
        account = await Account.get(PydanticObjectId(account_id))
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid account ID")

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    update_fields = account_data.dict(exclude_unset=True)
    if update_fields.get("password"):
        update_fields["password"] = utils.hash_password(update_fields["password"])

    for key, value in update_fields.items():
        setattr(account, key, value)

    account.updated_at = datetime.now(timezone.utc)
    await account.save()

    return { "message": "Account updated successfully" }

@router.delete("/accounts/{account_id}", status_code=status.HTTP_200_OK)
async def delete_account(account_id:str, admin = Depends(get_current_admin_user)):
    try:
        account = await Account.get(PydanticObjectId(account_id))
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Account ID")

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    await account.delete()
    return {"message": "Account deleted successfully"}