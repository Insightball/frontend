import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, Users, Film, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { useAuth } from '../context/AuthContext'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

function DashboardHome() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [matchesData, playersData] = await Promise.all([
        matchService.getMatches({ limit: 5 }),
        playerService.getPlayers()
      ])
      setMatches(matchesData)
      setPlayers(playersData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const completedMatches = matches.filter(m => m.status === 'completed').length
  const processingMatches = matches.filter(m => m.status === 'processing').length
  const totalPlayers = players.length
  const quota = 10

  const upcomingMatches = [
    { date: '2026-02-22', opponent: 'FC Marseille', category: 'N3' },
    { date: '2026-03-01', opponent: 'AS Monaco', category: 'N3' },
    { date: '2026-03-08', opponent: 'OGC Nice', category: 'N3' }
  ]

  const topPlayers = players.slice(0, 5).map((player, i) => ({
    ...player,
    rating: (8.5 - i * 0.3).toFixed(1),
    matches: 10 - i,
    trend: i % 2 === 0 ? 'up' : 'down'
  }))

  const notifications = [
    { type: 'success', message: 'Match vs Lyon analysé avec succès', time: 'Il y a 2h' },
    { type: 'warning', message: 'Quota 7/10 matchs utilisés ce mois', time: 'Il y a 1 jour' },
    { type: 'info', message: '3 joueurs en progression ce mois', time: 'Il y a 2 jours' }
  ]

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {user?.name} 👋
        </h1>
        <p className="text-gray-400">
          Voici un aperçu de votre club
        </p>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} type="stat" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-fade-in">
          {/* Matchs analysés */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-sm text-gray-500">Ce mois</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1 stat-number">{completedMatches}</div>
            <div className="text-sm text-gray-400">Matchs analysés</div>
          </div>

          {/* En cours */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-gray-500">En cours</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1 stat-number">{processingMatches}</div>
            <div className="text-sm text-gray-400">En analyse</div>
          </div>

          {/* Effectif */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <Link to="/dashboard/players" className="text-sm text-primary hover:underline smooth-transition">
                Gérer
              </Link>
            </div>
            <div className="text-3xl font-bold text-white mb-1 stat-number">{totalPlayers}</div>
            <div className="text-sm text-gray-400">Joueurs</div>
          </div>

          {/* Quota */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-sm text-gray-500">Restant</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1 stat-number">{quota - completedMatches}</div>
            <div className="text-sm text-gray-400">Matchs / {quota}</div>
            <div className="mt-2 w-full bg-dark-border rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full progress-animate"
                style={{ width: `${(completedMatches / quota) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Matches */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 animate-slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Derniers matchs</h2>
              <Link to="/dashboard/matches" className="text-sm text-primary hover:underline flex items-center gap-1 smooth-transition hover-scale">
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="list" />
            ) : matches.length === 0 ? (
              <div className="text-center py-8 animate-fade-in">
                <Film className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 mb-4">Aucun match analysé</p>
                <Link 
                  to="/dashboard/matches"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold rounded-lg hover-glow smooth-transition"
                >
                  Uploader un match
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.slice(0, 3).map((match, index) => (
                  <Link
                    key={match.id}
                    to={`/dashboard/matches/${match.id}`}
                    className="flex items-center gap-4 p-4 bg-black/50 border border-dark-border rounded-lg hover:border-primary/30 smooth-transition group card-hover animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold group-hover:text-primary smooth-transition">
                          {match.category} - {match.opponent}
                        </h3>
                        {match.status === 'completed' && (
                          <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded">
                            Terminé
                          </span>
                        )}
                        {match.status === 'processing' && (
                          <span className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded animate-pulse">
                            En cours
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(match.date).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                    </div>

                    {match.status === 'completed' && match.stats && (
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-gray-400 text-xs mb-1">Possession</div>
                          <div className="font-bold">{match.stats.possession}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 text-xs mb-1">Passes</div>
                          <div className="font-bold">{match.stats.passes}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 text-xs mb-1">Tirs</div>
                          <div className="font-bold">{match.stats.shots}</div>
                        </div>
                      </div>
                    )}

                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary smooth-transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Players */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Top joueurs du mois</h2>
              <Link to="/dashboard/players" className="text-sm text-primary hover:underline flex items-center gap-1 smooth-transition hover-scale">
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="list" />
            ) : topPlayers.length === 0 ? (
              <div className="text-center py-8 animate-fade-in">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">Aucun joueur enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 p-3 bg-black/50 border border-dark-border rounded-lg card-hover animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      #{index + 1}
                    </div>

                    {player.photo_url ? (
                      <img 
                        src={player.photo_url} 
                        alt={player.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-dark-border rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-gray-400">{player.position}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{player.rating}</div>
                      <div className="text-xs text-gray-500">{player.matches} matchs</div>
                    </div>

                    <div>
                      {player.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-red-500 transform rotate-180" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 animate-slide-in-right">
            <h2 className="text-xl font-bold mb-6">Alertes</h2>
            <div className="space-y-4">
              {notifications.map((notif, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-black/50 border border-dark-border rounded-lg animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {notif.type === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  {notif.type === 'warning' && (
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  )}
                  {notif.type === 'info' && (
                    <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1">{notif.message}</p>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold mb-6">Prochains matchs</h2>
            <div className="space-y-4">
              {upcomingMatches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-black/50 border border-dark-border rounded-lg card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{match.opponent}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(match.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded">
                    {match.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardHome
