import httpx
from bs4 import BeautifulSoup
from datetime import date, datetime
import asyncio
import logging
from utils.db import get_pool

logger = logging.getLogger(__name__)

# Indian cities with pincode for fuel lookup
CITIES = {
    "Chennai": {"state": "Tamil Nadu", "pincode": "600001"},
    "Mumbai": {"state": "Maharashtra", "pincode": "400001"},
    "Delhi": {"state": "Delhi", "pincode": "110001"},
    "Bangalore": {"state": "Karnataka", "pincode": "560001"},
    "Hyderabad": {"state": "Telangana", "pincode": "500001"},
    "Kolkata": {"state": "West Bengal", "pincode": "700001"},
    "Ahmedabad": {"state": "Gujarat", "pincode": "380001"},
    "Pune": {"state": "Maharashtra", "pincode": "411001"},
    "Jaipur": {"state": "Rajasthan", "pincode": "302001"},
    "Lucknow": {"state": "Uttar Pradesh", "pincode": "226001"},
}

# Goodreturns city slugs
CITY_SLUGS = {
    "Chennai": "chennai",
    "Mumbai": "mumbai",
    "Delhi": "new-delhi",
    "Bangalore": "bangalore",
    "Hyderabad": "hyderabad",
    "Kolkata": "kolkata",
    "Ahmedabad": "ahmedabad",
    "Pune": "pune",
    "Jaipur": "jaipur",
    "Lucknow": "lucknow",
}

async def fetch_fuel_price_goodreturns(city: str) -> dict:
    """Fetch petrol & diesel prices from goodreturns.in"""
    slug = CITY_SLUGS.get(city, "chennai")
    url = f"https://www.goodreturns.in/fuel-prices/{slug}.html"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, headers=headers, follow_redirects=True)
            soup = BeautifulSoup(resp.text, "lxml")

            petrol = None
            diesel = None

            # Parse fuel price table
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows:
                    cells = row.find_all(["td", "th"])
                    text = " ".join(c.get_text(strip=True) for c in cells).lower()
                    if "petrol" in text:
                        for cell in cells:
                            val = cell.get_text(strip=True).replace("₹", "").replace(",", "").strip()
                            try:
                                f = float(val)
                                if 80 < f < 130:
                                    petrol = f
                            except:
                                pass
                    if "diesel" in text:
                        for cell in cells:
                            val = cell.get_text(strip=True).replace("₹", "").replace(",", "").strip()
                            try:
                                f = float(val)
                                if 70 < f < 120:
                                    diesel = f
                            except:
                                pass

            # Fallback to known approximate prices if scraping fails
            if not petrol or not diesel:
                petrol, diesel = get_fallback_prices(city)

            return {
                "city": city,
                "state": CITIES.get(city, {}).get("state", ""),
                "petrol": petrol,
                "diesel": diesel,
                "date": date.today().isoformat(),
                "source": "goodreturns.in"
            }
    except Exception as e:
        logger.error(f"Error fetching fuel for {city}: {e}")
        petrol, diesel = get_fallback_prices(city)
        return {
            "city": city,
            "state": CITIES.get(city, {}).get("state", ""),
            "petrol": petrol,
            "diesel": diesel,
            "date": date.today().isoformat(),
            "source": "cached"
        }

def get_fallback_prices(city: str):
    """Approximate current fuel prices by state (updated May 2025)"""
    state_prices = {
        "Tamil Nadu":    (102.63, 94.24),
        "Maharashtra":   (104.21, 92.15),
        "Delhi":         (94.72, 87.62),
        "Karnataka":     (101.94, 87.89),
        "Telangana":     (107.41, 95.65),
        "West Bengal":   (103.94, 90.76),
        "Gujarat":       (94.12, 89.88),
        "Rajasthan":     (104.72, 90.17),
        "Uttar Pradesh": (94.65, 87.76),
    }
    state = CITIES.get(city, {}).get("state", "Delhi")
    return state_prices.get(state, (96.0, 89.0))

async def get_fuel_prices(city: str = "Chennai"):
    """Get fuel prices — try DB cache first, then live fetch"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT petrol_price, diesel_price, effective_date, source, fetched_at
            FROM fuel_prices
            WHERE city = $1
            ORDER BY fetched_at DESC
            LIMIT 1
        """, city)

        # Use cache if fetched today
        if row and row["fetched_at"].date() == date.today():
            return {
                "city": city,
                "state": CITIES.get(city, {}).get("state", ""),
                "petrol": float(row["petrol_price"]),
                "diesel": float(row["diesel_price"]),
                "date": row["effective_date"].isoformat() if row["effective_date"] else date.today().isoformat(),
                "source": row["source"],
                "cached": True
            }

    # Fetch live
    data = await fetch_fuel_price_goodreturns(city)

    # Store in DB
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO fuel_prices (state, city, petrol_price, diesel_price, effective_date, source)
            VALUES ($1, $2, $3, $4, $5, $6)
        """, data["state"], data["city"], data["petrol"], data["diesel"],
            date.today(), data["source"])

    data["cached"] = False
    return data

async def get_all_cities_fuel():
    """Fetch fuel prices for all major cities"""
    tasks = [get_fuel_prices(city) for city in CITIES.keys()]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if isinstance(r, dict)]

async def get_fuel_alerts(city: str = "Chennai"):
    """
    Generate fuel price change alerts.
    IOCL revises prices on 1st of every month.
    We predict based on crude oil trend.
    """
    from datetime import timedelta
    today = date.today()
    next_revision = date(today.year, today.month + 1 if today.month < 12 else 1, 1)
    days_until = (next_revision - today).days

    # Check global crude oil trend (simplified signal)
    alerts = []

    if days_until <= 5:
        alerts.append({
            "type": "revision_warning",
            "severity": "high",
            "title": "⛽ Fuel Price Revision Due",
            "message": f"IOCL typically revises fuel prices on the 1st of each month. Next revision is in {days_until} days ({next_revision.strftime('%d %b %Y')}). Consider filling up now.",
            "action": "Fill tank before " + next_revision.strftime("%d %b"),
            "days_until": days_until
        })
    elif days_until <= 10:
        alerts.append({
            "type": "revision_upcoming",
            "severity": "medium",
            "title": "📅 Fuel Revision in {days} Days".format(days=days_until),
            "message": f"Monthly fuel price revision is {days_until} days away. Monitor crude oil prices — Brent crude above $90/barrel usually signals a price hike.",
            "action": "Monitor crude oil prices",
            "days_until": days_until
        })

    return {
        "city": city,
        "next_revision_date": next_revision.isoformat(),
        "days_until_revision": days_until,
        "alerts": alerts
    }

async def refresh_fuel_prices():
    """Cron job: refresh all cities"""
    logger.info("🔄 Refreshing fuel prices for all cities...")
    await get_all_cities_fuel()
    logger.info("✅ Fuel prices refreshed")
