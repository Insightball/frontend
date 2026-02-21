import api from './api'

const API_URL = '/players/' // ← Sans /api (déjà dans api.js)

const playerService = {
  // Get all players
  async getPlayers(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await api.get(`${API_URL}?${params}`)
    return response.data
  },

  // Get single player
  async getPlayer(playerId) {
    const response = await api.get(`${API_URL}${playerId}`)
    return response.data
  },

  // Create player
  async createPlayer(playerData) {
    const response = await api.post(API_URL, playerData)
    return response.data
  },

  // Update player
  async updatePlayer(playerId, playerData) {
    const response = await api.patch(`${API_URL}${playerId}`, playerData)
    return response.data
  },

  // Delete player
  async deletePlayer(playerId) {
    const response = await api.delete(`${API_URL}${playerId}`)
    return response.data
  }
}

export default playerService
