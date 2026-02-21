import { useState, useEffect } from 'react'
import { Users, UserPlus, Calendar, Bell, MessageSquare, ChevronRight, TrendingUp } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import playerService from '../services/playerService'

function TeamManagement() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const data = await playerService.getPlayers()
      setPlayers(data)
    } catch (error) {
      console.error('Error loading players:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group players by category
  const playersByCategory = players.reduce((acc, player) => {
    const cat = player.category || 'Autres'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(player)
    return acc
  }, {})

  // Mock staff data
  const staff = [
    { id: '1', name: 'Jean Dupont', role: 'Entraîneur Principal', category: 'N3', photo: null },
    { id: '2', name: 'Marie Martin', role: 'Entraîneur Adjoint', category: 'N3', photo: null },
    { id: '3', name: 'Pierre Lefebvre', role: 'Préparateur Physique', category: 'Tous', photo: null },
    { id: '4', name: 'Sophie Bernard', role: 'Entraîneur U19', category: 'U19', photo: null }
  ]

  // Mock training schedule
  const trainingSchedule = [
    { day: 'Lundi', time: '18h00 - 20h00', category: 'N3', location: 'Terrain A' },
    { day: 'Mardi', time: '17h00 - 19h00', category: 'U19', location: 'Terrain B' },
    { day: 'Mercredi', time: '18h00 - 20h00', category: 'N3', location: 'Terrain A' },
    { day: 'Jeudi', time: '17h00 - 19h00', category: 'U19', location: 'Terrain B' },
    { day: 'Vendredi', time: '18h00 - 20h00', category: 'N3', location: 'Terrain A' }
  ]

  // Mock upcoming matches
  const upcomingMatches = [
    { date: '2026-02-22', category: 'N3', opponent: 'FC Marseille', players: 18 },
    { date: '2026-02-23', category: 'U19', opponent: 'AS Monaco', players: 16 }
  ]

  const getPositionStats = (categoryPlayers) => {
    const positions = categoryPlayers.reduce((acc, p) => {
      acc[p.position] = (acc[p.position] || 0) + 1
      return acc
    }, {})
    return positions
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion d'équipe</h1>
            <p className="text-gray-400">Vue d'ensemble et organisation du club</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-dark-border hover:border-primary hover:bg-primary/10 rounded-lg transition-all flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Convoquer
            </button>
            <button className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Ajouter staff
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{players.length}</div>
          <div className="text-sm text-gray-400">Joueurs totaux</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{Object.keys(playersByCategory).length}</div>
          <div className="text-sm text-gray-400">Catégories</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{staff.length}</div>
          <div className="text-sm text-gray-400">Staff technique</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{trainingSchedule.length}</div>
          <div className="text-sm text-gray-400">Entraînements / sem.</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories Overview */}
          <div>
            <h2 className="text-xl font-bold mb-4">Effectif par catégorie</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(playersByCategory).map(([category, categoryPlayers]) => {
                const positions = getPositionStats(categoryPlayers)
                const activeCount = categoryPlayers.filter(p => p.status === 'actif').length
                
                return (
                  <div
                    key={category}
                    className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-primary/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                        {category}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Total joueurs</span>
                        <span className="text-2xl font-bold text-white">{categoryPlayers.length}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Actifs</span>
                        <span className="text-sm font-semibold text-green-500">{activeCount}</span>
                      </div>

                      {/* Position breakdown */}
                      <div className="pt-3 border-t border-dark-border">
                        <div className="text-xs text-gray-500 mb-2">Répartition</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(positions).map(([pos, count]) => (
                            <span
                              key={pos}
                              className="px-2 py-1 bg-dark-border text-xs rounded"
                            >
                              {pos}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Training Schedule */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Planning des entraînements</h2>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                Modifier
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {trainingSchedule.map((training, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-black/50 border border-dark-border rounded-lg hover:border-primary/30 transition-all"
                >
                  <div className="w-20 flex-shrink-0">
                    <div className="text-sm font-semibold">{training.day}</div>
                    <div className="text-xs text-gray-500">{training.time}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{training.category}</div>
                    <div className="text-sm text-gray-400">{training.location}</div>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Prochaines convocations</h2>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                Créer convocation
                <Bell className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingMatches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-black/50 border border-dark-border rounded-lg hover:border-primary/30 transition-all group cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                      <div className="text-xs text-primary font-medium">
                        {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold mb-1">{match.opponent}</div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{match.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {match.players} joueurs
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Staff */}
        <div className="space-y-6">
          {/* Staff List */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Staff technique</h2>

            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-black/50 border border-dark-border rounded-lg hover:border-primary/30 transition-all"
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-dark-border rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{member.name}</div>
                    <div className="text-sm text-gray-400">{member.role}</div>
                    <div className="text-xs text-gray-500 mt-1">{member.category}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-2 border border-dark-border hover:border-primary hover:bg-primary/10 rounded-lg transition-all text-sm flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Ajouter un membre
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-lg transition-all text-sm font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Créer convocation
              </button>
              <button className="w-full px-4 py-3 bg-dark-border hover:bg-dark-border/70 rounded-lg transition-all text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message groupe
              </button>
              <button className="w-full px-4 py-3 bg-dark-border hover:bg-dark-border/70 rounded-lg transition-all text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Planifier entraînement
              </button>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Performance globale</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Taux de présence</span>
                <span className="text-lg font-bold text-green-500">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Matchs gagnés</span>
                <span className="text-lg font-bold text-primary">75%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Joueurs blessés</span>
                <span className="text-lg font-bold text-red-500">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TeamManagement
