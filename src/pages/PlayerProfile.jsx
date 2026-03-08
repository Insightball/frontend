import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, User, Shield, Zap, Target, Calendar, Ruler, Scale, Circle, Activity, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import DashboardLayout from '../components/DashboardLayout'
import PlayerForm from '../components/PlayerForm'
import playerService from '../services/playerService'
import { T, globalStyles } from '../theme'

const G = {
  bg: T.bg, card: T.surface, border: T.rule,
  text: T.ink, muted: T.muted, gold: T.gold, goldD: T.goldD,
  goldBg: T.goldBg, goldBdr: T.goldBdr,
  mono: T.mono, display: T.display,
  dark: '#0a0908', dark2: '#0f0e0c',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', orange: '#f59e0b', yellow: '#eab308',
}

const POS = {
  'Gardien':   { color: '#eab308', icon: Shield,  label: 'Gardien' },
  'Défenseur': { color: '#3b82f6', icon: Shield,  label: 'Défenseur' },
  'Milieu':    { color: '#22c55e', icon: Zap,     label: 'Milieu' },
  'Attaquant': { color: '#ef4444', icon: Target,  label: 'Attaquant' },
}

const FOOT = {
  'droit':      { label: 'Pied droit',   short: 'D', color: G.gold },
  'gauche':     { label: 'Pied gauche',  short: 'G', color: G.blue },
  'ambidextre': { label: 'Ambidextre',   short: 'A', color: G.green },
}

const STATUS = {
  'actif':    { label: 'Actif',    color: G.green },
  'blessé':   { label: 'Blessé',   color: G.red },
  'suspendu': { label: 'Suspendu', color: G.orange },
  'inactif':  { label: 'Inactif',  color: 'rgba(26,25,22,0.35)' },
}

// Métriques par poste pour les courbes de progression
const POSITION_METRICS = {
  'Gardien': [
    { key: 'saves', label: 'Arrêts', color: G.yellow, unit: '' },
    { key: 'minutes', label: 'Minutes', color: G.blue, unit: "'" },
    { key: 'rating', label: 'Note', color: G.gold, unit: '/10' },
  ],
  'Défenseur': [
    { key: 'duels_won_pct', label: 'Duels gagnés', color: G.blue, unit: '%' },
    { key: 'interceptions', label: 'Interceptions', color: G.green, unit: '' },
    { key: 'distance_km', label: 'Distance', color: G.gold, unit: 'km' },
  ],
  'Milieu': [
    { key: 'pass_success', label: 'Passes réussies', color: G.green, unit: '%' },
    { key: 'key_passes', label: 'Passes clés', color: G.gold, unit: '' },
    { key: 'distance_km', label: 'Distance', color: G.blue, unit: 'km' },
  ],
  'Attaquant': [
    { key: 'goals', label: 'Buts', color: G.red, unit: '' },
    { key: 'assists', label: 'Passes D.', color: G.blue, unit: '' },
    { key: 'shots_on_target', label: 'Tirs cadrés', color: G.gold, unit: '' },
  ],
}

function getMetricsForPosition(position) {
  return POSITION_METRICS[position] || POSITION_METRICS['Milieu']
}

function getAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Génère un résumé textuel automatique basé sur les données de progression
function generateProgressSummary(history, metrics, position) {
  if (!history || history.length < 3) return null

  const summaries = []
  const recent = history.slice(0, 5)
  const older = history.slice(5)

  metrics.forEach(({ key, label, unit }) => {
    const recentVals = recent.map(m => m[key]).filter(v => v != null && v > 0)
    const olderVals = older.map(m => m[key]).filter(v => v != null && v > 0)

    if (recentVals.length < 2) return

    const recentAvg = recentVals.reduce((a, b) => a + b, 0) / recentVals.length
    const olderAvg = olderVals.length > 0
      ? olderVals.reduce((a, b) => a + b, 0) / olderVals.length
      : null

    if (olderAvg !== null && olderAvg > 0) {
      const delta = ((recentAvg - olderAvg) / olderAvg) * 100
      if (delta >= 10) {
        summaries.push({ type: 'up', text: `En progression sur ${label.toLowerCase()} (+${Math.round(delta)}% sur les 5 derniers matchs).` })
      } else if (delta <= -10) {
        summaries.push({ type: 'down', text: `Baisse observée sur ${label.toLowerCase()} (−${Math.round(Math.abs(delta))}% sur les 5 derniers matchs).` })
      }
    }

    // Constance
    if (recentVals.length >= 4) {
      const max = Math.max(...recentVals)
      const min = Math.min(...recentVals)
      const variance = max - min
      if (variance <= recentAvg * 0.15) {
        summaries.push({ type: 'stable', text: `Régularité notable sur ${label.toLowerCase()} — performances stables.` })
      }
    }
  })

  return summaries.slice(0, 2)
}

