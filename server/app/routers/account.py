from typing import List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.core import oauth2
from app.models.account import Account
from beanie import PydanticObjectId
from bson import ObjectId
from bson.errors import InvalidId
from beanie.operators import AddToSet, Pull
from app.schemas.account import PublicAccount

router = APIRouter(
    prefix="/accounts",
    tags=["accounts"]
)

@router.post("/follow/{account_id}", status_code=status.HTTP_200_OK)
async def follow_account(account_id: str, current_account=Depends(oauth2.get_current_user)):
    if account_id == current_account.account_id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself.")

    try:
        account_to_follow = await Account.get(account_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid account ID.")

    if not account_to_follow:
        raise HTTPException(status_code=404, detail="User not found.")

    current_user_doc = await Account.get(current_account.account_id)
    if not current_user_doc:
        raise HTTPException(status_code=404, detail="Current user not found.")

    await account_to_follow.update(AddToSet({Account.followers: current_user_doc.id}))
    await current_user_doc.update(AddToSet({Account.following: account_to_follow.id}))

    return {"message": f"Successfully followed {account_to_follow.username}."}


@router.post("/unfollow/{account_id}", status_code=status.HTTP_200_OK)
async def unfollow_user(account_id: str, current_account=Depends(oauth2.get_current_user)):
    if account_id == current_account.account_id:
        raise HTTPException(status_code=400, detail="You cannot unfollow yourself.")

    try:
        account_to_unfollow = await Account.get(account_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid account ID.")

    if not account_to_unfollow:
        raise HTTPException(status_code=404, detail="User not found.")

    current_user_doc = await Account.get(current_account.account_id)
    if not current_user_doc:
        raise HTTPException(status_code=404, detail="Current user not found.")

    await account_to_unfollow.update(Pull({Account.followers: current_user_doc.id}))
    await current_user_doc.update(Pull({Account.following: account_to_unfollow.id}))

    return {"message": f"Successfully unfollowed {account_to_unfollow.username}."}


@router.get("/followers", response_model=List[PublicAccount])
async def get_my_followers(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    current_user=Depends(oauth2.get_current_user)
):
    account = await Account.get(current_user.account_id)
    if not account or not current_user.followers:
        return []

    follower_ids = account.followers[offset:offset + limit]
    follower_accounts = await Account.find({"_id": {"$in": follower_ids}}).to_list()
    return [PublicAccount(
        id=str(f.id),
        username=f.username,
        full_name=f.full_name,
        avatar_url=f.avatar_url
    ) for f in follower_accounts]

@router.get("/following", response_model=List[PublicAccount])
async def get_my_following(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    current_user=Depends(oauth2.get_current_user)
):
    user = await Account.get(current_user.account_id)
    if not user or not user.following:
        return []

    following_ids = user.following[offset:offset + limit]

    following = await Account.find(Account.id.in_(following_ids)).to_list()
    return [PublicAccount(
        id=str(f.id),
        username=f.username,
        full_name=f.full_name,
        avatar_url=f.avatar_url
    ) for f in following]
