from fastapi import APIRouter, Query
from services.food_service import get_food_comparison, get_all_coupons

router = APIRouter()

@router.get("/search")
async def search_food(
    q: str = Query(..., description="Restaurant or dish to search"),
    city: str = Query(default="Chennai")
):
    return await get_food_comparison(q, city)

@router.get("/coupons")
async def all_coupons():
    return await get_all_coupons()
