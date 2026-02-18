import api from './api'

const playerService = {
  // Get all players
  async getPlayers(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.category) params.append('category', filters.category)
    if (filters.status) params.append('status', filters.status)
    
    const response = await api.get(`/players?${params.toString()}`)
    return response.data
  },

  // Get single player
  async getPlayer(playerId) {
    const response = await api.get(`/players/${playerId}`)
    return response.data
  },

  // Create player
  async createPlayer(playerData) {
    const response = await api.post('/players', playerData)
    return response.data
  },

  // Update player
  async updatePlayer(playerId, playerData) {
    const response = await api.patch(`/players/${playerId}`, playerData)
    return response.data
  },

  // Delete player
  async deletePlayer(playerId) {
    await api.delete(`/players/${playerId}`)
  },

  // Get players by category
  async getPlayersByCategory(category) {
    return this.getPlayers({ category })
  },

  // Get active players only
  async getActivePlayers(category = null) {
    return this.getPlayers({ category, status: 'actif' })
  }
}

export default playerService
