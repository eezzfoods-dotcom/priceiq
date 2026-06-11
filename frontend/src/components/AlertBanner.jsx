import { X } from 'lucide-react'

export default function AlertBanner({ alert, onClose }) {
  const cls = {
    high: 'bg-red-500/15 border-red-500/30 text-red-300',
    medium: 'bg-amber-400/15 border-amber-400/30 text-amber-300',
    low: 'bg-blue-400/15 border-blue-400/30 text-blue-300',
  }[alert.severity] || 'bg-slate-700 text-white'

  return (
    <div className={`border-b px-4 py-2.5 flex items-start justify-between gap-4 ${cls}`}>
      <div className="flex items-start gap-2 text-sm max-w-4xl mx-auto w-full">
        <span className="font-semibold shrink-0">{alert.title}</span>
        <span className="opacity-80">{alert.message}</span>
        {alert.action && (
          <span className="ml-2 font-semibold shrink-0 opacity-100">→ {alert.action}</span>
        )}
      </div>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
