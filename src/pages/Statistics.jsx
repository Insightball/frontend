import { useState, useEffect } from 'react'
import { Download, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from 'recharts'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

// ─── Heatmap SVG pitch ───────────────────────────────────────────────────
function Heatmap({ data }) {
  const W = 320, H = 200
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 10, overflow: 'hidden' }}>
      <rect width={W} height={H} fill="#071a07" rx="8" />
      <rect x={8} y={8} width={W-16} height={H-16} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" rx="4" />
      <line x1={W/2} y1={8} x2={W/2} y2={H-8} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx={W/2} cy={H/2} r={28} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x={8} y={H/2-32} width={46} height={64} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect x={W-54} y={H/2-32} width={46} height={64} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {data.map((pt, i) => {
        const px = 8 + (pt.x / 100) * (W - 16)
        const py = 8 + (pt.y / 100) * (H - 16)
        return (
          <circle key={i} cx={px} cy={py} r={20 + pt.intensity * 14}
            fill={`rgba(99,102,241,${0.12 + pt.intensity * 0.45})`}
            style={{ filter: `blur(${10 + pt.intensity * 8}px)` }}
          />
        )
      })}
      {data.filter(pt => pt.intensity > 0.6).map((pt, i) => (
        <circle key={`d${i}`}
          cx={8 + (pt.x / 100) * (W - 16)}
          cy={8 + (pt.y / 100) * (H - 16)}
          r={3} fill="rgba(139,92,246,0.85)" />
      ))}
    </svg>
  )
}

// ─── Heatmap événements (ballons gagnés/perdus/tirs) ────────────────────
function EventHeatmap({ events }) {
  const W = 320, H = 200
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 10, overflow: 'hidden', display: 'block' }}>
      <defs>
        <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d2b0d"/><stop offset="100%" stopColor="#091a09"/>
        </linearGradient>
        <pattern id="ep" width="28" height={H} patternUnits="userSpaceOnUse">
          <rect width="14" height={H} fill="rgba(255,255,255,0.013)"/>
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#eg)" rx="8"/>
      <rect width={W} height={H} fill="url(#ep)" rx="8"/>
      <g stroke="rgba(255,255,255,0.11)" strokeWidth="1" fill="none">
        <rect x={8} y={7} width={W-16} height={H-14} rx="2"/>
        <line x1={W/2} y1={7} x2={W/2} y2={H-7}/>
        <circle cx={W/2} cy={H/2} r={26}/>
        <rect x={8} y={H/2-30} width={44} height={60}/>
        <rect x={8} y={H/2-14} width={18} height={28}/>
        <rect x={W-52} y={H/2-30} width={44} height={60}/>
        <rect x={W-26} y={H/2-14} width={18} height={28}/>
      </g>
      {/* Blobs */}
      {events.map((z, i) => {
        const cx = 8 + (z.x/100)*(W-16), cy = 7 + (z.y/100)*(H-14)
        const col = z.type==='won' ? `rgba(16,185,129,${0.12+z.i*0.4})` : z.type==='shot' ? `rgba(245,158,11,${0.12+z.i*0.4})` : `rgba(239,68,68,${0.12+z.i*0.4})`
        return <circle key={i} cx={cx} cy={cy} r={16+z.i*12} fill={col} style={{filter:`blur(${6+z.i*4}px)`}}/>
      })}
      {/* Points nets */}
      {events.map((z, i) => {
        const cx = 8 + (z.x/100)*(W-16), cy = 7 + (z.y/100)*(H-14)
        const col = z.type==='won' ? '#10b981' : z.type==='shot' ? '#f59e0b' : '#ef4444'
        return <circle key={'d'+i} cx={cx} cy={cy} r={3.5} fill={col} fillOpacity={0.9} stroke="rgba(0,0,0,0.5)" strokeWidth="1"/>
      })}
    </svg>
  )
}

