import { TrendingUp, Activity, Target } from 'lucide-react'

function Dashboard() {
  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-dark-border pb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-400 uppercase tracking-wider font-mono">Flux_Live</span>
            </div>
            <span className="text-gray-600">|</span>
            <span className="text-sm text-gray-400 font-mono">Match : 882-X6</span>
          </div>

          <div className="flex space-x-2">
            <button className="px-6 py-2 bg-primary text-black font-semibold rounded text-sm uppercase tracking-wider">
              Collectif
            </button>
            <button className="px-6 py-2 border border-dark-border text-gray-400 font-semibold rounded text-sm uppercase tracking-wider hover:bg-dark-card transition-colors">
              Individuel
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Large Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dynamic Chart */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-sm text-gray-400 uppercase tracking-wider font-mono">Dynamique du Match</h3>
              </div>
              
              <div className="h-64 relative">
                {/* Simple line chart simulation */}
                <svg className="w-full h-full" viewBox="0 0 800 200">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#5EEAD4', stopOpacity: 0.3}} />
                      <stop offset="100%" style={{stopColor: '#5EEAD4', stopOpacity: 0}} />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under curve */}
                  <path
                    d="M 0 120 Q 100 80 200 100 T 400 90 T 600 110 T 800 95 L 800 200 L 0 200 Z"
                    fill="url(#lineGradient)"
                  />
                  
                  {/* Main line */}
                  <path
                    d="M 0 120 Q 100 80 200 100 T 400 90 T 600 110 T 800 95"
                    fill="none"
                    stroke="#5EEAD4"
                    strokeWidth="2"
                  />
                  
                  {/* Time markers */}
                  <text x="10" y="195" fill="#6B7280" fontSize="12" fontFamily="monospace">0'</text>
                  <text x="390" y="195" fill="#6B7280" fontSize="12" fontFamily="monospace">MT</text>
                  <text x="780" y="195" fill="#6B7280" fontSize="12" fontFamily="monospace">90'</text>
                </svg>
              </div>
            </div>

            {/* Recovery Zones */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="text-sm text-gray-400 uppercase tracking-wider font-mono">Zones de Récupération</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">DEF 1/3</span>
                  <div className="flex-1 mx-4 bg-dark-border rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">MID 1/3</span>
                  <div className="flex-1 mx-4 bg-dark-border rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">ATT 1/3</span>
                  <div className="flex-1 mx-4 bg-dark-border rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{width: '40%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats Cards */}
          <div className="space-y-6">
            {/* Passes Totales */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-mono">Passes Totales</div>
              <div className="flex items-baseline space-x-2 mb-4">
                <div className="text-5xl font-bold text-white">482</div>
                <div className="text-lg text-primary">88%</div>
              </div>
              <div className="bg-dark-border rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full" style={{width: '88%'}}></div>
              </div>
            </div>

            {/* Pressing Haut */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-mono">Pressing Haut</div>
              <div className="flex items-baseline space-x-2 mb-2">
                <div className="text-5xl font-bold text-white">18</div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+4</span>
                </div>
              </div>
              <div className="text-xs text-gray-600">Top 5% league avg</div>
            </div>

            {/* Shot Map */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3 className="text-xs text-gray-400 uppercase tracking-wider font-mono">Carte des Tirs (x6)</h3>
              </div>
              
              <div className="aspect-[4/3] bg-black border border-dark-border rounded relative">
                {/* Simple field representation */}
                <div className="absolute inset-0 p-4">
                  {/* Goal line */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700"></div>
                  
                  {/* Shot markers */}
                  <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary rounded-full shadow-glow"></div>
                  <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-primary rounded-full"></div>
                  <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
