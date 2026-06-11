from fastapi import APIRouter, Query
from services.grocery_service import search_grocery, get_popular_grocery_prices

router = APIRouter()

@router.get("/search")
async def search_groceries(
    q: str = Query(..., description="Item to search"),
    city: str = Query(default="Chennai")
):
    return await search_grocery(q, city)

@router.get("/popular")
async def popular_prices():
    return await get_popular_grocery_prices()
