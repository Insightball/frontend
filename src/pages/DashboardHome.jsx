import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, Users, Film, AlertCircle, CheckCircle, Clock, ArrowRight, Zap, Target, Award } from 'lucide-react'
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
      {/* Welcome Section - Enhanced */}
      <div className="mb-8 relative">
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Bienvenue, {user?.name} 👋
              </h1>
              <p className="text-gray-400">
                {user?.club_name || 'Votre club'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Redesigned */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} type="stat" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Matchs analysés */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="w-7 h-7 text-black" />
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Ce mois</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                {completedMatches}
              </div>
              <div className="text-sm text-gray-400 font-medium">Matchs analysés</div>
            </div>
          </div>

          {/* En cours */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Actif</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {processingMatches}
              </div>
              <div className="text-sm text-gray-400 font-medium">En analyse</div>
            </div>
          </div>

          {/* Effectif */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <Link to="/dashboard/players" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  Gérer →
                </Link>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {totalPlayers}
              </div>
              <div className="text-sm text-gray-400 font-medium">Joueurs</div>
            </div>
          </div>

          {/* Quota */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Film className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Quota</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                {quota - completedMatches}
              </div>
              <div className="text-sm text-gray-400 font-medium mb-3">Matchs restants</div>
              <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedMatches / quota) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Matches - Enhanced */}
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Film className="w-5 h-5 text-black" />
                </div>
                <h2 className="text-2xl font-bold">Derniers matchs</h2>
              </div>
              <Link to="/dashboard/matches" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium group">
                Voir tout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="list" />
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Film className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="text-gray-400 mb-6">Aucun match analysé pour le moment</p>
                <Link 
                  to="/dashboard/matches"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
                >
                  <Film className="w-5 h-5" />
                  Uploader un match
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.slice(0, 3).map((match, index) => (
                  <Link
                    key={match.id}
                    to={`/dashboard/matches/${match.id}`}
                    className="flex items-center gap-4 p-4 bg-black/50 border border-white/10 rounded-xl hover:border-emerald-500/50 hover:bg-black/70 transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition-colors">
                          {match.category} - {match.opponent}
                        </h3>
                        {match.status === 'completed' && (
                          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-full">
                            ✓ Terminé
                          </span>
                        )}
                        {match.status === 'processing' && (
                          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-full animate-pulse">
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
                          <div className="text-lg font-bold text-emerald-400">{match.stats.possession}%</div>
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

                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Players - Enhanced */}
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Top joueurs du mois</h2>
              </div>
              <Link to="/dashboard/players" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium group">
                Voir tout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton type="list" />
            ) : topPlayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-purple-500" />
                </div>
                <p className="text-gray-400">Aucun joueur enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 p-4 bg-black/50 border border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-black/70 transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                      #{index + 1}
                    </div>

                    {player.photo_url ? (
                      <img 
                        src={player.photo_url} 
                        alt={player.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border-2 border-white/10">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-sm text-gray-400">{player.position}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {player.rating}
                      </div>
                      <div className="text-xs text-gray-500">{player.matches} matchs</div>
                    </div>

                    <div>
                      {player.trend === 'up' ? (
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-red-500 transform rotate-180" />
                        </div>
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
          {/* Notifications - Enhanced */}
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Alertes</h2>
            </div>
            <div className="space-y-3">
              {notifications.map((notif, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-black/50 border border-white/10 rounded-xl"
                >
                  {notif.type === 'success' && (
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                  )}
                  {notif.type === 'warning' && (
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                  )}
                  {notif.type === 'info' && (
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
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

          {/* Upcoming Matches - Enhanced */}
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-2xl font-bold">Prochains matchs</h2>
            </div>
            <div className="space-y-3">
              {upcomingMatches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-black/50 border border-white/10 rounded-xl hover:border-emerald-500/50 transition-all"
                >
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-500" />
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
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-full">
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
