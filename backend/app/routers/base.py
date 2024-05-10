from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Create a router
router = APIRouter(
    prefix="",
    tags=["main"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_class=JSONResponse)
async def read_root():
    return {"message": "Hello World!!!!!!"}
