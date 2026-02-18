import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('insightball_token')
        
        if (token) {
          // Verify token is still valid by fetching user
          const userData = await authService.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        // Token invalid or expired
        authService.logout()
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password)
      setUser(userData)
      return userData
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  const signup = async (data) => {
    try {
      const userData = await authService.signup(data)
      setUser(userData)
      return userData
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Signup failed')
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
