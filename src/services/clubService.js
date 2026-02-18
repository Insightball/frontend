import api from './api'

const clubService = {
  // Get current user's club
  async getMyClub() {
    const response = await api.get('/clubs/me')
    return response.data
  },

  // Update club
  async updateClub(clubData) {
    const response = await api.patch('/clubs/me', clubData)
    return response.data
  },

  // Update logo only
  async updateLogo(logoUrl) {
    return this.updateClub({ logo_url: logoUrl })
  },

  // Update colors
  async updateColors(primaryColor, secondaryColor) {
    return this.updateClub({ 
      primary_color: primaryColor,
      secondary_color: secondaryColor
    })
  }
}

export default clubService
