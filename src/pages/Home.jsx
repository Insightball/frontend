import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function Home() {
  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(94,234,212,0.03)_0%,_transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-dark-card border border-dark-border rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-400 uppercase tracking-wider font-mono">System Online</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              TRANSFORMEZ VOS
              <br />
              VIDÉOS DE MATCHS
              <br />
              EN <span className="text-primary">DÉCISIONS</span>
              <br />
              <span className="text-gray-400">CLAIRES</span>
            </h1>

            {/* Description */}
            <div className="space-y-4 text-gray-400 text-lg border-l-2 border-primary/30 pl-6">
              <p className="font-light">
                INSIGHTBALL est la plateforme qui démocratise
                l'analyse vidéo professionnelle pour tous.
              </p>
              <p className="font-light">
                Transformez une simple vidéo en informations
                exploitables grâce à l'automatisation et à l'IA.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/pre-inscription"
                className="group px-8 py-4 bg-primary text-black font-semibold rounded hover:shadow-glow transition-all flex items-center justify-center space-x-2"
              >
                <span>PRÉ-INSCRIPTION</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/demo"
                className="px-8 py-4 border border-dark-border text-gray-300 font-semibold rounded hover:bg-dark-card transition-all flex items-center justify-center space-x-2"
              >
                <span className="font-mono">// DÉCOUVRIR</span>
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="aspect-square bg-dark-card border border-dark-border rounded-2xl p-8 relative overflow-hidden">
              {/* Football Field Visualization */}
              <div className="absolute inset-0 flex items-center justify-center opacity-50">
                <svg className="w-full h-full" viewBox="0 0 400 600">
                  {/* Field outline */}
                  <rect x="20" y="20" width="360" height="560" fill="none" stroke="#1F2937" strokeWidth="2" />
                  {/* Center line */}
                  <line x1="20" y1="300" x2="380" y2="300" stroke="#1F2937" strokeWidth="2" />
                  {/* Center circle */}
                  <circle cx="200" cy="300" r="60" fill="none" stroke="#1F2937" strokeWidth="2" />
                  
                  {/* Player dots (cyan) */}
                  <circle cx="120" cy="150" r="8" fill="#5EEAD4" className="animate-pulse" />
                  <circle cx="280" cy="180" r="8" fill="#5EEAD4" className="animate-pulse" style={{animationDelay: '0.3s'}} />
                  <circle cx="200" cy="250" r="8" fill="#5EEAD4" className="animate-pulse" style={{animationDelay: '0.6s'}} />
                  <circle cx="150" cy="350" r="8" fill="#5EEAD4" className="animate-pulse" style={{animationDelay: '0.9s'}} />
                  <circle cx="250" cy="380" r="8" fill="#5EEAD4" className="animate-pulse" style={{animationDelay: '1.2s'}} />
                  
                  {/* Opponent dots (red) */}
                  <circle cx="180" cy="120" r="6" fill="#EF4444" opacity="0.6" />
                  <circle cx="320" cy="250" r="6" fill="#EF4444" opacity="0.6" />
                  <circle cx="100" cy="450" r="6" fill="#EF4444" opacity="0.6" />
                  <circle cx="290" cy="480" r="6" fill="#EF4444" opacity="0.6" />
                </svg>
              </div>

              {/* Stats Card Overlay */}
              <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-sm border border-primary/30 rounded-lg p-4 min-w-[200px]">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-mono">Player 10</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Passes</div>
                    <div className="text-2xl font-bold text-white">24<span className="text-sm text-primary ml-1">92%</span></div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Distance</div>
                    <div className="text-2xl font-bold text-white">8.2<span className="text-sm text-gray-400 ml-1">km</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
