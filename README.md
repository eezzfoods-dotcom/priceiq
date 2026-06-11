# 🔍 PriceIQ — India's Smartest Price Comparison Platform

Compare prices across Amazon, Flipkart, Blinkit, BigBasket, Instamart, Zepto, Swiggy, and Zomato — plus live petrol/diesel prices and weather alerts.

---

## 🏗️ Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React + Vite + Tailwind | Vercel (free) |
| Backend | FastAPI (Python) | Render (free) |
| Database | PostgreSQL | Neon.tech (free) |
| Weather | OpenWeatherMap API | Free (1000 calls/day) |
| Fuel prices | goodreturns.in scraper | Free |
| Shopping | Amazon PA API + Flipkart Affiliate | Free (after approval) |

---

## 📁 Project Structure

```
priceiq/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── requirements.txt
│   ├── render.yaml             # Render deployment config
│   ├── .env.example
│   ├── routers/
│   │   ├── shopping.py
│   │   ├── grocery.py
│   │   ├── food.py
│   │   ├── fuel.py
│   │   └── weather.py
│   ├── services/
│   │   ├── shopping_service.py
│   │   ├── grocery_service.py
│   │   ├── food_service.py
│   │   ├── fuel_service.py
│   │   └── weather_service.py
│   └── utils/
│       ├── db.py
│       └── scheduler.py
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── Layout.jsx      # Nav, header, alert banners
    │   │   ├── AlertBanner.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── Skeleton.jsx
    │   ├── pages/
    │   │   ├── Home.jsx        # Dashboard with live fuel + weather
    │   │   ├── Shopping.jsx    # Amazon + Flipkart compare
    │   │   ├── Grocery.jsx     # Blinkit/BigBasket/Instamart/Zepto
    │   │   ├── Food.jsx        # Swiggy/Zomato + coupons
    │   │   └── Fuel.jsx        # Full fuel + weather page
    │   ├── hooks/
    │   │   └── useStore.js     # Zustand global state
    │   └── utils/
    │       └── api.js          # Axios API calls
    ├── vercel.json
    └── .env.example
```

---

## 🚀 Local Setup

### Step 1 — Clone and setup

```bash
git clone https://github.com/YOUR_USERNAME/priceiq.git
cd priceiq
```

### Step 2 — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your API keys (see API Keys section below)

uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Step 3 — Frontend

```bash
cd frontend
npm install

cp .env.example .env
# .env already has VITE_API_URL=http://localhost:8000/api

npm run dev
# App running at http://localhost:5173
```

---

## 🔑 API Keys — How to Get Them

### 1. OpenWeatherMap (FREE — Required for live weather)
- Go to https://openweathermap.org/api
- Sign up free → My API Keys → copy key
- Add to `.env`: `OPENWEATHER_API_KEY=your_key`
- Free tier: **1000 calls/day** — plenty for personal use

### 2. Amazon Product Advertising API (FREE — Required for shopping)
- Apply at https://affiliate-program.amazon.in
- Sign up as an Associate → get approved (1–3 days)
- Go to Tools → Product Advertising API → get access key
- Add to `.env`: `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG`
- **Until you get keys**: mock data is shown automatically

### 3. Flipkart Affiliate API (FREE — Required for shopping)
- Apply at https://affiliate.flipkart.com
- Sign up → usually instant approval
- Go to API → generate token
- Add to `.env`: `FLIPKART_AFFILIATE_ID`, `FLIPKART_AFFILIATE_TOKEN`
- **Until you get keys**: mock data is shown automatically

### 4. Neon PostgreSQL (FREE)
- Go to https://neon.tech → create project
- Copy the connection string
- Add to `.env`: `DATABASE_URL=postgresql://...`

---

## ☁️ Deployment

### Backend → Render

1. Push `backend/` folder to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Set root directory: `backend`
5. Build: `pip install -r requirements.txt`
6. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add all env variables from `.env`
8. Deploy → copy your Render URL (e.g. `https://priceiq-api.onrender.com`)

### Frontend → Vercel

1. Push `frontend/` folder to GitHub
2. Go to https://vercel.com → New Project → import repo
3. Set root directory: `frontend`
4. Add env variable: `VITE_API_URL=https://priceiq-api.onrender.com/api`
5. Deploy → your app is live!

---

## 📊 Data Sources

| Category | Platform | Data Type | Freshness |
|---------|---------|-----------|-----------|
| Shopping | Amazon | Live via PA API | Real-time |
| Shopping | Flipkart | Live via Affiliate API | Real-time |
| Grocery | Blinkit/BigBasket/Instamart/Zepto | Cached catalog | Every 6 hours |
| Food | Swiggy/Zomato | Deep-link + coupons | Weekly |
| Fuel | All India cities | Scraped goodreturns.in | Daily at 7 AM |
| Weather | OpenWeatherMap | Live | On demand |

---

## 🔔 Alert System

- **Fuel revision alert**: Fires automatically when next IOCL revision is ≤ 5 days away
- **Weather alerts**: Extreme heat (>38°C), thunderstorm, heavy rain, high humidity
- **Toast notifications**: High-severity alerts shown as toasts on first load
- **Banner alerts**: Persistent across all pages until dismissed

---

## 🗺️ Roadmap

- [ ] RapidAPI integration for live Blinkit/Swiggy prices (Scenario B)
- [ ] Price history charts (trending up/down)
- [ ] Push notifications for fuel revision
- [ ] PWA for mobile install
- [ ] User price alerts ("notify me when onion < ₹30/kg")
- [ ] CNG prices
- [ ] Compare cart: add multiple items and get total per platform

---

## 📝 Notes

- Render free tier **sleeps after 15 min** of inactivity — first request may take ~30s to wake up. Upgrade to Render Starter ($7/mo) to avoid this.
- Grocery prices are **approximate** — refreshed from a curated catalog every 6 hours. Not second-by-second live.
- Food section uses **deep links** (opens Swiggy/Zomato app) — no live menu data without paid API.
- Coupons are **manually curated** — update `food_service.py` weekly.
