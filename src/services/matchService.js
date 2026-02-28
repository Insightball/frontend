import api from './api'
import uploadService from './uploadService'

const matchService = {
  async getMatches(filters = {}) {
    const params = new URLSearchParams()
    if (filters.category) params.append('category', filters.category)
    if (filters.status)   params.append('status', filters.status)
    if (filters.skip)     params.append('skip', filters.skip)
    if (filters.limit)    params.append('limit', filters.limit)
    const response = await api.get(`/matches/?${params.toString()}`)
    return response.data
  },

  async getMatch(matchId) {
    const response = await api.get(`/matches/${matchId}`)
    return response.data
  },

  async createMatch(matchData) {
    // FIX : slash final pour éviter le 307 Redirect qui tue le body POST
    const response = await api.post('/matches/', matchData)
    return response.data
  },

  async updateMatch(matchId, matchData) {
    const response = await api.patch(`/matches/${matchId}`, matchData)
    return response.data
  },

  async uploadMatch({ matchData, lineup, videoFile, onProgress }) {
    // Step 1 : Upload direct vers S3 — retourne le file_key (pas une URL publique)
    const videoKey = await uploadService.uploadToS3(videoFile, onProgress)

    // Step 2 : Créer le match avec le file_key S3
    // FIX : slash final pour éviter le 307 Redirect
    const response = await api.post('/matches/', {
      ...matchData,
      lineup,
      video_key: videoKey,  // file_key S3, pas une URL publique
    })
    return response.data
  },

  async deleteMatch(matchId) {
    await api.delete(`/matches/${matchId}`)
  }
}

export default matchService
