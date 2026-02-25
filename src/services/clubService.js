import api from './api'

const clubService = {
  async getMyClub() {
    const response = await api.get('/club/me')
    return response.data
  },
  async updateClub(clubData) {
    const response = await api.patch('/club/me', clubData)
    return response.data
  },
  async updateLogo(logoUrl) {
    return this.updateClub({ logo_url: logoUrl })
  },
  async updateColors(primaryColor, secondaryColor) {
    return this.updateClub({ primary_color: primaryColor, secondary_color: secondaryColor })
  }
}

export default clubService
