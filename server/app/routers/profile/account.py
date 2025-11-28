from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

router = APIRouter(
    prefix="/profile/account",
    tags=["profile/account"],
    responses={404: {"description": "Not found"}},
)