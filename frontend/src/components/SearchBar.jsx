import { Search, X } from 'lucide-react'
import { useState } from 'react'

export default function SearchBar({ placeholder, onSearch, loading }) {
  const [q, setQ] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (q.trim()) onSearch(q.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 w-5 h-5 text-slate-500" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={placeholder || 'Search...'}
          className="input-field pl-11 pr-10"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !q.trim()}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : <Search className="w-4 h-4" />}
        {loading ? 'Searching...' : 'Compare'}
      </button>
    </form>
  )
}
