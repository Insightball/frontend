import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Video, Calendar, TrendingUp, Clock, MapPin, Plus, Search, Filter } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import matchService from '../services/matchService'

function DashboardMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, completed

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const data = await matchService.getMatches()
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'En attente', class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
      processing: { label: 'En cours', class: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
      completed: { label: 'Terminé', class: 'bg-green-500/10 text-green-500 border-green-500/30' },
      error: { label: 'Erreur', class: 'bg-red-500/10 text-red-500 border-red-500/30' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
        {badge.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true
    return match.status === filter
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes Matchs</h1>
            <p className="text-gray-400">Gérez vos matchs et consultez les analyses</p>
          </div>
          
          <Link
            to="/dashboard/matches/upload"
            className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau match
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total matchs</span>
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{matches.length}</div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">En attente</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold">
              {matches.filter(m => m.status === 'pending').length}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">En cours</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">
              {matches.filter(m => m.status === 'processing').length}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Terminés</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">
              {matches.filter(m => m.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all' 
                ? 'bg-primary text-black' 
                : 'bg-dark-card border border-dark-border text-gray-300 hover:border-primary/50'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-dark-card border border-dark-border text-gray-300 hover:border-yellow-500/50'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'processing' 
                ? 'bg-blue-500 text-black' 
                : 'bg-dark-card border border-dark-border text-gray-300 hover:border-blue-500/50'
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'completed' 
                ? 'bg-green-500 text-black' 
                : 'bg-dark-card border border-dark-border text-gray-300 hover:border-green-500/50'
            }`}
          >
            Terminés
          </button>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold mb-2">Aucun match</h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Commencez par uploader votre premier match' 
                : `Aucun match ${filter === 'pending' ? 'en attente' : filter === 'processing' ? 'en cours' : 'terminé'}`}
            </p>
            <Link
              to="/dashboard/matches/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all"
            >
              <Plus className="w-5 h-5" />
              Ajouter un match
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMatches.map((match) => (
              <Link
                key={match.id}
                to={`/dashboard/matches/${match.id}`}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        vs {match.opponent}
                      </h3>
                      {getStatusBadge(match.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(match.date)}
                      </div>
                      
                      {match.category && (
                        <span className="px-2 py-1 bg-dark-border rounded text-xs font-medium">
                          {match.category}
                        </span>
                      )}
                      
                      {match.competition && (
                        <span className="text-xs">{match.competition}</span>
                      )}

                      {match.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {match.location}
                        </div>
                      )}
                    </div>

                    {match.score_home !== null && match.score_away !== null && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-2xl font-bold">{match.score_home}</span>
                        <span className="text-gray-500">-</span>
                        <span className="text-2xl font-bold">{match.score_away}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          match.score_home > match.score_away 
                            ? 'bg-green-500/10 text-green-500' 
                            : match.score_home < match.score_away 
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {match.score_home > match.score_away ? 'Victoire' : match.score_home < match.score_away ? 'Défaite' : 'Nul'}
                        </span>
                      </div>
                    )}

                    {match.status === 'processing' && match.progress > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span>Analyse en cours...</span>
                          <span>{match.progress}%</span>
                        </div>
                        <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${match.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <Video className="w-8 h-8 text-gray-600 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default DashboardMatches
