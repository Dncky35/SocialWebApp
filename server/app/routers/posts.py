from datetime import datetime, timezone
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, Query, HTTPException
from app.models.post import Post, PostUpdate
from app.core import database, oauth2
from beanie.operators import In
from typing import List

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

@router.post("/", status_code=201)
async def create_post(post_data: Post, current_user=Depends(oauth2.get_current_user)):
    
    post = Post(
        **post_data.dict(exclude_unset=True),
        author_id=current_user.account_id,
    )

    await post.insert()

    return post

@router.get("/", response_model=List[Post])
async def get_all_post(offset:int = Query(0, ge=0), limit:int = Query(20, ge=1, le=100), current_user=Depends(oauth2.get_current_user)):
    posts = await Post.find_all().sort(-Post.created_at).skip(offset).limit(limit).to_list()

    if not posts:
        raise HTTPException(status_code=404, detail="Post not found")

    return posts

@router.get("/{id}", response_model=Post)
async def get_single_post(id:str, current_account=Depends(oauth2.get_current_user)):
    try:
        post = await Post.get(PydanticObjectId(id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID")

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return post

@router.patch("/{id}", response_model=Post)
async def update_post(id:str, post_data:PostUpdate, current_user=Depends(oauth2.get_current_user)):
    post = await Post.get(PydanticObjectId(id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.account_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    post.content = post_data.content or post.content
    post.image_url = post_data.image_url or post.image_url
    post.updated_at = datetime.now(timezone.utc)
    await post.save()
    
    return post

@router.delete("/{id}")
async def delete_post(id:str, current_user=Depends(oauth2.get_current_user)):
    post = await Post.get(PydanticObjectId(id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.account_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await post.delete()
    return {"message": "Post deleted successfully"}

@router.post("/{id}/like", status_code=200)
async def toogle_like_post(id:str, current_user=Depends(oauth2.get_current_user)):
    post = await Post.find_one({"_id":id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    account_id = current_user.account_id

    if account_id in post.likes:
        post.likes.remove(account_id)
        action = "unliked"
    else:
        post.likes.append(account_id)
        action = "liked"

    post.updated_at = datetime.now(timezone.utc)
    await post.save()

    return {
        "message" : f"post {action} successfully",
        "likes_count": len(post.likes),
        "liked": account_id in post.likes, 
    }
