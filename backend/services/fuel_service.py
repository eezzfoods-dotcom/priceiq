import httpx
from bs4 import BeautifulSoup
from datetime import date
import asyncio
import logging
import os

logger = logging.getLogger(__name__)
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "")

CITIES = {
    "Chennai": {"state": "Tamil Nadu"}, "Mumbai": {"state": "Maharashtra"},
    "Delhi": {"state": "Delhi"}, "Bangalore": {"state": "Karnataka"},
    "Hyderabad": {"state": "Telangana"}, "Kolkata": {"state": "West Bengal"},
    "Ahmedabad": {"state": "Gujarat"}, "Pune": {"state": "Maharashtra"},
    "Jaipur": {"state": "Rajasthan"}, "Lucknow": {"state": "Uttar Pradesh"},
}
CITY_SLUGS = {
    "Chennai": "chennai", "Mumbai": "mumbai", "Delhi": "new-delhi",
    "Bangalore": "bangalore", "Hyderabad": "hyderabad", "Kolkata": "kolkata",
    "Ahmedabad": "ahmedabad", "Pune": "pune", "Jaipur": "jaipur", "Lucknow": "lucknow",
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

async def scrape_live(city: str):
    slug = CITY_SLUGS.get(city, "chennai")
    target = f"https://www.goodreturns.in/fuel-prices/{slug}.html"
    url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={target}"
    petrol = FUEL_PRICES.get(city, FUEL_PRICES["Chennai"])["petrol"]
    diesel = FUEL_PRICES.get(city, FUEL_PRICES["Chennai"])["diesel"]
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url)
            if r.status_code != 200:
                return None
            soup = BeautifulSoup(r.text, "lxml")
            for table in soup.find_all("table"):
                for row in table.find_all("tr"):
                    cells = row.find_all(["td", "th"])
                    row_text = " ".join(c.get_text(strip=True) for c in cells).lower()
                    for cell in cells:
                        val = cell.get_text(strip=True).replace("Rs.", "").replace(",", "").strip()
                        try:
                            f = float(val)
                            if "petrol" in row_text and 80 < f < 130:
                                petrol = f
                            if "diesel" in row_text and 70 < f < 120:
                                diesel = f
                        except Exception:
                            pass
            return {"petrol": petrol, "diesel": diesel}
    except Exception as e:
        logger.error(f"Scrape failed {city}: {e}")
        return None

async def get_fuel_prices(city: str = "Chennai"):
    fallback = FUEL_PRICES.get(city, FUEL_PRICES["Chennai"])
    if SCRAPER_API_KEY:
        live = await scrape_live(city)
        if live:
            return {"city": city, "state": CITIES.get(city, {}).get("state", ""), "petrol": live["petrol"], "diesel": live["diesel"], "date": date.today().isoformat(), "source": "Live - goodreturns.in", "cached": False}
    return {"city": city, "state": CITIES.get(city, {}).get("state", ""), "petrol": fallback["petrol"], "diesel": fallback["diesel"], "date": date.today().isoformat(), "source": "IOCL June 2025 (cached)", "cached": True}

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
        alerts.append({"type": "revision_warning", "severity": "high", "title": "Fuel Price Revision Due", "message": f"IOCL revises on 1st of every month. Next revision in {days_until} days. Fill up now.", "action": f"Fill tank before {next_revision.strftime('%d %b')}", "days_until": days_until})
    elif days_until <= 10:
        alerts.append({"type": "revision_upcoming", "severity": "medium", "title": f"Fuel Revision in {days_until} Days", "message": "Monthly revision approaching.", "action": "Monitor crude oil", "days_until": days_until})
    return {"city": city, "next_revision_date": next_revision.isoformat(), "days_until_revision": days_until, "alerts": alerts}

async def refresh_fuel_prices():
    logger.info("Refreshing fuel prices...")
    await get_all_cities_fuel()
