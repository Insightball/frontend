import api from './api'

const authService = {
  // Sign up
  async signup(userData) {
    const response = await api.post('/auth/signup', userData)
    
    if (response.data.access_token) {
      localStorage.setItem('insightball_token', response.data.access_token)
      
      // Get user info
      const userInfo = await this.getCurrentUser()
      localStorage.setItem('insightball_user', JSON.stringify(userInfo))
      
      return userInfo
    }
    
    throw new Error('No token received')
  },

  // Login
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    
    if (response.data.access_token) {
      localStorage.setItem('insightball_token', response.data.access_token)
      
      // Get user info
      const userInfo = await this.getCurrentUser()
      localStorage.setItem('insightball_user', JSON.stringify(userInfo))
      
      return userInfo
    }
    
    throw new Error('No token received')
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout
  logout() {
    localStorage.removeItem('insightball_token')
    localStorage.removeItem('insightball_user')
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem('insightball_token')
  },

  // Get stored user
  getStoredUser() {
    const userJson = localStorage.getItem('insightball_user')
    return userJson ? JSON.parse(userJson) : null
  }
}

export default authService
