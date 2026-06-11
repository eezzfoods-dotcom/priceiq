import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

_pool = None


async def get_pool():
    global _pool
    if _pool is None:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            return None
        try:
            _pool = await asyncpg.create_pool(db_url, min_size=2, max_size=10)
        except Exception as e:
            print(f"⚠️  DB connection failed: {e}")
            return None
    return _pool


async def init_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("⚠️  No DATABASE_URL — running in mock data mode")
        return
    try:
        pool = await get_pool()
        if not pool:
            print("⚠️  Could not create DB pool — running without DB")
            return
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS fuel_prices (
                    id SERIAL PRIMARY KEY,
                    state VARCHAR(100) NOT NULL,
                    city VARCHAR(100),
                    petrol_price DECIMAL(6,2),
                    diesel_price DECIMAL(6,2),
                    cng_price DECIMAL(6,2),
                    effective_date DATE,
                    fetched_at TIMESTAMP DEFAULT NOW(),
                    source VARCHAR(100)
                );
                CREATE TABLE IF NOT EXISTS fuel_alerts (
                    id SERIAL PRIMARY KEY,
                    state VARCHAR(100),
                    alert_type VARCHAR(50),
                    message TEXT,
                    predicted_change DECIMAL(5,2),
                    confidence VARCHAR(20),
                    valid_until TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS grocery_cache (
                    id SERIAL PRIMARY KEY,
                    platform VARCHAR(50) NOT NULL,
                    product_name VARCHAR(200) NOT NULL,
                    search_term VARCHAR(100),
                    price DECIMAL(8,2),
                    unit VARCHAR(50),
                    image_url TEXT,
                    product_url TEXT,
                    in_stock BOOLEAN DEFAULT TRUE,
                    cached_at TIMESTAMP DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS weather_cache (
                    id SERIAL PRIMARY KEY,
                    city VARCHAR(100) NOT NULL,
                    lat DECIMAL(9,6),
                    lon DECIMAL(9,6),
                    temperature DECIMAL(5,2),
                    feels_like DECIMAL(5,2),
                    humidity INTEGER,
                    condition VARCHAR(100),
                    icon VARCHAR(20),
                    wind_speed DECIMAL(5,2),
                    forecast JSONB,
                    fetched_at TIMESTAMP DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS search_history (
                    id SERIAL PRIMARY KEY,
                    category VARCHAR(50),
                    query VARCHAR(200),
                    results_count INTEGER,
                    searched_at TIMESTAMP DEFAULT NOW()
                );
            """)
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️  DB init failed: {e} — running without DB")