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
  // Initialisation instantanée depuis localStorage — pas de flash loader
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('insightball_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(() => {
    // Si on a un user en cache, pas besoin de bloquer le rendu
    try {
      return !localStorage.getItem('insightball_user')
    } catch { return true }
  })

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('insightball_token')
        if (token) {
          const userData = await authService.getCurrentUser()
          setUser(userData)
          // Mettre à jour le cache local
          localStorage.setItem('insightball_user', JSON.stringify(userData))
        } else {
          // Pas de token → nettoyer
          setUser(null)
          localStorage.removeItem('insightball_user')
        }
      } catch (error) {
        // Token invalide → nettoyer tout
        authService.logout()
        setUser(null)
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

  // Recharge les données user depuis /me — appelé après toute action Stripe
  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      localStorage.setItem('insightball_user', JSON.stringify(userData))
      return userData
    } catch (error) {
      console.error('refreshUser failed:', error)
    }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
