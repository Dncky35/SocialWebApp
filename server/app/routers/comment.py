from fastapi import APIRouter, status, Depends, HTTPException, Query
from app.models.comment import Comment
from beanie import PydanticObjectId
from app.core import oauth2
from app.schemas.comment import CommentRequest
from bson import ObjectId

router = APIRouter(
    prefix="/comments",
    tags=["comments"],
)

@router.get("/{comment_id}")
async def get_single_comment(comment_id: str, current_account=Depends(oauth2.get_current_user)):

    try:
        comment = await Comment.get(PydanticObjectId(comment_id))
    except Exception:
        return {"error": "Invalid comment ID"}

    if not comment:
        return {"error": "Comment not found"}

    return comment

@router.patch("/{comment_id}", status_code=status.HTTP_200_OK)
async def update_comment(comment_id: str, comment_data: CommentRequest, current_account=Depends(oauth2.get_current_user)):
    comment = await Comment.get(PydanticObjectId(comment_id))
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_account.account_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    comment.content = comment_data.content or comment.content
    await comment.save()

    return comment

@router.delete("/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_comment(comment_id: str, current_account=Depends(oauth2.get_current_user)):
    comment = await Comment.get(PydanticObjectId(comment_id))
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_account.account_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await comment.delete()
    return {"Result": "Comment deleted successfully"}

@router.post("/{comment_id}/comment", status_code=status.HTTP_200_OK)
async def create_sub_comment(comment_id:str, current_account=Depends(oauth2.get_current_user), sub_comment_data: CommentRequest = Depends(CommentRequest)):
    comment = await Comment.get(PydanticObjectId(comment_id))
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    sub_commnet = Comment(
        **sub_comment_data.dict(exclude_unset=True),
        author_id=current_account.account_id,
        post_id=comment.post_id,
        parent_comment_id=comment.id,
    )

    await sub_commnet.insert()
    return sub_commnet

@router.post("/{comment_id}/like", status_code=status.HTTP_200_OK)
async def toogle_like_comment(comment_id:str, current_account=Depends(oauth2.get_current_user)):
    comment = await Comment.get(PydanticObjectId(comment_id))
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    account_id = ObjectId(current_account.account_id)

    if account_id in comment.likes:
        comment.likes.remove(account_id)
        action = "unliked"
    else:
        comment.likes.append(account_id)
        action = "liked"

    await comment.save()

    return {
        "message" : f"post {action} successfully",
        "likes_count": len(comment.likes),
        "liked": account_id in comment.likes, 
    }

@router.get("/{comment_id}/replies", response_model=list[Comment])
async def get_replies(comment_id:str, offset:int = Query(0, ge=0), limit:int = Query(20, ge=1, le=100), current_account=Depends(oauth2.get_current_user)):
    comment = await Comment.get(PydanticObjectId(comment_id))
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    replies = await Comment.find(Comment.parent_comment_id == comment.id)\
                        .sort("-created_at")\
                        .skip(offset)\
                        .limit(limit)\
                        .to_list()
                        
    return replies


    


    