// ─── Comparaison 2 joueurs ───────────────────────────────────────────────
function CompareView({ players, getStats }) {
  const [p1idx, setP1idx] = useState(0)
  const [p2idx, setP2idx] = useState(Math.min(1, players.length-1))

  const p1 = players[p1idx], p2 = players[p2idx]
  if (!p1 || !p2) return null
  const s1 = getStats(p1, p1idx), s2 = getStats(p2, p2idx)

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

  const sel = { background: '#0d0f18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', cursor: 'pointer', flex: 1 }

  return (
    <div>
      {/* Sélecteurs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <select value={p1idx} onChange={e=>setP1idx(+e.target.value)} style={sel}>
          {players.map((p,i) => <option key={p.id} value={i}>#{p.number} {p.name}</option>)}
        </select>
        <div style={{ textAlign:'center', fontSize:13, color:'#4b5563', fontWeight:700 }}>vs</div>
        <select value={p2idx} onChange={e=>setP2idx(+e.target.value)} style={sel}>
          {players.map((p,i) => <option key={p.id} value={i}>#{p.number} {p.name}</option>)}
        </select>
      </div>

      {/* Headers face-à-face */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[{p:p1,color:'#6366f1'},{p:p2,color:'#ec4899'}].map(({p,color})=>(
          <div key={p.id} style={{ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:800, color }}>{`#${p.number}`}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', marginTop:2 }}>{p.name}</div>
            <div style={{ fontSize:11, color:'#6b7280' }}>{p.position}</div>
          </div>
        ))}
      </div>

      {/* Barres miroir */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {metrics.map(({label, v1, v2, max}) => {
          const p1wins = v1 >= v2
          return (
            <div key={label}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:700, color: p1wins ? '#818cf8' : '#6b7280' }}>{v1}</span>
                <span style={{ fontSize:11, color:'#4b5563' }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:700, color: !p1wins ? '#f472b6' : '#6b7280' }}>{v2}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3 }}>
                {/* Barre p1 → droite */}
                <div style={{ height:5, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden', direction:'rtl' }}>
                  <div style={{ height:'100%', width:`${Math.min((v1/max)*100,100)}%`, background:'#6366f1', borderRadius:99, opacity: p1wins ? 1 : 0.4 }}/>
                </div>
                {/* Barre p2 → gauche */}
                <div style={{ height:5, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min((v2/max)*100,100)}%`, background:'#ec4899', borderRadius:99, opacity: !p1wins ? 1 : 0.4 }}/>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Progression match par match ─────────────────────────────────────────
function ProgressionView({ matches }) {
  const [metric, setMetric] = useState('possession')

  const metrics = [
    { id:'possession', label:'Possession', color:'#6366f1', key: m => m.stats?.possession || 58, suffix:'%' },
    { id:'passes', label:'Passes', color:'#3b82f6', key: m => m.stats?.passes || 178, suffix:'' },
    { id:'shots', label:'Tirs', color:'#f59e0b', key: m => m.stats?.shots || 8, suffix:'' },
  ]
  const current = metrics.find(m=>m.id===metric)

  const data = matches.length > 0
    ? matches.map((m, i) => ({
        match: m.opponent ? `vs ${m.opponent.split(' ')[0]}` : `M${i+1}`,
        score: m.score_home !== null ? `${m.score_home}-${m.score_away}` : null,
        val: current.key(m),
        result: m.score_home > m.score_away ? 'V' : m.score_home < m.score_away ? 'D' : 'N',
      }))
    : [
        { match:'vs Amiens', score:'0-1', val:44, result:'D' },
        { match:'vs Reims', score:'1-1', val:52, result:'N' },
        { match:'vs Metz', score:'1-2', val:48, result:'D' },
        { match:'vs Valois', score:'1-0', val:56, result:'V' },
        { match:'vs Balagne', score:'2-0', val:61, result:'V' },
        { match:'vs Charlev.', score:'3-1', val:63, result:'V' },
        { match:'vs St-Q.', score:'0-0', val:46, result:'N' },
      ]

  const maxVal = Math.max(...data.map(d=>d.val))
  const resultColor = { V:'#10b981', N:'#f59e0b', D:'#ef4444' }

  return (
    <div>
      {/* Switcher */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {metrics.map(m => (
          <button key={m.id} onClick={()=>setMetric(m.id)} style={{
            padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
            background: metric===m.id ? m.color : 'rgba(255,255,255,0.04)',
            color: metric===m.id ? '#fff' : '#6b7280',
            transition:'all 0.15s',
          }}>{m.label}</button>
        ))}
      </div>

      {/* Graphique barres */}
      <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:10, fontWeight:700, color:current.color }}>{d.val}{current.suffix}</span>
            <div style={{ width:'100%', height: Math.max(8, (d.val/maxVal)*90), background:current.color, borderRadius:'4px 4px 0 0', opacity:0.8 }}/>
            <span style={{ fontSize:9, color:'#4b5563', textAlign:'center', whiteSpace:'nowrap' }}>{d.match}</span>
            {d.score && (
              <span style={{ fontSize:9, fontWeight:700, color: resultColor[d.result] || '#6b7280' }}>{d.score}</span>
            )}
          </div>
        ))}
      </div>

      {/* Légende résultats */}
      <div style={{ display:'flex', gap:12, marginTop:10, justifyContent:'center' }}>
        {[{r:'V',c:'#10b981',l:'Victoire'},{r:'N',c:'#f59e0b',l:'Nul'},{r:'D',c:'#ef4444',l:'Défaite'}].map(x=>(
          <div key={x.r} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:x.c }}/>
            <span style={{ fontSize:11, color:'#6b7280' }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TEAM_HEAT = [
  { x: 25, y: 50, intensity: 0.9 }, { x: 50, y: 30, intensity: 0.8 },
  { x: 50, y: 70, intensity: 0.7 }, { x: 70, y: 50, intensity: 0.95 },
  { x: 60, y: 25, intensity: 0.6 }, { x: 60, y: 75, intensity: 0.65 },
  { x: 80, y: 40, intensity: 0.75 }, { x: 80, y: 60, intensity: 0.7 },
  { x: 35, y: 40, intensity: 0.5 }, { x: 35, y: 60, intensity: 0.55 },
]

const POS_HEAT = {
  'Gardien':   [{ x: 8, y: 50, intensity: 0.95 }, { x: 15, y: 35, intensity: 0.6 }, { x: 15, y: 65, intensity: 0.6 }],
  'Défenseur': [{ x: 22, y: 30, intensity: 0.8 }, { x: 22, y: 70, intensity: 0.8 }, { x: 32, y: 50, intensity: 0.6 }, { x: 42, y: 45, intensity: 0.4 }],
  'Milieu':    [{ x: 40, y: 50, intensity: 0.9 }, { x: 55, y: 35, intensity: 0.7 }, { x: 55, y: 65, intensity: 0.7 }, { x: 65, y: 50, intensity: 0.6 }],
  'Attaquant': [{ x: 75, y: 50, intensity: 0.9 }, { x: 85, y: 35, intensity: 0.8 }, { x: 85, y: 65, intensity: 0.75 }, { x: 65, y: 45, intensity: 0.5 }],
}

// Zones événements par poste
const POS_EVENTS = {
  'Gardien': [
    { x:10, y:50, i:0.9, type:'won' }, { x:16, y:35, i:0.65, type:'won' }, { x:16, y:65, i:0.6, type:'won' },
    { x:20, y:52, i:0.5, type:'lost' },
  ],
  'Défenseur': [
    { x:22, y:28, i:0.85, type:'won' }, { x:22, y:72, i:0.8, type:'won' }, { x:35, y:50, i:0.7, type:'won' },
    { x:40, y:35, i:0.55, type:'lost' }, { x:42, y:60, i:0.5, type:'lost' },
    { x:55, y:42, i:0.65, type:'shot' },
  ],
  'Milieu': [
    { x:42, y:50, i:0.9, type:'won' }, { x:55, y:32, i:0.7, type:'won' }, { x:58, y:68, i:0.65, type:'won' },
    { x:65, y:45, i:0.55, type:'lost' }, { x:68, y:60, i:0.5, type:'lost' },
    { x:72, y:40, i:0.75, type:'shot' }, { x:76, y:55, i:0.7, type:'shot' },
  ],
  'Attaquant': [
    { x:72, y:48, i:0.75, type:'won' }, { x:82, y:35, i:0.65, type:'won' },
    { x:38, y:50, i:0.55, type:'lost' }, { x:45, y:38, i:0.5, type:'lost' }, { x:48, y:62, i:0.45, type:'lost' },
    { x:80, y:42, i:0.9, type:'shot' }, { x:84, y:55, i:0.85, type:'shot' }, { x:88, y:48, i:0.8, type:'shot' },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function StatBar({ label, value, max, color = '#6366f1', suffix = '' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 700 }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

function Card({ title, subtitle, children, style = {} }) {
  return (
    <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px', ...style }}>
      {title && <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: '#4b5563', marginTop: 3 }}>{subtitle}</p>}
      </div>}
      {children}
    </div>
  )
}

const TT = {
  contentStyle: { backgroundColor: '#0d0f18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 },
  labelStyle: { color: '#94a3b8' },
}

function getPlayerStats(player, idx) {
  const isAtt = player.position === 'Attaquant'
  const isMil = player.position === 'Milieu'
  return {
    touches: 58 - idx * 2,
    passes: 40 - idx * 2,
    passesSuccess: 86 - idx,
    ballsWon: 8 - Math.floor(idx / 2),
    ballsLost: 3 + Math.floor(idx / 3),
    shots: isAtt ? 6 - Math.floor(idx / 2) : 2,
    goals: isAtt ? Math.max(0, 4 - Math.floor(idx / 2)) : idx < 2 ? 1 : 0,
    assists: isMil ? Math.max(0, 4 - Math.floor(idx / 2)) : 1,
    km: (9.5 - idx * 0.15).toFixed(1),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function Statistics() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('collective')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [indivTab, setIndivTab] = useState('stats') // 'stats' | 'terrain' | 'compare' | 'progression'

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [md, pd] = await Promise.all([matchService.getMatches(), playerService.getPlayers()])
      const completed = md.filter(m => m.status?.toUpperCase() === 'COMPLETED')
      setMatches(completed)
      setPlayers(pd)
      if (pd.length > 0) setSelectedPlayer(pd[0])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
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
    { cat: 'Possession', val: avgPoss },
    { cat: 'Passes', val: 82 },
    { cat: 'Pressing', val: 74 },
    { cat: 'Défense', val: 78 },
    { cat: 'Finition', val: Math.round((totalGoals / Math.max(totalShots, 1)) * 100) || 60 },
  ]

  const monthlyData = [
    { month: 'Nov', victoires: 1, nuls: 0, defaites: 1 },
    { month: 'Déc', victoires: 2, nuls: 1, defaites: 0 },
    { month: 'Jan', victoires: 2, nuls: 0, defaites: 1 },
    { month: 'Fév', victoires: 2, nuls: 0, defaites: 1 },
  ]

  const sel = {
    background: '#0d0f18', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10, padding: '9px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', cursor: 'pointer',
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Statistiques</h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Saison 2025-2026 · U14 JS Cugnaux</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} style={sel}>
              <option value="all">Toute la saison</option>
              <option value="month">30 derniers jours</option>
              <option value="week">7 derniers jours</option>
            </select>
            <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <Download size={14} /> PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[{ id: 'collective', label: '⚽  Collectives' }, { id: 'individual', label: '👤  Individuelles' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 22px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              background: tab === t.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              color: tab === t.id ? '#fff' : '#6b7280',
              boxShadow: tab === t.id ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
              transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ─── COLLECTIVE ─── */}
      {tab === 'collective' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Bilan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'Matchs joués', value: N || 7, color: '#6366f1' },
              { label: 'Victoires', value: wins || 4, color: '#10b981' },
              { label: 'Nuls', value: draws || 1, color: '#f59e0b' },
              { label: 'Défaites', value: losses || 2, color: '#ef4444' },
            ].map((s, i) => (
              <div key={s.label} style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.06)', borderBottom: `3px solid ${s.color}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 38, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {/* Possession */}
            <Card title="Possession de balle" subtitle="Moyenne sur la saison">
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 14px' }}>
                <div style={{ position: 'relative', width: 130, height: 130 }}>
                  <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="13" />
                    <circle cx="65" cy="65" r="52" fill="none" stroke="#6366f1" strokeWidth="13"
                      strokeDasharray={`${(avgPoss / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{avgPoss}%</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>moy.</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>68%</div>
                  <div style={{ fontSize: 11, color: '#4b5563' }}>Max</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>48%</div>
                  <div style={{ fontSize: 11, color: '#4b5563' }}>Min</div>
                </div>
              </div>
            </Card>

            {/* Passes */}
            <Card title="Passes" subtitle="Total & précision">
              <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
                <div style={{ fontSize: 46, fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>{totalPasses}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>passes totales</div>
              </div>
              <StatBar label="Passes courtes" value={82} max={100} color="#3b82f6" suffix="%" />
              <StatBar label="Passes longues" value={61} max={100} color="#06b6d4" suffix="%" />
              <StatBar label="Précision globale" value={78} max={100} color="#6366f1" suffix="%" />
            </Card>

            {/* Tirs */}
            <Card title="Tirs" subtitle="Cadrés vs total">
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0 16px' }}>
                {[
                  { val: totalShots, label: 'Total tirs', color: '#f59e0b' },
                  { val: totalSOT, label: 'Cadrés', color: '#10b981' },
                  { val: totalGoals, label: 'Buts', color: '#6366f1' },
                ].map((v, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: v.color, lineHeight: 1 }}>{v.val}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{v.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((totalSOT / Math.max(totalShots, 1)) * 100)}%`, background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: 99 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontSize: 11, color: '#4b5563' }}>Taux de cadrage</span>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>{Math.round((totalSOT / Math.max(totalShots, 1)) * 100)}%</span>
              </div>
            </Card>
          </div>

          {/* Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {/* KM */}
            <Card title="Distance parcourue" subtitle="Cumulé équipe saison">
              <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
                <div style={{ fontSize: 50, fontWeight: 800, color: '#10b981', lineHeight: 1 }}>{totalKm}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>km total</div>
              </div>
              <StatBar label="Moy. par match" value={85} max={120} color="#10b981" suffix=" km" />
              <StatBar label="Moy. par joueur/match" value={8} max={12} color="#22c55e" suffix=" km" />
              <StatBar label="Part sprints" value={32} max={50} color="#86efac" suffix="%" />
            </Card>

            {/* Radar */}
            <Card title="Performance globale">
              <ResponsiveContainer width="100%" height={195}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="cat" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#374151" tick={{ fontSize: 9 }} domain={[0, 100]} />
                  <Radar dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  <Tooltip {...TT} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Heatmap */}
            <Card title="Heatmap équipe" subtitle="Zones de présence collectives">
              <Heatmap data={TEAM_HEAT} />
            </Card>
          </div>

          {/* Monthly */}
          <Card title="Résultats mensuels">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={monthlyData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 12 }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 12 }} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="victoires" fill="#10b981" name="Victoires" radius={[4,4,0,0]} />
                <Bar dataKey="nuls" fill="#f59e0b" name="Nuls" radius={[4,4,0,0]} />
                <Bar dataKey="defaites" fill="#ef4444" name="Défaites" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ─── INDIVIDUAL ─── */}
      {tab === 'individual' && (
        <div>
          {/* Sous-onglets */}
          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
            {[
              { id:'stats', label:'📊 Stats' },
              { id:'terrain', label:'🗺 Terrain' },
              { id:'compare', label:'⚖️ Comparer' },
              { id:'progression', label:'📈 Progression' },
            ].map(t => (
              <button key={t.id} onClick={()=>setIndivTab(t.id)} style={{
                padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer', fontWeight:600, fontSize:13,
                background: indivTab===t.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.04)',
                color: indivTab===t.id ? '#fff' : '#6b7280',
                boxShadow: indivTab===t.id ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                transition:'all 0.2s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Vue Progression — pas besoin de joueur sélectionné */}
          {indivTab === 'progression' && (
            <Card title="Progression match par match" subtitle="Évolution des métriques clés sur la saison">
              <ProgressionView matches={matches}/>
            </Card>
          )}

          {/* Vue Comparer */}
          {indivTab === 'compare' && (
            <Card title="Comparaison joueurs" subtitle="Affrontez 2 joueurs sur les métriques clés">
              <CompareView players={players} getStats={getPlayerStats}/>
            </Card>
          )}

          {/* Vues qui nécessitent un joueur sélectionné */}
          {(indivTab === 'stats' || indivTab === 'terrain') && (
            <div style={{ display: 'flex', gap: 14 }}>
              {/* List */}
              <div style={{ width: 210, flexShrink: 0, background: '#0d0f18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', alignSelf: 'flex-start' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Joueurs ({players.length})</p>
                </div>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {players.map((p) => {
                    const isSelected = selectedPlayer?.id === p.id
                    return (
                      <div key={p.id} onClick={() => setSelectedPlayer(p)} style={{
                        padding: '10px 16px', cursor: 'pointer',
                        background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                        borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s',
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#818cf8' : '#e2e8f0' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#4b5563', marginTop: 1 }}>{p.position} · #{p.number}</div>
                        </div>
                        {isSelected && <ChevronRight size={13} color="#6366f1" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Detail */}
              {selectedPlayer && (() => {
                const idx = players.findIndex(p => p.id === selectedPlayer.id)
                const s = getPlayerStats(selectedPlayer, idx)
                const matchEvolution = Array.from({ length: 7 }, (_, i) => ({
                  match: `M${i + 1}`,
                  touches: Math.max(20, s.touches + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 12)),
                  passes: Math.max(10, s.passes + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 8)),
                }))
                return (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Header joueur */}
                    <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#818cf8', flexShrink: 0 }}>
                        #{selectedPlayer.number}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9' }}>{selectedPlayer.name}</h2>
                        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{selectedPlayer.position} · {selectedPlayer.category}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 24 }}>
                        {[
                          { label: 'Buts', value: s.goals, color: '#10b981' },
                          { label: 'Passes D.', value: s.assists, color: '#6366f1' },
                          { label: 'Km moy.', value: s.km, color: '#f59e0b' },
                        ].map(v => (
                          <div key={v.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: v.color }}>{v.value}</div>
                            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{v.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ─ Vue Stats ─ */}
                    {indivTab === 'stats' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Card title="Statistiques détaillées">
                          <StatBar label="Ballons touchés" value={s.touches} max={80} color="#6366f1" />
                          <StatBar label="Passes réussies" value={s.passesSuccess} max={100} color="#3b82f6" suffix="%" />
                          <StatBar label="Ballons gagnés" value={s.ballsWon} max={15} color="#10b981" />
                          <StatBar label="Ballons perdus" value={s.ballsLost} max={15} color="#ef4444" />
                          <StatBar label="Tirs tentés" value={s.shots} max={10} color="#f59e0b" />
                          <StatBar label="Distance parcourue" value={parseFloat(s.km)} max={12} color="#22c55e" suffix=" km" />
                        </Card>
                        <Card title="Heatmap individuelle" subtitle={`Zones de présence — ${selectedPlayer.position}`}>
                          <Heatmap data={POS_HEAT[selectedPlayer.position] || POS_HEAT['Milieu']} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                            {[
                              { label: 'Touches', value: s.touches, color: '#6366f1' },
                              { label: 'Passes', value: s.passes, color: '#3b82f6' },
                              { label: 'Gagnés', value: s.ballsWon, color: '#10b981' },
                              { label: 'Perdus', value: s.ballsLost, color: '#ef4444' },
                            ].map(v => (
                              <div key={v.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: v.color }}>{v.value}</div>
                                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{v.label}</div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* ─ Vue Terrain ─ */}
                    {indivTab === 'terrain' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Card title="Zones d'action" subtitle="Ballons gagnés · perdus · tirs">
                          <EventHeatmap events={POS_EVENTS[selectedPlayer.position] || POS_EVENTS['Milieu']}/>
                          {/* Légende */}
                          <div style={{ display:'flex', gap:14, marginTop:10 }}>
                            {[{c:'#10b981',l:'Gagnés'},{c:'#ef4444',l:'Perdus'},{c:'#f59e0b',l:'Tirs'}].map(x=>(
                              <div key={x.l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                                <div style={{ width:8, height:8, borderRadius:'50%', background:x.c }}/>
                                <span style={{ fontSize:11, color:'#6b7280' }}>{x.l}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                          {[
                            { val:s.ballsWon, label:'Ballons gagnés', color:'#10b981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.2)' },
                            { val:s.ballsLost, label:'Ballons perdus', color:'#ef4444', bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.2)' },
                            { val:s.shots, label:'Tirs tentés', color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)' },
                            { val:s.goals, label:'Buts marqués', color:'#6366f1', bg:'rgba(99,102,241,0.08)', border:'rgba(99,102,241,0.2)' },
                          ].map(x=>(
                            <div key={x.label} style={{ background:x.bg, border:`1px solid ${x.border}`, borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <span style={{ fontSize:13, color:'#94a3b8' }}>{x.label}</span>
                              <span style={{ fontSize:28, fontWeight:800, color:x.color }}>{x.val}</span>
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
        select option { background: #0d0f18; }
      `}</style>
    </DashboardLayout>
  )
}
