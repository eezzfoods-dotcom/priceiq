from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from routers import shopping, grocery, fuel, weather, food
from utils.db import init_db
from utils.scheduler import start_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    start_scheduler()
    yield

app = FastAPI(
    title="PriceIQ API",
    description="Real-time price comparison across Indian platforms",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shopping.router, prefix="/api/shopping", tags=["Shopping"])
app.include_router(grocery.router, prefix="/api/grocery", tags=["Grocery"])
app.include_router(food.router, prefix="/api/food", tags=["Food"])
app.include_router(fuel.router, prefix="/api/fuel", tags=["Fuel"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])

@app.get("/")
async def root():
    return {"status": "PriceIQ API running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}
