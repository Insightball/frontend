function LoadingSkeleton({ type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-dark-border rounded-lg skeleton"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-border rounded skeleton w-3/4"></div>
            <div className="h-3 bg-dark-border rounded skeleton w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-dark-border rounded skeleton"></div>
          <div className="h-3 bg-dark-border rounded skeleton w-5/6"></div>
        </div>
      </div>
    )
  }

  if (type === 'stat') {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-dark-border rounded-lg skeleton"></div>
          <div className="h-3 bg-dark-border rounded skeleton w-16"></div>
        </div>
        <div className="h-8 bg-dark-border rounded skeleton w-20 mb-2"></div>
        <div className="h-3 bg-dark-border rounded skeleton w-24"></div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-dark-card border border-dark-border rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-dark-border rounded-lg skeleton"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-dark-border rounded skeleton w-3/4"></div>
              <div className="h-3 bg-dark-border rounded skeleton w-1/2"></div>
            </div>
            <div className="h-8 bg-dark-border rounded skeleton w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'player-card') {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-dark-border rounded-lg skeleton"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-border rounded skeleton w-2/3"></div>
            <div className="h-3 bg-dark-border rounded skeleton w-1/3"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center space-y-2">
            <div className="h-6 bg-dark-border rounded skeleton mx-auto w-12"></div>
            <div className="h-3 bg-dark-border rounded skeleton"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="h-6 bg-dark-border rounded skeleton mx-auto w-12"></div>
            <div className="h-3 bg-dark-border rounded skeleton"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="h-6 bg-dark-border rounded skeleton mx-auto w-12"></div>
            <div className="h-3 bg-dark-border rounded skeleton"></div>
          </div>
        </div>
      </div>
    )
  }

  // Default skeleton
  return (
    <div className="bg-dark-border rounded skeleton h-32"></div>
  )
}

export default LoadingSkeleton
