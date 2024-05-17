from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.src import main
from app.models import base

# Create a router
router = APIRouter(
    prefix="",
    tags=["main"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_class=JSONResponse)
async def read_root():
    message = main.check_connection()
    data = base.ConnectionStatus(**message)

    return data
