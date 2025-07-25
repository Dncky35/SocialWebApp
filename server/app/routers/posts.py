from datetime import datetime, timezone
from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.models.post import Post
from app.schemas.post import PostUpdate, PostCreate
from app.models.comment import Comment
from app.schemas.comment import CommentRequest
from app.core import oauth2
from typing import List

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

@router.post("/", status_code=201)
async def create_post(post_data: PostCreate, current_user=Depends(oauth2.get_current_user)):
    
    post = Post(
        **post_data.dict(exclude_unset=True),
        author_id=current_user.account_id,
    )

    await post.insert()

    return post

@router.get("", response_model=List[Post])
async def get_all_post(offset:int = Query(0, ge=0), limit:int = Query(20, ge=1, le=100), current_user=Depends(oauth2.get_current_user)):
    # Fetch all posts with pagination and no get deleted posts
    if offset < 0 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid offset or limit")
    # Ensure we only fetch posts that are not deleted
    # and sort them by created_at in descending order
    if offset > 0:
        offset = (offset - 1) * limit
    else:
        offset = 0 
    
    # Fetch posts from the database
    # Note: Beanie's find_all() method does not support filtering by is_deleted directly    
    # so we use find() with a filter
    posts = await Post.find_all().sort(-Post.created_at).skip(offset).limit(limit).to_list()
    posts = [post for post in posts if not post.is_deleted]

    return posts

@router.get("/{id}", response_model=Post)
async def get_single_post(id:str, current_account=Depends(oauth2.get_current_user)):
    try:
        post = await Post.get(PydanticObjectId(id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID")

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.is_deleted:
        raise HTTPException(status_code=404, detail="Post not found")

    return post

@router.patch("/{id}", response_model=Post)
async def update_post(id:str, post_data:PostUpdate, current_user=Depends(oauth2.get_current_user)):
    post = await Post.get(PydanticObjectId(id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.account_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if post.is_deleted:
        raise HTTPException(status_code=404, detail="Post not found")

    post.content = post_data.content or post.content
    post.image_url = post_data.image_url or post.image_url
    post.updated_at = datetime.now(timezone.utc)
    await post.save()
    
    return post

@router.delete("/{id}")
async def delete_post(id:str, current_user=Depends(oauth2.get_current_user)):
    post = await Post.get(PydanticObjectId(id) if PydanticObjectId.is_valid(id) else None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.is_deleted:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.account_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # await post.delete()
    # soft deleting
    post.is_deleted = True
    post.updated_at = datetime.now(timezone.utc)
    await post.save()

    return {"message": "Post deleted successfully"}

@router.post("/{id}/like", status_code=200)
async def toogle_like_post(id:str, current_user=Depends(oauth2.get_current_user)):
    post = await Post.get(PydanticObjectId(id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.is_deleted:
        raise HTTPException(status_code=404, detail="Post not found")

    account_id = ObjectId(current_user.account_id)

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

@router.post("/{post_id}/comment", status_code=status.HTTP_201_CREATED)
async def create_comment(post_id:str, comment_data:CommentRequest, current_account=Depends(oauth2.get_current_user)):
    comment = Comment(
        **comment_data.dict(exclude_unset=True),
        author_id=current_account.account_id,
        post_id=post_id,
    )

    await comment.insert()
    return comment

@router.get("/{post_id}/comment", response_model=List[Comment])
async def get_comments(post_id:str, offset:int = Query(0, ge=0), limit:int = Query(20, ge=1, le=100), 
current_account=Depends(oauth2.get_current_user)):
    # Validate offset and limit
    if offset < 0 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid offset or limit")
    
    # Adjust offset for pagination
    if offset > 0:
        offset = (offset - 1) * limit
    else:
        offset = 0
    # Fetch comments for the specified post with pagination
    try:
        comments = await Comment.find_all(Comment.post_id == PydanticObjectId(post_id))\
                        .sort("-created_at")\
                        .skip(offset)\
                        .limit(limit)\
                        .to_list()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Post ID, {str(e)}")
    
    # Filter out deleted comments
    comments = [comment for comment in comments if not comment.is_deleted]
    # Ensure we only return comments for the specified post
    comments = [comment for comment in comments if comment.parent_comment_id is None]

    return comments


