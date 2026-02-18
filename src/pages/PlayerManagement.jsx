import { useState, useEffect } from 'react'
import { Plus, Users as UsersIcon, Search, Filter } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PlayerCard from '../components/PlayerCard'
import PlayerForm from '../components/PlayerForm'
import playerService from '../services/playerService'
import { useAuth } from '../context/AuthContext'

function PlayerManagement() {
  const { user } = useAuth()
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPlayers()
  }, [])

  useEffect(() => {
    filterPlayers()
  }, [players, selectedCategory, selectedPosition, searchQuery])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const data = await playerService.getPlayers()
      setPlayers(data)
    } catch (error) {
      console.error('Error loading players:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPlayers = () => {
    let filtered = [...players]

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Position filter
    if (selectedPosition !== 'all') {
      filtered = filtered.filter(p => p.position === selectedPosition)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.number.toString().includes(searchQuery)
      )
    }

    setFilteredPlayers(filtered)
  }

  const handleAddPlayer = async (playerData) => {
    try {
      await playerService.createPlayer(playerData)
      await loadPlayers()
      setIsFormOpen(false)
    } catch (error) {
      throw error
    }
  }

  const handleEditPlayer = async (playerData) => {
    try {
      await playerService.updatePlayer(editingPlayer.id, playerData)
      await loadPlayers()
      setEditingPlayer(null)
      setIsFormOpen(false)
    } catch (error) {
      throw error
    }
  }

  const handleDeletePlayer = async (player) => {
    if (!confirm(`Supprimer ${player.name} ?`)) return

    try {
      await playerService.deletePlayer(player.id)
      await loadPlayers()
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const openEditForm = (player) => {
    setEditingPlayer(player)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingPlayer(null)
  }

  // Group by position for display
  const groupedPlayers = {
    'Gardien': filteredPlayers.filter(p => p.position === 'Gardien'),
    'Défenseur': filteredPlayers.filter(p => p.position === 'Défenseur'),
    'Milieu': filteredPlayers.filter(p => p.position === 'Milieu'),
    'Attaquant': filteredPlayers.filter(p => p.position === 'Attaquant'),
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Effectif</h1>
            <p className="text-gray-400">Gérez vos joueurs</p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="group px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un joueur</span>
          </button>
        </div>

        {/* Stats quick view */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{players.length}</div>
                <div className="text-sm text-gray-400">Joueurs total</div>
              </div>
            </div>
          </div>

          {['Gardien', 'Défenseur', 'Milieu', 'Attaquant'].map(position => (
            <div key={position} className="bg-dark-card border border-dark-border rounded-lg p-4">
              <div className="text-2xl font-bold">
                {players.filter(p => p.position === position).length}
              </div>
              <div className="text-sm text-gray-400">{position}s</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-dark-card border border-dark-border rounded-lg pl-12 pr-8 py-3 text-white focus:border-primary focus:outline-none transition-colors appearance-none min-w-[180px]"
            >
              <option value="all">Toutes catégories</option>
              <option value="N3">N3</option>
              <option value="U19">U19 Nationaux</option>
              <option value="U17">U17 Nationaux</option>
              <option value="U15">U15</option>
              <option value="Seniors">Seniors</option>
            </select>
          </div>

          {/* Position filter */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors appearance-none min-w-[160px]"
          >
            <option value="all">Tous les postes</option>
            <option value="Gardien">Gardiens</option>
            <option value="Défenseur">Défenseurs</option>
            <option value="Milieu">Milieux</option>
            <option value="Attaquant">Attaquants</option>
          </select>
        </div>
      </div>

      {/* Players List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-lg">
          <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {players.length === 0 ? 'Aucun joueur' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-500 mb-4">
            {players.length === 0 
              ? 'Commencez par ajouter vos joueurs'
              : 'Essayez de modifier vos filtres'}
          </p>
          {players.length === 0 && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all"
            >
              Ajouter votre premier joueur
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPlayers).map(([position, positionPlayers]) => {
            if (positionPlayers.length === 0) return null

            return (
              <div key={position}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {position}s
                  <span className="text-sm font-normal text-gray-500">
                    ({positionPlayers.length})
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {positionPlayers.map(player => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      onEdit={openEditForm}
                      onDelete={handleDeletePlayer}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Player Form Modal */}
      <PlayerForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingPlayer ? handleEditPlayer : handleAddPlayer}
        player={editingPlayer}
        category={selectedCategory !== 'all' ? selectedCategory : undefined}
      />
    </DashboardLayout>
  )
}

export default PlayerManagement
