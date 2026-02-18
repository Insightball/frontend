import { createContext, useContext, useState, useEffect } from 'react'

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
    const token = localStorage.getItem('insightball_token')
    const userData = localStorage.getItem('insightball_user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // TODO: Replace with real API call
    // For now, mock authentication
    const mockUser = {
      id: '1',
      name: 'Tchitcha',
      email: email,
      plan: 'club',
      clubName: 'Gazelec FC'
    }
    
    const mockToken = 'mock-jwt-token-' + Date.now()
    
    // Save to localStorage
    localStorage.setItem('insightball_token', mockToken)
    localStorage.setItem('insightball_user', JSON.stringify(mockUser))
    
    setUser(mockUser)
    
    return mockUser
  }

  const signup = async (data) => {
    // TODO: Replace with real API call
    const mockUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      plan: data.plan,
      clubName: data.clubName || null
    }
    
    const mockToken = 'mock-jwt-token-' + Date.now()
    
    localStorage.setItem('insightball_token', mockToken)
    localStorage.setItem('insightball_user', JSON.stringify(mockUser))
    
    setUser(mockUser)
    
    return mockUser
  }

  const logout = () => {
    localStorage.removeItem('insightball_token')
    localStorage.removeItem('insightball_user')
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
