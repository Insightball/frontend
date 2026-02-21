import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Video, Users, BarChart3, Settings, LogOut, Menu, X, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ClubBadge from './ClubBadge'
import NotificationBell from './NotificationBell'

function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Accueil', href: '/dashboard', icon: Home },
    { name: 'Matchs', href: '/dashboard/matches', icon: Video },
    { name: 'Effectif', href: '/dashboard/players', icon: Users },
    { name: 'Statistiques', href: '/dashboard/stats', icon: BarChart3 }
  ]

  // Add Team management only for CLUB plan
  if (user?.plan === 'club') {
    navigation.push({ name: 'Équipe', href: '/dashboard/team', icon: Users })
  }

  navigation.push({ name: 'Paramètres', href: '/dashboard/settings', icon: Settings })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-dark-card border-r border-dark-border">
        {/* Logo */}
        <div className="p-6 border-b border-dark-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src="/logo.svg" alt="INSIGHTBALL" className="w-10 h-10" />
            <span className="text-xl font-bold">INSIGHTBALL</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-black font-semibold'
                    : 'text-gray-300 hover:bg-dark-border hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-dark-border">
          <div className="bg-black rounded-lg p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              {user?.club?.logo_url ? (
                <ClubBadge club={user.club} size="md" />
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{user?.name}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
              <NotificationBell />
            </div>
            <div className="text-xs">
              <span className={`px-2 py-1 rounded ${
                user?.plan === 'club' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-blue-500/10 text-blue-500'
              }`}>
                {user?.plan === 'club' ? 'CLUB' : 'COACH'}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-dark-border hover:text-white rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-dark-card border-b border-dark-border">
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo.svg" alt="INSIGHTBALL" className="w-8 h-8" />
              <span className="font-bold">INSIGHTBALL</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-dark-border rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-dark-border">
              <nav className="p-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary text-black font-semibold'
                          : 'text-gray-300 hover:bg-dark-border hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-dark-border hover:text-white rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
