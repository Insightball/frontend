import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-dark-border">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.svg" 
              alt="INSIGHTBALL" 
              className="w-10 h-10"
            />
            <span className="text-xl font-bold">INSIGHTBALL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <NotificationBell />
                <button
                  onClick={logout}
                  className="px-6 py-2 bg-dark-border hover:bg-dark-border/70 rounded-lg transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/demo" className="text-gray-300 hover:text-primary transition-colors">
                  Démo
                </Link>
                <Link to="/#pricing" className="text-gray-300 hover:text-primary transition-colors">
                  Tarifs
                </Link>
                <Link to="/login" className="text-gray-300 hover:text-primary transition-colors">
                  Connexion
                </Link>
                <Link 
                  to="/signup"
                  className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all"
                >
                  Essayer gratuitement
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-dark-border rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-dark-border pt-4 space-y-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-300 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Notifications</span>
                  <NotificationBell />
                </div>
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-6 py-2 bg-dark-border hover:bg-dark-border/70 rounded-lg transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/demo"
                  className="block text-gray-300 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Démo
                </Link>
                <Link
                  to="/#pricing"
                  className="block text-gray-300 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tarifs
                </Link>
                <Link
                  to="/login"
                  className="block text-gray-300 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="block px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Essayer gratuitement
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
