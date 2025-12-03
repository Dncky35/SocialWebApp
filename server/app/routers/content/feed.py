from enum import Enum
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.schemas.post import PaginatedPostResponse, PostResponse
from app.core.oauth2 import get_current_user_from_access_token
from app.models.post import Post

class FeedValue(str, Enum):
    LATEST = "Latest"
    TRENDING = "Trending"
    FOLLOWING = "Following"


router = APIRouter(
    prefix="/content/feed",
    tags=["feed"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=PaginatedPostResponse, status_code=status.HTTP_200_OK)
async def get_posts(page: int = 1, limit: int = 10, feedValue: FeedValue = FeedValue.LATEST, current_user=Depends(get_current_user_from_access_token)):
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
