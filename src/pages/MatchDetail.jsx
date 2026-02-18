import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PlayerStatsCard from '../components/PlayerStatsCard'
import HeatmapPlayer from '../components/HeatmapPlayer'
import MatchTimeline from '../components/MatchTimeline'

function MatchDetail() {
  const { matchId } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - sera remplacé par vraies données API
  const match = {
    id: matchId,
    opponent: 'FC Lyon',
    date: '2026-02-10',
    category: 'N3',
    score_home: 3,
    score_away: 1,
    is_home: true,
    status: 'completed',
    stats: {
      possession: 58,
      passes: 482,
      shots: 18,
      shotsOnTarget: 9,
      corners: 6,
      fouls: 12
    },
    player_stats: [
      {
        player: { id: '1', name: 'Kylian Mbappé', number: 10, position: 'Attaquant', photo_url: null },
        rating: 8.5,
        passes: 45,
        distance: 10.2,
        duels: 12,
        trend: 1
      }
    ],
    events: [
      { time: 15, type: 'goal', player: 'Mbappé', description: 'But suite à un centre', half: 1 },
      { time: 34, type: 'card_yellow', player: 'Dupont', description: 'Carton jaune pour faute', half: 1 },
      { time: 67, type: 'substitution', player: 'Martin → Lefebvre', description: 'Changement tactique', half: 2 }
    ],
    heatmap_data: [
      { x: 70, y: 30, intensity: 0.9 },
      { x: 75, y: 35, intensity: 0.8 },
      { x: 65, y: 25, intensity: 0.7 }
    ]
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'players', label: 'Joueurs' },
    { id: 'phases', label: 'Phases de jeu' },
    { id: 'comparison', label: 'Comparaison' },
    { id: 'video', label: 'Vidéo' },
    { id: 'report', label: 'Rapport PDF' }
  ]

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux matchs
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {match.category} - {match.opponent}
            </h1>
            <p className="text-gray-400">
              {new Date(match.date).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-dark-border hover:border-primary hover:bg-primary/10 rounded-lg transition-all flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Partager
            </button>
            <button className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* Score */}
        <div className="mt-6 bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-400 mb-2">
                {match.is_home ? 'Nous' : match.opponent}
              </div>
              <div className="text-6xl font-bold text-white">{match.score_home}</div>
            </div>
            <div className="text-3xl font-bold text-gray-600">-</div>
            <div className="text-center">
              <div className="text-lg font-medium text-gray-400 mb-2">
                {match.is_home ? match.opponent : 'Nous'}
              </div>
              <div className="text-6xl font-bold text-white">{match.score_away}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex items-center gap-2 border-b border-dark-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Possession', value: `${match.stats.possession}%` },
                { label: 'Passes', value: match.stats.passes },
                { label: 'Tirs', value: match.stats.shots },
                { label: 'Tirs cadrés', value: match.stats.shotsOnTarget },
                { label: 'Corners', value: match.stats.corners },
                { label: 'Fautes', value: match.stats.fouls }
              ].map((stat, i) => (
                <div key={i} className="bg-dark-card border border-dark-border rounded-lg p-4">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <MatchTimeline events={match.events} />

            {/* Heatmap collective */}
            <HeatmapPlayer data={match.heatmap_data} playerName="Équipe" />
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Stats individuelles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {match.player_stats.map((playerStat, i) => (
                <PlayerStatsCard 
                  key={i}
                  player={playerStat.player}
                  stats={playerStat}
                  onClick={(player) => console.log('Player clicked:', player)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'phases' && (
          <div className="text-center py-16 bg-dark-card border border-dark-border rounded-lg">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Phases de jeu</h3>
            <p className="text-gray-500">Analyse détaillée des phases de jeu à venir</p>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="text-center py-16 bg-dark-card border border-dark-border rounded-lg">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Comparaison</h3>
            <p className="text-gray-500">Comparaison avec les matchs précédents à venir</p>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="text-center py-16 bg-dark-card border border-dark-border rounded-lg">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Vidéo</h3>
            <p className="text-gray-500">Player vidéo avec timeline synchronisée à venir</p>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="text-center py-16 bg-dark-card border border-dark-border rounded-lg">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Rapport PDF</h3>
            <p className="text-gray-500">Preview et téléchargement du rapport PDF à venir</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MatchDetail
