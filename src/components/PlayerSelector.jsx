import { useState } from 'react'
import { Users, Search, Filter } from 'lucide-react'

function PlayerSelector({ players, lineup, onDragStart, selectedCategory }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPosition, setFilterPosition] = useState('all')

  // Filter available players (not in starters)
  const availablePlayers = players.filter(p => {
    const isInLineup = lineup.starters.some(s => s.id === p.id)
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.number.toString().includes(searchTerm)
    const matchesPosition = filterPosition === 'all' || p.position === filterPosition
    const matchesCategory = !selectedCategory || p.category === selectedCategory
    
    return !isInLineup && matchesSearch && matchesPosition && matchesCategory
  })

  const handleDragStart = (player) => {
    onDragStart(player)
  }

  const getPositionColor = (position) => {
    switch (position) {
      case 'Gardien': return 'bg-yellow-500'
      case 'Défenseur': return 'bg-blue-500'
      case 'Milieu': return 'bg-green-500'
      case 'Attaquant': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const positions = ['all', 'Gardien', 'Défenseur', 'Milieu', 'Attaquant']

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un joueur..."
            className="w-full bg-black border border-dark-border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setFilterPosition(pos)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filterPosition === pos
                  ? 'bg-primary text-black'
                  : 'bg-dark-border text-gray-400 hover:text-white'
              }`}
            >
              {pos === 'all' ? 'Tous' : pos}
            </button>
          ))}
        </div>
      </div>

      {/* Players list */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {availablePlayers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">Aucun joueur disponible</p>
          </div>
        ) : (
          availablePlayers.map((player) => (
            <div
              key={player.id}
              draggable
              onDragStart={() => handleDragStart(player)}
              className="flex items-center gap-3 p-3 bg-dark-card border border-dark-border rounded-lg cursor-move hover:border-primary/50 hover:bg-dark-card/80 transition-all group"
            >
              {/* Player avatar */}
              <div className="relative flex-shrink-0">
                {player.photo_url ? (
                  <img
                    src={player.photo_url}
                    alt={player.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-dark-border rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-black rounded-full flex items-center justify-center text-xs font-bold border-2 border-dark-card">
                  {player.number}
                </div>
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white group-hover:text-primary transition-colors">
                  {player.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span
                    className={`w-2 h-2 rounded-full ${getPositionColor(player.position)}`}
                  ></span>
                  <span>{player.position}</span>
                  {player.category && (
                    <>
                      <span>•</span>
                      <span>{player.category}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status */}
              {player.status && player.status !== 'actif' && (
                <span className={`px-2 py-1 rounded text-xs ${
                  player.status === 'blessé' ? 'bg-red-500/10 text-red-400' :
                  player.status === 'suspendu' ? 'bg-orange-500/10 text-orange-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {player.status}
                </span>
              )}

              {/* Drag indicator */}
              <div className="flex-shrink-0 text-gray-600 group-hover:text-primary transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="6" cy="5" r="1.5" />
                  <circle cx="14" cy="5" r="1.5" />
                  <circle cx="6" cy="10" r="1.5" />
                  <circle cx="14" cy="10" r="1.5" />
                  <circle cx="6" cy="15" r="1.5" />
                  <circle cx="14" cy="15" r="1.5" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Counter */}
      <div className="pt-3 border-t border-dark-border text-sm text-gray-400">
        {availablePlayers.length} joueur{availablePlayers.length > 1 ? 's' : ''} disponible{availablePlayers.length > 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default PlayerSelector
