from fastapi import APIRouter, Depends, HTTPException, status
from app.core.oauth2 import get_current_user_from_access_token
from app.models.post import Post, PostLike, Comment, SubComment
from app.schemas.post import (
    PostCreation, PostResponse, PostUpdate,
    PostLikeResponse, CommentResponse, CommentCreation, CommentUpdate,
    SubCommentResponse, SubCommentCreation, SubCommentUpdate
)

router = APIRouter(
    prefix="/feed/posts",
    tags=["feed", "posts"], 
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(post: PostCreation, current_user=Depends(get_current_user_from_access_token)):
    """Create a new post."""
    new_post = Post(
        author_id=current_user.account_id,
        content=post.content,
        image_url=post.image_url,
        tags=post.tags or []
    )
    await new_post.insert()
    return PostResponse(
        id=str(new_post.id),
        content=new_post.content,
        image_url=new_post.image_url,
        tags=new_post.tags,
        created_at=new_post.created_at.isoformat(),
        updated_at=new_post.updated_at.isoformat(),
        author_id=str(new_post.author_id),
        likes_count=new_post.likes_count,
        comments_count=new_post.comments_count,
        reposts_count=new_post.reposts_count
    )
    
@router.patch("/{post_id}", response_model=PostResponse, status_code=status.HTTP_200_OK)
async def update_post(post_id: str, post: PostUpdate, current_user=Depends(get_current_user_from_access_token)):
    """Update an existing post."""
    db_post = await Post.get(post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if str(db_post.author_id) != current_user.account_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    if post.content is not None:
        db_post.content = post.content
    if post.image_url is not None:
        db_post.image_url = post.image_url
    if post.tags is not None:
        db_post.tags = post.tags
    await db_post.save()
    return PostResponse(
        id=str(db_post.id),
        content=db_post.content,
        image_url=db_post.image_url,
        tags=db_post.tags,
        created_at=db_post.created_at.isoformat(),
        updated_at=db_post.updated_at.isoformat(),
        author_id=str(db_post.author_id),
        likes_count=db_post.likes_count,
        comments_count=db_post.comments_count,
        reposts_count=db_post.reposts_count
    )
    
@router.get("/{post_id}", response_model=PostResponse, status_code=status.HTTP_200_OK)
async def get_post(post_id: str, current_user=Depends(get_current_user_from_access_token)):
    """Retrieve a specific post by ID."""
    db_post = await Post.get(post_id)
    if not db_post or db_post.is_deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    return PostResponse(
        id=str(db_post.id),
        content=db_post.content,
        image_url=db_post.image_url,
        tags=db_post.tags,
        created_at=db_post.created_at.isoformat(),
        updated_at=db_post.updated_at.isoformat(),
        author_id=str(db_post.author_id),
        likes_count=db_post.likes_count,
        comments_count=db_post.comments_count,
        reposts_count=db_post.reposts_count
    )


