import api from './api'
import uploadService from './uploadService'

const matchService = {
  // Get all matches
  async getMatches(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.category) params.append('category', filters.category)
    if (filters.status) params.append('status', filters.status)
    if (filters.skip) params.append('skip', filters.skip)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await api.get(`/matches?${params.toString()}`)
    return response.data
  },

  // Get single match
  async getMatch(matchId) {
    const response = await api.get(`/matches/${matchId}`)
    return response.data
  },

  // Create match
  async createMatch(matchData) {
    const response = await api.post('/matches', matchData)
    return response.data
  },

  // Update match
  async updateMatch(matchId, matchData) {
    const response = await api.patch(`/matches/${matchId}`, matchData)
    return response.data
  },

  // Upload match with video
  async uploadMatch({ matchData, lineup, videoFile, onProgress }) {
    // Step 1: Upload video to S3
    const videoUrl = await uploadService.uploadToS3(videoFile, onProgress)

    // Step 2: Create match with video URL
    const response = await api.post('/matches', {
      ...matchData,
      lineup,
      video_url: videoUrl,
    })
    return response.data
  },

  // Delete match
  async deleteMatch(matchId) {
    await api.delete(`/matches/${matchId}`)
  }
}

export default matchService
