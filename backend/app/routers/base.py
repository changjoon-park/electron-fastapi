from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.src import main

# Create a router
router = APIRouter(
    prefix="",
    tags=["main"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_class=JSONResponse)
async def read_root():
    message = main.check_connection()

    return message
