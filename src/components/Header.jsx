import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-dark-border">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/logo.svg" 
              alt="INSIGHTBALL" 
              className="w-10 h-10 group-hover:scale-110 transition-transform"
            />
            <span className="text-xl font-bold tracking-tight">
              INSIGHT<span className="text-violet-400">BALL</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/problematique" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
              Problématique
            </Link>
            <Link to="/solution" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
              Solution
            </Link>
            <Link to="/fonctionnement" className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
              Fonctionnement
            </Link>
            
            <Link 
              to="/pre-inscription" 
              className="px-6 py-2.5 border border-primary/30 text-primary hover:bg-primary/10 transition-all uppercase tracking-wider text-sm font-medium rounded"
            >
              Pré-inscription
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Header
