import { User, Edit2, Trash2, AlertCircle } from 'lucide-react'

const POSITION_COLORS = {
  'Gardien': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  'Défenseur': 'bg-blue-500/10 border-blue-500/30 text-blue-500',
  'Milieu': 'bg-green-500/10 border-green-500/30 text-green-500',
  'Attaquant': 'bg-red-500/10 border-red-500/30 text-red-500',
}

const STATUS_BADGES = {
  'actif': { label: 'Actif', color: 'bg-green-500' },
  'blessé': { label: 'Blessé', color: 'bg-red-500' },
  'suspendu': { label: 'Suspendu', color: 'bg-orange-500' },
  'inactif': { label: 'Inactif', color: 'bg-gray-500' },
}

function PlayerCard({ player, onEdit, onDelete }) {
  const positionColor = POSITION_COLORS[player.position] || 'bg-gray-500/10 border-gray-500/30 text-gray-500'
  const statusBadge = STATUS_BADGES[player.status] || STATUS_BADGES['actif']

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-primary/30 transition-all group">
      <div className="flex items-start gap-4">
        {/* Photo / Avatar */}
        <div className="relative">
          {player.photo_url ? (
            <img 
              src={player.photo_url} 
              alt={player.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-dark-border rounded-lg flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
          )}
          
          {/* Numéro maillot */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-bold text-sm">
            {player.number}
          </div>
          
          {/* Status badge */}
          {player.status !== 'actif' && (
            <div className={`absolute -top-1 -left-1 w-3 h-3 ${statusBadge.color} rounded-full border-2 border-dark-card`} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">
                {player.name}
              </h3>
              <p className="text-sm text-gray-400">{player.category}</p>
            </div>

            {/* Actions (visible au survol) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(player)}
                className="p-1.5 hover:bg-dark-border rounded transition-colors"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-primary" />
              </button>
              <button
                onClick={() => onDelete(player)}
                className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>

          {/* Poste */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 border rounded text-xs font-medium ${positionColor}`}>
              {player.position}
            </span>
            
            {player.status !== 'actif' && (
              <span className="flex items-center gap-1 px-2 py-1 bg-dark-border rounded text-xs text-gray-400">
                <AlertCircle className="w-3 h-3" />
                {statusBadge.label}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div>
              <span className="text-gray-400">{player.matches_played}</span> matchs
            </div>
            <div>
              <span className="text-gray-400">{Math.round(player.minutes_played / 60)}</span> heures
            </div>
            {player.birth_date && (
              <div>
                {new Date().getFullYear() - new Date(player.birth_date).getFullYear()} ans
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerCard
