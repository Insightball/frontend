import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, Users, Film, CheckCircle, Clock, ArrowRight, Award, AlertCircle } from 'lucide-react'
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
    { date: '2026-02-22', opponent: 'AS Furiani', category: 'N3' },
    { date: '2026-03-01', opponent: 'FC Bastia-Borgo', category: 'N3' },
    { date: '2026-03-08', opponent: 'UF Zonza', category: 'N3' }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {user?.name} 👋
        </h1>
        <p className="text-gray-400">
          {user?.club_name || 'Votre club'}
        </p>
      </div>

      {/* Stats Cards - VIOLET THEME ONLY */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} type="stat" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Matchs analysés - Violet */}
          <div className="bg-gradient-to-br from-violet-500/5 to-transparent border border-violet-500/20 rounded-xl p-6 hover:border-violet-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-violet-400" />
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Ce mois</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{completedMatches}</div>
            <div className="text-sm text-gray-400">Matchs analysés</div>
          </div>

          {/* En cours - Violet clair */}
          <div className="bg-gradient-to-br from-violet-400/5 to-transparent border border-violet-400/20 rounded-xl p-6 hover:border-violet-400/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-violet-400/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-violet-300" />
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Actif</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{processingMatches}</div>
            <div className="text-sm text-gray-400">En analyse</div>
          </div>

          {/* Effectif - Purple */}
          <div className="bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <Link to="/dashboard/players" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Gérer →
              </Link>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{totalPlayers}</div>
            <div className="text-sm text-gray-400">Joueurs</div>
          </div>

          {/* Quota - Fuchsia */}
          <div className="bg-gradient-to-br from-fuchsia-500/5 to-transparent border border-fuchsia-500/20 rounded-xl p-6 hover:border-fuchsia-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-fuchsia-500/10 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-fuchsia-400" />
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Quota</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{quota - completedMatches}</div>
            <div className="text-sm text-gray-400 mb-3">Matchs restants / {quota}</div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all duration-500"
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
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                  <Film className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold">Derniers matchs</h2>
              </div>
              <Link to="/dashboard/matches" className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium group">
                Voir tout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="list" />
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-violet-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Film className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-gray-400 mb-6">Aucun match analysé pour le moment</p>
                <Link 
                  to="/dashboard/matches"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                >
                  <Film className="w-5 h-5" />
                  Uploader un match
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.slice(0, 3).map((match) => (
                  <Link
                    key={match.id}
                    to={`/dashboard/matches/${match.id}`}
                    className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/10 rounded-lg hover:border-violet-500/30 hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-violet-400 transition-colors">
                          {match.category} - {match.opponent}
                        </h3>
                        {match.status === 'completed' && (
                          <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium rounded-full">
                            ✓ Terminé
                          </span>
                        )}
                        {match.status === 'processing' && (
                          <span className="px-3 py-1 bg-violet-400/10 border border-violet-400/30 text-violet-300 text-xs font-medium rounded-full animate-pulse">
                            ⏳ En cours
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(match.date).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    {match.status === 'completed' && match.stats && (
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Possession</div>
                          <div className="text-lg font-bold text-violet-400">{match.stats.possession}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Passes</div>
                          <div className="text-lg font-bold">{match.stats.passes}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Tirs</div>
                          <div className="text-lg font-bold">{match.stats.shots}</div>
                        </div>
                      </div>
                    )}

                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Players */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Top joueurs du mois</h2>
              </div>
              <Link to="/dashboard/players" className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium group">
                Voir tout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="list" />
            ) : topPlayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-400">Aucun joueur enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/10 rounded-lg hover:border-purple-500/30 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                      #{index + 1}
                    </div>

                    {player.photo_url ? (
                      <img 
                        src={player.photo_url} 
                        alt={player.name}
                        className="w-12 h-12 rounded-lg object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-sm text-gray-400">{player.position}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-violet-400">
                        {player.rating}
                      </div>
                      <div className="text-xs text-gray-500">{player.matches} matchs</div>
                    </div>

                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                      {player.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-violet-400" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-gray-600 transform rotate-180" />
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
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold">Alertes</h2>
            </div>
            <div className="space-y-3">
              {notifications.map((notif, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-lg"
                >
                  {notif.type === 'success' && (
                    <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-violet-400" />
                    </div>
                  )}
                  {notif.type === 'warning' && (
                    <div className="w-8 h-8 bg-fuchsia-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-fuchsia-400" />
                    </div>
                  )}
                  {notif.type === 'info' && (
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white mb-1">{notif.message}</p>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold">Prochains matchs</h2>
            </div>
            <div className="space-y-3">
              {upcomingMatches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/10 rounded-lg hover:border-violet-500/30 transition-all"
                >
                  <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{match.opponent}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(match.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium rounded-full">
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