/* ── Tooltip custom pour Recharts ── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: G.dark2, border: `1px solid rgba(201,162,39,0.2)`,
      padding: '10px 14px', fontFamily: G.mono,
    }}>
      <div style={{ fontSize: 8, letterSpacing: '.12em', color: G.muted, marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 11, color: p.color, marginBottom: 2 }}>
          {p.name} : <strong style={{ color: '#f5f2eb' }}>{p.value != null ? p.value : '—'}{p.unit || ''}</strong>
        </div>
      ))}
    </div>
  )
}

/* ── Stat mini-card ── */
function StatBox({ value, label, sub, color, big }) {
  return (
    <div style={{
      background: G.card, border: `1px solid ${G.border}`,
      borderTop: color ? `2px solid ${color}` : `1px solid ${G.border}`,
      padding: big ? '20px 18px' : '16px 14px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <span style={{ fontFamily: G.display, fontSize: big ? 38 : 28, lineHeight: 1, color: G.text, letterSpacing: '.01em' }}>
        {value ?? '—'}
      </span>
      <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>
        {label}
      </span>
      {sub && <span style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(26,25,22,0.30)', marginTop: 2 }}>{sub}</span>}
    </div>
  )
}

/* ── Info row ── */
function InfoRow({ icon: Icon, label, value, color }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${G.border}` }}>
      <div style={{ width: 32, height: 32, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} color={color || G.gold} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted }}>{label}</div>
        <div style={{ fontFamily: G.display, fontSize: 16, color: G.text, letterSpacing: '.02em', textTransform: 'uppercase' }}>{value}</div>
      </div>
    </div>
  )
}

/* ── Bar chart simple ── */
function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: G.muted }}>{label}</span>
        <span style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 600, color: G.text }}>{value}</span>
      </div>
      <div style={{ height: 4, background: G.border, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color || G.gold, transition: 'width .8s ease' }} />
      </div>
    </div>
  )
}

/* ── Onglet Progression ── */
function ProgressionTab({ stats, player, isMobile }) {
  const [range, setRange] = useState('all')
  const [activeMetric, setActiveMetric] = useState(0)

  const allHistory = (stats?.all?.match_history || [])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const filteredHistory = range === '5' ? allHistory.slice(-5)
    : range === '10' ? allHistory.slice(-10)
    : allHistory

  const metrics = getMetricsForPosition(player.position)
  const summary = generateProgressSummary([...allHistory].reverse(), metrics, player.position)

  // Prépare les données pour Recharts
  const chartData = filteredHistory.map(m => {
    const label = m.opponent
      ? (m.date ? `${new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · ${m.opponent}` : m.opponent)
      : m.date ? new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '?'
    const point = { label }
    metrics.forEach(({ key }) => {
      point[key] = m[key] != null ? m[key] : null
    })
    return point
  })

  if (allHistory.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', background: G.card, border: `1px solid ${G.border}` }}>
        <TrendingUp size={32} color='rgba(26,25,22,0.12)' style={{ marginBottom: 14 }} />
        <h3 style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: G.muted, marginBottom: 8, letterSpacing: '.02em' }}>
          Progression à venir
        </h3>
        <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.06em', color: 'rgba(26,25,22,0.30)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>
          Les courbes d'évolution apparaîtront après les premiers matchs analysés.
        </p>
      </div>
    )
  }

  if (allHistory.length < 3) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', background: G.card, border: `1px solid ${G.border}` }}>
        <TrendingUp size={28} color={G.gold} style={{ marginBottom: 12 }} />
        <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.06em', color: G.muted, lineHeight: 1.7 }}>
          {allHistory.length} match{allHistory.length > 1 ? 's' : ''} analysé{allHistory.length > 1 ? 's' : ''}.<br />
          Les courbes de progression s'afficheront à partir de 3 matchs.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* En-tête + sélecteur de période */}
      <div style={{
        background: G.card, border: `1px solid ${G.border}`,
        borderTop: `2px solid ${G.gold}`,
        padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 1, background: G.gold }} />Courbes de progression — {player.position}
          </div>
          {/* Sélecteur période */}
          <div style={{ display: 'flex', gap: 0, border: `1px solid ${G.border}` }}>
            {[
              { id: 'all', label: 'Saison' },
              { id: '10', label: '10 matchs' },
              { id: '5', label: '5 matchs' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setRange(opt.id)} style={{
                padding: '6px 14px', fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
                background: range === opt.id ? G.gold : 'transparent',
                color: range === opt.id ? '#0f0f0d' : G.muted,
                border: 'none', borderRight: opt.id !== '5' ? `1px solid ${G.border}` : 'none',
                cursor: 'pointer', transition: 'all .15s',
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sélecteur de métrique (tabs) */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${G.border}` }}>
          {metrics.map((m, i) => (
            <button key={m.key} onClick={() => setActiveMetric(i)} style={{
              padding: '8px 16px', fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
              background: 'transparent', border: 'none',
              borderBottom: activeMetric === i ? `2px solid ${m.color}` : '2px solid transparent',
              color: activeMetric === i ? m.color : G.muted,
              cursor: 'pointer', transition: 'all .15s',
            }}>
              {m.label}
            </button>
          ))}
          {/* Toutes les métriques */}
          <button onClick={() => setActiveMetric(-1)} style={{
            padding: '8px 16px', fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
            background: 'transparent', border: 'none',
            borderBottom: activeMetric === -1 ? `2px solid ${G.muted}` : '2px solid transparent',
            color: activeMetric === -1 ? G.text : G.muted,
            cursor: 'pointer', transition: 'all .15s',
          }}>
            Tout
          </button>
        </div>

        {/* Graphe Recharts */}
        <div style={{ height: isMobile ? 200 : 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="label"
                tick={{ fontFamily: G.mono, fontSize: 7, fill: 'rgba(26,25,22,0.35)', letterSpacing: '.06em' }}
                tickLine={false}
                axisLine={{ stroke: G.border }}
                interval={isMobile ? 'preserveStartEnd' : 0}
                angle={isMobile ? -30 : -20}
                textAnchor="end"
                height={isMobile ? 40 : 36}
              />
              <YAxis
                tick={{ fontFamily: G.mono, fontSize: 7, fill: 'rgba(26,25,22,0.35)' }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} />
              {(activeMetric === -1 ? metrics : [metrics[activeMetric]]).map((m, i) => (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={activeMetric === -1 ? 1.5 : 2.5}
                  dot={{ fill: m.color, r: activeMetric === -1 ? 2 : 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: m.color }}
                  connectNulls={false}
                  unit={m.unit}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Légende */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {metrics.map((m, i) => (
            <div key={m.key} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: activeMetric === -1 || activeMetric === i ? 1 : 0.3,
              cursor: 'pointer', transition: 'opacity .15s',
            }} onClick={() => setActiveMetric(activeMetric === i ? -1 : i)}>
              <div style={{ width: 20, height: 2, background: m.color }} />
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.08em', color: G.muted, textTransform: 'uppercase' }}>
                {m.label}{m.unit ? ` (${m.unit})` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé textuel automatique */}
      {summary && summary.length > 0 && (
        <div style={{ background: G.card, border: `1px solid ${G.border}`, padding: '20px 24px' }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 1, background: G.gold }} />Analyse automatique
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {summary.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px',
                background: s.type === 'up' ? `${G.green}08` : s.type === 'down' ? `${G.red}08` : G.goldBg,
                border: `1px solid ${s.type === 'up' ? G.green + '25' : s.type === 'down' ? G.red + '25' : G.goldBdr}`,
                borderLeft: `3px solid ${s.type === 'up' ? G.green : s.type === 'down' ? G.red : G.gold}`,
              }}>
                <span style={{ fontSize: 14, lineHeight: 1, marginTop: 1 }}>
                  {s.type === 'up' ? '↑' : s.type === 'down' ? '↓' : '→'}
                </span>
                <span style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.04em', color: G.text, lineHeight: 1.6 }}>
                  {s.text}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(26,25,22,0.25)', letterSpacing: '.06em', marginTop: 12, lineHeight: 1.5 }}>
            Analyse basée sur {allHistory.length} match{allHistory.length > 1 ? 's' : ''} · Métriques adaptées au poste {player.position}
          </p>
        </div>
      )}

      {/* Mini stats de synthèse */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8 }}>
        <StatBox value={allHistory.length} label="Matchs analysés" color={G.gold} />
        <StatBox
          value={allHistory.filter(m => m.goals > 0).length}
          label="Matchs avec but"
          color={G.red}
        />
        <StatBox
          value={allHistory.length > 0 ? Math.round(allHistory.reduce((s, m) => s + (m.minutes || 0), 0) / allHistory.length) : '—'}
          label="Min. moy / match"
          color={G.blue}
        />
        <StatBox
          value={(() => {
            const rated = allHistory.filter(m => m.rating != null)
            if (!rated.length) return '—'
            return (rated.reduce((s, m) => s + m.rating, 0) / rated.length).toFixed(1)
          })()}
          label="Note moyenne"
          color={G.green}
        />
      </div>
    </div>
  )
}

export default function PlayerProfile() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('stats') // 'stats' | 'progression'
  const [statsView, setStatsView] = useState('official')
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { loadPlayer() }, [playerId])

  const loadPlayer = async () => {
    try {
      setLoading(true)
      const [data, statsData] = await Promise.all([
        playerService.getPlayer(playerId),
        playerService.getPlayerStats(playerId).catch(() => null),
      ])
      setPlayer(data)
      setStats(statsData)
    } catch (e) {
      setError('Joueur introuvable')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (data) => {
    await playerService.updatePlayer(playerId, data)
    await loadPlayer()
    setIsFormOpen(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <div style={{ width: 28, height: 28, border: `2px solid ${G.goldBdr}`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>Chargement...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </DashboardLayout>
    )
  }

  if (error || !player) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <AlertCircle size={32} color={G.red} style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: G.display, fontSize: 28, color: G.text, textTransform: 'uppercase', marginBottom: 8 }}>{error || 'Joueur introuvable'}</h2>
          <button onClick={() => navigate('/dashboard/players')} style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, background: 'none', border: `1px solid ${G.goldBdr}`, padding: '10px 20px', cursor: 'pointer', marginTop: 12 }}>
            ← Retour à l'effectif
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const pos = POS[player.position] || POS['Milieu']
  const foot = FOOT[player.preferred_foot]
  const status = STATUS[player.status] || STATUS['actif']
  const age = getAge(player.birth_date)

  const currentStats = stats?.[statsView] || stats?.all || null

  const matchStats = {
    played: currentStats?.matches_played ?? 0,
    starter: currentStats?.matches_starter ?? 0,
    sub: currentStats?.matches_sub ?? 0,
    minutes: currentStats?.total_minutes ?? 0,
    goals: currentStats?.goals ?? 0,
    assists: currentStats?.assists ?? 0,
  }

  const techStats = {
    passes: currentStats?.total_passes ?? null,
    passSuccess: currentStats?.avg_pass_success ?? null,
    shots: currentStats?.total_shots ?? null,
    shotsOnTarget: currentStats?.shots_on_target ?? null,
    duels: currentStats?.total_duels ?? null,
    duelsWon: currentStats?.duels_won ?? null,
    distance: currentStats?.total_distance_km ?? null,
    avgDistance: currentStats?.avg_distance_km ?? null,
    keyPasses: currentStats?.total_key_passes ?? null,
    tackles: currentStats?.total_tackles ?? null,
    interceptions: currentStats?.total_interceptions ?? null,
    saves: currentStats?.total_saves ?? null,
    yellowCards: currentStats?.yellow_cards ?? null,
  }

  const matchHistory = currentStats?.match_history ?? []

  const hasTechStats = Object.values(techStats).some(v => v !== null && v > 0)
  const hasMatchStats = matchStats.played > 0

  const officialCount = stats?.official?.matches_played ?? 0
  const friendlyCount = stats?.friendly?.matches_played ?? 0
  const prepaCount = stats?.preparation?.matches_played ?? 0
  const allCount = stats?.all?.matches_played ?? 0

  const STATS_TABS = [
    { id: 'official', label: 'Officiels', count: officialCount, color: G.gold },
    { id: 'friendly', label: 'Amicaux', count: friendlyCount, color: G.blue },
    { id: 'preparation', label: 'Prépa', count: prepaCount, color: G.green },
    { id: 'all', label: 'Tout', count: allCount, color: G.muted },
  ].filter(t => t.count > 0 || t.id === 'official')

  return (
    <DashboardLayout>
      <style>{`
        ${globalStyles}
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* ── BACK BUTTON ── */}
      <button onClick={() => navigate('/dashboard/players')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
        color: G.muted, background: 'none', border: 'none', cursor: 'pointer',
        padding: '0 0 20px', transition: 'color .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = G.gold}
        onMouseLeave={e => e.currentTarget.style.color = G.muted}
      >
        <ArrowLeft size={14} /> Retour à l'effectif
      </button>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: G.card, border: `1px solid ${G.border}`, borderTop: `3px solid ${pos.color}`,
        padding: isMobile ? '24px 20px' : '32px 32px',
        marginBottom: 20, animation: 'fadeIn .4s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 28, alignItems: isMobile ? 'center' : 'flex-start' }}>

          {/* Photo + numéro */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} style={{
                width: isMobile ? 100 : 120, height: isMobile ? 100 : 120,
                objectFit: 'cover', display: 'block', border: `2px solid ${G.border}`,
              }} />
            ) : (
              <div style={{
                width: isMobile ? 100 : 120, height: isMobile ? 100 : 120,
                background: G.goldBg, border: `2px solid ${G.goldBdr}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={isMobile ? 40 : 48} color='rgba(201,162,39,0.3)' />
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: -8, right: -8,
              width: 36, height: 36, background: G.gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: G.display, fontSize: 18, color: '#0f0f0d', fontWeight: 900,
            }}>
              {player.number}
            </div>
            {player.status && player.status !== 'actif' && (
              <div style={{
                position: 'absolute', top: -4, left: -4,
                padding: '3px 8px', background: status.color + '15', border: `1px solid ${status.color}40`,
                fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: status.color,
              }}>
                {status.label}
              </div>
            )}
          </div>

          {/* Info principale */}
          <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
              Fiche joueur
            </div>
            <h1 style={{
              fontFamily: G.display, fontSize: isMobile ? 32 : 48,
              textTransform: 'uppercase', lineHeight: .9, letterSpacing: '.01em',
              color: G.text, margin: '0 0 12px',
            }}>
              {player.name}
            </h1>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <span style={{
                fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
                padding: '5px 14px', background: pos.color + '12', border: `1px solid ${pos.color}30`, color: pos.color,
              }}>
                {player.position}
              </span>
              <span style={{
                fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
                padding: '5px 14px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold,
              }}>
                {player.category}
              </span>
              {foot && (
                <span style={{
                  fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
                  padding: '5px 14px', background: foot.color + '10', border: `1px solid ${foot.color}25`, color: foot.color,
                }}>
                  {foot.label}
                </span>
              )}
              {player.status === 'actif' && (
                <span style={{
                  fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
                  padding: '5px 14px', background: G.green + '10', border: `1px solid ${G.green}25`, color: G.green,
                }}>
                  Actif
                </span>
              )}
            </div>

            {/* Quick stats row */}
            <div style={{ display: 'flex', gap: isMobile ? 20 : 28, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              {age && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontFamily: G.display, fontSize: 26, color: G.text, lineHeight: 1 }}>{age}</span>
                  <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', color: G.muted, textTransform: 'uppercase' }}>ans</span>
                </div>
              )}
              {player.height && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontFamily: G.display, fontSize: 26, color: G.text, lineHeight: 1 }}>{player.height}</span>
                  <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', color: G.muted, textTransform: 'uppercase' }}>cm</span>
                </div>
              )}
              {player.weight && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontFamily: G.display, fontSize: 26, color: G.text, lineHeight: 1 }}>{player.weight}</span>
                  <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', color: G.muted, textTransform: 'uppercase' }}>kg</span>
                </div>
              )}
              {(age || player.height || player.weight) && <div style={{ width: 1, height: 28, background: G.border, alignSelf: 'center' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontFamily: G.display, fontSize: 26, color: hasMatchStats ? G.gold : G.muted, lineHeight: 1 }}>{matchStats.played}</span>
                <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', color: G.muted, textTransform: 'uppercase' }}>matchs</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button onClick={() => setIsFormOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'transparent', border: `1px solid ${G.goldBdr}`,
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            color: G.gold, cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
            alignSelf: isMobile ? 'center' : 'flex-start',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = G.goldBg; e.currentTarget.style.borderColor = G.gold }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = G.goldBdr }}
          >
            <Edit2 size={12} /> Modifier
          </button>
        </div>
      </div>

      {/* ── TABS PRINCIPAUX : Stats / Progression ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `2px solid ${G.border}`, animation: 'fadeIn .4s ease .05s both' }}>
        {[
          { id: 'stats', label: 'Statistiques' },
          { id: 'progression', label: 'Progression', badge: allCount > 0 ? `${allCount}` : null },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: isMobile ? '10px 16px' : '12px 24px',
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            background: 'transparent', border: 'none',
            borderBottom: activeTab === tab.id ? `2px solid ${G.gold}` : '2px solid transparent',
            marginBottom: -2,
            color: activeTab === tab.id ? G.gold : G.muted,
            cursor: 'pointer', transition: 'all .15s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {tab.label}
            {tab.badge && (
              <span style={{
                fontFamily: G.mono, fontSize: 8, padding: '1px 7px',
                background: activeTab === tab.id ? G.gold + '18' : 'transparent',
                color: activeTab === tab.id ? G.gold : G.muted,
                border: `1px solid ${activeTab === tab.id ? G.goldBdr : G.border}`,
              }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ TAB : STATISTIQUES ══ */}
      {activeTab === 'stats' && (
        <>
          {/* Sous-tabs type de match */}
          {allCount > 0 && (
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${G.border}`, overflowX: 'auto', animation: 'fadeIn .4s ease .05s both' }}>
              {STATS_TABS.map(tab => (
                <button key={tab.id} onClick={() => setStatsView(tab.id)} style={{
                  padding: '10px 18px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
                  background: 'transparent', border: 'none',
                  borderBottom: statsView === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                  color: statsView === tab.id ? tab.color : G.muted,
                  cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {tab.label}
                  <span style={{
                    fontFamily: G.mono, fontSize: 8, padding: '1px 6px',
                    background: statsView === tab.id ? tab.color + '18' : 'transparent',
                    color: statsView === tab.id ? tab.color : G.muted,
                    borderRadius: 2,
                  }}>{tab.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── CONTENT GRID ── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 28 }}>

            {/* ── INFOS PERSONNELLES ── */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, padding: '24px', animation: 'fadeIn .4s ease .1s both' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 1, background: G.gold }} />Informations
              </div>
              <InfoRow icon={User} label="Nom complet" value={player.name} />
              <InfoRow icon={Calendar} label="Date de naissance" value={player.birth_date ? `${formatDate(player.birth_date)} (${age} ans)` : null} />
              <InfoRow icon={Ruler} label="Taille" value={player.height ? `${player.height} cm` : null} />
              <InfoRow icon={Scale} label="Poids" value={player.weight ? `${player.weight} kg` : null} />
              <InfoRow icon={Circle} label="Pied fort" value={foot?.label} color={foot?.color} />
              <InfoRow icon={Activity} label="Statut" value={status.label} color={status.color} />
              <InfoRow icon={Shield} label="Catégorie" value={player.category} />
              <div style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(26,25,22,0.30)', marginTop: 16, letterSpacing: '.06em' }}>
                Ajouté le {formatDate(player.created_at)}
              </div>
            </div>

            {/* ── STATS MATCHS ── */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, padding: '24px', animation: 'fadeIn .4s ease .2s both' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 1, background: G.gold }} />Statistiques matchs
              </div>
              {hasMatchStats ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                    <StatBox value={matchStats.played} label="Matchs joués" color={G.gold} />
                    <StatBox value={matchStats.goals} label="Buts" color={G.red} />
                    <StatBox value={matchStats.assists} label="Passes D." color={G.blue} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
                    <StatBox value={matchStats.starter} label="Titulaire" />
                    <StatBox value={matchStats.sub} label="Remplaçant" />
                  </div>
                  {matchStats.minutes > 0 && (
                    <div style={{ background: G.goldBg, border: `1px solid ${G.goldBdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>Minutes jouées</span>
                      <span style={{ fontFamily: G.display, fontSize: 28, color: G.gold }}>{matchStats.minutes}'</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <Clock size={28} color='rgba(26,25,22,0.20)' style={{ marginBottom: 12 }} />
                  <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: G.muted, lineHeight: 1.7 }}>
                    Les statistiques apparaîtront<br />après le premier match analysé.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── STATS TECHNIQUES ── */}
          {hasTechStats && (
            <div style={{ background: G.card, border: `1px solid ${G.border}`, padding: '24px', marginBottom: 20, animation: 'fadeIn .4s ease .3s both' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 1, background: G.gold }} />Performance technique
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                {techStats.keyPasses > 0 && <StatBox value={techStats.keyPasses} label="Passes clés" color={G.gold} />}
                {techStats.tackles > 0 && <StatBox value={techStats.tackles} label="Tacles" color={G.blue} />}
                {techStats.interceptions > 0 && <StatBox value={techStats.interceptions} label="Interceptions" color={G.green} />}
                {techStats.saves > 0 && <StatBox value={techStats.saves} label="Arrêts" color={G.orange} />}
                {techStats.yellowCards > 0 && <StatBox value={techStats.yellowCards} label="Cartons J." color={G.yellow} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28 }}>
                <div>
                  {techStats.passes !== null && techStats.passes > 0 && (
                    <ProgressBar label="Passes totales" value={techStats.passes} max={techStats.passes} color={G.gold} />
                  )}
                  {techStats.passSuccess !== null && (
                    <ProgressBar label="% Passes réussies (moy.)" value={techStats.passSuccess} max={100} color={G.green} />
                  )}
                  {techStats.avgDistance !== null && (
                    <ProgressBar label={`Distance moy. / match (${techStats.avgDistance} km)`} value={techStats.avgDistance} max={14} color={G.blue} />
                  )}
                </div>
                <div>
                  {techStats.shots !== null && techStats.shots > 0 && (
                    <ProgressBar label="Tirs totaux" value={techStats.shots} max={techStats.shots} color={G.red} />
                  )}
                  {techStats.shotsOnTarget !== null && techStats.shots > 0 && (
                    <ProgressBar label={`Tirs cadrés (${techStats.shotsOnTarget}/${techStats.shots})`} value={techStats.shotsOnTarget} max={techStats.shots} color={G.orange} />
                  )}
                  {techStats.duelsWon !== null && techStats.duels > 0 && (
                    <ProgressBar label={`Duels gagnés (${techStats.duelsWon}/${techStats.duels})`} value={techStats.duelsWon} max={techStats.duels} color={G.gold} />
                  )}
                </div>
              </div>
              {techStats.distance > 0 && (
                <div style={{ background: G.goldBg, border: `1px solid ${G.goldBdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>Distance totale parcourue</span>
                  <span style={{ fontFamily: G.display, fontSize: 28, color: G.gold }}>{techStats.distance} km</span>
                </div>
              )}
            </div>
          )}

          {/* ── HISTORIQUE MATCHS ── */}
          {matchHistory.length > 0 && (
            <div style={{ background: G.card, border: `1px solid ${G.border}`, padding: '24px', marginBottom: 20, animation: 'fadeIn .4s ease .4s both' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 1, background: G.gold }} />Historique matchs
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
                {matchHistory.map((m, i) => {
                  const isWin = m.is_home ? (m.score_home > m.score_away) : (m.score_away > m.score_home)
                  const isDraw = m.score_home === m.score_away
                  const resultColor = isWin ? G.green : isDraw ? G.orange : G.red
                  const resultLabel = isWin ? 'V' : isDraw ? 'N' : 'D'
                  const score = m.is_home ? `${m.score_home} - ${m.score_away}` : `${m.score_away} - ${m.score_home}`
                  const dateStr = m.date ? new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''
                  return (
                    <div key={m.match_id} style={{
                      background: G.card, padding: isMobile ? '12px' : '12px 16px',
                      display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16,
                      cursor: 'pointer', transition: 'background .1s',
                    }}
                      onClick={() => navigate(`/dashboard/matches/${m.match_id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
                      onMouseLeave={e => e.currentTarget.style.background = G.card}
                    >
                      <div style={{
                        width: 28, height: 28, background: resultColor + '15', border: `1px solid ${resultColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        fontFamily: G.mono, fontSize: 11, fontWeight: 700, color: resultColor,
                      }}>{resultLabel}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: G.display, fontSize: 14, color: G.text, textTransform: 'uppercase', letterSpacing: '.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.is_home ? 'vs' : '@'} {m.opponent}
                        </div>
                        <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted, letterSpacing: '.08em' }}>
                          {dateStr} {m.competition ? `· ${m.competition}` : ''}
                        </div>
                      </div>
                      <div style={{ fontFamily: G.display, fontSize: 18, color: G.text, flexShrink: 0 }}>{score}</div>
                      <div style={{ display: 'flex', gap: isMobile ? 6 : 12, alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: G.display, fontSize: 14, color: G.text }}>{m.minutes}'</div>
                          <div style={{ fontFamily: G.mono, fontSize: 7, color: G.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>min</div>
                        </div>
                        {m.goals > 0 && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: G.display, fontSize: 14, color: G.gold }}>{m.goals}</div>
                            <div style={{ fontFamily: G.mono, fontSize: 7, color: G.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>but{m.goals > 1 ? 's' : ''}</div>
                          </div>
                        )}
                        {m.assists > 0 && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: G.display, fontSize: 14, color: G.blue }}>{m.assists}</div>
                            <div style={{ fontFamily: G.mono, fontSize: 7, color: G.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>pd</div>
                          </div>
                        )}
                        <span style={{
                          fontFamily: G.mono, fontSize: 7, letterSpacing: '.08em', textTransform: 'uppercase',
                          padding: '2px 6px', background: m.starter ? G.green + '12' : 'rgba(26,25,22,0.05)',
                          border: `1px solid ${m.starter ? G.green + '30' : G.border}`,
                          color: m.starter ? G.green : G.muted,
                        }}>
                          {m.starter ? 'TIT' : 'RMP'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Placeholder si pas de matchs */}
          {!hasMatchStats && (
            <div style={{
              background: G.card, border: `1px dashed ${G.border}`,
              padding: '48px 24px', textAlign: 'center', marginBottom: 28,
              animation: 'fadeIn .4s ease .3s both',
            }}>
              <TrendingUp size={28} color='rgba(26,25,22,0.15)' style={{ marginBottom: 12 }} />
              <h3 style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: G.muted, marginBottom: 6, letterSpacing: '.02em' }}>
                Évolution & performance
              </h3>
              <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.06em', color: 'rgba(26,25,22,0.30)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>
                Les graphiques de progression, heatmaps individuelles et comparaisons seront disponibles après les premiers matchs analysés.
              </p>
            </div>
          )}
        </>
      )}

      {/* ══ TAB : PROGRESSION ══ */}
      {activeTab === 'progression' && (
        <div style={{ animation: 'fadeIn .4s ease' }}>
          <ProgressionTab stats={stats} player={player} isMobile={isMobile} />
        </div>
      )}

      {/* ── EDIT FORM MODAL ── */}
      <PlayerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleEdit}
        player={player}
      />
    </DashboardLayout>
  )
}
