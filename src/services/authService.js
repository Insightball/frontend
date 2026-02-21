import api from './api'

const authService = {
  // Sign up
  async signup(userData) {
    try {
      console.log('Signup attempt:', { email: userData.email })
      const response = await api.post('/auth/signup', userData)
      console.log('Signup response:', response.data)
      
      if (response.data.access_token) {
        localStorage.setItem('insightball_token', response.data.access_token)
        
        // Get user info
        const userInfo = await this.getCurrentUser()
        localStorage.setItem('insightball_user', JSON.stringify(userInfo))
        
        return userInfo
      }
      
      throw new Error('No token received')
    } catch (error) {
      console.error('Signup error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  // Login
  async login(email, password) {
    try {
      console.log('Login attempt:', { email })
      const response = await api.post('/auth/login', { email, password })
      console.log('Login response received:', response.data)
      
      if (response.data.access_token) {
        localStorage.setItem('insightball_token', response.data.access_token)
        
        // Get user info
        console.log('Fetching user info...')
        const userInfo = await this.getCurrentUser()
        console.log('User info received:', userInfo)
        localStorage.setItem('insightball_user', JSON.stringify(userInfo))
        
        return userInfo
      }
      
      throw new Error('No token received')
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
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
