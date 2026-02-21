import { useState } from 'react'
import { Users, X } from 'lucide-react'

function TacticalBoard({ formation, lineup, onPlayerPlace, onPlayerRemove }) {
  const [draggedPlayer, setDraggedPlayer] = useState(null)

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, positionId) => {
    e.preventDefault()
    if (draggedPlayer) {
      onPlayerPlace(draggedPlayer, positionId)
      setDraggedPlayer(null)
    }
  }

  const getPlayerAtPosition = (positionId) => {
    return lineup.starters.find(p => p.positionId === positionId)
  }

  return (
    <div className="relative w-full bg-gradient-to-b from-green-900/20 to-green-800/20 rounded-xl border-2 border-green-700/30 overflow-hidden">
      {/* Football field */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Field background */}
        <rect width="100" height="100" fill="url(#fieldGradient)" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#166534" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#15803d" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#166534" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Field lines */}
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" fill="none">
          {/* Outer rectangle */}
          <rect x="2" y="2" width="96" height="96" />
          
          {/* Center line */}
          <line x1="2" y1="50" x2="98" y2="50" />
          
          {/* Center circle */}
          <circle cx="50" cy="50" r="8" />
          <circle cx="50" cy="50" r="0.5" fill="rgba(255,255,255,0.3)" />
          
          {/* Penalty areas */}
          <rect x="20" y="2" width="60" height="16" />
          <rect x="20" y="82" width="60" height="16" />
          
          {/* Goal areas */}
          <rect x="35" y="2" width="30" height="6" />
          <rect x="35" y="92" width="30" height="6" />
          
          {/* Penalty spots */}
          <circle cx="50" cy="12" r="0.5" fill="rgba(255,255,255,0.3)" />
          <circle cx="50" cy="88" r="0.5" fill="rgba(255,255,255,0.3)" />
          
          {/* Penalty arcs */}
          <path d="M 38 18 Q 50 24 62 18" />
          <path d="M 38 82 Q 50 76 62 82" />
        </g>
      </svg>

      {/* Player positions */}
      <div className="absolute inset-0">
        {formation.positions.map((position) => {
          const player = getPlayerAtPosition(position.id)
          
          return (
            <div
              key={position.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, position.id)}
            >
              {/* Position circle */}
              {!player && (
                <div className="relative">
                  <div className="w-12 h-12 bg-white/10 border-2 border-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                    <Users className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/60 whitespace-nowrap hidden group-hover:block bg-black/80 px-2 py-1 rounded">
                    {position.role}
                  </div>
                </div>
              )}

              {/* Player avatar */}
              {player && (
                <div className="relative">
                  <div className="w-14 h-14 bg-primary border-2 border-primary-light rounded-full flex flex-col items-center justify-center text-black font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <span className="text-xs">{player.number}</span>
                    <span className="text-[10px] truncate max-w-[3rem]">
                      {player.name.split(' ').pop()}
                    </span>
                  </div>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => onPlayerRemove(player.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>

                  {/* Player name tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/90 whitespace-nowrap hidden group-hover:block bg-black/90 px-2 py-1 rounded shadow-lg">
                    {player.name} - {position.role}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Formation label */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white border border-primary/30">
        {formation.name}
      </div>
    </div>
  )
}

export default TacticalBoard
