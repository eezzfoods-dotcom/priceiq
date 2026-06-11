from datetime import date
import asyncio
import logging

logger = logging.getLogger(__name__)

CITIES = {
    "Chennai": {"state": "Tamil Nadu"}, "Mumbai": {"state": "Maharashtra"},
    "Delhi": {"state": "Delhi"}, "Bangalore": {"state": "Karnataka"},
    "Hyderabad": {"state": "Telangana"}, "Kolkata": {"state": "West Bengal"},
    "Ahmedabad": {"state": "Gujarat"}, "Pune": {"state": "Maharashtra"},
    "Jaipur": {"state": "Rajasthan"}, "Lucknow": {"state": "Uttar Pradesh"},
}

FUEL_PRICES = {
    "Chennai": {"petrol": 102.63, "diesel": 94.24},
    "Mumbai": {"petrol": 104.21, "diesel": 92.15},
    "Delhi": {"petrol": 94.72, "diesel": 87.62},
    "Bangalore": {"petrol": 101.94, "diesel": 87.89},
    "Hyderabad": {"petrol": 107.41, "diesel": 95.65},
    "Kolkata": {"petrol": 103.94, "diesel": 90.76},
    "Ahmedabad": {"petrol": 94.12, "diesel": 89.88},
    "Pune": {"petrol": 104.21, "diesel": 92.15},
    "Jaipur": {"petrol": 104.72, "diesel": 90.17},
    "Lucknow": {"petrol": 94.65, "diesel": 87.76},
}

async def get_fuel_prices(city: str = "Chennai"):
    prices = FUEL_PRICES.get(city, FUEL_PRICES["Chennai"])
    return {"city": city, "state": CITIES.get(city, {}).get("state", ""), "petrol": prices["petrol"], "diesel": prices["diesel"], "date": date.today().isoformat(), "source": "IOCL June 2025", "cached": False}

async def get_all_cities_fuel():
    tasks = [get_fuel_prices(city) for city in CITIES.keys()]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if isinstance(r, dict)]

async def get_fuel_alerts(city: str = "Chennai"):
    today = date.today()
    next_month = today.month + 1 if today.month < 12 else 1
    next_year = today.year if today.month < 12 else today.year + 1
    next_revision = date(next_year, next_month, 1)
    days_until = (next_revision - today).days
    alerts = []
    if days_until <= 5:
        alerts.append({"type": "revision_warning", "severity": "high", "title": "Fuel Price Revision Due", "message": f"Next IOCL revision in {days_until} days. Fill up now.", "action": f"Fill tank before {next_revision.strftime(chr(37)+chr(100)+chr(32)+chr(37)+chr(98))}", "days_until": days_until})
    elif days_until <= 10:
        alerts.append({"type": "revision_upcoming", "severity": "medium", "title": f"Fuel Revision in {days_until} Days", "message": "Monthly revision approaching.", "action": "Monitor crude oil", "days_until": days_until})
    return {"city": city, "next_revision_date": next_revision.isoformat(), "days_until_revision": days_until, "alerts": alerts}

async def refresh_fuel_prices():
    logger.info("Fuel prices hardcoded")
