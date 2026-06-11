import { useState, useEffect } from 'react'
import { getAllCitiesFuel, getWeather, getFuelAlerts } from '../utils/api'
import { SkeletonRow } from '../components/Skeleton'
import { Bell, Droplets, Wind, Eye, Thermometer, Clock, RefreshCw } from 'lucide-react'
import useStore from '../hooks/useStore'

const SEVERITY_STYLE = {
  high: 'alert-high',
  medium: 'alert-medium',
  low: 'alert-low',
}

export default function Fuel() {
  const { selectedCity, weather, setWeather, fuelData, fuelAlerts } = useStore()
  const [allCities, setAllCities] = useState(null)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [localWeather, setLocalWeather] = useState(weather)

  useEffect(() => {
    loadAllCities()
    refreshWeather()
  }, [selectedCity])

  async function loadAllCities() {
    setLoadingCities(true)
    try {
      const res = await getAllCitiesFuel()
      setAllCities(res.data)
    } catch (e) {}
    setLoadingCities(false)
  }

  async function refreshWeather() {
    setLoadingWeather(true)
    try {
      const res = await getWeather(selectedCity)
      setLocalWeather(res.data)
      setWeather(res.data)
    } catch (e) {}
    setLoadingWeather(false)
  }

  const w = localWeather

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Fuel & Weather</h1>
          <p className="text-slate-400 text-sm">Live petrol/diesel prices + weather alerts for {selectedCity}</p>
        </div>
        <button
          onClick={() => { loadAllCities(); refreshWeather() }}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loadingCities ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Fuel alerts */}
      {fuelAlerts?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Bell className="w-4 h-4 text-amber-400" /> Fuel Alerts
          </div>
          {fuelAlerts.map((alert, i) => (
            <div key={i} className={SEVERITY_STYLE[alert.severity] || 'alert-medium'}>
              <div className="font-semibold text-sm mb-0.5">{alert.title}</div>
              <div className="text-sm opacity-80">{alert.message}</div>
              {alert.action && <div className="text-xs font-bold mt-1 opacity-90">→ {alert.action}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Weather card */}
      {w && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Weather · {w.city}</div>
            {loadingWeather && <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />}
          </div>

          <div className="flex items-center gap-6">
            <span className="text-6xl">{w.emoji}</span>
            <div>
              <div className="text-5xl font-bold text-white">{w.temperature}°C</div>
              <div className="text-slate-400 mt-1">{w.condition}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Thermometer, label: 'Feels like', value: `${w.feels_like}°C` },
              { icon: Droplets, label: 'Humidity', value: `${w.humidity}%` },
              { icon: Wind, label: 'Wind', value: `${w.wind_speed} km/h` },
              { icon: Eye, label: 'Visibility', value: `${w.visibility} km` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="text-sm font-semibold text-white">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 24h forecast */}
          {w.forecast?.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">24-Hour Forecast</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {w.forecast.map((f, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3 text-center min-w-[70px] shrink-0">
                    <div className="text-xs text-slate-500 mb-1">{f.time}</div>
                    <div className="text-xl mb-1">{f.emoji}</div>
                    <div className="text-sm font-bold text-white">{f.temp}°</div>
                    {f.rain_prob > 30 && (
                      <div className="text-xs text-blue-400 mt-1">💧{f.rain_prob}%</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather alerts */}
          {w.alerts?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Weather Alerts</div>
              {w.alerts.map((alert, i) => (
                <div key={i} className={SEVERITY_STYLE[alert.severity] || 'alert-low'}>
                  <div className="font-semibold text-sm">{alert.title}</div>
                  <div className="text-sm opacity-80 mt-0.5">{alert.message}</div>
                </div>
              ))}
            </div>
          )}

          {w.source === 'mock_demo' && (
            <div className="text-xs text-slate-600 border-t border-[#252A38] pt-3">
              ⚠️ Demo data shown. Add your OpenWeatherMap API key in backend <code className="bg-white/5 px-1 rounded">.env</code> for live weather.
            </div>
          )}
        </div>
      )}

      {/* All cities fuel table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#252A38] flex items-center justify-between">
          <div className="font-semibold text-white">Fuel Prices — All Major Cities</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Updated today · IOCL
          </div>
        </div>

        {loadingCities ? (
          <div className="p-4 space-y-2">{[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}</div>
        ) : allCities ? (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-[#252A38]">
                <th className="text-left px-5 py-3">City</th>
                <th className="text-left px-5 py-3">State</th>
                <th className="text-left px-5 py-3">Petrol/L</th>
                <th className="text-left px-5 py-3">Diesel/L</th>
                <th className="text-left px-5 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {allCities.map((row, i) => {
                const isSelected = row.city === selectedCity
                return (
                  <tr key={i} className={`border-b border-[#252A38] last:border-0 transition-colors ${isSelected ? 'bg-brand-500/10' : 'hover:bg-white/3'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {isSelected && <span className="text-xs text-brand-400">📍</span>}
                        <span className={`font-medium text-sm ${isSelected ? 'text-brand-400' : 'text-white'}`}>{row.city}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-sm">{row.state}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-white">₹{row.petrol}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-300">₹{row.diesel}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${row.source === 'goodreturns.in' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                        {row.source === 'goodreturns.in' ? '🟢 Live' : '🟡 Cached'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">Failed to load city data.</div>
        )}
      </div>

      <div className="text-xs text-slate-600 text-center">
        Fuel prices sourced from goodreturns.in · Revised by IOCL on 1st of every month
      </div>
    </div>
  )
}
