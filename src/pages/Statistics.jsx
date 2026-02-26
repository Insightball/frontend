import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  paper:   '#f5f2eb',
  cream:   '#faf8f4',
  white:   '#ffffff',
  ink:     '#0f0f0d',
  ink2:    '#2a2a26',
  muted:   'rgba(15,15,13,0.42)',
  muted2:  'rgba(15,15,13,0.62)',
  rule:    'rgba(15,15,13,0.09)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.25)',
  green:   '#16a34a',
  red:     '#dc2626',
  blue:    '#2563eb',
  orange:  '#d97706',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

const TT = {
  contentStyle: { backgroundColor: G.white, border: `1px solid ${G.rule}`, borderRadius: 6, fontFamily: G.mono, fontSize: 11, boxShadow: '0 2px 8px rgba(15,15,13,0.08)' },
  labelStyle:   { color: G.muted2 },
  itemStyle:    { color: G.ink },
}

// ── Terrain SVG ────────────────────────────────────────────────────────────
function Pitch({ children, light = false }) {
  const W = 320, H = 200
  const lineColor = light ? 'rgba(15,15,13,0.15)' : 'rgba(255,255,255,0.15)'
  const bg = light ? G.paper : '#1a2e1a'
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', borderRadius: 6 }}>
      <rect width={W} height={H} fill={bg} />
      <g stroke={lineColor} strokeWidth="1" fill="none">
        <rect x={8} y={7} width={W - 16} height={H - 14} />
        <line x1={W / 2} y1={7} x2={W / 2} y2={H - 7} />
        <circle cx={W / 2} cy={H / 2} r={26} />
        <rect x={8}     y={H/2-30} width={44} height={60} />
        <rect x={W-52}  y={H/2-30} width={44} height={60} />
        <rect x={8}     y={H/2-16} width={20} height={32} />
        <rect x={W-28}  y={H/2-16} width={20} height={32} />
      </g>
      {children}
    </svg>
  )
}

// ── Heatmap ────────────────────────────────────────────────────────────────
function Heatmap({ data }) {
  const W = 320, H = 200
  return (
    <Pitch>
      {data.map((pt, i) => {
        const px = 8 + (pt.x / 100) * (W - 16)
        const py = 7 + (pt.y / 100) * (H - 14)
        return <circle key={i} cx={px} cy={py} r={20 + pt.intensity * 14} fill={`rgba(201,162,39,${0.12 + pt.intensity * 0.45})`} style={{ filter: `blur(${10 + pt.intensity * 8}px)` }} />
      })}
      {data.filter(pt => pt.intensity > 0.6).map((pt, i) => (
        <circle key={`d${i}`} cx={8 + (pt.x / 100) * (W - 16)} cy={7 + (pt.y / 100) * (H - 14)} r={3} fill={G.gold} fillOpacity={0.9} />
      ))}
    </Pitch>
  )
}

// ── Event Heatmap ──────────────────────────────────────────────────────────
function EventHeatmap({ events }) {
  const W = 320, H = 200
  return (
    <Pitch>
      {events.map((z, i) => {
        const cx = 8 + (z.x / 100) * (W - 16), cy = 7 + (z.y / 100) * (H - 14)
        const col = z.type === 'won' ? `rgba(22,163,74,${0.1 + z.i * 0.4})` : z.type === 'shot' ? `rgba(201,162,39,${0.12 + z.i * 0.4})` : `rgba(220,38,38,${0.1 + z.i * 0.4})`
        return <circle key={i} cx={cx} cy={cy} r={16 + z.i * 12} fill={col} style={{ filter: `blur(${6 + z.i * 4}px)` }} />
      })}
      {events.map((z, i) => {
        const cx = 8 + (z.x / 100) * (W - 16), cy = 7 + (z.y / 100) * (H - 14)
        const col = z.type === 'won' ? G.green : z.type === 'shot' ? G.gold : G.red
        return <circle key={`d${i}`} cx={cx} cy={cy} r={3.5} fill={col} fillOpacity={0.9} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      })}
    </Pitch>
  )
}

