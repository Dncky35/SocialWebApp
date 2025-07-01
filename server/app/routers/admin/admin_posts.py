from fastapi import APIRouter, Depends, status, Query, HTTPException
from app.core.oauth2 import get_current_admin_user
from app.models.post import Post
from beanie import PydanticObjectId
from bson.errors import InvalidId

router = APIRouter(
    prefix="/admin/posts",
    tags=["Admin Posts Management"]
)   

#POST
@router.get("/posts", status_code=status.HTTP_200_OK)
async def get_all_posts(offset:int = Query(0, ge=0), limit:int = Query(20, le=100), admin = Depends(get_current_admin_user)):
    posts = await Post.find_all().sort("-created_at").skip(offset).limit(limit).to_list()
    return posts

@router.get("/posts/{post_id}", status_code=status.HTTP_200_OK)
async def get_post(post_id:str, admin = Depends(get_current_admin_user)):
    try:
        post = await Post.get(PydanticObjectId(post_id))
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Post ID")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post