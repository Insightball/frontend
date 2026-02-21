import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Users, Target, Activity, Calendar, Download, Filter } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

function Statistics() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all') // all, month, week
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [matchesData, playersData] = await Promise.all([
        matchService.getMatches(),
        playerService.getPlayers()
      ])
      setMatches(matchesData.filter(m => m.status === 'completed'))
      setPlayers(playersData)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate global stats
  const totalMatches = matches.length
  const victories = matches.filter(m => m.stats?.possession > 50).length // Mock logic
  const winRate = totalMatches > 0 ? ((victories / totalMatches) * 100).toFixed(0) : 0
  const avgPossession = totalMatches > 0 
    ? (matches.reduce((sum, m) => sum + (m.stats?.possession || 0), 0) / totalMatches).toFixed(1)
    : 0
  const totalGoals = matches.reduce((sum, m) => sum + (m.stats?.shots || 0) / 6, 0).toFixed(0) // Mock

  // Evolution data for charts
  const evolutionData = matches.slice(-10).map((match, i) => ({
    name: `M${i + 1}`,
    possession: match.stats?.possession || 0,
    passes: match.stats?.passes || 0,
    shots: match.stats?.shots || 0
  }))

  // Top players mock data
  const topPlayers = players.slice(0, 5).map((p, i) => ({
    ...p,
    goals: 10 - i,
    assists: 8 - i,
    rating: (8.5 - i * 0.3).toFixed(1),
    matches: 15 - i
  }))

  // Radar chart data for team performance
  const radarData = [
    { category: 'Possession', value: parseInt(avgPossession), fullMark: 100 },
    { category: 'Passes', value: 85, fullMark: 100 },
    { category: 'Tirs', value: 75, fullMark: 100 },
    { category: 'Défense', value: 80, fullMark: 100 },
    { category: 'Intensité', value: 88, fullMark: 100 }
  ]

  // Monthly performance
  const monthlyData = [
    { month: 'Jan', victoires: 3, defaites: 1, nuls: 1 },
    { month: 'Fév', victoires: 4, defaites: 2, nuls: 0 },
    { month: 'Mar', victoires: 5, defaites: 1, nuls: 1 }
  ]

  const categories = ['all', 'N3', 'U19', 'U17', 'U15', 'Seniors']
  const periods = [
    { value: 'all', label: 'Toute la saison' },
    { value: 'month', label: '30 derniers jours' },
    { value: 'week', label: '7 derniers jours' }
  ]

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Statistiques</h1>
            <p className="text-gray-400">Analyse complète des performances</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-dark-border hover:border-primary hover:bg-primary/10 rounded-lg transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">Filtres :</span>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:border-primary focus:outline-none"
          >
            {periods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:border-primary focus:outline-none"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'Toutes catégories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalMatches}</div>
          <div className="text-sm text-gray-400">Matchs joués</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm text-green-500 font-medium">+12%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{winRate}%</div>
          <div className="text-sm text-gray-400">Taux de victoire</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-primary font-medium">+5%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{avgPossession}%</div>
          <div className="text-sm text-gray-400">Possession moy.</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalGoals}</div>
          <div className="text-sm text-gray-400">Buts marqués</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Evolution Chart */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Évolution des performances</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="possession" stroke="#5EEAD4" strokeWidth={2} name="Possession %" />
              <Line type="monotone" dataKey="shots" stroke="#F59E0B" strokeWidth={2} name="Tirs" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Team Performance Radar */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Performance globale</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="category" stroke="#9CA3AF" />
              <PolarRadiusAxis stroke="#9CA3AF" />
              <Radar name="Notre équipe" dataKey="value" stroke="#5EEAD4" fill="#5EEAD4" fillOpacity={0.3} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Results */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Résultats mensuels</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="victoires" fill="#10B981" name="Victoires" />
            <Bar dataKey="nuls" fill="#F59E0B" name="Nuls" />
            <Bar dataKey="defaites" fill="#EF4444" name="Défaites" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Players */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Meilleurs joueurs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joueur</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Matchs</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Buts</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Passes D.</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Note moy.</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((player, index) => (
                <tr key={player.id} className="border-b border-dark-border hover:bg-black/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {player.photo_url ? (
                        <img src={player.photo_url} alt={player.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-dark-border rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-gray-400">{player.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">{player.matches}</td>
                  <td className="py-4 px-4 text-center font-semibold">{player.goals}</td>
                  <td className="py-4 px-4 text-center font-semibold">{player.assists}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded font-bold">
                      {player.rating}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {index % 2 === 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Statistics
