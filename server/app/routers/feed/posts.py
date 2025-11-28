from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.core.oauth2 import get_current_user_from_access_token
from app.models.post import Post, PostLike, Comment, SubComment
from app.schemas.post import (
    PostCreation, PostResponse, PostUpdate, PaginatedPostResponse,
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
        author_id=current_user.id,
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
    if str(db_post.author_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    if db_post.is_deleted:
        raise HTTPException(status_code=403, detail="This post has been deleted")
    
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
    
@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: str, current_user=Depends(get_current_user_from_access_token)):
    """Delete a specific post by ID."""
    db_post = await Post.get(post_id)
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if str(db_post.author_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    if db_post.is_deleted:
        raise HTTPException(status_code=403, detail="This post has already been deleted")
    
    db_post.is_deleted = True
    await db_post.save()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

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

@router.get("/", response_model=PaginatedPostResponse, status_code=status.HTTP_200_OK)
async def get_posts(page: int = 1, limit: int = 10, current_user=Depends(get_current_user_from_access_token)):
    """Retrieve a list of posts with pagination."""
    
    #validate limit and offeset
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be greater than 0")
    
    
    skip = (page - 1) * limit
    # Fetch posts that are not deleted from the database
    # Get Latest posts first
    posts = await Post.find(Post.is_deleted == False).sort(-Post.created_at).skip(skip).limit(limit).to_list()
    total_posts = await Post.find(Post.is_deleted == False).count()
    return PaginatedPostResponse(
        total=total_posts,
        has_more=skip + limit < total_posts,
        posts=[PostResponse(
            id=str(post.id),
            content=post.content,
            image_url=post.image_url,
            tags=post.tags,
            created_at=post.created_at.isoformat(),
            updated_at=post.updated_at.isoformat(),
            author_id=str(post.author_id),
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            reposts_count=post.reposts_count
        ) for post in posts]
    )

@router.post("/{post_id}/like", response_model=PostLikeResponse, status_code=status.HTTP_201_CREATED)
async def toggle_like_post(post_id: str, current_user=Depends(get_current_user_from_access_token)):
    # Validate the Post ID format
    try:
        post_oid = PydanticObjectId(post_id)
        user_oid = PydanticObjectId(current_user.id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    # Check if Post exists
    db_post = await Post.get(post_oid)
    if not db_post or db_post.is_deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # DEBUG: Print all fields that Python sees on the model
    
    # Check for existing like
    existing_like = await PostLike.find_one((PostLike.post_id == post_oid) and (PostLike.liked_by == user_oid))

    # --- SCENARIO A: UNLIKE ---
    
    if existing_like:
        await existing_like.delete()
        
        # Decrement count (ensure it doesn't go below 0)
        if db_post.likes_count > 0:
            db_post.likes_count -= 1
            await db_post.save()
            
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    
    # --- SCENARIO B: LIKE ---
    
    new_like = PostLike(
        post_id=post_oid,
        liked_by=user_oid
    )
    await new_like.insert()
    
    db_post.likes_count += 1
    await db_post.save()
    
    return PostLikeResponse(
        id=str(new_like.id),
        post_id=str(new_like.post_id),
        liked_by=str(new_like.liked_by),
        created_at=new_like.created_at.isoformat()
    )