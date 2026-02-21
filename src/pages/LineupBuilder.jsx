import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Save, ArrowLeft, Users as UsersIcon, RefreshCw } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import TacticalBoard from '../components/TacticalBoard'
import PlayerSelector from '../components/PlayerSelector'
import { FORMATIONS, FORMATION_LIST } from '../utils/formations'
import playerService from '../services/playerService'

function LineupBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const matchId = searchParams.get('matchId')
  
  const [selectedFormation, setSelectedFormation] = useState('4-4-2')
  const [selectedCategory, setSelectedCategory] = useState('N3')
  const [players, setPlayers] = useState([])
  const [lineup, setLineup] = useState({
    starters: [],
    substitutes: []
  })
  const [draggedPlayer, setDraggedPlayer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const data = await playerService.getPlayers()
      setPlayers(data.filter(p => p.status === 'actif'))
    } catch (error) {
      console.error('Error loading players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormationChange = (formationKey) => {
    setSelectedFormation(formationKey)
    // Clear lineup when changing formation
    setLineup({ starters: [], substitutes: [] })
  }

  const handlePlayerPlace = (player, positionId) => {
    // Check if position is already occupied
    const existingPlayerIndex = lineup.starters.findIndex(p => p.positionId === positionId)
    
    if (existingPlayerIndex >= 0) {
      // Replace existing player - send them to substitutes
      const replacedPlayer = lineup.starters[existingPlayerIndex]
      setLineup(prev => ({
        starters: prev.starters.map(p => 
          p.positionId === positionId 
            ? { ...player, positionId } 
            : p
        ),
        substitutes: [...prev.substitutes, replacedPlayer]
      }))
    } else {
      // Add new player to position
      setLineup(prev => ({
        ...prev,
        starters: [...prev.starters, { ...player, positionId }]
      }))
    }
  }

  const handlePlayerRemove = (playerId) => {
    const player = lineup.starters.find(p => p.id === playerId)
    setLineup(prev => ({
      starters: prev.starters.filter(p => p.id !== playerId),
      substitutes: player ? [...prev.substitutes, player] : prev.substitutes
    }))
  }

  const handleAddSubstitute = (player) => {
    setLineup(prev => ({
      ...prev,
      substitutes: [...prev.substitutes, player]
    }))
  }

  const handleRemoveSubstitute = (playerId) => {
    setLineup(prev => ({
      ...prev,
      substitutes: prev.substitutes.filter(p => p.id !== playerId)
    }))
  }

  const handleSave = async () => {
    try {
      const lineupData = {
        formation: selectedFormation,
        category: selectedCategory,
        starters: lineup.starters.map(p => ({
          player_id: p.id,
          position_id: p.positionId,
          number: p.number,
          name: p.name
        })),
        substitutes: lineup.substitutes.map(p => ({
          player_id: p.id,
          number: p.number,
          name: p.name
        }))
      }

      // TODO: Save to backend
      console.log('Saving lineup:', lineupData)

      if (matchId) {
        // If called from match context, save to match and return
        navigate(`/dashboard/matches/${matchId}`)
      } else {
        // Otherwise save as template
        alert('Composition sauvegardée !')
      }
    } catch (error) {
      console.error('Error saving lineup:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser la composition ?')) {
      setLineup({ starters: [], substitutes: [] })
    }
  }

  const formation = FORMATIONS[selectedFormation]
  const isComplete = lineup.starters.length === 11

  const categories = ['N3', 'U19', 'U17', 'U15', 'Seniors']

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Composition tactique</h1>
            <p className="text-gray-400">
              {isComplete ? '✓ Composition complète (11/11)' : `${lineup.starters.length}/11 joueurs placés`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-dark-border hover:border-primary hover:bg-primary/10 rounded-lg transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={!isComplete}
              className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Tactical Board */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formation & Category selectors */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dispositif tactique
              </label>
              <select
                value={selectedFormation}
                onChange={(e) => handleFormationChange(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              >
                {FORMATION_LIST.map((formation) => (
                  <option key={formation.value} value={formation.value}>
                    {formation.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tactical Board */}
          <div className="aspect-[2/3]">
            <TacticalBoard
              formation={formation}
              lineup={lineup}
              onPlayerPlace={handlePlayerPlace}
              onPlayerRemove={handlePlayerRemove}
            />
          </div>

          {/* Substitutes */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Remplaçants ({lineup.substitutes.length})</h3>
            </div>

            {lineup.substitutes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Aucun remplaçant
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lineup.substitutes.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 p-3 bg-black/50 border border-dark-border rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary text-black rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {player.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.position}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveSubstitute(player.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Player Selector */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Joueurs disponibles
          </h3>
          <PlayerSelector
            players={players}
            lineup={lineup}
            onDragStart={setDraggedPlayer}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default LineupBuilder