// ── Comparaison joueurs ────────────────────────────────────────────────────
function CompareView({ players, getStats }) {
  const [p1idx, setP1idx] = useState(0)
  const [p2idx, setP2idx] = useState(Math.min(1, players.length - 1))
  const p1 = players[p1idx], p2 = players[p2idx]
  if (!p1 || !p2) return null
  const s1 = getStats(p1, p1idx), s2 = getStats(p2, p2idx)
  const C1 = G.gold, C2 = G.red
  const metrics = [
    { label: 'Buts',           v1: s1.goals,      v2: s2.goals,      max: 10 },
    { label: 'Passes D.',      v1: s1.assists,    v2: s2.assists,    max: 8  },
    { label: 'Tirs',           v1: s1.shots,      v2: s2.shots,      max: 12 },
    { label: 'Ballons gagnés', v1: s1.ballsWon,   v2: s2.ballsWon,   max: 15 },
    { label: 'Ballons perdus', v1: s1.ballsLost,  v2: s2.ballsLost,  max: 10 },
    { label: 'Touches',        v1: s1.touches,    v2: s2.touches,    max: 80 },
    { label: 'Passes',         v1: s1.passes,     v2: s2.passes,     max: 70 },
    { label: 'Km/match',       v1: parseFloat(s1.km), v2: parseFloat(s2.km), max: 12 },
  ]
  const selStyle = {
    background: G.white, border: `1px solid ${G.rule}`,
    padding: '9px 12px', color: G.ink, fontFamily: G.mono,
    fontSize: 12, outline: 'none', cursor: 'pointer', flex: 1,
    borderRadius: 6,
  }
  return (
    <div>
      {/* Sélecteurs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <select value={p1idx} onChange={e => setP1idx(+e.target.value)} style={{ ...selStyle, borderTop: `2px solid ${C1}` }}>
          {players.map((p, i) => <option key={p.id} value={i}>#{p.number} {p.name}</option>)}
        </select>
        <div style={{ textAlign: 'center', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', color: G.muted }}>vs</div>
        <select value={p2idx} onChange={e => setP2idx(+e.target.value)} style={{ ...selStyle, borderTop: `2px solid ${C2}` }}>
          {players.map((p, i) => <option key={p.id} value={i}>#{p.number} {p.name}</option>)}
        </select>
      </div>

      {/* Cards joueurs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.rule, marginBottom: 14 }}>
        {[{ p: p1, color: C1 }, { p: p2, color: C2 }].map(({ p, color }) => (
          <div key={p.id} style={{ background: G.white, padding: '14px 16px', textAlign: 'center', borderTop: `2px solid ${color}` }}>
            <div style={{ fontFamily: G.display, fontSize: 22, color }}>{`#${p.number}`}</div>
            <div style={{ fontFamily: G.mono, fontSize: 11, color: G.ink, marginTop: 4, fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>{p.position}</div>
          </div>
        ))}
      </div>

      {/* Barres comparaison */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {metrics.map(({ label, v1, v2, max }) => {
          const p1wins = v1 >= v2
          return (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: G.mono, fontSize: 12, fontWeight: 700, color: p1wins ? C1 : G.muted }}>{v1}</span>
                <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{label}</span>
                <span style={{ fontFamily: G.mono, fontSize: 12, fontWeight: 700, color: !p1wins ? C2 : G.muted }}>{v2}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <div style={{ height: 4, background: G.paper, overflow: 'hidden', direction: 'rtl', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${Math.min((v1 / max) * 100, 100)}%`, background: C1, opacity: p1wins ? 1 : 0.3 }} />
                </div>
                <div style={{ height: 4, background: G.paper, overflow: 'hidden', borderRadius: 2 }}>
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

// ── Progression ────────────────────────────────────────────────────────────
function ProgressionView({ matches }) {
  const [metric, setMetric] = useState('possession')
  const metrics = [
    { id: 'possession', label: 'Possession', color: G.gold,   key: m => m.stats?.possession || 58, suffix: '%' },
    { id: 'passes',     label: 'Passes',     color: G.blue,   key: m => m.stats?.passes     || 178, suffix: '' },
    { id: 'shots',      label: 'Tirs',       color: G.orange, key: m => m.stats?.shots       || 8,  suffix: '' },
  ]
  const current = metrics.find(m => m.id === metric)
  const data = matches.length > 0
    ? matches.map((m, i) => ({
        match: m.opponent ? `vs ${m.opponent.split(' ')[0]}` : `M${i + 1}`,
        score: m.score_home !== null ? `${m.score_home}-${m.score_away}` : null,
        val: current.key(m),
        result: m.score_home > m.score_away ? 'V' : m.score_home < m.score_away ? 'D' : 'N'
      }))
    : [
        { match: 'vs Amiens',   score: '0-1', val: 44, result: 'D' },
        { match: 'vs Reims',    score: '1-1', val: 52, result: 'N' },
        { match: 'vs Metz',     score: '1-2', val: 48, result: 'D' },
        { match: 'vs Valois',   score: '1-0', val: 56, result: 'V' },
        { match: 'vs Balagne',  score: '2-0', val: 61, result: 'V' },
        { match: 'vs Charlev.', score: '3-1', val: 63, result: 'V' },
        { match: 'vs St-Q.',    score: '0-0', val: 46, result: 'N' },
      ]

  const maxVal = Math.max(...data.map(d => d.val))
  const resultColor = { V: G.green, N: G.orange, D: G.red }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {metrics.map(m => (
          <button key={m.id} onClick={() => setMetric(m.id)} style={{
            padding: '7px 16px', cursor: 'pointer',
            border: metric === m.id ? 'none' : `1px solid ${G.rule}`,
            borderRadius: 6,
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
            background: metric === m.id ? m.color : 'transparent',
            color: metric === m.id ? G.white : G.muted2,
            fontWeight: metric === m.id ? 700 : 400,
            transition: 'all .15s',
          }}>{m.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 700, color: current.color }}>{d.val}{current.suffix}</span>
            <div style={{ width: '100%', height: Math.max(6, (d.val / maxVal) * 90), background: current.color, opacity: 0.85, borderRadius: '3px 3px 0 0' }} />
            <span style={{ fontFamily: G.mono, fontSize: 8, color: G.muted, textAlign: 'center', whiteSpace: 'nowrap' }}>{d.match}</span>
            {d.score && <span style={{ fontFamily: G.mono, fontSize: 8, fontWeight: 700, color: resultColor[d.result] || G.muted }}>{d.score}</span>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, justifyContent: 'center' }}>
        {[{ c: G.green, l: 'Victoire' }, { c: G.orange, l: 'Nul' }, { c: G.red, l: 'Défaite' }].map(x => (
          <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, background: x.c, borderRadius: 2 }} />
            <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Données statiques ──────────────────────────────────────────────────────
const TEAM_HEAT = [
  { x: 25, y: 50, intensity: 0.9 }, { x: 50, y: 30, intensity: 0.8 },
  { x: 50, y: 70, intensity: 0.7 }, { x: 70, y: 50, intensity: 0.95 },
  { x: 60, y: 25, intensity: 0.6 }, { x: 60, y: 75, intensity: 0.65 },
  { x: 80, y: 40, intensity: 0.75 },{ x: 80, y: 60, intensity: 0.7 },
  { x: 35, y: 40, intensity: 0.5 }, { x: 35, y: 60, intensity: 0.55 },
]
const POS_HEAT = {
  'Gardien':   [{ x: 8, y: 50, intensity: 0.95 }, { x: 15, y: 35, intensity: 0.6 }, { x: 15, y: 65, intensity: 0.6 }],
  'Défenseur': [{ x: 22, y: 30, intensity: 0.8 }, { x: 22, y: 70, intensity: 0.8 }, { x: 32, y: 50, intensity: 0.6 }, { x: 42, y: 45, intensity: 0.4 }],
  'Milieu':    [{ x: 40, y: 50, intensity: 0.9 }, { x: 55, y: 35, intensity: 0.7 }, { x: 55, y: 65, intensity: 0.7 }, { x: 65, y: 50, intensity: 0.6 }],
  'Attaquant': [{ x: 75, y: 50, intensity: 0.9 }, { x: 85, y: 35, intensity: 0.8 }, { x: 85, y: 65, intensity: 0.75 }, { x: 65, y: 45, intensity: 0.5 }],
}
const POS_EVENTS = {
  'Gardien':   [{ x: 10, y: 50, i: 0.9, type: 'won' }, { x: 16, y: 35, i: 0.65, type: 'won' }, { x: 20, y: 52, i: 0.5, type: 'lost' }],
  'Défenseur': [{ x: 22, y: 28, i: 0.85, type: 'won' }, { x: 35, y: 50, i: 0.7, type: 'won' }, { x: 55, y: 42, i: 0.65, type: 'shot' }],
  'Milieu':    [{ x: 42, y: 50, i: 0.9, type: 'won' }, { x: 55, y: 32, i: 0.7, type: 'won' }, { x: 72, y: 40, i: 0.75, type: 'shot' }],
  'Attaquant': [{ x: 72, y: 48, i: 0.75, type: 'won' }, { x: 80, y: 42, i: 0.9, type: 'shot' }, { x: 45, y: 38, i: 0.5, type: 'lost' }],
}

// ── Composant principal ────────────────────────────────────────────────────
export default function Statistics() {
  const [matches,    setMatches]    = useState([])
  const [players,    setPlayers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('statistiques')
  const [activePos,  setActivePos]  = useState('Milieu')
  const [seasonFilter, setSeasonFilter] = useState('Toute la saison')
  const [isMobile,   setIsMobile]   = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [m, p] = await Promise.all([matchService.getMatches(), playerService.getPlayers()])
        setMatches(m); setPlayers(p)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [])

  const completed = matches.filter(m => m.status === 'completed')
  const wins   = completed.filter(m => m.score_home > m.score_away).length
  const draws  = completed.filter(m => m.score_home === m.score_away).length
  const losses = completed.filter(m => m.score_home < m.score_away).length
  const avgPoss = completed.length ? Math.round(completed.reduce((s, m) => s + (m.stats?.possession || 58), 0) / completed.length) : 60
  const totalPasses = completed.reduce((s, m) => s + (m.stats?.passes || 0), 0)
  const totalShots  = completed.reduce((s, m) => s + (m.stats?.shots  || 0), 0)

  const getStats = (p, i) => ({
    goals: 3 + i, assists: 2 + (i % 3), shots: 5 + i * 2,
    ballsWon: 8 + i, ballsLost: 3 + (i % 4), touches: 42 + i * 5,
    passes: 28 + i * 3, km: (8.5 + i * 0.4).toFixed(1),
  })

  const tabs = ['statistiques', 'heatmap', 'progression', 'comparaison']

  const Card = ({ children, gold = false }) => (
    <div style={{
      background: G.white, border: `1px solid ${G.rule}`,
      borderTop: `2px solid ${gold ? G.gold : G.rule}`,
      borderRadius: 8, padding: 20,
    }}>{children}</div>
  )

  const CardTitle = ({ children }) => (
    <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 2, height: 14, background: G.gold, display: 'inline-block', flexShrink: 0 }} />
      {children}
    </div>
  )

  const BigStat = ({ value, label, color = G.ink }) => (
    <div>
      <div style={{ fontFamily: G.display, fontSize: isMobile ? 40 : 52, lineHeight: 1, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>{label}</div>
    </div>
  )

  const Bar2 = ({ label, value, max, color = G.gold }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted2 }}>{label}</span>
        <span style={{ fontFamily: G.mono, fontSize: 10, fontWeight: 700, color: G.ink }}>{value}</span>
      </div>
      <div style={{ height: 5, background: G.paper, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <style>{`${FONTS} * { box-sizing:border-box; }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
            Statistiques
          </div>
          <h1 style={{ fontFamily: G.display, fontSize: isMobile ? 32 : 44, textTransform: 'uppercase', lineHeight: .9, color: G.ink }}>
            Analyse<br /><span style={{ color: G.gold }}>de la saison</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)} style={{ background: G.white, border: `1px solid ${G.rule}`, padding: '8px 14px', fontFamily: G.mono, fontSize: 10, color: G.ink, outline: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {['Toute la saison', '3 derniers matchs', 'Ce mois'].map(o => <option key={o}>{o}</option>)}
          </select>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: G.ink, color: G.paper, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 6 }}>
            <Download size={11} /> Exporter
          </button>
        </div>
      </div>

      {/* KPI top — 4 cols mobile 2, desktop 4 */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 1, background: G.rule, marginBottom: 20 }}>
        {[
          { v: completed.length || 7, label: 'Matchs joués',  color: G.gold },
          { v: wins  || 4,            label: 'Victoires',     color: G.green },
          { v: draws || 1,            label: 'Nuls',          color: G.orange },
          { v: losses || 2,           label: 'Défaites',      color: G.red },
        ].map((s, i) => (
          <div key={i} style={{ background: G.white, padding: '22px 20px', borderTop: `2px solid ${s.color}` }}>
            <div style={{ fontFamily: G.display, fontSize: isMobile ? 40 : 52, lineHeight: 1, color: s.color, marginBottom: 6 }}>{s.v}</div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${G.rule}`, marginBottom: 20, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 18px', background: 'transparent', border: 'none',
            borderBottom: activeTab === tab ? `2px solid ${G.gold}` : '2px solid transparent',
            color: activeTab === tab ? G.gold : G.muted,
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
          }}>{tab}</button>
        ))}
      </div>

      {/* ── Statistiques ── */}
      {activeTab === 'statistiques' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>

          {/* Possession */}
          <Card gold>
            <CardTitle>Possession de balle</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke={G.paper} strokeWidth="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke={G.gold} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 30 * avgPoss / 100} ${2 * Math.PI * 30 * (1 - avgPoss / 100)}`}
                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: G.display, fontSize: 18, color: G.gold }}>{avgPoss}%</div>
              </div>
              <div>
                <BigStat value={`${avgPoss}%`} label="Moyenne saison" color={G.gold} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[{ label: 'Max', v: '68%', c: G.green }, { label: 'Min', v: '48%', c: G.red }].map(s => (
                <div key={s.label} style={{ background: G.paper, borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: G.display, fontSize: 22, color: s.c }}>{s.v}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Passes */}
          <Card>
            <CardTitle>Passes</CardTitle>
            <BigStat value={totalPasses || 1265} label="Total saison" />
            <div style={{ height: 12 }} />
            <Bar2 label="Réussies"  value={89} max={100} color={G.green} />
            <Bar2 label="Longues"   value={42} max={100} color={G.blue} />
            <Bar2 label="Clés"      value={38} max={100} color={G.gold} />
          </Card>

          {/* Tirs */}
          <Card>
            <CardTitle>Tirs</CardTitle>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <BigStat value={totalShots || 92}  label="Total"    color={G.gold} />
              <BigStat value={35}                label="Cadrés"   color={G.green} />
              <BigStat value={20}                label="Non cadrés" color={G.red} />
            </div>
            <Bar2 label="Cadrage"     value={38} max={100} color={G.gold} />
            <Bar2 label="Conversion"  value={12} max={100} color={G.green} />
          </Card>

          {/* Distance */}
          <Card>
            <CardTitle>Distance parcourue</CardTitle>
            <BigStat value="105.3" label="km total équipe / match" color={G.blue} />
            <div style={{ height: 16 }} />
            <Bar2 label="Gardien"   value={5.2}  max={13} color={G.muted} />
            <Bar2 label="Défenseur" value={9.1}  max={13} color={G.gold} />
            <Bar2 label="Milieu"    value={11.4} max={13} color={G.green} />
            <Bar2 label="Attaquant" value={9.8}  max={13} color={G.blue} />
          </Card>

          {/* Duels */}
          <Card>
            <CardTitle>Duels</CardTitle>
            <BigStat value="523" label="duels joués saison" color={G.ink} />
            <div style={{ height: 16 }} />
            <Bar2 label="Gagnés"  value={64} max={100} color={G.green} />
            <Bar2 label="Aériens" value={58} max={100} color={G.blue} />
            <Bar2 label="Perdus"  value={36} max={100} color={G.red} />
          </Card>

          {/* Performance globale */}
          <Card gold>
            <CardTitle>Performance globale</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Attaque',  value: 72, color: G.gold  },
                { label: 'Défense',  value: 68, color: G.blue  },
                { label: 'Milieu',   value: 78, color: G.green },
                { label: 'Pressing', value: 61, color: G.orange},
                { label: 'Physique', value: 74, color: G.ink   },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted2, width: 56, flexShrink: 0 }}>{s.label}</span>
                  <div style={{ flex: 1, height: 5, background: G.paper, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.value}%`, background: s.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 700, color: G.ink, width: 28, textAlign: 'right' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}

      {/* ── Heatmap ── */}
      {activeTab === 'heatmap' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <Card gold>
            <CardTitle>Heatmap équipe</CardTitle>
            <Heatmap data={TEAM_HEAT} />
            <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, marginTop: 10, textAlign: 'center' }}>Zones d'activité collective — saison complète</div>
          </Card>

          <Card>
            <CardTitle>Par poste</CardTitle>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {Object.keys(POS_HEAT).map(pos => (
                <button key={pos} onClick={() => setActivePos(pos)} style={{
                  padding: '5px 12px', borderRadius: 5, border: activePos === pos ? 'none' : `1px solid ${G.rule}`,
                  background: activePos === pos ? G.gold : 'transparent',
                  color: activePos === pos ? G.white : G.muted2,
                  fontFamily: G.mono, fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all .15s',
                }}>{pos}</button>
              ))}
            </div>
            <Heatmap data={POS_HEAT[activePos] || []} />
          </Card>

          <Card>
            <CardTitle>Zones d'événements</CardTitle>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {Object.keys(POS_EVENTS).map(pos => (
                <button key={pos} onClick={() => setActivePos(pos)} style={{
                  padding: '5px 12px', borderRadius: 5, border: activePos === pos ? 'none' : `1px solid ${G.rule}`,
                  background: activePos === pos ? G.ink : 'transparent',
                  color: activePos === pos ? G.paper : G.muted2,
                  fontFamily: G.mono, fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all .15s',
                }}>{pos}</button>
              ))}
            </div>
            <EventHeatmap events={POS_EVENTS[activePos] || []} />
            <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'center' }}>
              {[{ c: G.green, l: 'Ballons gagnés' }, { c: G.gold, l: 'Tirs' }, { c: G.red, l: 'Ballons perdus' }].map(x => (
                <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: x.c }} />
                  <span style={{ fontFamily: G.mono, fontSize: 8, color: G.muted }}>{x.l}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Progression ── */}
      {activeTab === 'progression' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <Card gold>
            <CardTitle>Progression des métriques</CardTitle>
            <ProgressionView matches={completed} />
          </Card>
          <Card>
            <CardTitle>Résultats match par match</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(completed.length > 0 ? completed : [
                { opponent: 'Amiens SC', score_home: 0, score_away: 1, category: 'N3' },
                { opponent: 'Stade Reims B', score_home: 1, score_away: 1, category: 'N3' },
                { opponent: 'FC Metz B', score_home: 1, score_away: 2, category: 'N3' },
                { opponent: 'AS Valois', score_home: 1, score_away: 0, category: 'N3' },
                { opponent: 'SC Balagne', score_home: 2, score_away: 0, category: 'N3' },
              ]).slice(0, 6).map((m, i) => {
                const won = m.score_home > m.score_away
                const draw = m.score_home === m.score_away
                const rc = won ? G.green : draw ? G.orange : G.red
                const rl = won ? 'V' : draw ? 'N' : 'D'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: G.paper, borderRadius: 6, borderLeft: `3px solid ${rc}` }}>
                    <span style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 700, padding: '3px 8px', background: rc + '20', color: rc, borderRadius: 4 }}>{rl}</span>
                    <span style={{ fontFamily: G.mono, fontSize: 11, color: G.ink, flex: 1 }}>{m.opponent}</span>
                    <span style={{ fontFamily: G.display, fontSize: 18, color: G.ink }}>{m.score_home} — {m.score_away}</span>
                    <span style={{ fontFamily: G.mono, fontSize: 8, color: G.muted }}>{m.category}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── Comparaison ── */}
      {activeTab === 'comparaison' && (
        <div style={{ maxWidth: 600 }}>
          <Card gold>
            <CardTitle>Comparaison joueurs</CardTitle>
            {players.length >= 2
              ? <CompareView players={players} getStats={getStats} />
              : <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, padding: '20px 0' }}>Au moins 2 joueurs requis pour la comparaison.</p>
            }
          </Card>
        </div>
      )}

    </DashboardLayout>
  )
}
