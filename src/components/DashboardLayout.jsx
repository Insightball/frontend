import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Film, Users, Settings, LogOut, BarChart3, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    { name: 'Joueurs', href: '/dashboard/players', icon: Users },
    { name: 'Matchs', href: '/dashboard/matches', icon: Film },
    { name: 'Statistiques', href: '/dashboard/stats', icon: BarChart3 },
  ]

  // Add team management for CLUB plan
  if (user?.plan === 'club') {
    navigation.push({ name: 'Équipe', href: '/dashboard/team', icon: Users })
  }

  navigation.push({ name: 'Paramètres', href: '/dashboard/settings', icon: Settings })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 bottom-0 w-64 bg-dark-card border-r border-dark-border overflow-y-auto">
          <div className="p-6">
            {/* User Info */}
            <div className="mb-8 p-4 bg-black border border-dark-border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              
              {user?.plan && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Plan</span>
                  <span className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-medium rounded uppercase">
                    {user.plan}
                  </span>
                </div>
              )}
              
              {user?.club_name && (
                <div className="mt-2 pt-2 border-t border-dark-border">
                  <span className="text-xs text-gray-500">Club</span>
                  <p className="text-sm font-medium mt-1">{user.club_name}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/10 border border-primary/30 text-primary'
                        : 'text-gray-400 hover:text-white hover:bg-dark-border'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="mt-8 pt-8 border-t border-dark-border">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
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