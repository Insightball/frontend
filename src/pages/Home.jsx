import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, BarChart3, Users, TrendingUp, CheckCircle2, ArrowRight, Sparkles, Zap, Target, Mail, Phone, MapPin, Send, Clock, Shield, Camera, FileText, Activity } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// ─── Terrain SVG passes entre joueurs ─────────────────────────────────────
function PassMap() {
  const W = 560, H = 200
  // Positions des lignes sur le terrain (% → px)
  // GK=1, Def-gauche=3, Def-central=4, Def-droit=5, Mil-gauche=7, Mil-central=8, Mil-droit=10, Att-gauche=11, Att-central=9
  const nodes = [
    { id: 1,  label: 'G',   x: 40,  y: 100, color: '#f59e0b' },
    { id: 3,  label: 'DG',  x: 110, y: 55,  color: '#3b82f6' },
    { id: 4,  label: 'DC',  x: 110, y: 100, color: '#3b82f6' },
    { id: 5,  label: 'DD',  x: 110, y: 145, color: '#3b82f6' },
    { id: 7,  label: 'MG',  x: 230, y: 60,  color: '#10b981' },
    { id: 8,  label: 'MC',  x: 230, y: 100, color: '#10b981' },
    { id: 10, label: 'MD',  x: 230, y: 140, color: '#10b981' },
    { id: 9,  label: 'ATT',  x: 380, y: 75,  color: '#ef4444' },
    { id: 11, label: 'ATT', x: 380, y: 125, color: '#ef4444' },
  ]
  const edges = [
    { from: 1, to: 4,   n: 48 }, { from: 1, to: 3,   n: 22 }, { from: 1, to: 5,   n: 20 },
    { from: 4, to: 8,   n: 61 }, { from: 3, to: 7,   n: 44 }, { from: 5, to: 10,  n: 38 },
    { from: 3, to: 4,   n: 35 }, { from: 4, to: 5,   n: 31 }, { from: 7, to: 8,   n: 55 },
    { from: 8, to: 10,  n: 42 }, { from: 7, to: 10,  n: 18 }, { from: 8, to: 9,   n: 47 },
    { from: 8, to: 11,  n: 33 }, { from: 7, to: 9,   n: 28 }, { from: 10, to: 11, n: 25 },
    { from: 9, to: 11,  n: 16 },
  ]
  const maxN = Math.max(...edges.map(e => e.n))
  const byId = {}
  nodes.forEach(n => byId[n.id] = n)
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 8 }}>
      {/* Terrain */}
      <rect width={W} height={H} fill="#0a1a0a" rx="6"/>
      <rect x={12} y={10} width={W-24} height={H-20} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" rx="3"/>
      <line x1={W/2} y1={10} x2={W/2} y2={H-10} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <circle cx={W/2} cy={H/2} r={30} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <rect x={12} y={H/2-28} width={44} height={56} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <rect x={W-56} y={H/2-28} width={44} height={56} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {/* Arrows */}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(99,102,241,0.7)"/>
        </marker>
      </defs>
      {edges.map((e, i) => {
        const a = byId[e.from], b = byId[e.to]
        const thick = 0.5 + (e.n / maxN) * 4
        const alpha = 0.15 + (e.n / maxN) * 0.65
        const dx = b.x - a.x, dy = b.y - a.y
        const len = Math.sqrt(dx*dx + dy*dy)
        const ex = b.x - (dx/len)*14, ey = b.y - (dy/len)*14
        return (
          <line key={i} x1={a.x} y1={a.y} x2={ex} y2={ey}
            stroke={`rgba(99,102,241,${alpha})`} strokeWidth={thick}
            markerEnd="url(#arr)"/>
        )
      })}
      {/* Nodes */}
      {nodes.map(n => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={13} fill={n.color} fillOpacity={0.18} stroke={n.color} strokeWidth="1.5"/>
          <text x={n.x} y={n.y+4} textAnchor="middle" fontSize="9" fontWeight="700" fill={n.color}>{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ─── Heatmap ballons gagnés/perdus ─────────────────────────────────────────
function BallEventMap({ won, lost }) {
  const W = 280, H = 175
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 8 }}>
      <rect width={W} height={H} fill="#0a1a0a" rx="6"/>
      <rect x={6} y={6} width={W-12} height={H-12} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" rx="3"/>
      <line x1={W/2} y1={6} x2={W/2} y2={H-6} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <circle cx={W/2} cy={H/2} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {/* Won = green blobs */}
      {won.map((pt, i) => (
        <circle key={"w"+i} cx={6+(pt.x/100)*(W-12)} cy={6+(pt.y/100)*(H-12)}
          r={10+pt.i*8} fill={`rgba(16,185,129,${0.12+pt.i*0.35})`} style={{filter:"blur(6px)"}}/>
      ))}
      {/* Lost = red blobs */}
      {lost.map((pt, i) => (
        <circle key={"l"+i} cx={6+(pt.x/100)*(W-12)} cy={6+(pt.y/100)*(H-12)}
          r={10+pt.i*8} fill={`rgba(239,68,68,${0.12+pt.i*0.35})`} style={{filter:"blur(6px)"}}/>
      ))}
      {/* Légende */}
      <circle cx={14} cy={H-10} r={5} fill="rgba(16,185,129,0.7)"/>
      <text x={22} y={H-7} fontSize="8" fill="#10b981">Gagnés</text>
      <circle cx={68} cy={H-10} r={5} fill="rgba(239,68,68,0.7)"/>
      <text x={76} y={H-7} fontSize="8" fill="#ef4444">Perdus</text>
    </svg>
  )
}

