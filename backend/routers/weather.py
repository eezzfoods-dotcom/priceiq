from fastapi import APIRouter, Query
from typing import Optional
from services.weather_service import get_weather

router = APIRouter()

@router.get("/current")
async def current_weather(
    city: str = Query(default="Chennai"),
    lat: Optional[float] = None,
    lon: Optional[float] = None
):
    return await get_weather(city, lat, lon)
