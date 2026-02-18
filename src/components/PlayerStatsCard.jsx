import { User, TrendingUp, TrendingDown, Minus } from 'lucide-react'

function PlayerStatsCard({ player, stats, onClick }) {
  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-500'
    if (rating >= 7) return 'text-primary'
    if (rating >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div 
      onClick={() => onClick && onClick(player)}
      className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-primary/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3 mb-4">
        {/* Photo */}
        {player.photo_url ? (
          <img 
            src={player.photo_url} 
            alt={player.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-dark-border rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {player.name}
            </h3>
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded">
              {player.number}
            </span>
          </div>
          <p className="text-sm text-gray-400">{player.position}</p>
        </div>

        {/* Rating */}
        {stats?.rating && (
          <div className="text-right">
            <div className={`text-2xl font-bold ${getRatingColor(stats.rating)}`}>
              {stats.rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Note</div>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-black/50 rounded p-2">
          <div className="text-lg font-bold text-white">{stats?.passes || 0}</div>
          <div className="text-xs text-gray-500">Passes</div>
        </div>
        <div className="bg-black/50 rounded p-2">
          <div className="text-lg font-bold text-white">{stats?.distance || 0} km</div>
          <div className="text-xs text-gray-500">Distance</div>
        </div>
        <div className="bg-black/50 rounded p-2">
          <div className="text-lg font-bold text-white">{stats?.duels || 0}</div>
          <div className="text-xs text-gray-500">Duels</div>
        </div>
      </div>

      {/* Trend indicator */}
      {stats?.trend !== undefined && (
        <div className="mt-3 pt-3 border-t border-dark-border flex items-center justify-center gap-2 text-xs text-gray-400">
          {getTrendIcon(stats.trend)}
          <span>
            {stats.trend > 0 ? 'En progression' : stats.trend < 0 ? 'En baisse' : 'Stable'}
          </span>
        </div>
      )}
    </div>
  )
}

export default PlayerStatsCard
