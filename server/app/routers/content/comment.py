from fastapi import APIRouter, Depends, HTTPException, Response, status

router = APIRouter(
    prefix="/content/comments",
    tags=["comments"],
    responses={404: {"description": "Not found"}},
)