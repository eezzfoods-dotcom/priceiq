import { useState } from 'react'
import { searchFood } from '../utils/api'
import SearchBar from '../components/SearchBar'
import { ExternalLink, Clock, Tag, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import useStore from '../hooks/useStore'

const POPULAR_FOOD = ['Biryani', 'Pizza', 'Dosa', 'Burger', 'Noodles', 'Parotta', 'Idli', 'Sushi']

export default function Food() {
  const { selectedCity } = useStore()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expandedCoupons, setExpandedCoupons] = useState({})

  async function handleSearch(q) {
    setLoading(true)
    try {
      const res = await searchFood(q, selectedCity)
      setResults(res.data)
    } catch (e) {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  function toggleCoupons(platform) {
    setExpandedCoupons(prev => ({ ...prev, [platform]: !prev[platform] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Food Delivery Compare</h1>
        <p className="text-slate-400 text-sm">Swiggy vs Zomato — coupons, delivery time, best deals in {selectedCity}.</p>
      </div>

      <SearchBar placeholder="Search biryani, pizza, dosa..." onSearch={handleSearch} loading={loading} />

      {!results && !loading && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Popular in {selectedCity}</div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_FOOD.map(f => (
              <button key={f} onClick={() => handleSearch(f)}
                className="text-sm text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="card p-5 space-y-3">
              <div className="h-6 w-32 skeleton rounded-lg" />
              <div className="h-4 w-full skeleton rounded-md" />
              <div className="h-4 w-3/4 skeleton rounded-md" />
              <div className="h-10 skeleton rounded-xl mt-4" />
            </div>
          ))}
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4 animate-slide-up">
          {/* Best deal banner */}
          {results.best_deal && (
            <div className="flex items-center gap-2 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-300">
                Best deal on <strong>{results.best_deal.platform}</strong> — save up to
                <strong> ₹{results.best_deal.best_saving}</strong> with coupon <strong>{results.best_deal.best_coupon?.code}</strong>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.platforms.map((platform, i) => {
              const isBest = platform === results.best_deal
              const isFastest = platform === results.fastest
              const couponExpanded = expandedCoupons[platform.platform]

              return (
                <div key={i} className={`card p-5 space-y-4 ${isBest ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : ''}`}>
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: platform.color + '22' }}>
                        {platform.platform === 'Swiggy' ? '🟠' : '🔴'}
                      </div>
                      <span className="font-display font-bold text-white text-lg">{platform.platform}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {isBest && <span className="cheapest-badge">Best Deal</span>}
                      {isFastest && <span className="badge bg-blue-500/20 text-blue-400">Fastest</span>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                        <Clock className="w-3 h-3" /> Avg. Delivery
                      </div>
                      <div className="text-xl font-bold text-white">{platform.avg_delivery_min}</div>
                      <div className="text-xs text-slate-500">minutes</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                        <Tag className="w-3 h-3" /> Best Saving
                      </div>
                      <div className="text-xl font-bold text-emerald-400">₹{platform.best_saving}</div>
                      <div className="text-xs text-slate-500">with coupon</div>
                    </div>
                  </div>

                  {/* Free delivery threshold */}
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>🚚</span>
                    <span>Free delivery on orders above <strong className="text-slate-300">₹{platform.free_delivery_above}</strong></span>
                  </div>

                  {/* Best coupon highlight */}
                  {platform.best_coupon && (
                    <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-300 text-sm tracking-widest">{platform.best_coupon.code}</span>
                            <span className="badge bg-amber-400/20 text-amber-300">Best</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">{platform.best_coupon.description}</div>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(platform.best_coupon.code)}
                          className="text-xs bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 px-2.5 py-1.5 rounded-lg transition-colors font-semibold shrink-0 ml-2"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* All coupons toggle */}
                  {platform.coupons.length > 1 && (
                    <div>
                      <button
                        onClick={() => toggleCoupons(platform.platform)}
                        className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        {couponExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {couponExpanded ? 'Hide' : `View all ${platform.coupons.length} coupons`}
                      </button>
                      {couponExpanded && (
                        <div className="mt-2 space-y-2">
                          {platform.coupons.slice(1).map((c, j) => (
                            <div key={j} className="flex items-center justify-between bg-white/5 rounded-lg p-2.5 gap-2">
                              <div>
                                <span className="font-mono font-bold text-slate-300 text-xs">{c.code}</span>
                                <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                              </div>
                              <button
                                onClick={() => navigator.clipboard.writeText(c.code)}
                                className="text-xs text-slate-400 hover:text-white border border-[#252A38] px-2 py-1 rounded-md transition-colors shrink-0"
                              >
                                Copy
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href={platform.search_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: platform.color }}
                  >
                    Order on {platform.platform} <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-slate-600 text-center">
            {results.note} · Coupons updated weekly
          </p>
        </div>
      )}
    </div>
  )
}
