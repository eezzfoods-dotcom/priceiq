from fastapi import APIRouter, Query
from services.shopping_service import search_all_shopping

router = APIRouter()

@router.get("/search")
async def search_shopping(q: str = Query(..., description="Product to search")):
    return await search_all_shopping(q)
