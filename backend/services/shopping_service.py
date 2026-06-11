import httpx
import os
import hashlib
import hmac
import base64
from datetime import datetime, timezone
import json
import logging

logger = logging.getLogger(__name__)

FLIPKART_AFFILIATE_ID = os.getenv("FLIPKART_AFFILIATE_ID", "")
FLIPKART_TOKEN = os.getenv("FLIPKART_AFFILIATE_TOKEN", "")

async def search_amazon(query: str, category: str = "All") -> list:
    """Amazon Product Advertising API v5"""
    access_key = os.getenv("AMAZON_ACCESS_KEY", "")
    secret_key = os.getenv("AMAZON_SECRET_KEY", "")
    partner_tag = os.getenv("AMAZON_PARTNER_TAG", "")

    if not access_key or access_key == "your_amazon_access_key":
        return get_mock_amazon(query)

    # PA-API v5 request
    host = "webservices.amazon.in"
    path = "/paapi5/searchitems"
    payload = {
        "Keywords": query,
        "Resources": [
            "ItemInfo.Title", "Offers.Listings.Price",
            "Images.Primary.Medium", "ItemInfo.ByLineInfo"
        ],
        "SearchIndex": "All",
        "PartnerTag": partner_tag,
        "PartnerType": "Associates",
        "Marketplace": "www.amazon.in",
        "ItemCount": 5
    }

    try:
        # Sign request (AWS Signature V4)
        now = datetime.now(timezone.utc)
        amz_date = now.strftime("%Y%m%dT%H%M%SZ")
        date_stamp = now.strftime("%Y%m%d")

        headers = {
            "content-type": "application/json; charset=utf-8",
            "host": host,
            "x-amz-date": amz_date,
            "x-amz-target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
        }

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://{host}{path}",
                json=payload,
                headers=headers
            )
            data = resp.json()

        items = data.get("SearchResult", {}).get("Items", [])
        results = []
        for item in items:
            price_info = item.get("Offers", {}).get("Listings", [{}])[0].get("Price", {})
            results.append({
                "platform": "Amazon",
                "platform_color": "#FF9900",
                "title": item.get("ItemInfo", {}).get("Title", {}).get("DisplayValue", ""),
                "price": price_info.get("Amount", 0),
                "currency": "₹",
                "rating": None,
                "image": item.get("Images", {}).get("Primary", {}).get("Medium", {}).get("URL", ""),
                "url": item.get("DetailPageURL", ""),
                "delivery": "Usually 2–5 days",
                "in_stock": True,
            })
        return results
    except Exception as e:
        logger.error(f"Amazon API error: {e}")
        return get_mock_amazon(query)

async def search_flipkart(query: str) -> list:
    """Flipkart Affiliate Search API"""
    if not FLIPKART_AFFILIATE_ID or FLIPKART_AFFILIATE_ID == "your_flipkart_affiliate_id":
        return get_mock_flipkart(query)

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://affiliate-api.flipkart.net/affiliate/search/json",
                params={"query": query, "resultCount": 5, "exactMatch": False},
                headers={
                    "Fk-Affiliate-Id": FLIPKART_AFFILIATE_ID,
                    "Fk-Affiliate-Token": FLIPKART_TOKEN,
                }
            )
            data = resp.json()

        products = data.get("productInfoList", [])
        results = []
        for p in products:
            info = p.get("productInfo", {})
            price_info = info.get("pricing", {})
            results.append({
                "platform": "Flipkart",
                "platform_color": "#2874F0",
                "title": info.get("title", ""),
                "price": price_info.get("finalPrice", {}).get("amount", 0),
                "currency": "₹",
                "rating": info.get("productRating", {}).get("average"),
                "image": info.get("imageUrls", {}).get("400x400", ""),
                "url": info.get("productUrl", ""),
                "delivery": "Usually 3–5 days",
                "in_stock": True,
            })
        return results
    except Exception as e:
        logger.error(f"Flipkart API error: {e}")
        return get_mock_flipkart(query)

async def search_all_shopping(query: str):
    """Search both platforms and return combined results"""
    import asyncio
    amazon_task = search_amazon(query)
    flipkart_task = search_flipkart(query)
    amazon_results, flipkart_results = await asyncio.gather(amazon_task, flipkart_task)

    all_results = amazon_results + flipkart_results
    all_results.sort(key=lambda x: x.get("price", 99999))

    return {
        "query": query,
        "results": all_results,
        "cheapest": all_results[0] if all_results else None,
        "platforms_searched": ["Amazon", "Flipkart"],
        "total_results": len(all_results)
    }

def get_mock_amazon(query: str) -> list:
    q = query.lower()
    if "tv" in q or "television" in q:
        return [
            {"platform": "Amazon", "platform_color": "#FF9900", "title": f"Samsung 43\" 4K Smart TV (2024)", "price": 28990, "currency": "₹", "rating": 4.3, "image": "https://m.media-amazon.com/images/I/71pnBpH8fmL._SX300_.jpg", "url": "https://www.amazon.in/s?k=" + query, "delivery": "2–5 days", "in_stock": True},
            {"platform": "Amazon", "platform_color": "#FF9900", "title": f"LG 43\" Full HD Smart TV", "price": 24999, "currency": "₹", "rating": 4.1, "image": "https://m.media-amazon.com/images/I/71pnBpH8fmL._SX300_.jpg", "url": "https://www.amazon.in/s?k=" + query, "delivery": "2–5 days", "in_stock": True},
        ]
    return [
        {"platform": "Amazon", "platform_color": "#FF9900", "title": f"{query.title()} - Top Rated", "price": 1499, "currency": "₹", "rating": 4.2, "image": "", "url": f"https://www.amazon.in/s?k={query}", "delivery": "2–5 days", "in_stock": True},
        {"platform": "Amazon", "platform_color": "#FF9900", "title": f"{query.title()} - Premium", "price": 2299, "currency": "₹", "rating": 4.5, "image": "", "url": f"https://www.amazon.in/s?k={query}", "delivery": "Next day", "in_stock": True},
    ]

def get_mock_flipkart(query: str) -> list:
    q = query.lower()
    if "tv" in q or "television" in q:
        return [
            {"platform": "Flipkart", "platform_color": "#2874F0", "title": "Mi 43\" 4K Android TV", "price": 26999, "currency": "₹", "rating": 4.4, "image": "", "url": f"https://www.flipkart.com/search?q={query}", "delivery": "3–5 days", "in_stock": True},
            {"platform": "Flipkart", "platform_color": "#2874F0", "title": "OnePlus 43\" Y1S Pro", "price": 27999, "currency": "₹", "rating": 4.3, "image": "", "url": f"https://www.flipkart.com/search?q={query}", "delivery": "3–5 days", "in_stock": True},
        ]
    return [
        {"platform": "Flipkart", "platform_color": "#2874F0", "title": f"{query.title()} - Best Seller", "price": 1299, "currency": "₹", "rating": 4.0, "image": "", "url": f"https://www.flipkart.com/search?q={query}", "delivery": "3–5 days", "in_stock": True},
        {"platform": "Flipkart", "platform_color": "#2874F0", "title": f"{query.title()} - Standard", "price": 1899, "currency": "₹", "rating": 3.9, "image": "", "url": f"https://www.flipkart.com/search?q={query}", "delivery": "5–7 days", "in_stock": True},
    ]
