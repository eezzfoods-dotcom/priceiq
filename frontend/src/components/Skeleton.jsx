export function SkeletonCard() {
  return (
    <div className="card p-4 flex gap-4">
      <div className="w-16 h-16 rounded-lg skeleton shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-20 skeleton rounded-md" />
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-3/4 skeleton rounded-md" />
        <div className="h-5 w-24 skeleton rounded-md mt-3" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 card">
      <div className="h-4 w-32 skeleton rounded-md" />
      <div className="h-6 w-20 skeleton rounded-md" />
      <div className="h-6 w-20 skeleton rounded-md" />
    </div>
  )
}
