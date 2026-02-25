import { useState, useEffect } from 'react'
import { Download, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

const G = {
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.22)',
  mono: "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.10)',
  muted: 'rgba(245,242,235,0.62)',
  text: '#f5f2eb',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', orange: '#f59e0b',
}

const TT = {
  contentStyle: { backgroundColor: '#0f0f0d', border: `1px solid ${G.border}`, borderRadius: 0, fontFamily: G.mono, fontSize: 11 },
  labelStyle: { color: 'rgba(245,242,235,0.75)' },
  itemStyle: { color: G.text },
}

function Heatmap({ data }) {
  const W = 320, H = 200
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'hidden', display: 'block' }}>
      <rect width={W} height={H} fill="#080a05" />
      <rect x={8} y={8} width={W - 16} height={H - 16} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <line x1={W / 2} y1={8} x2={W / 2} y2={H - 8} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx={W / 2} cy={H / 2} r={28} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x={8} y={H / 2 - 32} width={46} height={64} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <rect x={W - 54} y={H / 2 - 32} width={46} height={64} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      {data.map((pt, i) => {
        const px = 8 + (pt.x / 100) * (W - 16)
        const py = 8 + (pt.y / 100) * (H - 16)
        return <circle key={i} cx={px} cy={py} r={20 + pt.intensity * 14} fill={`rgba(201,162,39,${0.1 + pt.intensity * 0.4})`} style={{ filter: `blur(${10 + pt.intensity * 8}px)` }} />
      })}
      {data.filter(pt => pt.intensity > 0.6).map((pt, i) => (
        <circle key={`d${i}`} cx={8 + (pt.x / 100) * (W - 16)} cy={8 + (pt.y / 100) * (H - 16)} r={3} fill={G.gold} fillOpacity={0.9} />
      ))}
    </svg>
  )
}

function EventHeatmap({ events }) {
  const W = 320, H = 200
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <rect width={W} height={H} fill="#080a05" />
      <g stroke="rgba(255,255,255,0.09)" strokeWidth="1" fill="none">
        <rect x={8} y={7} width={W - 16} height={H - 14} />
        <line x1={W / 2} y1={7} x2={W / 2} y2={H - 7} />
        <circle cx={W / 2} cy={H / 2} r={26} />
        <rect x={8} y={H / 2 - 30} width={44} height={60} />
        <rect x={W - 52} y={H / 2 - 30} width={44} height={60} />
      </g>
      {events.map((z, i) => {
        const cx = 8 + (z.x / 100) * (W - 16), cy = 7 + (z.y / 100) * (H - 14)
        const col = z.type === 'won' ? `rgba(34,197,94,${0.1 + z.i * 0.4})` : z.type === 'shot' ? `rgba(201,162,39,${0.12 + z.i * 0.4})` : `rgba(239,68,68,${0.1 + z.i * 0.4})`
        return <circle key={i} cx={cx} cy={cy} r={16 + z.i * 12} fill={col} style={{ filter: `blur(${6 + z.i * 4}px)` }} />
      })}
      {events.map((z, i) => {
        const cx = 8 + (z.x / 100) * (W - 16), cy = 7 + (z.y / 100) * (H - 14)
        const col = z.type === 'won' ? '#22c55e' : z.type === 'shot' ? G.gold : '#ef4444'
        return <circle key={`d${i}`} cx={cx} cy={cy} r={3.5} fill={col} fillOpacity={0.9} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
      })}
    </svg>
  )
}

