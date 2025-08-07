from datetime import datetime, timezone
from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.models.post import Post
from app.models.account import Account
from app.models.comment import Comment
from app.schemas.post import PostUpdate, PostCreate, PostPublic
from app.schemas.account import PublicAccount
from app.schemas.comment import CommentRequest, CommentResponse
from app.core import oauth2
from typing import List

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

def create_post_response(post:Post, account:Account, comments:List[Comment], current_account):
    public_account = PublicAccount(
        id=account.id,
        username=account.username,
        bio=account.bio,
        avatar_url=account.avatar_url,
        followers_count=len(account.followers),
        following_count=len(account.following),
        is_following = PydanticObjectId(current_account.account_id) in account.followers if current_account else False,
        created_at=account.created_at,
    )

    public_comments = [comment for comment in comments if not comment.is_deleted]

    comment_list = []
    for comment in public_comments:
        comment_list.append(CommentResponse(
            id=str(comment.id),
            content=comment.content,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            author_id=comment.author_id,
            post_id=comment.post_id,
            parent_comment_id=comment.parent_comment_id if comment.parent_comment_id else None,
            child_commets=comment.child_commets if comment.child_commets else [],
            likes=comment.likes,
            is_liked = PydanticObjectId(current_account.account_id) in comment.likes if current_account else False,

        ))

    # comments = [comment for comment in comments if not comment.is_deleted]
    post.likes = [str(like) for like in post.likes]
    return PostPublic(
        id=str(post.id),
        content=post.content,
        image_url=post.image_url,
        tags=post.tags,
        likes=post.likes,
        comments = comment_list,
        is_liked = str(current_account.account_id) in post.likes if current_account else False,
        created_at=post.created_at,
        updated_at=post.updated_at,
        owner=public_account,
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

    return create_post_response(post, owner, [], current_user)


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

        # post_comments = await Comment.find(Comment.post_id == post.id).sort(-Comment.created_at).to_list()
        post_comments = await Comment.find(Comment.post_id == post.id).sort(-Comment.created_at).skip(offset).limit(limit).to_list()

        post_list.append(create_post_response(post, owner_account, post_comments, current_user))

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

    post_comments = await Comment.find_all(Comment.post_id == post.id).sort(-Post.created_at).skip(0).limit(10).to_list()

    if not post_comments:
        post_comments = []
    else:
        post_comments = [comment for comment in post_comments if not comment.is_deleted]

    return create_post_response(post, owner, post_comments, current_account)

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

    post_comments = await Comment.find_all(Comment.post_id == post.id).sort(-Post.created_at).skip(0).limit(10).to_list()

    if not post_comments:
        post_comments = []
    else:
        post_comments = [comment for comment in post_comments if not comment.is_deleted]
    
    return create_post_response(post, owner, post_comments, current_user)

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

@router.post("/{post_id}/comment", status_code=status.HTTP_201_CREATED, response_model=CommentResponse)
async def create_comment(post_id:str, comment_data:CommentRequest, current_account=Depends(oauth2.get_current_user)):
    print(f"parrent_comment_id: {comment_data.parent_comment_id}")
    comment = Comment(
        content=comment_data.content,
        parent_comment_id= ObjectId(comment_data.parent_comment_id) if comment_data.parent_comment_id else None,
        author_id=current_account.account_id,
        post_id=post_id,
    )

    await comment.insert()

    return CommentResponse(
        id=str(comment.id),
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        author_id=comment.author_id,
        post_id=comment.post_id,
        parent_comment_id=comment.parent_comment_id,
        child_commets=comment.child_commets,
        likes=comment.likes,
        is_liked= PydanticObjectId(current_account.account_id) in comment.likes if current_account else False,
    )

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


