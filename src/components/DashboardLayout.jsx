import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Film, Users, Settings, LogOut, BarChart3, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Accueil', href: '/dashboard', icon: Home },
    { name: 'Matchs', href: '/dashboard/matches', icon: Film },
    { name: 'Effectif', href: '/dashboard/players', icon: Users },
    { name: 'Statistiques', href: '/dashboard/stats', icon: BarChart3 },
  ]

  if (user?.plan === 'club') {
    navigation.push({ name: 'Équipe', href: '/dashboard/team', icon: Users })
  }

  navigation.push({ name: 'Paramètres', href: '/dashboard/settings', icon: Settings })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-black border-b border-white/10 z-50">
        <div className="h-full px-6 flex items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="INSIGHTBALL" className="w-10 h-10" />
            <span className="text-xl font-bold">
              INSIGHT<span className="text-violet-400">BALL</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar - VIOLET THEME */}
        <aside className="fixed left-0 top-20 bottom-0 w-64 bg-black border-r border-white/10 overflow-y-auto">
          <div className="p-6">
            {/* User Info */}
            <div className="mb-8 p-4 bg-white/[0.02] border border-white/10 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              
              {user?.plan && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Plan</span>
                  <span className="px-2 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium rounded uppercase">
                    {user.plan}
                  </span>
                </div>
              )}
            </div>

            {/* Navigation - VIOLET ACTIVE STATE */}
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                        : 'text-gray-400 hover:bg-white/[0.02] hover:text-white border border-transparent'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/[0.02] hover:text-white transition-all border border-transparent"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </nav>
          </div>

          {/* Club Info */}
          {user?.club_name && (
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-black">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">CLUB</span>
              </div>
              <p className="text-sm font-medium text-white mt-1">{user.club_name}</p>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
