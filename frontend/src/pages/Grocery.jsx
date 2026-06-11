import { useState, useEffect } from 'react'
import { searchGrocery, getPopularGrocery } from '../utils/api'
import SearchBar from '../components/SearchBar'
import { SkeletonRow } from '../components/Skeleton'
import { Clock, TrendingDown, ExternalLink } from 'lucide-react'
import useStore from '../hooks/useStore'

const PLATFORM_LOGOS = { Blinkit: '🟡', BigBasket: '🟢', Instamart: '🟠', Zepto: '🟣' }

export default function Grocery() {
  const { selectedCity } = useStore()
  const [results, setResults] = useState(null)
  const [popular, setPopular] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getPopularGrocery().then(r => setPopular(r.data)).catch(() => {})
  }, [])

  async function handleSearch(q) {
    setLoading(true)
    try {
      const res = await searchGrocery(q, selectedCity)
      setResults(res.data)
    } catch (e) {
      setResults({ error: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Grocery Compare</h1>
        <p className="text-slate-400 text-sm">Blinkit · BigBasket · Instamart · Zepto — prices refreshed every 6 hours.</p>
      </div>

      <SearchBar placeholder="tomato, onion, milk, rice, egg..." onSearch={handleSearch} loading={loading} />

      {loading && <div className="space-y-3">{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</div>}

      {results && !loading && !results.error && (
        <div className="space-y-4 animate-slide-up">
          {results.cheapest && (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Cheapest:</span>
                <span className="text-white font-bold">₹{results.cheapest.price} / {results.cheapest.unit}</span>
                <span className="text-slate-400">on {results.cheapest.platform}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold">Fastest:</span>
                <span className="text-white font-bold">{results.fastest?.delivery_min} min</span>
                <span className="text-slate-400">on {results.fastest?.platform}</span>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252A38] text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Platform</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Unit</th>
                  <th className="text-left px-4 py-3">Delivery</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((item, i) => {
                  const isCheapest = item === results.cheapest
                  const isFastest = item === results.fastest
                  return (
                    <tr key={i} className={`border-b border-[#252A38] last:border-0 hover:bg-white/3 transition-colors ${isCheapest ? 'bg-emerald-500/5' : ''}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span>{PLATFORM_LOGOS[item.platform] || '🔵'}</span>
                          <span className="font-semibold text-white text-sm">{item.platform}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isCheapest ? 'text-emerald-400 text-lg' : 'text-white'}`}>
                            ₹{item.price}
                          </span>
                          {isCheapest && <span className="cheapest-badge">Lowest</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-sm">{item.unit}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span className={`text-sm font-medium ${isFastest ? 'text-blue-400' : 'text-slate-300'}`}>
                            {item.delivery_min < 60 ? `${item.delivery_min} min` : `${item.delivery_min / 60}h`}
                          </span>
                          {isFastest && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Fastest</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-1 rounded-full ${item.in_stock ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {item.in_stock ? 'In Stock' : 'Out'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <a href={`https://www.${item.platform.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer"
                          className="text-slate-600 hover:text-brand-400 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {results.cache_note && (
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {results.cache_note}
            </div>
          )}
        </div>
      )}

      {/* Popular prices section */}
      {!results && !loading && popular && (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-400">Today's popular prices in {selectedCity}</div>
          {Object.entries(popular).map(([item, platforms]) => (
            <div key={item} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white capitalize">{item}</span>
                <span className="text-xs text-slate-500">Best: ₹{platforms[0]?.price} on {platforms[0]?.platform}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {platforms.map((p, i) => (
                  <div key={i} className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 ${i === 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-slate-300'}`}>
                    <span>{PLATFORM_LOGOS[p.platform]}</span>
                    <span className="font-medium">₹{p.price}</span>
                    <span className="text-xs opacity-60">{p.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
