import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Leaf, UtensilsCrossed, Fuel, ArrowRight, TrendingDown } from 'lucide-react'
import useStore from '../hooks/useStore'

const CATEGORIES = [
  { path: '/shopping', icon: '🛒', label: 'Shopping', desc: 'TVs, Mobiles, Electronics', color: '#FF9900', platforms: ['Amazon', 'Flipkart'] },
  { path: '/grocery', icon: '🥦', label: 'Grocery', desc: 'Fruits, Veggies, Daily needs', color: '#84C225', platforms: ['Blinkit', 'BigBasket', 'Instamart', 'Zepto'] },
  { path: '/food', icon: '🍕', label: 'Food', desc: 'Restaurants + Coupons', color: '#FC8019', platforms: ['Swiggy', 'Zomato'] },
  { path: '/fuel', icon: '⛽', label: 'Fuel & Weather', desc: 'Petrol, Diesel + Alerts', color: '#4F6EF7', platforms: ['IOCL live', 'Weather'] },
]

export default function Home() {
  const navigate = useNavigate()
  const { weather, fuelData, fuelAlerts, selectedCity } = useStore()

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
          Compare prices.<br />
          <span className="text-brand-500">Buy smarter.</span>
        </h1>
        <p className="text-slate-400 mt-3 text-base">
          Real-time prices across Amazon, Flipkart, Blinkit, BigBasket, Swiggy, Zomato — plus live petrol/diesel and weather alerts for {selectedCity}.
        </p>
      </div>

      {/* Live widgets row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weather card */}
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Weather · {selectedCity}</div>
              {weather ? (
                <>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl">{weather.emoji}</span>
                    <div>
                      <div className="text-3xl font-bold text-white">{weather.temperature}°C</div>
                      <div className="text-sm text-slate-400">{weather.condition}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-slate-500">
                    <span>💧 {weather.humidity}%</span>
                    <span>💨 {weather.wind_speed} km/h</span>
                    <span>🌡️ Feels {weather.feels_like}°C</span>
                  </div>
                  {weather.alerts?.length > 0 && (
                    <div className="mt-3 text-xs bg-amber-400/10 text-amber-300 rounded-lg px-3 py-2">
                      {weather.alerts[0].title}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-16 flex items-center text-slate-500 text-sm">Loading weather...</div>
              )}
            </div>
          </div>
        </div>

        {/* Fuel card */}
        <div className="card p-5">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Live Fuel Prices · {selectedCity}</div>
          {fuelData ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-slate-500 mb-1">Petrol</div>
                  <div className="text-2xl font-bold text-white">₹{fuelData.petrol}</div>
                  <div className="text-xs text-slate-500">per litre</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-slate-500 mb-1">Diesel</div>
                  <div className="text-2xl font-bold text-white">₹{fuelData.diesel}</div>
                  <div className="text-xs text-slate-500">per litre</div>
                </div>
              </div>
              {fuelAlerts?.length > 0 && (
                <div className="mt-3 text-xs bg-red-500/10 text-red-300 rounded-lg px-3 py-2">
                  {fuelAlerts[0].title} — {fuelAlerts[0].action}
                </div>
              )}
              <button onClick={() => navigate('/fuel')} className="mt-3 text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View all cities <ArrowRight className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="h-16 flex items-center text-slate-500 text-sm">Loading fuel prices...</div>
          )}
        </div>
      </div>

      {/* Category cards */}
      <div>
        <h2 className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-3">Compare by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.path}
              onClick={() => navigate(cat.path)}
              className="card p-5 text-left hover:border-brand-500/40 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-display font-bold text-white text-lg">{cat.label}</div>
                  <div className="text-sm text-slate-400 mt-0.5">{cat.desc}</div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cat.platforms.map(p => (
                      <span key={p} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-md">{p}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-brand-400 transition-colors mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
