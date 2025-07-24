from typing import List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from beanie.operators import RegEx
from app.core import oauth2
from app.models.account import Account
from app.models.post import Post
from beanie import PydanticObjectId
from bson import ObjectId
from bson.errors import InvalidId
from beanie.operators import AddToSet, Pull
from app.schemas.account import PublicAccount, PrivateAccount, UpdateProfile

router = APIRouter(
    prefix="/accounts",
    tags=["accounts"]
)

@router.get("/me/profile", response_model=PrivateAccount)
async def get_my_profile(current_user=Depends(oauth2.get_current_user)):
    account = await Account.get(PydanticObjectId(current_user.account_id) if PydanticObjectId.is_valid(current_user.account_id) else None)
    if not account or account.is_deleted:
        raise HTTPException(status_code=404, detail="Account not found")

    return PublicAccount(
        id=account.id,
        email=account.email,
        full_name=account.full_name,
        is_verified=account.is_verified,
        username=account.username,
        bio=account.bio,
        profile_image_url=account.avatar_url,
        followers_count=len(account.followers),
        following_count=len(account.following),
    )

# Fix: endpoint as profile/{account_id}
@router.get("/{account_id}/profile", response_model=PublicAccount)
async def get_profile(account_id: str, current_user=Depends(oauth2.get_current_user)):
    try:
        account = await Account.get(account_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid account ID.")

    if not account or account.is_deleted:
        raise HTTPException(status_code=404, detail="Account not found")

    is_following = PydanticObjectId(current_user.account_id) in account.followers if current_user else None

    return PublicAccount(
        username=account.username,
        bio=account.bio,
        profile_image_url=account.avatar_url,
        followers_count=len(account.followers),
        following_count=len(account.following),
        is_following= is_following
    )
    
# Fix: endpoint as profile/me
@router.patch("/me/profile", status_code=status.HTTP_200_OK)
async def update_my_profile(profile_data: UpdateProfile, current_user=Depends(oauth2.get_current_user)):
    try:
        account = await Account.get(PydanticObjectId(current_user.account_id))
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid account ID.")

    if not account or account.is_deleted:
        raise HTTPException(status_code=404, detail="Account not found")

    # account.full_name = profile_data.full_name or account.full_name
    # account.bio = profile_data.bio or account.bio
    # account.profile_image_url = profile_data.profile_image_url or account.profile_image_url

    update_fields = profile_data.dict(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(account, key, value)

    await account.save()

    return { "message": "Profile updated successfully" }


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

@router.get("/search", response_model=List[PublicAccount])
async def search_accounts(username: str, offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100, current_account=Depends(oauth2.get_current_user))):
    if not username:
        return []

    # Case-insensitive partial match on username
    query = RegEx(Account.username, f".*{username}.*", options="i")
    accounts = await Account.find(query).skip(offset).limit(limit).to_list()

    returns = [
        PublicAccount(
            id=acc.id,
            username=acc.username,
            bio=acc.bio,
            profile_image_url=acc.avatar_url,
            followers_count=len(acc.followers),
            following_count=len(acc.following),
        )
        for acc in accounts
    ]

    return returns

@router.get("/feed/following")
async def get_feed(offset:int = Query(0, ge=0), limit:int = Query(20, ge=1, le=100), current_account = Depends(oauth2.get_current_user)):
    # GET LIST OF CURRENT USER'S FOLLOW USERS
    try:
        account = await Account.get(PydanticObjectId(current_account.account_id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Account ID")

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    following_ids = account.following

    # GET POST THAT POSTED BY following_ids
    posts = await Post.find(Post.author_id.in_(following_ids)).sort(-Post.created_at).skip(offset).limit(limit).to_list()
    return posts

# TO DO: add feed/ with most recent published posts, add feed/


