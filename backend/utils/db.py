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
            print(f"DB connection failed: {e}")
            return None
    return _pool


async def init_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("No DATABASE_URL - running in mock mode")
        return
    try:
        pool = await get_pool()
        if not pool:
            return
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
        print("DB initialized")
    except Exception as e:
        print(f"DB init failed: {e} - running without DB")
