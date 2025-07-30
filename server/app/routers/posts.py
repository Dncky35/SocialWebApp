from datetime import datetime, timezone
from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.models.post import Post
from app.models.account import Account
from app.models.comment import Comment
from app.schemas.post import PostUpdate, PostCreate, PostPublic
from app.schemas.account import PublicAccount
from app.models.comment import Comment
from app.schemas.comment import CommentRequest
from app.core import oauth2
from typing import List

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

@router.post("", status_code=201, response_model=PostPublic)
async def create_post(post_data: PostCreate, current_user=Depends(oauth2.get_current_user)):
    
    post = Post(
        **post_data.dict(exclude_unset=True),
        author_id=current_user.account_id,
    )

    await post.insert()

    try:
        owner = await Account.get(PydanticObjectId(current_user.account_id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Account ID")
    
    if not owner:
        raise HTTPException(status_code=404, detail="Account not found")

    return PostPublic (
        id=str(post.id),
        content=post.content,
        image_url=post.image_url,
        tags=post.tags,
        likes=post.likes,
        is_liked = PydanticObjectId(current_user.account_id) in post.likes if current_user else False,
        created_at=post.created_at,
        updated_at=post.updated_at,
        owner = PublicAccount(
            id=owner.id,
            username=owner.username,
            bio=owner.bio,
            avatar_url=owner.avatar_url,
            is_following= PydanticObjectId(current_user.account_id) in owner_account.followers if current_user else False, 
            followers_count=len(owner.followers),
            following_count=len(owner.following),
            created_at=owner.created_at,
        )
    )

@router.get("", response_model=List[PostPublic])
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

    post_list = []
    for post in posts:
        owner_account = await Account.get(PydanticObjectId(post.author_id))
        if not owner_account:
            raise HTTPException(status_code=404, detail="Account not found")

        post_comments = await Comment.find_all(Comment.post_id == post.id).sort(-Post.created_at).skip(offset).limit(limit).to_list()

        if not post_comments:
            post_comments = []
        else:
            post_comments = [comment for comment in post_comments if not comment.is_deleted]

        owner_account = PublicAccount(
            id=owner_account.id,
            username=owner_account.username,
            bio=owner_account.bio,
            is_following= PydanticObjectId(current_user.account_id) in owner_account.followers if current_user else False, 
            avatar_url=owner_account.avatar_url,
            followers_count=len(owner_account.followers),
            following_count=len(owner_account.following),
            created_at=owner_account.created_at,
        )

        post_list.append(PostPublic(
            id=str(post.id),
            content=post.content,
            image_url=post.image_url,
            tags=post.tags,
            likes=post.likes,
            comments = post_comments,
            is_liked = PydanticObjectId(current_user.account_id) in post.likes if current_user else False,
            created_at=post.created_at,
            updated_at=post.updated_at,
            owner=owner_account,
        ))

    return post_list


@router.get("/{id}", response_model=PostPublic)
async def get_single_post(id:str, current_account=Depends(oauth2.get_current_user)):
    try:
        post = await Post.get(PydanticObjectId(id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID")

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.is_deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    
    try:
        owner = await Account.get(PydanticObjectId(post.author_id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Account ID")
    
    if not owner:
        raise HTTPException(status_code=404, detail="Account not found")

    post_comments = await Comment.find_all(Comment.post_id == post.id).sort(-Post.created_at).skip(offset).limit(limit).to_list()

    if not post_comments:
        post_comments = []
    else:
        post_comments = [comment for comment in post_comments if not comment.is_deleted]

    post_return = PostPublic(
        id=str(post.id),
        content=post.content,
        image_url=post.image_url,
        tags=post.tags,
        likes=post.likes,
        is_liked = PydanticObjectId(current_user.account_id) in post.likes if current_user else False,
        comments = post_comments,
        created_at=post.created_at,
        updated_at=post.updated_at,
        owner = PublicAccount(
            id=owner.id,
            username=owner.username,
            bio=owner.bio,
            avatar_url=owner.avatar_url,
            is_following= PydanticObjectId(current_user.account_id) in owner_account.followers if current_user else False, 
            followers_count=len(owner.followers),
            following_count=len(owner.following),
            created_at=owner.created_at,
        )
    )

    return post_return

@router.patch("/{id}", response_model=PostPublic)
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

    try:
        owner = await Account.get(PydanticObjectId(current_user.account_id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Account ID")
    
    if not owner:
        raise HTTPException(status_code=404, detail="Account not found")

    post_comments = await Comment.find_all(Comment.post_id == post.id).sort(-Post.created_at).skip(offset).limit(limit).to_list()

    if not post_comments:
        post_comments = []
    else:
        post_comments = [comment for comment in post_comments if not comment.is_deleted]
    
    return PostPublic(
        id=str(post.id),
        content=post.content,
        image_url=post.image_url,
        tags=post.tags,
        likes=post.likes,
        is_liked = PydanticObjectId(current_user.account_id) in post.likes if current_user else False,
        comments = post_comments,
        created_at=post.created_at,
        updated_at=post.updated_at,
        owner = PublicAccount(
            id=owner.id,
            username=owner.username,
            bio=owner.bio,
            is_following= PydanticObjectId(current_user.account_id) in owner_account.followers if current_user else False, 
            avatar_url=owner.avatar_url,
            followers_count=len(owner.followers),
            following_count=len(owner.following),
            created_at=owner.created_at,
        )
    )

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


