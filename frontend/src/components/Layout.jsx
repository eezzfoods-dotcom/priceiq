import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ShoppingCart, Leaf, UtensilsCrossed, Fuel, Home, Bell, ChevronDown } from 'lucide-react'
import { getWeather, getFuelPrices, getFuelAlerts } from '../utils/api'
import useStore from '../hooks/useStore'
import AlertBanner from './AlertBanner'
import toast from 'react-hot-toast'

const CITIES = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow']

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/shopping', icon: ShoppingCart, label: 'Shopping' },
  { to: '/grocery', icon: Leaf, label: 'Grocery' },
  { to: '/food', icon: UtensilsCrossed, label: 'Food' },
  { to: '/fuel', icon: Fuel, label: 'Fuel & Weather' },
]

export default function Layout() {
  const { selectedCity, setCity, weather, setWeather, fuelData, setFuelData, setFuelAlerts } = useStore()
  const [cityOpen, setCityOpen] = useState(false)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadWeatherAndFuel(selectedCity)
  }, [selectedCity])

  async function loadWeatherAndFuel(city) {
    try {
      const [wRes, fRes, aRes] = await Promise.all([
        getWeather(city),
        getFuelPrices(city),
        getFuelAlerts(city),
      ])
      setWeather(wRes.data)
      setFuelData(fRes.data)
      const newAlerts = aRes.data.alerts || []
      setFuelAlerts(newAlerts)
      setAlerts(newAlerts)
      if (newAlerts.length > 0 && newAlerts[0].severity === 'high') {
        toast(newAlerts[0].title, { icon: '⛽', duration: 6000 })
      }
    } catch (e) {
      console.error('Failed to load weather/fuel', e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-[#252A38] bg-[#0F1117]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <span className="font-display text-xl font-bold text-white">Price<span className="text-brand-500">IQ</span></span>
          </div>

          <div className="flex items-center gap-4">
            {/* Weather pill */}
            {weather && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-full">
                <span>{weather.emoji}</span>
                <span>{weather.temperature}°C</span>
                <span className="text-slate-500">|</span>
                <span>{weather.city}</span>
              </div>
            )}

            {/* Fuel pill */}
            {fuelData && (
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-full">
                <span>⛽</span>
                <span>₹{fuelData.petrol}/L</span>
                <span className="text-slate-500">Petrol</span>
              </div>
            )}

            {/* Alerts bell */}
            {alerts.length > 0 && (
              <div className="relative">
                <Bell className="w-5 h-5 text-amber-400 animate-pulse-slow" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {alerts.length}
                </span>
              </div>
            )}

            {/* City selector */}
            <div className="relative">
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-1.5 text-sm text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-colors"
              >
                📍 {selectedCity} <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {cityOpen && (
                <div className="absolute right-0 top-10 bg-[#181C27] border border-[#252A38] rounded-xl shadow-2xl z-50 min-w-[160px] py-1">
                  {CITIES.map(c => (
                    <button
                      key={c}
                      onClick={() => { setCity(c); setCityOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${c === selectedCity ? 'text-brand-500 font-semibold' : 'text-slate-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Alert banners */}
      {alerts.map((alert, i) => (
        <AlertBanner key={i} alert={alert} onClose={() => setAlerts(a => a.filter((_, j) => j !== i))} />
      ))}

      {/* Weather alerts from weather data */}
      {weather?.alerts?.map((alert, i) => (
        <AlertBanner key={`w-${i}`} alert={alert} onClose={() => {}} />
      ))}

      {/* Main layout */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* Sidebar nav */}
        <nav className="hidden lg:flex flex-col gap-1 w-52 shrink-0">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Page content */}
        <main className="flex-1 min-w-0 animate-slide-up">
          <Outlet />
        </main>
      </div>

      {/* Bottom mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#181C27] border-t border-[#252A38] z-50">
        <div className="flex">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-brand-400' : 'text-slate-500'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="lg:hidden h-16" />
    </div>
  )
}