// ─── Mini Heatmap SVG ─────────────────────────────────────────────────────
function MiniHeatmap({ data }) {
  const W = 280, H = 175
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 8 }}>
      <rect width={W} height={H} fill="#0a1a0a" rx="6"/>
      <rect x={6} y={6} width={W-12} height={H-12} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" rx="3"/>
      <line x1={W/2} y1={6} x2={W/2} y2={H-6} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <circle cx={W/2} cy={H/2} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <rect x={6} y={H/2-22} width={36} height={44} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <rect x={W-42} y={H/2-22} width={36} height={44} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {data.map((pt, i) => (
        <circle key={i} cx={6+(pt.x/100)*(W-12)} cy={6+(pt.y/100)*(H-12)}
          r={14+pt.i*10} fill={`rgba(99,102,241,${0.1+pt.i*0.45})`}
          style={{filter:`blur(${7+pt.i*5}px)`}}/>
      ))}
    </svg>
  )
}

function StatBar({ label, value, max, color }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 11, color: '#f1f5f9', fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min((value/max)*100,100)}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

const TT = {
  contentStyle: { backgroundColor: '#0d0f18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8', fontSize: 11 },
}

// Effectif GFCA N3 2025/2026
const PLAYERS = [
  { name: 'Cyril Fogacci',       pos: 'Gardien',    num: 1,  goals: 0, assists: 0, shots: 0, shotsOn: 0, touches: 24, passes: 16, km: 4.1, won: 5,  lost: 1,
    heat: [{ x:8, y:50, i:0.95 }, { x:15, y:32, i:0.55 }, { x:15, y:68, i:0.55 }],
    wonZones: [{ x:12, y:50, i:0.9 }, { x:18, y:35, i:0.6 }],
    lostZones: [{ x:15, y:55, i:0.5 }] },
  { name: 'Hassein Mersni',      pos: 'Défenseur',  num: 3,  goals: 0, assists: 1, shots: 1, shotsOn: 0, touches: 51, passes: 38, km: 9.1, won: 13, lost: 3,
    heat: [{ x:20, y:28, i:0.85 }, { x:28, y:50, i:0.65 }, { x:20, y:72, i:0.7 }],
    wonZones: [{ x:22, y:30, i:0.8 }, { x:30, y:50, i:0.6 }, { x:22, y:70, i:0.75 }],
    lostZones: [{ x:38, y:35, i:0.6 }, { x:42, y:55, i:0.5 }] },
  { name: 'Max Bonalair',        pos: 'Défenseur',  num: 4,  goals: 1, assists: 2, shots: 3, shotsOn: 1, touches: 54, passes: 41, km: 9.4, won: 14, lost: 2,
    heat: [{ x:18, y:38, i:0.8 }, { x:25, y:55, i:0.7 }, { x:35, y:40, i:0.5 }],
    wonZones: [{ x:20, y:40, i:0.85 }, { x:28, y:58, i:0.65 }],
    lostZones: [{ x:40, y:38, i:0.55 }, { x:35, y:60, i:0.45 }] },
  { name: 'Naïl Kheroua',        pos: 'Milieu',     num: 8,  goals: 3, assists: 4, shots: 8, shotsOn: 5, touches: 74, passes: 61, km: 10.8, won: 13, lost: 3,
    heat: [{ x:50, y:50, i:0.9 }, { x:62, y:38, i:0.75 }, { x:62, y:62, i:0.7 }, { x:70, y:50, i:0.55 }],
    wonZones: [{ x:50, y:48, i:0.85 }, { x:62, y:35, i:0.7 }, { x:58, y:65, i:0.65 }],
    lostZones: [{ x:68, y:42, i:0.6 }, { x:72, y:60, i:0.5 }] },
  { name: 'Paul-Antoine Finidori', pos: 'Milieu',   num: 10, goals: 2, assists: 5, shots: 5, shotsOn: 3, touches: 71, passes: 60, km: 11.1, won: 12, lost: 3,
    heat: [{ x:48, y:48, i:0.85 }, { x:60, y:33, i:0.7 }, { x:60, y:63, i:0.7 }],
    wonZones: [{ x:48, y:45, i:0.8 }, { x:60, y:32, i:0.65 }, { x:62, y:62, i:0.6 }],
    lostZones: [{ x:70, y:50, i:0.55 }, { x:65, y:38, i:0.45 }] },
  { name: 'Nolan Dangoumau',     pos: 'Attaquant',  num: 11, goals: 5, assists: 2, shots: 14, shotsOn: 8, touches: 55, passes: 39, km: 9.5, won: 9,  lost: 4,
    heat: [{ x:78, y:50, i:0.9 }, { x:85, y:35, i:0.8 }, { x:85, y:65, i:0.75 }],
    wonZones: [{ x:75, y:48, i:0.7 }, { x:82, y:35, i:0.6 }],
    lostZones: [{ x:35, y:50, i:0.55 }, { x:45, y:38, i:0.5 }, { x:45, y:62, i:0.45 }] },
  { name: 'Noah Randazzo',       pos: 'Attaquant',  num: 9,  goals: 4, assists: 3, shots: 11, shotsOn: 6, touches: 58, passes: 43, km: 9.8, won: 10, lost: 3,
    heat: [{ x:80, y:42, i:0.85 }, { x:88, y:52, i:0.8 }, { x:74, y:58, i:0.6 }],
    wonZones: [{ x:78, y:42, i:0.7 }, { x:85, y:55, i:0.65 }],
    lostZones: [{ x:40, y:52, i:0.5 }, { x:50, y:42, i:0.45 }] },
  { name: 'Laurent Fogacci',     pos: 'Milieu',     num: 6,  goals: 2, assists: 3, shots: 4, shotsOn: 2, touches: 68, passes: 54, km: 10.3, won: 11, lost: 4,
    heat: [{ x:42, y:50, i:0.9 }, { x:55, y:35, i:0.7 }, { x:55, y:65, i:0.65 }],
    wonZones: [{ x:42, y:48, i:0.8 }, { x:55, y:34, i:0.65 }],
    lostZones: [{ x:62, y:50, i:0.55 }, { x:58, y:65, i:0.45 }] },
  { name: 'Kaïs Djellal',        pos: 'Milieu',     num: 7,  goals: 2, assists: 3, shots: 5, shotsOn: 3, touches: 62, passes: 50, km: 10.5, won: 11, lost: 3,
    heat: [{ x:55, y:50, i:0.85 }, { x:65, y:35, i:0.7 }, { x:68, y:62, i:0.6 }],
    wonZones: [{ x:55, y:48, i:0.8 }, { x:65, y:34, i:0.65 }, { x:68, y:60, i:0.55 }],
    lostZones: [{ x:72, y:48, i:0.5 }, { x:68, y:65, i:0.4 }] },
]

