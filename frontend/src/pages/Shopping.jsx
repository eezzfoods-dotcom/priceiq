import { useState } from 'react'
import { searchShopping } from '../utils/api'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/Skeleton'
import { TrendingDown } from 'lucide-react'

const POPULAR = ['Samsung TV', 'iPhone 15', 'Washing Machine', 'Refrigerator', 'Laptop', 'Air Purifier']

export default function Shopping() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSearch(q) {
    setLoading(true)
    setError(null)
    try {
      const res = await searchShopping(q)
      setResults(res.data)
    } catch (e) {
      setError('Failed to fetch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Shopping Compare</h1>
        <p className="text-slate-400 text-sm">Compare prices across Amazon and Flipkart. Affiliate APIs — real prices.</p>
      </div>

      <SearchBar placeholder="Search for TV, mobile, laptop..." onSearch={handleSearch} loading={loading} />

      {/* Popular chips */}
      {!results && !loading && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Popular searches</div>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map(p => (
              <button key={p} onClick={() => handleSearch(p)}
                className="text-sm text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && <div className="text-red-400 text-sm p-4 card">{error}</div>}

      {results && !loading && (
        <div className="space-y-4 animate-slide-up">
          {results.cheapest && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Best price:</span>
              <span className="text-white font-bold">₹{results.cheapest.price?.toLocaleString('en-IN')}</span>
              <span className="text-slate-400">on {results.cheapest.platform}</span>
            </div>
          )}

          <div className="space-y-3">
            {results.results.map((item, i) => (
              <ProductCard key={i} item={item} isCheapest={item === results.cheapest} />
            ))}
          </div>

          {results.results.length === 0 && (
            <div className="card p-8 text-center text-slate-400">
              No results found for "{results.query}". Try a different search term.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
