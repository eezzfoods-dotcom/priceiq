from fastapi import APIRouter, Query
from services.fuel_service import get_fuel_prices, get_all_cities_fuel, get_fuel_alerts

router = APIRouter()

@router.get("/prices")
async def fuel_prices(city: str = Query(default="Chennai")):
    return await get_fuel_prices(city)

@router.get("/all-cities")
async def all_cities_fuel():
    return await get_all_cities_fuel()

@router.get("/alerts")
async def fuel_alerts(city: str = Query(default="Chennai")):
    return await get_fuel_alerts(city)
