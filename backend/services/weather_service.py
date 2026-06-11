import httpx
import os
from datetime import datetime, date
import logging
from utils.db import get_pool

logger = logging.getLogger(__name__)

CITIES_COORDS = {
    "Chennai":   {"lat": 13.0827, "lon": 80.2707},
    "Mumbai":    {"lat": 19.0760, "lon": 72.8777},
    "Delhi":     {"lat": 28.6139, "lon": 77.2090},
    "Bangalore": {"lat": 12.9716, "lon": 77.5946},
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867},
    "Kolkata":   {"lat": 22.5726, "lon": 88.3639},
    "Ahmedabad": {"lat": 23.0225, "lon": 72.5714},
    "Pune":      {"lat": 18.5204, "lon": 73.8567},
    "Jaipur":    {"lat": 26.9124, "lon": 75.7873},
    "Lucknow":   {"lat": 26.8467, "lon": 80.9462},
}

WEATHER_ICONS = {
    "clear sky": "☀️", "few clouds": "🌤️", "scattered clouds": "⛅",
    "broken clouds": "☁️", "overcast clouds": "☁️",
    "light rain": "🌦️", "moderate rain": "🌧️", "heavy rain": "⛈️",
    "thunderstorm": "⛈️", "drizzle": "🌦️", "mist": "🌫️",
    "fog": "🌫️", "haze": "🌫️", "smoke": "🌫️",
    "snow": "🌨️", "sleet": "🌨️",
}

def get_weather_emoji(description: str) -> str:
    desc = description.lower()
    for key, emoji in WEATHER_ICONS.items():
        if key in desc:
            return emoji
    return "🌡️"

async def get_weather(city: str = "Chennai", lat: float = None, lon: float = None):
    api_key = os.getenv("OPENWEATHER_API_KEY", "")

    coords = CITIES_COORDS.get(city, CITIES_COORDS["Chennai"])
    if lat and lon:
        coords = {"lat": lat, "lon": lon}

    if not api_key or api_key == "your_openweather_key":
        return get_mock_weather(city, coords)

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Current weather
            current_resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": coords["lat"], "lon": coords["lon"],
                    "appid": api_key, "units": "metric"
                }
            )
            current = current_resp.json()

            # 5-day forecast
            forecast_resp = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "lat": coords["lat"], "lon": coords["lon"],
                    "appid": api_key, "units": "metric", "cnt": 8
                }
            )
            forecast_data = forecast_resp.json()

        description = current["weather"][0]["description"]
        emoji = get_weather_emoji(description)

        # Process 24h forecast (every 3 hours, 8 slots)
        forecast = []
        for item in forecast_data.get("list", [])[:8]:
            forecast.append({
                "time": datetime.fromtimestamp(item["dt"]).strftime("%H:%M"),
                "temp": round(item["main"]["temp"]),
                "description": item["weather"][0]["description"],
                "emoji": get_weather_emoji(item["weather"][0]["description"]),
                "rain_prob": round(item.get("pop", 0) * 100),
            })

        result = {
            "city": city,
            "temperature": round(current["main"]["temp"], 1),
            "feels_like": round(current["main"]["feels_like"], 1),
            "humidity": current["main"]["humidity"],
            "condition": description.title(),
            "emoji": emoji,
            "wind_speed": round(current["wind"]["speed"] * 3.6, 1),  # m/s to km/h
            "visibility": current.get("visibility", 10000) // 1000,
            "pressure": current["main"]["pressure"],
            "forecast": forecast,
            "alerts": generate_weather_alerts(current, forecast),
            "source": "openweathermap"
        }

        # Cache it
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO weather_cache (city, lat, lon, temperature, feels_like, humidity, condition, wind_speed, forecast)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
                ON CONFLICT DO NOTHING
            """, city, coords["lat"], coords["lon"],
                result["temperature"], result["feels_like"],
                result["humidity"], result["condition"],
                result["wind_speed"], str(forecast))

        return result

    except Exception as e:
        logger.error(f"Weather API error: {e}")
        return get_mock_weather(city, coords)

def generate_weather_alerts(current: dict, forecast: list) -> list:
    alerts = []
    temp = current["main"]["temp"]
    humidity = current["main"]["humidity"]
    description = current["weather"][0]["description"].lower()

    if temp > 38:
        alerts.append({
            "type": "heat",
            "severity": "high",
            "title": "🌡️ Extreme Heat Alert",
            "message": f"Temperature is {round(temp)}°C. Stay hydrated and avoid outdoor exposure during peak hours (12 PM–4 PM).",
        })
    elif temp > 35:
        alerts.append({
            "type": "heat",
            "severity": "medium",
            "title": "☀️ High Temperature",
            "message": f"Temperature reaching {round(temp)}°C. Keep water handy.",
        })

    if "thunder" in description or "storm" in description:
        alerts.append({
            "type": "storm",
            "severity": "high",
            "title": "⛈️ Thunderstorm Warning",
            "message": "Thunderstorm conditions. Avoid travel if possible. Keep vehicles in covered parking.",
        })
    elif "heavy rain" in description:
        alerts.append({
            "type": "rain",
            "severity": "high",
            "title": "🌧️ Heavy Rain Alert",
            "message": "Heavy rainfall expected. Waterlogging likely in low-lying areas. Allow extra travel time.",
        })
    elif "rain" in description or "drizzle" in description:
        alerts.append({
            "type": "rain",
            "severity": "low",
            "title": "🌦️ Rain Expected",
            "message": "Carry an umbrella. Roads may be slippery.",
        })

    if humidity > 85 and temp > 30:
        alerts.append({
            "type": "humidity",
            "severity": "medium",
            "title": "💧 High Humidity",
            "message": f"Humidity at {humidity}%. Heat index will feel much higher than actual temperature.",
        })

    return alerts

def get_mock_weather(city: str, coords: dict) -> dict:
    """Mock weather when no API key — realistic Chennai-like defaults"""
    return {
        "city": city,
        "temperature": 34.5,
        "feels_like": 38.2,
        "humidity": 72,
        "condition": "Few Clouds",
        "emoji": "🌤️",
        "wind_speed": 18.4,
        "visibility": 8,
        "pressure": 1008,
        "forecast": [
            {"time": "09:00", "temp": 32, "description": "Few clouds", "emoji": "🌤️", "rain_prob": 10},
            {"time": "12:00", "temp": 36, "description": "Clear sky", "emoji": "☀️", "rain_prob": 5},
            {"time": "15:00", "temp": 37, "description": "Clear sky", "emoji": "☀️", "rain_prob": 5},
            {"time": "18:00", "temp": 34, "description": "Light rain", "emoji": "🌦️", "rain_prob": 60},
            {"time": "21:00", "temp": 30, "description": "Moderate rain", "emoji": "🌧️", "rain_prob": 75},
        ],
        "alerts": [
            {
                "type": "heat",
                "severity": "medium",
                "title": "☀️ High Temperature",
                "message": "Temperature reaching 37°C. Keep water handy."
            }
        ],
        "source": "mock_demo"
    }
