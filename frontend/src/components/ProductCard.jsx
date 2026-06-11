import { ExternalLink, Star, Truck } from 'lucide-react'

export default function ProductCard({ item, isCheapest }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`card p-4 flex gap-4 hover:border-brand-500/40 transition-all duration-200 group cursor-pointer ${isCheapest ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : ''}`}
    >
      {item.image ? (
        <img src={item.image} alt={item.title} className="w-16 h-16 object-contain rounded-lg bg-white/5 shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-2xl shrink-0">🛍️</div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: item.platform_color + '22', color: item.platform_color }}
          >
            {item.platform}
          </span>
          {isCheapest && <span className="cheapest-badge">Lowest</span>}
        </div>
        <p className="text-sm text-white font-medium line-clamp-2 leading-snug mt-1">{item.title}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-lg font-bold text-white">₹{item.price?.toLocaleString('en-IN')}</span>
          {item.rating && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Truck className="w-3 h-3" /> {item.delivery}
          </span>
        </div>
      </div>

      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-brand-400 shrink-0 mt-1 transition-colors" />
    </a>
  )
}
