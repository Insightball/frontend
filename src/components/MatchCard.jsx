import { useNavigate } from 'react-router-dom'
import { Calendar, Tag, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react'

function MatchCard({ match }) {
  const navigate = useNavigate()

  const getStatusBadge = () => {
    switch (match.status) {
      case 'completed':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-500 uppercase tracking-wider">Terminé</span>
          </div>
        )
      case 'processing':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Analyse en cours...</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-500/10 border border-gray-500/30 rounded-full">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">En attente</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Erreur</span>
          </div>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="group bg-dark-card border border-dark-border rounded-lg p-6 hover:border-primary/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
            {match.category} - {match.opponent}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(match.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span className="capitalize">{match.type}</span>
            </div>
          </div>
        </div>
        
        {getStatusBadge()}
      </div>

      {/* Progress Bar (if processing) */}
      {match.status === 'processing' && match.progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-mono">Progression</span>
            <span className="text-xs text-primary font-mono">{match.progress}%</span>
          </div>
          <div className="w-full bg-dark-border rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full transition-all duration-500"
              style={{ width: `${match.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Preview (if completed) */}
      {match.status === 'completed' && match.stats && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-black/50 border border-dark-border rounded-lg">
          <div>
            <div className="text-xs text-gray-500 mb-1">Possession</div>
            <div className="text-lg font-bold text-white">{match.stats.possession}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Passes</div>
            <div className="text-lg font-bold text-white">{match.stats.passes}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Tirs</div>
            <div className="text-lg font-bold text-white">{match.stats.shots}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-3">
        {match.status === 'completed' && (
          <>
            <button 
              onClick={() => navigate(`/dashboard/matches/${match.id}`)}
              className="flex-1 px-4 py-2.5 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center justify-center space-x-2"
            >
              <span>Voir le rapport</span>
            </button>
            <button className="p-2.5 border border-dark-border hover:border-primary hover:bg-primary/10 rounded-lg transition-all">
              <Download className="w-5 h-5" />
            </button>
          </>
        )}
        
        {match.status === 'processing' && (
          <button className="flex-1 px-4 py-2.5 border border-dark-border text-gray-400 rounded-lg cursor-not-allowed" disabled>
            Analyse en cours...
          </button>
        )}
        
        {match.status === 'pending' && (
          <button className="flex-1 px-4 py-2.5 border border-dark-border hover:border-primary hover:bg-primary/10 text-gray-300 rounded-lg transition-all">
            En attente d'analyse
          </button>
        )}
        
        {match.status === 'error' && (
          <button className="flex-1 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">
            Réessayer
          </button>
        )}
      </div>
    </div>
  )
}

export default MatchCard