const avgKm = (PLAYERS.reduce((s, p) => s + p.km, 0) / PLAYERS.length).toFixed(1)

const radarData = [
  { cat: 'Possession', val: 58 },
  { cat: 'Passes', val: 74 },
  { cat: 'Pressing', val: 76 },
  { cat: 'Défense', val: 82 },
  { cat: 'Finition', val: 62 },
]

const matchData = [
  { match: 'Amiens',    poss: 44, km: 98.2,  score: '0-1', pts: 0, prev: null },
  { match: 'Reims 2',   poss: 52, km: 103.5, score: '1-1', pts: 1, prev: 0 },
  { match: 'Metz 2',    poss: 48, km: 101.8, score: '1-2', pts: 0, prev: 1 },
  { match: 'Valois',    poss: 56, km: 105.3, score: '1-0', pts: 3, prev: 0 },
  { match: 'Balagne',   poss: 61, km: 108.7, score: '2-0', pts: 3, prev: 3 },
  { match: 'Charlev.',  poss: 63, km: 110.2, score: '3-1', pts: 3, prev: 3 },
  { match: 'St Quentin',poss: 46, km: 99.6,  score: '0-0', pts: 1, prev: 3 },
]

function DashboardDemo() {
  const [tab, setTab] = useState('collective')
  const [selectedPlayer, setSelectedPlayer] = useState(PLAYERS[0])
  const [comparePlayer, setComparePlayer] = useState(null)
  const [indivView, setIndivView] = useState('stats') // 'stats' | 'ballmap' | 'compare'
  const [progressMetric, setProgressMetric] = useState('poss')

  const tabStyle = (t) => ({
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: 12, transition: 'all 0.2s',
    background: tab === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
    color: tab === t ? '#fff' : '#6b7280',
    boxShadow: tab === t ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
  })

  const microBtn = (active, onClick, label) => (
    <button onClick={onClick} style={{
      padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
      background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
      color: active ? '#818cf8' : '#4b5563', transition: 'all 0.15s',
    }}>{label}</button>
  )

  const CP = comparePlayer  // shorthand

  return (
    <div style={{ background: '#080a12', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 0 60px rgba(99,102,241,0.1)' }}>
      {/* Browser bar */}
      <div style={{ background: '#0d0f1a', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }}/>)}
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#4b5563', fontFamily: 'monospace' }}>app.insightball.com · Dashboard</span>
        </div>
        <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, background: 'rgba(99,102,241,0.1)', padding: '3px 8px', borderRadius: 6 }}>DÉMO</div>
      </div>

      {/* Main tabs */}
      <div style={{ padding: '12px 18px 0', display: 'flex', gap: 4, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button style={tabStyle('collective')} onClick={() => setTab('collective')}>⚽ Collectif</button>
        <button style={tabStyle('individual')} onClick={() => setTab('individual')}>👤 Individuelles</button>
      </div>

      <div style={{ padding: '16px' }}>

        {/* ══════════ COLLECTIVE ══════════ */}
        {tab === 'collective' && (
          <div>
            {/* Bilan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Matchs', value: 7, color: '#6366f1' },
                { label: 'Victoires', value: 3, color: '#10b981' },
                { label: 'Nuls', value: 2, color: '#f59e0b' },
                { label: 'Défaites', value: 2, color: '#ef4444' },
                { label: 'Km moy.', value: avgKm, color: '#22c55e' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderBottom: `2px solid ${s.color}`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              {/* Possession */}
              <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>Possession moy.</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#6366f1" strokeWidth="8"
                        strokeDasharray={`${0.53*2*Math.PI*32} ${2*Math.PI*32}`} strokeLinecap="round"/>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>53%</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Stats clés */}
              <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>Passes & Tirs</p>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {[{val:1142,label:'passes',color:'#3b82f6'},{val:32,label:'tirs',color:'#f59e0b'},{val:11,label:'buts',color:'#10b981'}].map(v=>(
                    <div key={v.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: v.color }}>{v.val}</div>
                      <div style={{ fontSize: 9, color: '#4b5563' }}>{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Radar */}
              <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>Performance</p>
                <ResponsiveContainer width="100%" height={100}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)"/>
                    <PolarAngleAxis dataKey="cat" stroke="#6b7280" tick={{ fontSize: 8 }}/>
                    <PolarRadiusAxis stroke="#374151" tick={false} domain={[0,100]}/>
                    <Radar dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Passes entre joueurs */}
            <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>🔗 Réseau de passes — 7 matchs</p>
              <PassMap/>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                {[{label:'G',color:'#f59e0b',desc:'Gardien'},{label:'D',color:'#3b82f6',desc:'Défenseurs'},{label:'M',color:'#10b981',desc:'Milieux'},{label:'ATT',color:'#ef4444',desc:'Attaquants'}].map(l=>(
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, opacity: 0.8 }}/>
                    <span style={{ fontSize: 10, color: '#6b7280' }}>{l.desc}</span>
                  </div>
                ))}
                <span style={{ fontSize: 10, color: '#4b5563', marginLeft: 'auto' }}>Épaisseur = fréquence des passes</span>
              </div>
            </div>

            {/* Suivi progression */}
            <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Suivi progression</p>
                <div style={{ display: 'flex', gap: 5 }}>
                  {microBtn(progressMetric==='poss', ()=>setProgressMetric('poss'), 'Possession')}
                  {microBtn(progressMetric==='km', ()=>setProgressMetric('km'), 'Km')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                {matchData.map((m) => {
                  const curr = progressMetric==='poss' ? m.poss : m.km
                  const prev = m.prev
                  const trend = prev===null ? null : curr > prev ? '↑' : curr < prev ? '↓' : '→'
                  const tc = trend==='↑' ? '#10b981' : trend==='↓' ? '#ef4444' : '#f59e0b'
                  return (
                    <div key={m.match} style={{ flex:1, background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'7px 4px', textAlign:'center', border:'1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: 8, color: '#4b5563', marginBottom: 3 }}>{m.match}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#f1f5f9' }}>{progressMetric==='poss' ? `${curr}%` : `${curr}`}</div>
                      <div style={{ fontSize: 9, color: '#6b7280' }}>{m.score}</div>
                      {trend && <div style={{ fontSize: 12, color: tc, fontWeight: 700 }}>{trend}</div>}
                    </div>
                  )
                })}
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={matchData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="match" stroke="#4b5563" tick={{ fontSize: 8 }}/>
                  <YAxis stroke="#4b5563" tick={{ fontSize: 8 }} domain={progressMetric==='poss' ? [30,80] : [90,120]}/>
                  <Tooltip {...TT} formatter={(v)=>[progressMetric==='poss'?`${v}%`:`${v} km`, progressMetric==='poss'?'Possession':'Distance']}/>
                  <Bar dataKey={progressMetric} fill="#6366f1" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══════════ INDIVIDUAL ══════════ */}
        {tab === 'individual' && (
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Sidebar joueurs */}
            <div style={{ width: 150, flexShrink: 0, maxHeight: 480, overflowY: 'auto' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Joueurs</p>
              {PLAYERS.map((p) => {
                const isSel = selectedPlayer.name === p.name
                const isCmp = CP && CP.name === p.name
                return (
                  <div key={p.name} style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 3,
                    background: isSel ? 'rgba(99,102,241,0.14)' : isCmp ? 'rgba(236,72,153,0.1)' : 'rgba(255,255,255,0.02)',
                    border: isSel ? '1px solid rgba(99,102,241,0.35)' : isCmp ? '1px solid rgba(236,72,153,0.3)' : '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isSel ? '#818cf8' : isCmp ? '#f472b6' : '#e2e8f0' }}>#{p.num} {p.name.split(' ')[0]}</div>
                    <div style={{ fontSize: 9, color: '#4b5563', marginTop: 1 }}>{p.pos}</div>
                    {indivView==='compare' && !isSel && (
                      <button onClick={e=>{e.stopPropagation();setComparePlayer(CP?.name===p.name?null:p)}}
                        style={{ marginTop: 4, fontSize: 9, padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer',
                          background: isCmp ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.06)', color: isCmp ? '#f472b6' : '#6b7280' }}>
                        {isCmp ? '✕ Retirer' : '+ Comparer'}
                      </button>
                    )}
                    {!isCmp && <div onClick={()=>{setSelectedPlayer(p); if(CP?.name===p.name) setComparePlayer(null)}} style={{ position:'absolute', inset:0 }}/>}
                    {isSel && <div onClick={()=>setSelectedPlayer(p)} style={{ position:'absolute', inset:0 }}/>}
                  </div>
                )
              })}
            </div>

            {/* Detail */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {microBtn(indivView==='stats',    ()=>setIndivView('stats'),   '📊 Stats')}
                {microBtn(indivView==='ballmap',  ()=>setIndivView('ballmap'), '🗺 Terrain')}
                {microBtn(indivView==='compare',  ()=>setIndivView('compare'), '⚖️ Comparer')}
              </div>

              {/* Header joueur sélectionné */}
              <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#818cf8', flexShrink: 0 }}>#{selectedPlayer.num}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedPlayer.name}</div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>{selectedPlayer.pos}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  {[{label:'Buts',value:selectedPlayer.goals,color:'#10b981'},{label:'P. Déc.',value:selectedPlayer.assists,color:'#6366f1'},{label:'Km/m',value:selectedPlayer.km,color:'#f59e0b'}].map(v=>(
                    <div key={v.label} style={{ textAlign:'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: v.color }}>{v.value}</div>
                      <div style={{ fontSize: 9, color: '#4b5563' }}>{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─ Vue Stats ─ */}
              {indivView==='stats' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>Stats saison</p>
                    <StatBar label="Ballons touchés" value={selectedPlayer.touches} max={80} color="#6366f1"/>
                    <StatBar label="Passes" value={selectedPlayer.passes} max={70} color="#3b82f6"/>
                    <StatBar label="Tirs" value={selectedPlayer.shots || 0} max={16} color="#f59e0b"/>
                    <StatBar label="Tirs cadrés" value={selectedPlayer.shotsOn || 0} max={10} color="#10b981"/>
                    <StatBar label="Ballons gagnés" value={selectedPlayer.won} max={18} color="#10b981"/>
                    <StatBar label="Ballons perdus" value={selectedPlayer.lost} max={10} color="#ef4444"/>
                    <StatBar label={`Km/match (moy. équipe: ${avgKm})`} value={selectedPlayer.km} max={12} color="#22c55e"/>
                  </div>
                  <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Zones de présence</p>
                    <MiniHeatmap data={selectedPlayer.heat}/>
                  </div>
                </div>
              )}

              {/* ─ Vue Terrain ballons ─ */}
              {indivView==='ballmap' && (
                <div>
                  <div style={{ background: '#0d0f18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Ballons gagnés & perdus sur le terrain</p>
                    <BallEventMap won={selectedPlayer.wonZones} lost={selectedPlayer.lostZones}/>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                      <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{selectedPlayer.won}</div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>Ballons gagnés</div>
                      </div>
                      <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{selectedPlayer.lost}</div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>Ballons perdus</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Vue Comparaison ─ */}
              {indivView==='compare' && (
                <div>
                  {!CP ? (
                    <div style={{ background: '#0d0f18', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 12, padding: '24px 16px', textAlign: 'center', color: '#4b5563', fontSize: 12 }}>
                      👈 Sélectionnez un 2ème joueur dans la liste pour comparer
                    </div>
                  ) : (
                    <div>
                      {/* Headers comparaison */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, marginBottom: 10 }}>
                        {[selectedPlayer, CP].map((p, i) => (
                          <div key={p.name} style={{ background: i===0 ? 'rgba(99,102,241,0.08)' : 'rgba(236,72,153,0.08)', border: `1px solid ${i===0?'rgba(99,102,241,0.25)":'rgba(236,72,153,0.25)'}`, borderRadius: 10, padding: '10px 12px', textAlign: i===0?'left':'right' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: i===0?'#818cf8':'#f472b6' }}>#{p.num} {p.name.split(' ')[0]}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>{p.pos}</div>
                          </div>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 16, color: '#4b5563' }}>⚖️</span>
                        </div>
                      </div>
                      {/* Barres comparaison */}
                      {[
                        { label: 'Buts', a: selectedPlayer.goals, b: CP.goals, max: 8 },
                        { label: 'Passes déc.', a: selectedPlayer.assists, b: CP.assists, max: 8 },
                        { label: 'Tirs', a: selectedPlayer.shots||0, b: CP.shots||0, max: 16 },
                        { label: 'Tirs cadrés', a: selectedPlayer.shotsOn||0, b: CP.shotsOn||0, max: 10 },
                        { label: 'Touches', a: selectedPlayer.touches, b: CP.touches, max: 80 },
                        { label: 'Passes', a: selectedPlayer.passes, b: CP.passes, max: 70 },
                        { label: 'Ballons gagnés', a: selectedPlayer.won, b: CP.won, max: 18 },
                        { label: 'Ballons perdus', a: selectedPlayer.lost, b: CP.lost, max: 10 },
                        { label: 'Km/match', a: selectedPlayer.km, b: CP.km, max: 12 },
                      ].map(row => {
                        const aW = Math.min((row.a/row.max)*100, 100)
                        const bW = Math.min((row.b/row.max)*100, 100)
                        const aWin = row.a > row.b
                        const bWin = row.b > row.a
                        return (
                          <div key={row.label} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 10, color: '#4b5563', textAlign: 'center', marginBottom: 3 }}>{row.label}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 4, alignItems: 'center' }}>
                              {/* Barre gauche (A) → vers droite */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: aWin?'#818cf8':'#4b5563' }}>{row.a}</span>
                                <div style={{ width: `${aW}%`, height: 6, background: aWin?'#6366f1':'rgba(99,102,241,0.3)', borderRadius: '99px 0 0 99px' }}/>
                              </div>
                              <div style={{ textAlign: 'center', fontSize: 9, color: '#374151' }}>{row.label.slice(0,3)}</div>
                              {/* Barre droite (B) → vers gauche */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: `${bW}%`, height: 6, background: bWin?'#ec4899':'rgba(236,72,153,0.3)', borderRadius: '0 99px 99px 0' }}/>
                                <span style={{ fontSize: 11, fontWeight: 700, color: bWin?'#f472b6':'#4b5563' }}>{row.b}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 18px', display: 'flex', justifyContent: 'flex-end', background: 'rgba(99,102,241,0.04)' }}>
        <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          Créer mon compte <ArrowRight size={14}/>
        </Link>
      </div>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────
function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleContactSubmit = (e) => {
    e.preventDefault()
    alert('Message envoyé !')
    setContactForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300" style={{
        backgroundColor: scrollY > 50 ? 'rgba(0,0,0,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(99,102,241,0.1)' : 'none',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group shrink-0">
              <img src="/logo.svg" alt="INSIGHTBALL" className="w-10 sm:w-12 h-10 sm:h-12 group-hover:scale-110 transition-transform" />
              <span className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">
                INSIGHT<span className="text-violet-400">BALL</span>
              </span>
            </Link>
            <div className="hidden lg:flex items-center gap-6 ml-auto">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Tarifs</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Connexion</Link>
              <Link to="/signup" className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all text-sm sm:text-base">
                Inscription
              </Link>
            </div>
            <div className="lg:hidden flex items-center gap-3">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Connexion</Link>
              <Link to="/signup" className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg text-sm">Inscription</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full mb-6 sm:mb-8">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-violet-400 font-medium">Analyse vidéo intelligente</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-4">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Votre match, vos statistiques
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                en 1 clic
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
              Importez votre vidéo de match et recevez un rapport clair avec statistiques collectives et individuelles, prêt à être exploité.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link to="/signup" className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-violet-500/50 transition-all flex items-center justify-center space-x-2">
                <span className="text-sm sm:text-base">Créer un compte</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#demo" className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span className="text-sm sm:text-base">Voir la démo</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full mb-4">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span className="text-xs sm:text-sm text-violet-400 font-medium">Démo interactive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Explorez la plateforme</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              Cliquez sur les onglets pour voir ce que vous recevrez après chaque match
            </p>
          </div>
          <DashboardDemo />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-purple-400 font-medium">Fonctionnalités</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">Tout ce dont vous avez besoin</h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Une plateforme complète d'analyse vidéo pour votre staff technique
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Camera, title: 'Upload en 1 clic', desc: "Uploadez votre vidéo depuis votre téléphone ou ordinateur. Notre IA fait le reste." },
              { icon: Clock, title: 'Rapport en 5 heures', desc: "Un rapport complet livré en 5 heures, avec les informations essentielles pour analyser, corriger et construire vos prochaines séances d'entraînement." },
              { icon: FileText, title: 'Rapports PDF', desc: "Exportez votre rapport avec heatmaps et statistiques détaillées. Prêt à être partagé avec le staff." },
              { icon: Users, title: "Suivi d'effectif", desc: "Suivez individuellement vos joueurs, analysez leurs performances et accompagnez leur progression au quotidien." },
              { icon: Shield, title: 'Analyse intelligente', desc: "IA développée pour le football, conçue pour analyser chaque action avec précision et cohérence." },
              { icon: Activity, title: 'Support dédié 🇫🇷', desc: "Une équipe basée en France, disponible et réactive pour répondre à vos besoins." },
            ].map((f, i) => (
              <div key={i} className="group relative p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">{f.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full mb-4">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-xs sm:text-sm text-violet-400 font-medium">Comment ça marche</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Simple comme 1, 2, 3</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              De la vidéo brute au rapport tactique professionnel en 3 étapes
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden sm:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-violet-500/30 via-purple-500/50 to-violet-500/30 z-0" />
            {[
              { step: '01', icon: '🎬', title: 'Uploadez votre vidéo', desc: 'Importez votre fichier vidéo depuis votre téléphone ou ordinateur. Tous formats acceptés — MP4, MOV, AVI.', color: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/30' },
              { step: '02', icon: '🤖', title: "L'IA analyse le match", desc: "Notre intelligence artificielle identifie chaque action et situation de jeu pour vous fournir un rapport complet en moins de 5 heures.", color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30', highlight: true },
              { step: '03', icon: '📊', title: 'Recevez votre rapport', desc: 'Accédez à vos statistiques collectives et individuelles, prêtes à être utilisées pour analyser vos performances.', color: 'from-fuchsia-500/20 to-fuchsia-500/5', border: 'border-fuchsia-500/30' },
            ].map((s, i) => (
              <div key={i} className={`relative z-10 p-6 sm:p-8 bg-gradient-to-b ${s.color} border ${s.border} rounded-2xl transition-all hover:scale-105`}>
                <div className="flex items-start justify-between mb-5">
                  <div className="text-3xl">{s.icon}</div>
                  <span className="text-xs font-bold text-gray-600 tracking-widest">{s.step}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-white">{s.title}</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{s.desc}</p>
                {s.highlight && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-xs text-purple-400 font-medium">Moins de 5h</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">Tarifs exclusifs 🎉</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Coach */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:transform hover:scale-105 transition-all">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Plan COACH</h3>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">29€</span>
                <span className="text-base sm:text-lg text-gray-400 line-through">39€</span>
                <span className="text-xs sm:text-sm text-gray-400">/mois</span>
              </div>
              <div className="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium rounded-full mb-6">
                -26% - Offre limitée
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8">
                {[
                  '3 matchs analysés / mois',
                  '1 équipe',
                  'Rapports collectifs et individuels',
                  'Suivi progression match après match',
                  'Tableau de bord complet',
                  'Support client dédié',
                  'Accessible sur ordinateur, tablette, téléphone',
                ].map((item) => (
                  <li key={item} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block w-full text-center px-6 sm:px-8 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition-all text-sm sm:text-base">
                Créer un compte
              </Link>
            </div>

            {/* Club */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-b from-violet-500/10 to-transparent border-2 border-violet-500/50 rounded-2xl hover:transform hover:scale-105 transition-all">
              <div className="absolute top-0 right-4 sm:right-6 -translate-y-1/2 px-3 sm:px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs sm:text-sm font-bold rounded-full">
                POPULAIRE
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Plan CLUB</h3>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">99€</span>
                <span className="text-base sm:text-lg text-gray-400 line-through">139€</span>
                <span className="text-xs sm:text-sm text-gray-400">/mois</span>
              </div>
              <div className="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium rounded-full mb-6">
                -29% - Offre limitée
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8">
                {[
                  { text: '10 matchs analysés / mois', bold: true },
                  { text: 'Multi-utilisateurs' },
                  { text: 'Multi-équipes' },
                  { text: 'Vue globale progression du club' },
                  { text: 'Tableau de bord avancé' },
                  { text: 'Support prioritaire dédié' },
                  { text: 'Accessible sur ordinateur, tablette, téléphone' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                    <span className={`text-sm sm:text-base text-gray-300 ${item.bold ? 'font-semibold' : ''}`}>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block w-full text-center px-6 sm:px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all text-sm sm:text-base">
                Créer un compte
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-8 px-4">Sans engagement</p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">Une question ?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
            <div className="space-y-6 sm:space-y-8">
              {[
                { icon: Mail, title: 'Email', content: <a href="mailto:contact@insightball.com" className="text-sm sm:text-base text-gray-400 hover:text-violet-400 transition-colors">contact@insightball.com</a> },
                { icon: Phone, title: 'Téléphone', content: <a href="tel:+33123456789" className="text-sm sm:text-base text-gray-400 hover:text-violet-400 transition-colors">+33 1 23 45 67 89</a> },
                { icon: MapPin, title: 'Adresse', content: <p className="text-sm sm:text-base text-gray-400">42 Avenue des Champs-Élysées<br />75008 Paris, France</p> },
              ].map((c) => (
                <div key={c.title} className="flex items-start space-x-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                    <c.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1">{c.title}</h3>
                    {c.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6 p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl">
              {[
                { label: 'Nom', type: 'text', key: 'name', placeholder: 'Votre nom' },
                { label: 'Email', type: 'email', key: 'email', placeholder: 'votre@email.com' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{f.label}</label>
                  <input type={f.type} required value={contactForm[f.key]}
                    onChange={(e) => setContactForm({...contactForm, [f.key]: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors"
                    placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea required rows={5} value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors resize-none"
                  placeholder="Votre message..." />
              </div>
              <button type="submit" className="w-full flex items-center justify-center space-x-2 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all text-sm sm:text-base">
                <Send className="w-5 h-5" /><span>Envoyer</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-8 sm:p-12 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
            <div className="relative">
              <Target className="w-12 sm:w-16 h-12 sm:h-16 text-violet-400 mx-auto mb-4 sm:mb-6 animate-bounce" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4">Prêt à passer au niveau supérieur ?</h2>
              <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 px-4">
                Rejoignez les clubs qui analysent leurs matchs avec INSIGHTBALL
              </p>
              <Link to="/signup" className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-violet-500/50 transition-all text-sm sm:text-base">
                <span>Créer un compte</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.svg" alt="INSIGHTBALL" className="w-8 sm:w-10 h-8 sm:h-10" />
                <span className="text-lg sm:text-xl font-bold">INSIGHT<span className="text-violet-400">BALL</span></span>
              </div>
              <p className="text-sm text-gray-400">Smart Video Analysis</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Entreprise</h4>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-gray-400">© 2026 INSIGHTBALL. Tous droits réservés.</div>
            <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
              We live football <span className="text-red-500 animate-pulse">❤️</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
      `}</style>
    </div>
  )
}

export default LandingPage