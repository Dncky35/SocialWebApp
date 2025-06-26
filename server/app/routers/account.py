from fastapi import APIRouter, HTTPException, status, Depends
from app.core import oauth2, database
from app.models.account import Account
from bson import ObjectId

router = APIRouter(
    prefix="/accounts",
    tags=["accounts"]
)

@router.post("/follow/{id}", status_code=status.HTTP_201_CREATED)
async def follow_account(id: str, current_account = Depends(oauth2.get_current_user)):
    if id == current_account.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself.")

    user = await database.account_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Update follower/following fields
    await Account.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"followers": current_user.account_id}}
    )

    await Account.update_one(
        {"_id": ObjectId(current_user.account_id)},
        {"$addToSet": {"following": user_id}}
    )

    return {"message": "Followed user successfully."}

@router.post("/unfollow/{user_id}")
async def unfollow_user(user_id: str, current_user: Account = Depends(oauth2.get_current_user)):
    if user_id == current_user.account_id:
        raise HTTPException(status_code=400, detail="You cannot unfollow yourself.")

    user = await Account.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Remove follower/following
    await Account.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"followers": current_user.account_id}}
    )

    await Account.update_one(
        {"_id": ObjectId(current_user.account_id)},
        {"$pull": {"following": user_id}}
    )

    return {"message": "Unfollowed user successfully."}
    
@router.get("/followers")
async def get_my_followers(current_user: Account = Depends(oauth2.get_current_user)):
    user = await Account.find_one({"-id": current_user.account_id})
    return {"followers": user.get("followers", [])}

@router.get("/following")
async def get_my_following(current_user=Depends(oauth2.get_current_user)):
    user = await Account.find_one({"_id": ObjectId(current_user.account_id)})
    return {"following": user.get("following", [])}