function CompareView({ players, getStats }) {
  const [p1idx, setP1idx] = useState(0)
  const [p2idx, setP2idx] = useState(Math.min(1, players.length - 1))
  const p1 = players[p1idx], p2 = players[p2idx]
  if (!p1 || !p2) return null
  const s1 = getStats(p1, p1idx), s2 = getStats(p2, p2idx)
  const C1 = G.gold, C2 = '#ef4444'
  const metrics = [
    { label: 'Buts', v1: s1.goals, v2: s2.goals, max: 10 },
    { label: 'Passes D.', v1: s1.assists, v2: s2.assists, max: 8 },
    { label: 'Tirs', v1: s1.shots, v2: s2.shots, max: 12 },
    { label: 'Ballons gagnés', v1: s1.ballsWon, v2: s2.ballsWon, max: 15 },
    { label: 'Ballons perdus', v1: s1.ballsLost, v2: s2.ballsLost, max: 10 },
    { label: 'Touches', v1: s1.touches, v2: s2.touches, max: 80 },
    { label: 'Passes', v1: s1.passes, v2: s2.passes, max: 70 },
    { label: 'Km/match', v1: parseFloat(s1.km), v2: parseFloat(s2.km), max: 12 },
  ]
  const selStyle = { background: '#0a0a08', border: `1px solid ${G.border}`, padding: '9px 12px', color: G.text, fontFamily: G.mono, fontSize: 12, outline: 'none', cursor: 'pointer', flex: 1 }
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <select value={p1idx} onChange={e => setP1idx(+e.target.value)} style={selStyle}>{players.map((p, i) => <option key={p.id} value={i}>#{p.number} {p.name}</option>)}</select>
        <div style={{ textAlign: 'center', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>vs</div>
        <select value={p2idx} onChange={e => setP2idx(+e.target.value)} style={selStyle}>{players.map((p, i) => <option key={p.id} value={i}>#{p.number} {p.name}</option>)}</select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border, marginBottom: 16 }}>
        {[{ p: p1, color: C1 }, { p: p2, color: C2 }].map(({ p, color }) => (
          <div key={p.id} style={{ background: '#0a0a08', padding: '14px 16px', textAlign: 'center', borderTop: `2px solid ${color}` }}>
            <div style={{ fontFamily: G.display, fontSize: 22, color }}>{`#${p.number}`}</div>
            <div style={{ fontFamily: G.mono, fontSize: 11, color: G.text, marginTop: 4, letterSpacing: '.06em' }}>{p.name}</div>
            <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>{p.position}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {metrics.map(({ label, v1, v2, max }) => {
          const p1wins = v1 >= v2
          return (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: G.mono, fontSize: 12, fontWeight: 700, color: p1wins ? C1 : G.muted }}>{v1}</span>
                <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{label}</span>
                <span style={{ fontFamily: G.mono, fontSize: 12, fontWeight: 700, color: !p1wins ? C2 : G.muted }}>{v2}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', direction: 'rtl' }}>
                  <div style={{ height: '100%', width: `${Math.min((v1 / max) * 100, 100)}%`, background: C1, opacity: p1wins ? 1 : 0.3 }} />
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((v2 / max) * 100, 100)}%`, background: C2, opacity: !p1wins ? 1 : 0.3 }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgressionView({ matches }) {
  const [metric, setMetric] = useState('possession')
  const metrics = [
    { id: 'possession', label: 'Possession', color: G.gold, key: m => m.stats?.possession || 58, suffix: '%' },
    { id: 'passes', label: 'Passes', color: G.blue, key: m => m.stats?.passes || 178, suffix: '' },
    { id: 'shots', label: 'Tirs', color: G.orange, key: m => m.stats?.shots || 8, suffix: '' },
  ]
  const current = metrics.find(m => m.id === metric)
  const data = matches.length > 0
    ? matches.map((m, i) => ({ match: m.opponent ? `vs ${m.opponent.split(' ')[0]}` : `M${i + 1}`, score: m.score_home !== null ? `${m.score_home}-${m.score_away}` : null, val: current.key(m), result: m.score_home > m.score_away ? 'V' : m.score_home < m.score_away ? 'D' : 'N' }))
    : [
      { match: 'vs Amiens', score: '0-1', val: 44, result: 'D' }, { match: 'vs Reims', score: '1-1', val: 52, result: 'N' },
      { match: 'vs Metz', score: '1-2', val: 48, result: 'D' }, { match: 'vs Valois', score: '1-0', val: 56, result: 'V' },
      { match: 'vs Balagne', score: '2-0', val: 61, result: 'V' }, { match: 'vs Charlev.', score: '3-1', val: 63, result: 'V' },
      { match: 'vs St-Q.', score: '0-0', val: 46, result: 'N' },
    ]
  const maxVal = Math.max(...data.map(d => d.val))
  const resultColor = { V: G.green, N: G.orange, D: G.red }
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {metrics.map(m => (
          <button key={m.id} onClick={() => setMetric(m.id)} style={{ padding: '7px 16px', border: metric === m.id ? 'none' : `1px solid ${G.border}`, cursor: 'pointer', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', background: metric === m.id ? m.color : 'transparent', color: metric === m.id ? '#0f0f0d' : G.muted, fontWeight: metric === m.id ? 700 : 400, transition: 'all .15s' }}>{m.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 700, color: current.color }}>{d.val}{current.suffix}</span>
            <div style={{ width: '100%', height: Math.max(6, (d.val / maxVal) * 90), background: current.color, opacity: 0.85 }} />
            <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.04em', color: G.muted, textAlign: 'center', whiteSpace: 'nowrap' }}>{d.match}</span>
            {d.score && <span style={{ fontFamily: G.mono, fontSize: 8, fontWeight: 700, color: resultColor[d.result] || G.muted }}>{d.score}</span>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
        {[{ c: G.green, l: 'Victoire' }, { c: G.orange, l: 'Nul' }, { c: G.red, l: 'Défaite' }].map(x => (
          <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, background: x.c }} />
            <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.06em', color: G.muted }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TEAM_HEAT = [
  { x: 25, y: 50, intensity: 0.9 }, { x: 50, y: 30, intensity: 0.8 }, { x: 50, y: 70, intensity: 0.7 },
  { x: 70, y: 50, intensity: 0.95 }, { x: 60, y: 25, intensity: 0.6 }, { x: 60, y: 75, intensity: 0.65 },
  { x: 80, y: 40, intensity: 0.75 }, { x: 80, y: 60, intensity: 0.7 }, { x: 35, y: 40, intensity: 0.5 }, { x: 35, y: 60, intensity: 0.55 },
]
const POS_HEAT = {
  'Gardien': [{ x: 8, y: 50, intensity: 0.95 }, { x: 15, y: 35, intensity: 0.6 }, { x: 15, y: 65, intensity: 0.6 }],
  'Défenseur': [{ x: 22, y: 30, intensity: 0.8 }, { x: 22, y: 70, intensity: 0.8 }, { x: 32, y: 50, intensity: 0.6 }, { x: 42, y: 45, intensity: 0.4 }],
  'Milieu': [{ x: 40, y: 50, intensity: 0.9 }, { x: 55, y: 35, intensity: 0.7 }, { x: 55, y: 65, intensity: 0.7 }, { x: 65, y: 50, intensity: 0.6 }],
  'Attaquant': [{ x: 75, y: 50, intensity: 0.9 }, { x: 85, y: 35, intensity: 0.8 }, { x: 85, y: 65, intensity: 0.75 }, { x: 65, y: 45, intensity: 0.5 }],
}
const POS_EVENTS = {
  'Gardien': [{ x: 10, y: 50, i: 0.9, type: 'won' }, { x: 16, y: 35, i: 0.65, type: 'won' }, { x: 16, y: 65, i: 0.6, type: 'won' }, { x: 20, y: 52, i: 0.5, type: 'lost' }],
  'Défenseur': [{ x: 22, y: 28, i: 0.85, type: 'won' }, { x: 22, y: 72, i: 0.8, type: 'won' }, { x: 35, y: 50, i: 0.7, type: 'won' }, { x: 40, y: 35, i: 0.55, type: 'lost' }, { x: 42, y: 60, i: 0.5, type: 'lost' }, { x: 55, y: 42, i: 0.65, type: 'shot' }],
  'Milieu': [{ x: 42, y: 50, i: 0.9, type: 'won' }, { x: 55, y: 32, i: 0.7, type: 'won' }, { x: 58, y: 68, i: 0.65, type: 'won' }, { x: 65, y: 45, i: 0.55, type: 'lost' }, { x: 68, y: 60, i: 0.5, type: 'lost' }, { x: 72, y: 40, i: 0.75, type: 'shot' }, { x: 76, y: 55, i: 0.7, type: 'shot' }],
  'Attaquant': [{ x: 72, y: 48, i: 0.75, type: 'won' }, { x: 82, y: 35, i: 0.65, type: 'won' }, { x: 38, y: 50, i: 0.55, type: 'lost' }, { x: 45, y: 38, i: 0.5, type: 'lost' }, { x: 48, y: 62, i: 0.45, type: 'lost' }, { x: 80, y: 42, i: 0.9, type: 'shot' }, { x: 84, y: 55, i: 0.85, type: 'shot' }, { x: 88, y: 48, i: 0.8, type: 'shot' }],
}

function StatBar({ label, value, max, color, suffix = '' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: G.mono, fontSize: 11, letterSpacing: '.04em', color: G.muted }}>{label}</span>
        <span style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 700, color: G.text }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color || G.gold, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

function Card({ title, subtitle, children, style = {}, accent }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}`, borderTop: `2px solid ${accent || G.border}`, padding: '20px 22px', ...style }}>
      {title && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: G.mono, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: G.text, margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', color: G.muted, marginTop: 4 }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

function getPlayerStats(player, idx) {
  const isAtt = player.position === 'Attaquant', isMil = player.position === 'Milieu'
  return { touches: 58 - idx * 2, passes: 40 - idx * 2, passesSuccess: 86 - idx, ballsWon: 8 - Math.floor(idx / 2), ballsLost: 3 + Math.floor(idx / 3), shots: isAtt ? 6 - Math.floor(idx / 2) : 2, goals: isAtt ? Math.max(0, 4 - Math.floor(idx / 2)) : idx < 2 ? 1 : 0, assists: isMil ? Math.max(0, 4 - Math.floor(idx / 2)) : 1, km: (9.5 - idx * 0.15).toFixed(1) }
}

export default function Statistics() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('collective')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [indivTab, setIndivTab] = useState('stats')

  useEffect(() => { loadData() }, [])
  const loadData = async () => {
    try {
      setLoading(true)
      const [md, pd] = await Promise.all([matchService.getMatches(), playerService.getPlayers()])
      const completed = md.filter(m => m.status?.toUpperCase() === 'COMPLETED')
      setMatches(completed); setPlayers(pd)
      if (pd.length > 0) setSelectedPlayer(pd[0])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const N = matches.length
  const wins = matches.filter(m => (m.score_home || 0) > (m.score_away || 0)).length
  const draws = matches.filter(m => (m.score_home || 0) === (m.score_away || 0)).length
  const losses = matches.filter(m => (m.score_home || 0) < (m.score_away || 0)).length
  const avgPoss = N > 0 ? Math.round(matches.reduce((s, m) => s + (m.stats?.possession || 58), 0) / N) : 58
  const totalPasses = N > 0 ? matches.reduce((s, m) => s + (m.stats?.passes || 178), 0) : 7 * 178
  const totalShots = N > 0 ? matches.reduce((s, m) => s + (m.stats?.shots || 8), 0) : 7 * 8
  const totalSOT = N > 0 ? matches.reduce((s, m) => s + (m.stats?.shots_on_target || 4), 0) : 7 * 4
  const totalGoals = matches.reduce((s, m) => s + (m.score_home || 0), 0)
  const totalKm = (N || 7) * 85

  const radarData = [
    { cat: 'Possession', val: avgPoss }, { cat: 'Passes', val: 82 }, { cat: 'Pressing', val: 74 },
    { cat: 'Défense', val: 78 }, { cat: 'Finition', val: Math.round((totalGoals / Math.max(totalShots, 1)) * 100) || 60 },
  ]
  const monthlyData = [
    { month: 'Nov', victoires: 1, nuls: 0, defaites: 1 }, { month: 'Déc', victoires: 2, nuls: 1, defaites: 0 },
    { month: 'Jan', victoires: 2, nuls: 0, defaites: 1 }, { month: 'Fév', victoires: 2, nuls: 0, defaites: 1 },
  ]

  const selStyle = { background: '#0a0a08', border: `1px solid ${G.border}`, padding: '9px 14px', color: G.text, fontFamily: G.mono, fontSize: 11, outline: 'none', cursor: 'pointer', letterSpacing: '.06em' }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ width: 28, height: 28, border: `2px solid ${G.goldBdr}`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      </div>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Statistiques
            </div>
            <h1 style={{ fontFamily: G.display, fontSize: 44, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: G.text, margin: 0 }}>
              Analyse<br /><span style={{ color: G.gold }}>de la saison.</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} style={selStyle}>
              <option value="all">Toute la saison</option>
              <option value="month">30 derniers jours</option>
              <option value="week">7 derniers jours</option>
            </select>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'transparent', border: `1px solid ${G.border}`, color: G.muted, cursor: 'pointer', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.goldBdr; e.currentTarget.style.color = G.gold }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted }}>
              <Download size={12} /> PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${G.border}` }}>
          {[{ id: 'collective', label: 'Collectives' }, { id: 'individual', label: 'Individuelles' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '12px 32px', border: 'none', cursor: 'pointer',
              fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase',
              background: 'transparent',
              color: tab === t.id ? G.text : G.muted,
              fontWeight: tab === t.id ? 700 : 400,
              borderBottom: tab === t.id ? `2px solid ${G.gold}` : '2px solid transparent',
              marginBottom: -1,
              transition: 'all .15s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* COLLECTIVES */}
      {tab === 'collective' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>

          {/* Bilan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: G.border }}>
            {[
              { label: 'Matchs joués', value: N || 7, color: G.gold },
              { label: 'Victoires', value: wins || 4, color: G.green },
              { label: 'Nuls', value: draws || 1, color: G.orange },
              { label: 'Défaites', value: losses || 2, color: G.red },
            ].map(s => (
              <div key={s.label} style={{ background: '#0a0a08', padding: '22px', borderTop: `2px solid ${s.color}` }}>
                <div style={{ fontFamily: G.display, fontSize: 56, lineHeight: 1, color: s.color }}>{s.value}</div>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, marginTop: 10 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: G.border }}>
            {/* Possession */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: `2px solid ${G.gold}`, padding: '20px 22px' }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontFamily: G.mono, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: G.text, margin: 0 }}>Possession de balle</h2>
                <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', color: G.muted, marginTop: 4 }}>Moyenne sur la saison</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 16px' }}>
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                  <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="48" fill="none" stroke={G.gold} strokeWidth="10"
                      strokeDasharray={`${(avgPoss / 100) * 2 * Math.PI * 48} ${2 * Math.PI * 48}`} strokeLinecap="butt" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: G.display, fontSize: 30, lineHeight: 1, color: G.text }}>{avgPoss}%</span>
                    <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 2 }}>moy.</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border }}>
                {[{ label: 'Max', value: '68%', color: G.green }, { label: 'Min', value: '48%', color: G.orange }].map(v => (
                  <div key={v.label} style={{ background: '#0a0a08', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: G.display, fontSize: 22, color: v.color, lineHeight: 1 }}>{v.value}</div>
                    <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 4 }}>{v.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Passes */}
            <Card title="Passes" subtitle="Total & précision">
              <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
                <div style={{ fontFamily: G.display, fontSize: 56, lineHeight: 1, color: G.text }}>{totalPasses}</div>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 6 }}>passes totales</div>
              </div>
              <StatBar label="Passes courtes" value={82} max={100} color={G.gold} suffix="%" />
              <StatBar label="Passes longues" value={61} max={100} color={G.blue} suffix="%" />
              <StatBar label="Précision globale" value={78} max={100} color={G.green} suffix="%" />
            </Card>

            {/* Tirs */}
            <Card title="Tirs" subtitle="Cadrés vs total">
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0 16px' }}>
                {[
                  { val: totalShots, label: 'Total tirs', color: G.orange },
                  { val: totalSOT, label: 'Cadrés', color: G.green },
                  { val: totalGoals, label: 'Buts', color: G.gold },
                ].map((v, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: G.display, fontSize: 42, lineHeight: 1, color: v.color }}>{v.val}</div>
                    <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 6 }}>{v.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ height: '100%', width: `${Math.round((totalSOT / Math.max(totalShots, 1)) * 100)}%`, background: `linear-gradient(90deg, ${G.orange}, ${G.green})` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', color: G.muted }}>Taux de cadrage</span>
                <span style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 700, color: G.green }}>{Math.round((totalSOT / Math.max(totalShots, 1)) * 100)}%</span>
              </div>
            </Card>
          </div>

          {/* Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: G.border }}>
            <Card title="Distance parcourue" subtitle="Cumulé équipe saison">
              <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
                <div style={{ fontFamily: G.display, fontSize: 56, lineHeight: 1, color: G.green }}>{totalKm}</div>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 6 }}>km total</div>
              </div>
              <StatBar label="Moy. par match" value={85} max={120} color={G.green} suffix=" km" />
              <StatBar label="Moy. par joueur/match" value={8} max={12} color={G.gold} suffix=" km" />
              <StatBar label="Part sprints" value={32} max={50} color={G.blue} suffix="%" />
            </Card>

            <Card title="Performance globale">
              <ResponsiveContainer width="100%" height={195}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={G.border} />
                  <PolarAngleAxis dataKey="cat" stroke={G.muted} tick={{ fontFamily: G.mono, fontSize: 9, fill: G.muted }} />
                  <PolarRadiusAxis stroke="transparent" tick={false} domain={[0, 100]} />
                  <Radar dataKey="val" stroke={G.gold} fill={G.gold} fillOpacity={0.12} strokeWidth={1.5} />
                  <Tooltip {...TT} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Heatmap équipe" subtitle="Zones de présence collectives">
              <Heatmap data={TEAM_HEAT} />
            </Card>
          </div>

          {/* Mensuel */}
          <Card title="Résultats mensuels" style={{ background: '#0a0a08' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={18}>
                <CartesianGrid strokeDasharray="0 0" stroke={G.border} vertical={false} />
                <XAxis dataKey="month" stroke="transparent" tick={{ fontFamily: G.mono, fontSize: 10, fill: G.muted }} />
                <YAxis stroke="transparent" tick={{ fontFamily: G.mono, fontSize: 10, fill: G.muted }} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase' }} />
                <Bar dataKey="victoires" fill={G.green} name="Victoires" radius={0} />
                <Bar dataKey="nuls" fill={G.orange} name="Nuls" radius={0} />
                <Bar dataKey="defaites" fill={G.red} name="Défaites" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* INDIVIDUELLES */}
      {tab === 'individual' && (
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {[{ id: 'stats', label: 'Stats' }, { id: 'terrain', label: 'Terrain' }, { id: 'compare', label: 'Comparer' }, { id: 'progression', label: 'Progression' }].map(t => (
              <button key={t.id} onClick={() => setIndivTab(t.id)} style={{ padding: '12px 24px', border: 'none', borderBottom: indivTab === t.id ? `2px solid ${G.gold}` : '2px solid transparent', cursor: 'pointer', fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', background: 'transparent', color: indivTab === t.id ? G.text : G.muted, fontWeight: indivTab === t.id ? 700 : 400, transition: 'all .15s', marginBottom: -1 }}>{t.label}</button>
            ))}
          </div>

          {indivTab === 'progression' && (
            <Card title="Progression match par match" subtitle="Évolution des métriques clés" accent={G.gold}>
              <ProgressionView matches={matches} />
            </Card>
          )}

          {indivTab === 'compare' && (
            <Card title="Comparaison joueurs" subtitle="Face-à-face sur les métriques clés" accent={G.gold}>
              <CompareView players={players} getStats={getPlayerStats} />
            </Card>
          )}

          {(indivTab === 'stats' || indivTab === 'terrain') && (
            <div style={{ display: 'flex', gap: 1, background: G.border }}>
              {/* Liste */}
              <div style={{ width: 200, flexShrink: 0, background: '#0a0a08', alignSelf: 'flex-start' }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${G.border}` }}>
                  <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>Joueurs ({players.length})</p>
                </div>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {players.map(p => {
                    const isSelected = selectedPlayer?.id === p.id
                    return (
                      <div key={p.id} onClick={() => setSelectedPlayer(p)} style={{ padding: '10px 14px', cursor: 'pointer', background: isSelected ? G.goldBg : 'transparent', borderLeft: `2px solid ${isSelected ? G.gold : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .15s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
                        <div>
                          <div style={{ fontFamily: G.mono, fontSize: 11, color: isSelected ? G.gold : G.text, letterSpacing: '.04em' }}>{p.name}</div>
                          <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, marginTop: 2, letterSpacing: '.06em' }}>{p.position} · #{p.number}</div>
                        </div>
                        {isSelected && <ChevronRight size={11} color={G.gold} />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Détail */}
              {selectedPlayer && (() => {
                const idx = players.findIndex(p => p.id === selectedPlayer.id)
                const s = getPlayerStats(selectedPlayer, idx)
                return (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
                    {/* Header joueur */}
                    <div style={{ background: '#0a0a08', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, borderTop: `2px solid ${G.gold}` }}>
                      <div style={{ width: 48, height: 48, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: G.display, fontSize: 22, color: G.gold }}>#{selectedPlayer.number}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', letterSpacing: '.03em', color: G.text, margin: 0 }}>{selectedPlayer.name}</h2>
                        <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 4 }}>{selectedPlayer.position} · {selectedPlayer.category}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 24 }}>
                        {[{ label: 'Buts', value: s.goals, color: G.green }, { label: 'Passes D.', value: s.assists, color: G.gold }, { label: 'Km moy.', value: s.km, color: G.orange }].map(v => (
                          <div key={v.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: G.display, fontSize: 26, lineHeight: 1, color: v.color }}>{v.value}</div>
                            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: G.muted, marginTop: 4 }}>{v.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {indivTab === 'stats' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border }}>
                        <Card title="Statistiques détaillées">
                          <StatBar label="Ballons touchés" value={s.touches} max={80} color={G.gold} />
                          <StatBar label="Passes réussies" value={s.passesSuccess} max={100} color={G.blue} suffix="%" />
                          <StatBar label="Ballons gagnés" value={s.ballsWon} max={15} color={G.green} />
                          <StatBar label="Ballons perdus" value={s.ballsLost} max={15} color={G.red} />
                          <StatBar label="Tirs tentés" value={s.shots} max={10} color={G.orange} />
                          <StatBar label="Distance parcourue" value={parseFloat(s.km)} max={12} color={G.green} suffix=" km" />
                        </Card>
                        <Card title="Heatmap individuelle" subtitle={`Zones de présence — ${selectedPlayer.position}`}>
                          <Heatmap data={POS_HEAT[selectedPlayer.position] || POS_HEAT['Milieu']} />
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: G.border, marginTop: 12 }}>
                            {[{ label: 'Touches', value: s.touches, color: G.gold }, { label: 'Passes', value: s.passes, color: G.blue }, { label: 'Gagnés', value: s.ballsWon, color: G.green }, { label: 'Perdus', value: s.ballsLost, color: G.red }].map(v => (
                              <div key={v.label} style={{ background: '#0a0a08', padding: '10px 8px', textAlign: 'center' }}>
                                <div style={{ fontFamily: G.display, fontSize: 20, color: v.color, lineHeight: 1 }}>{v.value}</div>
                                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase', color: G.muted, marginTop: 4 }}>{v.label}</div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}

                    {indivTab === 'terrain' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border }}>
                        <Card title="Zones d'action" subtitle="Ballons gagnés · perdus · tirs">
                          <EventHeatmap events={POS_EVENTS[selectedPlayer.position] || POS_EVENTS['Milieu']} />
                          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                            {[{ c: G.green, l: 'Gagnés' }, { c: G.red, l: 'Perdus' }, { c: G.gold, l: 'Tirs' }].map(x => (
                              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 6, height: 6, background: x.c }} />
                                <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.06em', color: G.muted }}>{x.l}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
                          {[{ val: s.ballsWon, label: 'Ballons gagnés', color: G.green }, { val: s.ballsLost, label: 'Ballons perdus', color: G.red }, { val: s.shots, label: 'Tirs tentés', color: G.orange }, { val: s.goals, label: 'Buts marqués', color: G.gold }].map(x => (
                            <div key={x.label} style={{ background: '#0a0a08', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `2px solid ${x.color}` }}>
                              <span style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: G.muted }}>{x.label}</span>
                              <span style={{ fontFamily: G.display, fontSize: 32, color: x.color, lineHeight: 1 }}>{x.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #0a0a08; }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-thumb { background: rgba(201,162,39,0.2); }
      `}</style>
    </DashboardLayout>
  )
}
