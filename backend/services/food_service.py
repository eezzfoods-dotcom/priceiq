import httpx
import os
import logging

logger = logging.getLogger(__name__)

# Active coupons curated manually — update weekly
COUPONS = {
    "swiggy": [
        {"code": "SWIG50", "description": "50% off up to ₹100 on orders above ₹199", "min_order": 199, "max_discount": 100, "valid": True},
        {"code": "NSWIGGY", "description": "60% off up to ₹120 for new users", "min_order": 149, "max_discount": 120, "valid": True},
        {"code": "HDFC20", "description": "20% off with HDFC cards, up to ₹75", "min_order": 299, "max_discount": 75, "valid": True},
    ],
    "zomato": [
        {"code": "ZOMATO50", "description": "50% off up to ₹100 on first 5 orders", "min_order": 199, "max_discount": 100, "valid": True},
        {"code": "AXIS20", "description": "20% off with Axis Bank cards", "min_order": 299, "max_discount": 80, "valid": True},
        {"code": "GOLD", "description": "Zomato Gold: Free delivery + extra 10% off", "min_order": 0, "max_discount": 0, "valid": True},
    ],
}

PLATFORM_INFO = {
    "swiggy": {
        "name": "Swiggy",
        "color": "#FC8019",
        "logo": "🟠",
        "avg_delivery_min": 30,
        "free_delivery_above": 149,
        "search_url": "https://www.swiggy.com/search?query={query}",
        "app_url": "swiggy://search?q={query}",
    },
    "zomato": {
        "name": "Zomato",
        "color": "#E23744",
        "logo": "🔴",
        "avg_delivery_min": 35,
        "free_delivery_above": 200,
        "search_url": "https://www.zomato.com/chennai/{query}-delivery",
        "app_url": "zomato://search?q={query}",
    },
}

async def get_food_comparison(query: str, city: str = "Chennai"):
    """
    Returns deep-link comparison between Swiggy and Zomato
    with best available coupons and estimated delivery
    """
    city_slug = city.lower().replace(" ", "-")
    platforms = []

    for key, info in PLATFORM_INFO.items():
        platform_coupons = COUPONS.get(key, [])
        best_coupon = max(platform_coupons, key=lambda c: c["max_discount"], default=None)

        search_url = info["search_url"].format(query=query.replace(" ", "+"), city=city_slug)

        platforms.append({
            "platform": info["name"],
            "color": info["color"],
            "avg_delivery_min": info["avg_delivery_min"],
            "free_delivery_above": info["free_delivery_above"],
            "search_url": search_url,
            "coupons": platform_coupons,
            "best_coupon": best_coupon,
            "best_saving": best_coupon["max_discount"] if best_coupon else 0,
        })

    # Sort by best saving
    platforms.sort(key=lambda x: x["best_saving"], reverse=True)

    return {
        "query": query,
        "city": city,
        "platforms": platforms,
        "fastest": min(platforms, key=lambda x: x["avg_delivery_min"]),
        "best_deal": platforms[0] if platforms else None,
        "note": "Click 'Order Now' to open the app with search pre-filled"
    }

async def get_all_coupons():
    return COUPONS
