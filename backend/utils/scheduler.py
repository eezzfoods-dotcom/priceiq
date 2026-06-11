from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

def start_scheduler():
    from services.fuel_service import refresh_fuel_prices
    from services.grocery_service import refresh_grocery_cache

    # Refresh fuel prices daily at 7 AM (IOCL updates at 6 AM)
    scheduler.add_job(
        refresh_fuel_prices,
        CronTrigger(hour=7, minute=0),
        id="refresh_fuel",
        replace_existing=True
    )

    # Refresh grocery cache every 6 hours
    scheduler.add_job(
        refresh_grocery_cache,
        CronTrigger(hour="6,12,18,0"),
        id="refresh_grocery",
        replace_existing=True
    )

    scheduler.start()
    logger.info("✅ Scheduler started")
