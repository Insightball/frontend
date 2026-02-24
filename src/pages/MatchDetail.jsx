import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PlayerStatsCard from '../components/PlayerStatsCard'
import HeatmapPlayer from '../components/HeatmapPlayer'
import MatchTimeline from '../components/MatchTimeline'

const G = {
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(15,15,13,0.09)', muted: 'rgba(15,15,13,0.42)',
}

function MatchDetail() {
  const { matchId } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const match = {
    id: matchId, opponent: 'FC Lyon', date: '2026-02-10',
    category: 'N3', score_home: 3, score_away: 1,
    is_home: true, status: 'completed',
    stats: { possession: 58, passes: 482, shots: 18, shotsOnTarget: 9, corners: 6, fouls: 12 },
    player_stats: [{
      player: { id: '1', name: 'Kylian Mbappé', number: 10, position: 'Attaquant', photo_url: null },
      rating: 8.5, passes: 45, distance: 10.2, duels: 12, trend: 1
    }],
    events: [
      { time: 15, type: 'goal', player: 'Mbappé', description: 'But suite à un centre', half: 1 },
      { time: 34, type: 'card_yellow', player: 'Dupont', description: 'Carton jaune pour faute', half: 1 },
      { time: 67, type: 'substitution', player: 'Martin → Lefebvre', description: 'Changement tactique', half: 2 }
    ],
    heatmap_data: [{ x: 70, y: 30, intensity: 0.9 }, { x: 75, y: 35, intensity: 0.8 }, { x: 65, y: 25, intensity: 0.7 }]
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'players', label: 'Joueurs' },
    { id: 'phases', label: 'Phases de jeu' },
    { id: 'comparison', label: 'Comparaison' },
    { id: 'video', label: 'Vidéo' },
    { id: 'report', label: 'Rapport PDF' },
  ]

  const resultColor = match.score_home > match.score_away ? '#22c55e' : match.score_home < match.score_away ? '#ef4444' : G.gold
  const resultLabel = match.score_home > match.score_away ? 'Victoire' : match.score_home < match.score_away ? 'Défaite' : 'Nul'

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => window.history.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 20, padding: 0, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = G.muted}
        >
          <ArrowLeft size={14} /> Retour aux matchs
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
              {match.category} · {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <h1 style={{ fontFamily: G.display, fontSize: 44, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#0f0f0d', margin: 0 }}>
              vs {match.opponent}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'transparent', border: `1px solid rgba(15,15,13,0.09)`, color: 'rgba(15,15,13,0.45)', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.goldBdr; e.currentTarget.style.color = G.gold }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted }}>
              <Share2 size={12} /> Partager
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: G.gold, color: '#0f0f0d', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#a8861f'}
              onMouseLeave={e => e.currentTarget.style.background = G.gold}>
              <Download size={12} /> PDF
            </button>
          </div>
        </div>

        {/* Score card */}
        <div style={{ marginTop: 24, background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, borderTop: `2px solid ${resultColor}`, padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 6 }}>
              {match.is_home ? 'Nous' : match.opponent}
            </div>
            <div style={{ fontFamily: G.display, fontSize: 72, lineHeight: 1, color: '#0f0f0d' }}>{match.score_home}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: G.display, fontSize: 28, color: 'rgba(245,242,235,.2)' }}>—</span>
            <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', padding: '4px 14px', background: resultColor + '12', color: resultColor, border: `1px solid ${resultColor}25` }}>{resultLabel}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 6 }}>
              {match.is_home ? match.opponent : 'Nous'}
            </div>
            <div style={{ fontFamily: G.display, fontSize: 72, lineHeight: 1, color: '#0f0f0d' }}>{match.score_away}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid rgba(15,15,13,0.09)`, marginBottom: 28, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '12px 20px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            background: 'transparent', border: 'none',
            borderBottom: activeTab === tab.id ? `2px solid ${G.gold}` : '2px solid transparent',
            color: activeTab === tab.id ? G.gold : G.muted,
            cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 1, background: G.border }}>
              {[
                { label: 'Possession',    value: `${match.stats.possession}%` },
                { label: 'Passes',        value: match.stats.passes },
                { label: 'Tirs',          value: match.stats.shots },
                { label: 'Tirs cadrés',   value: match.stats.shotsOnTarget },
                { label: 'Corners',       value: match.stats.corners },
                { label: 'Fautes',        value: match.stats.fouls },
              ].map((stat, i) => (
                <div key={i} style={{ background: '#ffffff', padding: '16px 14px' }}>
                  <div style={{ fontFamily: G.display, fontSize: 32, color: '#0f0f0d', lineHeight: 1, marginBottom: 6 }}>{stat.value}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <MatchTimeline events={match.events} />
            <HeatmapPlayer data={match.heatmap_data} playerName="Équipe" />
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            <h2 style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', marginBottom: 20 }}>Stats individuelles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {match.player_stats.map((ps, i) => <PlayerStatsCard key={i} player={ps.player} stats={ps} onClick={p => console.log(p)} />)}
            </div>
          </div>
        )}

        {['phases', 'comparison', 'video', 'report'].map(tabId => activeTab === tabId && (
          <div key={tabId} style={{ background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontFamily: G.mono, fontSize: 14, color: G.gold }}>⏳</span>
            </div>
            <h3 style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', letterSpacing: '.04em', color: '#0f0f0d', marginBottom: 8 }}>
              {tabs.find(t => t.id === tabId)?.label}
            </h3>
            <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: 'rgba(15,15,13,0.45)' }}>Disponible prochainement</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}

export default MatchDetail
