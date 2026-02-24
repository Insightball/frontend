import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, BarChart3, Users, TrendingUp, CheckCircle2, ArrowRight, Sparkles, Zap, Target, Mail, Send, Clock, Shield, Camera, FileText, Activity, CheckCircle } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/* ─── Palette ─────────────────────────────────── */
const G = {
  paper:    '#f5f2eb',
  cream:    '#faf8f4',
  ink:      '#0f0f0d',
  ink2:     '#2a2a26',
  muted:    'rgba(15,15,13,0.42)',
  rule:     'rgba(15,15,13,0.09)',
  gold:     '#c9a227',
  goldD:    '#a8861f',
  goldBg:   'rgba(201,162,39,0.07)',
  goldBdr:  'rgba(201,162,39,0.25)',
  mono:     "'JetBrains Mono', monospace",
  display:  "'Anton', sans-serif",
  serif:    "'Literata', Georgia, serif",
}

/* ─── Google Fonts injection ─────────────────── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=Literata:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
`

/* ─── Heatmap terrain ────────────────────────── */
function Heatmap({ zones, mode = 'presence' }) {
  const W = 300, H = 190
  const colorFor = (z) => {
    if (mode === 'presence') return `rgba(201,162,39,${0.1 + z.i * 0.5})`
    if (z.type === 'won')  return `rgba(34,197,94,${0.15 + z.i * 0.55})`
    if (z.type === 'lost') return `rgba(239,68,68,${0.15 + z.i * 0.55})`
    if (z.type === 'shot') return `rgba(201,162,39,${0.15 + z.i * 0.55})`
    return `rgba(201,162,39,${0.1 + z.i * 0.4})`
  }
  const blurFor = (z) => mode === 'presence' ? 9 + z.i * 7 : 7 + z.i * 5
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1f0d"/>
          <stop offset="100%" stopColor="#091409"/>
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#pitchGrad)"/>
      <g stroke="rgba(255,255,255,0.11)" strokeWidth="1" fill="none">
        <rect x={8} y={7} width={W-16} height={H-14}/>
        <line x1={W/2} y1={7} x2={W/2} y2={H-7}/>
        <circle cx={W/2} cy={H/2} r={26}/>
        <circle cx={W/2} cy={H/2} r={2} fill="rgba(255,255,255,0.2)" stroke="none"/>
        <rect x={8} y={H/2-32} width={46} height={64}/>
        <rect x={8} y={H/2-16} width={20} height={32}/>
        <rect x={W-54} y={H/2-32} width={46} height={64}/>
        <rect x={W-28} y={H/2-16} width={20} height={32}/>
        <circle cx={40} cy={H/2} r={2} fill="rgba(255,255,255,0.2)" stroke="none"/>
        <circle cx={W-40} cy={H/2} r={2} fill="rgba(255,255,255,0.2)" stroke="none"/>
      </g>
      {zones.map((z, i) => (
        <circle key={i}
          cx={8 + (z.x/100)*(W-16)} cy={7 + (z.y/100)*(H-14)}
          r={18+z.i*14} fill={colorFor(z)}
          style={{ filter: `blur(${blurFor(z)}px)` }}
        />
      ))}
      {mode === 'events' && zones.map((z, i) => (
        <circle key={'d'+i}
          cx={8+(z.x/100)*(W-16)} cy={7+(z.y/100)*(H-14)}
          r={4}
          fill={z.type==='won' ? '#22c55e' : z.type==='shot' ? '#c9a227' : '#ef4444'}
          fillOpacity={0.85} stroke="rgba(0,0,0,0.4)" strokeWidth="1"
        />
      ))}
    </svg>
  )
}

function StatBar({ label, value, max }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: 'rgba(245,242,235,0.5)', fontFamily: G.mono }}>{label}</span>
        <span style={{ fontSize: 11, color: '#f5f2eb', fontWeight: 700, fontFamily: G.mono }}>{value}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min((value/max)*100,100)}%`, background: G.gold, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

const TT = {
  contentStyle: { backgroundColor: '#0f0f0d', border: `1px solid rgba(201,162,39,0.2)`, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
  labelStyle: { color: 'rgba(245,242,235,0.5)', fontSize: 11 },
}

/* ─── Données GFCA ───────────────────────────── */
const PLAYERS = [
  { name: 'Cyril Fogacci',         pos: 'Gardien',   num: 1,  goals: 0, assists: 0, shots: 0,  shotsOn: 0, touches: 24, passes: 16, km: 4.1,  won: 5,  lost: 1,
    heat:[{x:8,y:50,i:.95},{x:15,y:32,i:.55},{x:15,y:68,i:.55}],
    events:[{x:12,y:50,i:.9,type:'won'},{x:18,y:35,i:.6,type:'won'},{x:15,y:62,i:.5,type:'lost'}] },
  { name: 'Hassein Mersni',        pos: 'Défenseur', num: 3,  goals: 0, assists: 1, shots: 1,  shotsOn: 0, touches: 51, passes: 38, km: 9.1,  won: 13, lost: 3,
    heat:[{x:20,y:28,i:.85},{x:28,y:50,i:.65},{x:20,y:72,i:.7}],
    events:[{x:22,y:30,i:.8,type:'won'},{x:30,y:50,i:.6,type:'won'},{x:22,y:70,i:.75,type:'won'},{x:38,y:35,i:.6,type:'lost'},{x:42,y:55,i:.5,type:'lost'}] },
  { name: 'Max Bonalair',          pos: 'Défenseur', num: 4,  goals: 1, assists: 2, shots: 3,  shotsOn: 1, touches: 54, passes: 41, km: 9.4,  won: 14, lost: 2,
    heat:[{x:18,y:38,i:.8},{x:25,y:55,i:.7},{x:35,y:40,i:.5}],
    events:[{x:20,y:40,i:.85,type:'won'},{x:28,y:58,i:.65,type:'won'},{x:40,y:38,i:.55,type:'lost'},{x:35,y:60,i:.45,type:'lost'},{x:55,y:30,i:.7,type:'shot'}] },
  { name: 'Naïl Kheroua',          pos: 'Milieu',    num: 8,  goals: 3, assists: 4, shots: 8,  shotsOn: 5, touches: 74, passes: 61, km: 10.8, won: 13, lost: 3,
    heat:[{x:50,y:50,i:.9},{x:62,y:38,i:.75},{x:62,y:62,i:.7},{x:70,y:50,i:.55}],
    events:[{x:50,y:48,i:.85,type:'won'},{x:62,y:35,i:.7,type:'won'},{x:58,y:65,i:.65,type:'won'},{x:68,y:42,i:.6,type:'lost'},{x:72,y:60,i:.5,type:'lost'},{x:78,y:45,i:.8,type:'shot'},{x:82,y:55,i:.75,type:'shot'}] },
  { name: 'Paul-Antoine Finidori', pos: 'Milieu',    num: 10, goals: 2, assists: 5, shots: 5,  shotsOn: 3, touches: 71, passes: 60, km: 11.1, won: 12, lost: 3,
    heat:[{x:48,y:48,i:.85},{x:60,y:33,i:.7},{x:60,y:63,i:.7}],
    events:[{x:48,y:45,i:.8,type:'won'},{x:60,y:32,i:.65,type:'won'},{x:62,y:62,i:.6,type:'won'},{x:70,y:50,i:.55,type:'lost'},{x:65,y:38,i:.45,type:'lost'},{x:75,y:42,i:.7,type:'shot'}] },
  { name: 'Nolan Dangoumau',       pos: 'Attaquant', num: 11, goals: 5, assists: 2, shots: 14, shotsOn: 8, touches: 55, passes: 39, km: 9.5,  won: 9,  lost: 4,
    heat:[{x:78,y:50,i:.9},{x:85,y:35,i:.8},{x:85,y:65,i:.75}],
    events:[{x:75,y:48,i:.7,type:'won'},{x:82,y:35,i:.6,type:'won'},{x:35,y:50,i:.55,type:'lost'},{x:45,y:38,i:.5,type:'lost'},{x:82,y:42,i:.9,type:'shot'},{x:78,y:55,i:.85,type:'shot'},{x:86,y:48,i:.8,type:'shot'}] },
  { name: 'Noah Randazzo',         pos: 'Attaquant', num: 9,  goals: 4, assists: 3, shots: 11, shotsOn: 6, touches: 58, passes: 43, km: 9.8,  won: 10, lost: 3,
    heat:[{x:80,y:42,i:.85},{x:88,y:52,i:.8},{x:74,y:58,i:.6}],
    events:[{x:78,y:42,i:.7,type:'won'},{x:85,y:55,i:.65,type:'won'},{x:40,y:52,i:.5,type:'lost'},{x:50,y:42,i:.45,type:'lost'},{x:83,y:45,i:.85,type:'shot'},{x:88,y:55,i:.8,type:'shot'}] },
  { name: 'Laurent Fogacci',       pos: 'Milieu',    num: 6,  goals: 2, assists: 3, shots: 4,  shotsOn: 2, touches: 68, passes: 54, km: 10.3, won: 11, lost: 4,
    heat:[{x:42,y:50,i:.9},{x:55,y:35,i:.7},{x:55,y:65,i:.65}],
    events:[{x:42,y:48,i:.8,type:'won'},{x:55,y:34,i:.65,type:'won'},{x:62,y:50,i:.55,type:'lost'},{x:58,y:65,i:.45,type:'lost'},{x:68,y:40,i:.65,type:'shot'}] },
  { name: 'Kaïs Djellal',          pos: 'Milieu',    num: 7,  goals: 2, assists: 3, shots: 5,  shotsOn: 3, touches: 62, passes: 50, km: 10.5, won: 11, lost: 3,
    heat:[{x:55,y:50,i:.85},{x:65,y:35,i:.7},{x:68,y:62,i:.6}],
    events:[{x:55,y:48,i:.8,type:'won'},{x:65,y:34,i:.65,type:'won'},{x:68,y:60,i:.55,type:'won'},{x:72,y:48,i:.5,type:'lost'},{x:68,y:65,i:.4,type:'lost'},{x:76,y:42,i:.7,type:'shot'}] },
]

const avgKm = (PLAYERS.reduce((s,p) => s+p.km, 0)/PLAYERS.length).toFixed(1)

const radarData = [
  { cat: 'Possession', val: 58 }, { cat: 'Passes', val: 74 },
  { cat: 'Pressing', val: 76 },   { cat: 'Défense', val: 82 },
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

/* ─── Dashboard Demo ─────────────────────────── */
function DashboardDemo() {
  const [tab, setTab] = useState('collective')
  const [selectedPlayer, setSelectedPlayer] = useState(PLAYERS[0])
  const [comparePlayer, setComparePlayer] = useState(null)
  const [indivView, setIndivView] = useState('stats')
  const [progressMetric, setProgressMetric] = useState('poss')

  const tabBtn = (t, label) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '9px 20px',
        fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
        background: tab === t ? G.gold : 'transparent',
        color: tab === t ? G.ink : G.muted,
        border: `1px solid ${tab === t ? G.gold : G.rule}`,
        cursor: 'pointer', transition: 'all .15s',
        fontWeight: tab === t ? 700 : 400,
      }}
    >
      {label}
    </button>
  )

  const microBtn = (active, onClick, label) => (
    <button onClick={onClick} style={{
      padding: '4px 12px', fontSize: 10,
      fontFamily: G.mono, letterSpacing: '.08em', textTransform: 'uppercase',
      background: active ? G.goldBg : 'transparent',
      color: active ? G.gold : G.muted,
      border: `1px solid ${active ? G.goldBdr : G.rule}`,
      cursor: 'pointer', transition: 'all .15s',
    }}>{label}</button>
  )

  const CP = comparePlayer

  return (
    <div style={{ background: G.ink, border: `1px solid rgba(201,162,39,0.15)`, overflow: 'hidden' }}>
      {/* Browser bar */}
      <div style={{ background: '#0a0a08', borderBottom: `1px solid rgba(255,255,255,0.04)`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: .6 }}/>)}
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', fontFamily: G.mono }}>app.insightball.com · Dashboard</span>
        </div>
        <span style={{ fontSize: 9, color: G.gold, fontFamily: G.mono, letterSpacing: '.12em', textTransform: 'uppercase', border: `1px solid ${G.goldBdr}`, padding: '3px 10px', background: G.goldBg }}>DÉMO</span>
      </div>

      {/* Tabs */}
      <div style={{ padding: '14px 18px 0', display: 'flex', gap: 4, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
        {tabBtn('collective', '⚽ Collectif')}
        {tabBtn('individual', '👤 Individuelles')}
      </div>

      <div style={{ padding: 16 }}>

        {/* ══ COLLECTIVE ══ */}
        {tab === 'collective' && (
          <div>
            {/* Bilan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginBottom: 12 }}>
              {[
                { label: 'Matchs',    value: 7,      color: G.gold },
                { label: 'Victoires', value: 3,      color: '#22c55e' },
                { label: 'Nuls',      value: 2,      color: G.gold },
                { label: 'Défaites', value: 2,      color: '#ef4444' },
                { label: 'Km moy.',   value: avgKm,  color: G.gold },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `2px solid ${s.color}`, padding: '10px 12px', border: `1px solid rgba(255,255,255,0.04)`, borderTopWidth: 0 }}>
                  <div style={{ fontFamily: G.display, fontSize: 24, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 4, letterSpacing: '.1em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              {/* Possession donut */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`, padding: 14 }}>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>Possession moy.</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                      <circle cx="40" cy="40" r="32" fill="none" stroke={G.gold} strokeWidth="6"
                        strokeDasharray={`${0.53*2*Math.PI*32} ${2*Math.PI*32}`} strokeLinecap="round"/>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: G.display, fontSize: 18, color: '#f5f2eb' }}>53%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats clés */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`, padding: 14 }}>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>Passes & Tirs</p>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {[{val:1142,label:'passes'},{val:32,label:'tirs'},{val:11,label:'buts'}].map(v => (
                    <div key={v.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: G.display, fontSize: 22, color: G.gold }}>{v.val}</div>
                      <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`, padding: 14 }}>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 2, letterSpacing: '.1em', textTransform: 'uppercase' }}>Performance</p>
                <ResponsiveContainer width="100%" height={100}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)"/>
                    <PolarAngleAxis dataKey="cat" stroke="rgba(255,255,255,.2)" tick={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace" }}/>
                    <PolarRadiusAxis stroke="#374151" tick={false} domain={[0,100]}/>
                    <Radar dataKey="val" stroke={G.gold} fill={G.gold} fillOpacity={0.15}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Progression */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Suivi progression</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {microBtn(progressMetric==='poss', ()=>setProgressMetric('poss'), 'Possession')}
                  {microBtn(progressMetric==='km',   ()=>setProgressMetric('km'),   'Km')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {matchData.map(m => {
                  const curr = progressMetric==='poss' ? m.poss : m.km
                  const prev = m.prev
                  const trend = prev===null ? null : curr>prev ? '↑' : curr<prev ? '↓' : '→'
                  const tc = trend==='↑' ? '#22c55e' : trend==='↓' ? '#ef4444' : G.gold
                  return (
                    <div key={m.match} style={{ flex:1, background:'rgba(255,255,255,0.02)', border:`1px solid rgba(255,255,255,0.04)`, padding:'6px 3px', textAlign:'center' }}>
                      <div style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(255,255,255,.2)', marginBottom: 3, textTransform: 'uppercase' }}>{m.match}</div>
                      <div style={{ fontFamily: G.display, fontSize: 13, color: '#f5f2eb' }}>{progressMetric==='poss' ? `${curr}%` : curr}</div>
                      <div style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(255,255,255,.2)' }}>{m.score}</div>
                      {trend && <div style={{ fontSize: 11, color: tc }}>{trend}</div>}
                    </div>
                  )
                })}
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={matchData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="match" stroke="rgba(255,255,255,.15)" tick={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace" }}/>
                  <YAxis stroke="rgba(255,255,255,.15)" tick={{ fontSize: 8 }} domain={progressMetric==='poss' ? [30,80] : [90,120]}/>
                  <Tooltip {...TT} formatter={v=>[progressMetric==='poss'?`${v}%`:`${v} km`, progressMetric==='poss'?'Possession':'Distance']}/>
                  <Bar dataKey={progressMetric} fill={G.gold} radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══ INDIVIDUAL ══ */}
        {tab === 'individual' && (
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Sidebar joueurs */}
            <div style={{ width: 140, flexShrink: 0, maxHeight: 480, overflowY: 'auto' }}>
              <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>Joueurs</p>
              {PLAYERS.map(p => {
                const isSel = selectedPlayer.name === p.name
                const isCmp = CP && CP.name === p.name
                return (
                  <div key={p.name}
                    onClick={() => { if (!isCmp) { setSelectedPlayer(p); if (CP?.name===p.name) setComparePlayer(null) } }}
                    style={{
                      padding: '8px 10px', cursor: 'pointer', marginBottom: 2,
                      background: isSel ? G.goldBg : isCmp ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
                      borderLeft: `2px solid ${isSel ? G.gold : isCmp ? '#ef4444' : 'transparent'}`,
                      transition: 'all .15s',
                    }}
                  >
                    <div style={{ fontFamily: G.mono, fontSize: 10, color: isSel ? G.gold : isCmp ? '#ef4444' : 'rgba(255,255,255,.5)', letterSpacing: '.04em' }}>
                      #{p.num} {p.name.split(' ')[0]}
                    </div>
                    <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.2)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{p.pos}</div>
                    {indivView==='compare' && !isSel && (
                      <button onClick={e => { e.stopPropagation(); setComparePlayer(isCmp ? null : p) }}
                        style={{ marginTop: 4, fontSize: 9, padding: '2px 6px', fontFamily: G.mono, letterSpacing: '.06em',
                          background: isCmp ? 'rgba(239,68,68,0.1)' : G.goldBg,
                          color: isCmp ? '#ef4444' : G.gold, border: `1px solid ${isCmp ? 'rgba(239,68,68,0.2)' : G.goldBdr}`,
                          cursor: 'pointer', textTransform: 'uppercase' }}>
                        {isCmp ? '✕' : '+ Cmp'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {microBtn(indivView==='stats',   ()=>setIndivView('stats'),   '📊 Stats')}
                {microBtn(indivView==='ballmap', ()=>setIndivView('ballmap'), '🗺 Terrain')}
                {microBtn(indivView==='compare', ()=>setIndivView('compare'), '⚖️ Comparer')}
              </div>

              {/* Header joueur */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.goldBdr}`, borderLeft: `3px solid ${G.gold}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ fontFamily: G.display, fontSize: 22, color: G.gold, width: 36, textAlign: 'center', flexShrink: 0 }}>
                  #{selectedPlayer.num}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: G.display, fontSize: 14, color: '#f5f2eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {selectedPlayer.name}
                  </div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{selectedPlayer.pos}</div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                  {[{label:'Buts',val:selectedPlayer.goals},{label:'P.Déc.',val:selectedPlayer.assists},{label:'Km',val:selectedPlayer.km}].map(v => (
                    <div key={v.label} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily: G.display, fontSize: 16, color: G.gold }}>{v.val}</div>
                      <div style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              {indivView==='stats' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`, padding: 12 }}>
                    <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Stats saison</p>
                    <StatBar label="Ballons touchés"   value={selectedPlayer.touches}    max={80}/>
                    <StatBar label="Passes"            value={selectedPlayer.passes}     max={70}/>
                    <StatBar label="Tirs"              value={selectedPlayer.shots||0}   max={16}/>
                    <StatBar label="Tirs cadrés"       value={selectedPlayer.shotsOn||0} max={10}/>
                    <StatBar label="Ballons gagnés"    value={selectedPlayer.won}        max={18}/>
                    <StatBar label="Ballons perdus"    value={selectedPlayer.lost}       max={10}/>
                    <StatBar label={`Km/match (moy: ${avgKm})`} value={selectedPlayer.km} max={12}/>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`, padding: 12 }}>
                    <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Zones de présence</p>
                    <Heatmap zones={selectedPlayer.heat} mode="presence"/>
                  </div>
                </div>
              )}

              {/* Terrain */}
              {indivView==='ballmap' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`, padding: 12 }}>
                  <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Ballons gagnés, perdus & tirs</p>
                  <Heatmap zones={selectedPlayer.events} mode="events"/>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                    {[{c:'#22c55e',l:'Gagnés'},{c:'#ef4444',l:'Perdus'},{c:G.gold,l:'Tirs'}].map(x => (
                      <div key={x.l} style={{ display:'flex',alignItems:'center',gap:5 }}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:x.c}}/>
                        <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{x.l}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                    {[
                      {val:selectedPlayer.won,   label:'Gagnés', color:'#22c55e', bg:'rgba(34,197,94,0.07)',   bdr:'rgba(34,197,94,0.2)'},
                      {val:selectedPlayer.lost,  label:'Perdus', color:'#ef4444', bg:'rgba(239,68,68,0.07)',  bdr:'rgba(239,68,68,0.2)'},
                      {val:selectedPlayer.shots||0,label:'Tirs', color:G.gold,   bg:G.goldBg,               bdr:G.goldBdr},
                    ].map(s => (
                      <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.bdr}`, padding:'10px 12px', textAlign:'center' }}>
                        <div style={{ fontFamily:G.display,fontSize:24,color:s.color }}>{s.val}</div>
                        <div style={{ fontFamily:G.mono,fontSize:9,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparaison */}
              {indivView==='compare' && (
                <div>
                  {!CP ? (
                    <div style={{ background:'rgba(255,255,255,0.02)',border:`1px dashed ${G.goldBdr}`,padding:'28px 16px',textAlign:'center',color:'rgba(255,255,255,.3)',fontFamily:G.mono,fontSize:11,letterSpacing:'.06em' }}>
                      ← Sélectionnez un 2ème joueur pour comparer
                    </div>
                  ) : (
                    <div>
                      <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,marginBottom:10 }}>
                        {[selectedPlayer, CP].map((p,i) => (
                          <div key={p.name} style={{
                            background: i===0 ? G.goldBg : 'rgba(239,68,68,0.06)',
                            border: `1px solid ${i===0 ? G.goldBdr : 'rgba(239,68,68,0.2)'}`,
                            padding:'10px 12px', textAlign: i===0?'left':'right'
                          }}>
                            <div style={{ fontFamily:G.display,fontSize:14,color:i===0?G.gold:'#ef4444',textTransform:'uppercase',letterSpacing:'.03em' }}>#{p.num} {p.name.split(' ')[0]}</div>
                            <div style={{ fontFamily:G.mono,fontSize:9,color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:'.08em' }}>{p.pos}</div>
                          </div>
                        ))}
                        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G.mono,fontSize:11,color:'rgba(255,255,255,.2)' }}>VS</div>
                      </div>
                      {[
                        {label:'Buts',a:selectedPlayer.goals,b:CP.goals,max:8},
                        {label:'Passes déc.',a:selectedPlayer.assists,b:CP.assists,max:8},
                        {label:'Tirs',a:selectedPlayer.shots||0,b:CP.shots||0,max:16},
                        {label:'Touches',a:selectedPlayer.touches,b:CP.touches,max:80},
                        {label:'Passes',a:selectedPlayer.passes,b:CP.passes,max:70},
                        {label:'Ballons gagnés',a:selectedPlayer.won,b:CP.won,max:18},
                        {label:'Km/match',a:selectedPlayer.km,b:CP.km,max:12},
                      ].map(row => {
                        const aW = Math.min((row.a/row.max)*100,100)
                        const bW = Math.min((row.b/row.max)*100,100)
                        const aWin = row.a > row.b
                        const bWin = row.b > row.a
                        return (
                          <div key={row.label} style={{ marginBottom: 7 }}>
                            <div style={{ fontFamily:G.mono,fontSize:9,color:'rgba(255,255,255,.2)',textAlign:'center',marginBottom:3,textTransform:'uppercase',letterSpacing:'.08em' }}>{row.label}</div>
                            <div style={{ display:'grid',gridTemplateColumns:'1fr 32px 1fr',gap:4,alignItems:'center' }}>
                              <div style={{ display:'flex',justifyContent:'flex-end',alignItems:'center',gap:5 }}>
                                <span style={{ fontFamily:G.mono,fontSize:10,color:aWin?G.gold:'rgba(255,255,255,.25)',fontWeight:700 }}>{row.a}</span>
                                <div style={{ width:`${aW}%`,height:4,background:aWin?G.gold:'rgba(201,162,39,0.2)',borderRadius:'99px 0 0 99px' }}/>
                              </div>
                              <div/>
                              <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                                <div style={{ width:`${bW}%`,height:4,background:bWin?'#ef4444':'rgba(239,68,68,0.2)',borderRadius:'0 99px 99px 0' }}/>
                                <span style={{ fontFamily:G.mono,fontSize:10,color:bWin?'#ef4444':'rgba(255,255,255,.25)',fontWeight:700 }}>{row.b}</span>
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

      {/* Footer démo */}
      <div style={{ borderTop:`1px solid rgba(255,255,255,0.04)`,padding:'12px 18px',display:'flex',justifyContent:'flex-end',background:'rgba(201,162,39,0.03)' }}>
        <Link to="/signup" style={{
          display:'inline-flex',alignItems:'center',gap:8,
          padding:'9px 22px',
          fontFamily:G.mono,fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:700,
          background:G.gold,color:G.ink,
          textDecoration:'none',transition:'background .15s'
        }}>
          Créer mon compte <ArrowRight size={13}/>
        </Link>
      </div>
    </div>
  )
}


/* ─── Waitlist Section ────────────────────────── */
function WaitlistSection() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    club: '', role: '', category: '',
  })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [focused, setFocused] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useState(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const iStyle = (name) => ({
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `2px solid ${focused === name ? G.gold : 'rgba(255,255,255,0.1)'}`,
    padding: '10px 0', color: '#f5f2eb',
    fontFamily: G.mono, fontSize: 13, outline: 'none',
    transition: 'border-color .15s',
  })

  const sStyle = (name, val) => ({
    width: '100%', background: '#0a0908', border: 'none',
    borderBottom: `2px solid ${focused === name ? G.gold : 'rgba(255,255,255,0.1)'}`,
    padding: '10px 0',
    color: val ? '#f5f2eb' : 'rgba(245,242,235,0.28)',
    fontFamily: G.mono, fontSize: 13, outline: 'none', cursor: 'pointer',
    transition: 'border-color .15s',
  })

  const lStyle = {
    fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em',
    textTransform: 'uppercase', color: 'rgba(245,242,235,0.3)',
    display: 'block', marginBottom: 8,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('https://backend-pued.onrender.com/api/leads/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name:  form.lastName,
          email:      form.email,
          club_name:  form.club,
          role:       form.role,
          category:   form.category,
        }),
      })
      if (!res.ok) throw new Error('Erreur')
      setSent(true)
    } catch(err) {
      setError('Une erreur est survenue. Écrivez-nous à contact@insightball.com')
    }
    setLoading(false)
  }

  const perks = [
    { icon: '⚡', title: 'Accès en avant-première', desc: 'Avant l'ouverture publique' },
    { icon: '🎯', title: 'Tarif fondateur –30%', desc: 'Réservé aux 50 premiers inscrits' },
    { icon: '🤝', title: 'Onboarding personnalisé', desc: 'Notre équipe vous accompagne' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '60px 20px' : '96px 40px' }}>
      <style>{`
        @keyframes wlspin { to { transform:rotate(360deg); } }
        .wl-option { background: #0a0908 !important; color: #f5f2eb !important; }
      `}</style>

      {/* ── HEADER centré ── */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 64 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 20 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
          Accès anticipé
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
        </div>
        <h2 style={{ fontFamily: G.display, fontSize: 'clamp(44px,6vw,80px)', textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#fff', marginBottom: 20 }}>
          Demandez votre<br/><span style={{ color: G.gold }}>accès anticipé.</span>
        </h2>
        <p style={{ fontFamily: G.serif, fontSize: 16, lineHeight: 1.75, color: 'rgba(245,242,235,0.5)', maxWidth: 520, margin: '0 auto' }}>
          La plateforme arrive bientôt. Soyez parmi les premiers clubs à utiliser 
          InsightBall et bénéficiez de conditions exclusives de lancement.
        </p>
      </div>

      {/* ── PERKS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,0.06)', marginBottom: isMobile ? 40 : 56 }}>
        {perks.map(p => (
          <div key={p.title} style={{ background: 'rgba(255,255,255,0.02)', padding: '24px 28px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{p.icon}</span>
            <div>
              <div style={{ fontFamily: G.mono, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff', fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.38)', letterSpacing: '.04em' }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FORMULAIRE ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderTop: `2px solid ${G.gold}`, padding: isMobile ? '32px 20px' : '48px 56px', maxWidth: 760, margin: '0 auto' }}>
        {sent ? (
          /* ── CONFIRMATION ── */
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(201,162,39,0.1)', border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
              ✓
            </div>
            <h3 style={{ fontFamily: G.display, fontSize: 36, textTransform: 'uppercase', letterSpacing: '.02em', color: '#fff', marginBottom: 16 }}>
              Demande reçue !
            </h3>
            <p style={{ fontFamily: G.mono, fontSize: 11, letterSpacing: '.06em', color: 'rgba(245,242,235,0.45)', lineHeight: 1.8, maxWidth: 380, margin: '0 auto 12px' }}>
              Votre demande d'accès anticipé a bien été enregistrée.<br/>
              Nous vous contacterons en priorité dès l'ouverture.
            </p>
            <p style={{ fontFamily: G.mono, fontSize: 10, color: G.gold, letterSpacing: '.08em' }}>
              Merci pour votre confiance. 🏆
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 10 }}>
                Formulaire d'inscription
              </div>
              <h3 style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', letterSpacing: '.02em', color: '#fff' }}>
                Rejoignez la liste.
              </h3>
            </div>

            {error && (
              <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderLeft: '2px solid #ef4444' }}>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: '#ef4444', margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Ligne 1 — Prénom + Nom */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 32, marginBottom: 28 }}>
                <div>
                  <label style={lStyle}>Prénom *</label>
                  <input type="text" required value={form.firstName} onChange={e=>set('firstName',e.target.value)}
                    placeholder="Jean" style={iStyle('firstName')}
                    onFocus={()=>setFocused('firstName')} onBlur={()=>setFocused(null)} />
                </div>
                <div>
                  <label style={lStyle}>Nom *</label>
                  <input type="text" required value={form.lastName} onChange={e=>set('lastName',e.target.value)}
                    placeholder="Dupont" style={iStyle('lastName')}
                    onFocus={()=>setFocused('lastName')} onBlur={()=>setFocused(null)} />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 28 }}>
                <label style={lStyle}>Email professionnel *</label>
                <input type="email" required value={form.email} onChange={e=>set('email',e.target.value)}
                  placeholder="jean.dupont@monclub.fr" style={iStyle('email')}
                  onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)} />
              </div>

              {/* Club */}
              <div style={{ marginBottom: 28 }}>
                <label style={lStyle}>Nom du club *</label>
                <input type="text" required value={form.club} onChange={e=>set('club',e.target.value)}
                  placeholder="JS Cugnaux, FC Toulouse..." style={iStyle('club')}
                  onFocus={()=>setFocused('club')} onBlur={()=>setFocused(null)} />
              </div>

              {/* Ligne 2 — Poste + Catégorie */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 32, marginBottom: 36 }}>
                <div>
                  <label style={lStyle}>Poste au sein du club *</label>
                  <select required value={form.role} onChange={e=>set('role',e.target.value)}
                    style={sStyle('role', form.role)}
                    onFocus={()=>setFocused('role')} onBlur={()=>setFocused(null)}>
                    <option value="" disabled className="wl-option">Choisir...</option>
                    <option value="Éducateur" className="wl-option">Éducateur</option>
                    <option value="Entraîneur" className="wl-option">Entraîneur</option>
                    <option value="Directeur Sportif" className="wl-option">Directeur Sportif</option>
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Catégorie entraînée *</label>
                  <select required value={form.category} onChange={e=>set('category',e.target.value)}
                    style={sStyle('category', form.category)}
                    onFocus={()=>setFocused('category')} onBlur={()=>setFocused(null)}>
                    <option value="" disabled className="wl-option">Choisir...</option>
                    {['U14','U15','U16','U17','U18','U19','Séniors'].map(c => (
                      <option key={c} value={c} className="wl-option">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CTA */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '16px',
                background: loading ? 'rgba(201,162,39,0.5)' : G.gold,
                color: '#0a0908', fontFamily: G.mono, fontSize: 11,
                letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'background .15s',
              }}
                onMouseEnter={e=>{ if(!loading) e.currentTarget.style.background=G.goldD }}
                onMouseLeave={e=>{ if(!loading) e.currentTarget.style.background=G.gold }}
              >
                {loading
                  ? <><span style={{ width:13, height:13, border:'2px solid #0a0908', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'wlspin .6s linear infinite' }}/> Envoi en cours...</>
                  : '→ Demander mon accès anticipé'
                }
              </button>

              <p style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.06em', color: 'rgba(245,242,235,0.18)', textAlign: 'center', lineHeight: 1.7, marginTop: 16 }}>
                Aucun paiement requis · Sans engagement · Données confidentielles
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Landing Page ────────────────────────────── */
function LandingPage() {
  const [contactForm, setContactForm] = useState({ name:'', email:'', message:'' })

  const [contactSent, setContactSent] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setContactLoading(true)
    try {
      await fetch('https://backend-pued.onrender.com/api/leads/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
    } catch(err) { console.error(err) }
    setContactSent(true)
    setContactLoading(false)
    setContactForm({ name:'', email:'', message:'' })
  }

  return (
    <div style={{ minHeight:'100vh', background: G.paper, color: G.ink, fontFamily: G.serif, overflowX: 'hidden' }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${G.paper}; }
        ::-webkit-scrollbar-thumb { background: rgba(15,15,13,0.15); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .anim-1 { animation: fadeUp .5s ease .05s both; }
        .anim-2 { animation: fadeUp .6s ease .2s both; }
        .anim-3 { animation: fadeUp .6s ease .35s both; }
        .anim-4 { animation: fadeUp .6s ease .5s both; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:200,
        height:56, display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 40px',
        background: G.ink,
        borderBottom:'1px solid rgba(255,255,255,0.06)',
      }}>
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:10,textDecoration:'none' }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width:28,height:28 }}/>
          <span style={{ fontFamily:G.display,fontSize:18,letterSpacing:'.06em',color:'#fff' }}>
            INSIGHT<span style={{ color:G.gold }}>BALL</span>
          </span>
        </Link>
        <div style={{ display:'flex',gap:28,listStyle:'none' }}>
          {[['#demo','Démo'],['#features','Fonctionnalités'],['#pricing','Tarifs'],['#waitlist','Accès anticipé'],['#contact','Contact']].map(([h,l]) => (
            <a key={h} href={h} style={{ fontFamily:G.mono,fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.38)',textDecoration:'none' }}
              onMouseEnter={e=>e.target.style.color='#fff'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.38)'}
            >{l}</a>
          ))}

        </div>
        <a href="#waitlist" style={{
          fontFamily:G.mono,fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700,
          padding:'9px 22px',background:G.gold,color:G.ink,textDecoration:'none',
          transition:'background .15s',display:'inline-block',
        }}
          onMouseEnter={e=>e.target.style.background=G.goldD}
          onMouseLeave={e=>e.target.style.background=G.gold}
        >Accès anticipé</a>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight:'100vh',
        display:'grid', gridTemplateColumns:'1fr 1fr',
        paddingTop:56,
        background:G.cream,
        borderBottom:`1px solid ${G.rule}`,
        overflow:'hidden',
        position:'relative',
      }}>
        {/* Ligne verticale centrale */}
        <div style={{ position:'absolute',top:0,bottom:0,left:'50%',width:1,background:G.rule,pointerEvents:'none' }}/>

        {/* Gauche — texte */}
        <div style={{ padding:'80px 56px 72px',display:'flex',flexDirection:'column',justifyContent:'space-between',borderRight:`1px solid ${G.rule}` }}>
          <div>

            <h1 className="anim-2" style={{ fontFamily:G.display,fontSize:'clamp(60px,8vw,108px)',lineHeight:.88,letterSpacing:'.01em',textTransform:'uppercase',color:G.ink,marginBottom:32 }}>
              Vos matchs.<br/>
              Vos données.<br/>
              <span style={{ color:G.gold }}>Enfin.</span>
            </h1>
            <p className="anim-3" style={{ fontSize:16,lineHeight:1.75,color:G.ink2,maxWidth:420,marginBottom:44 }}>
              Uploadez votre vidéo de match. Recevez un rapport tactique complet en 5 heures —
              heatmaps, stats individuelles, zones de récupération.{' '}
              <strong>Le niveau des pros, au prix du club.</strong>
            </p>
            <div className="anim-4" style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
              <a href="#waitlist" style={{
                fontFamily:G.mono,fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700,
                padding:'14px 34px',background:G.ink,color:'#fff',
                textDecoration:'none',transition:'background .15s',display:'inline-block',
              }}
                onMouseEnter={e=>e.target.style.background=G.gold}
                onMouseLeave={e=>e.target.style.background=G.ink}
              >Accès anticipé gratuit</a>
              <a href="#demo" style={{
                fontFamily:G.mono,fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',
                padding:'13px 24px',background:'transparent',color:G.muted,
                border:`1px solid ${G.rule}`,borderRadius:2,
                textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,transition:'all .15s',
              }}
                onMouseEnter={e=>{e.currentTarget.style.color=G.ink;e.currentTarget.style.borderColor='rgba(15,15,13,.3)'}}
                onMouseLeave={e=>{e.currentTarget.style.color=G.muted;e.currentTarget.style.borderColor=G.rule}}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Voir la démo
              </a>
            </div>
          </div>
        </div>

        {/* Droite — photo + stats */}
        <div style={{ position:'relative',overflow:'hidden',background:G.ink }}>
          <img
            src="/Coach_analyse_Insightball.png"
            alt="Coach InsightBall"
            style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 20%',opacity:.65,mixBlendMode:'luminosity',display:'block' }}
          />
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(15,15,13,.5) 0%,transparent 60%)' }}/>

        </div>
      </section>



      {/* ── POUR QUI ── */}
      <section style={{ padding:'96px 40px',borderBottom:`1px solid ${G.rule}`,display:'grid',gridTemplateColumns:'220px 1fr 1fr',gap:56,alignItems:'start' }}>
        <div>
          <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8 }}>
            <span style={{ width:16,height:1,background:G.gold,display:'inline-block' }}/>Pour qui ?
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily:G.display,fontSize:'clamp(38px,4.5vw,60px)',textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',marginBottom:24 }}>
            L'analyse pro.<br/>Accessible à<br/><span style={{ color:G.gold }}>tous les clubs.</span>
          </h2>
          <p style={{ fontSize:15,lineHeight:1.8,color:G.ink2,marginBottom:28 }}>
            InsightBall transforme n'importe quelle vidéo de match en rapport tactique professionnel.
            <strong> Ce que seules les grandes structures pouvaient se payer, vous y avez accès dès aujourd'hui</strong> — à partir de 29€/mois, sans équipement spécial.
          </p>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:0,border:`1px solid ${G.rule}` }}>
          {[
            {val:'29€',lbl:'Dès 29€/mois sans engagement'},
            {val:'5h', lbl:'Rapport livré en 5 heures'},
            {val:'0',  lbl:'Équipement requis'},
          ].map((n,i) => (
            <div key={i}
              style={{ padding:'20px 24px',borderBottom:i<2?`1px solid ${G.rule}`:'none',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'background .15s',cursor:'default' }}
              onMouseEnter={e=>e.currentTarget.style.background=G.goldBg}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div style={{ fontFamily:G.display,fontSize:40,letterSpacing:'.01em',lineHeight:1 }}>{n.val}</div>
              <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',color:G.muted,textAlign:'right',lineHeight:1.6 }}>{n.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" style={{ padding:'96px 40px',background:G.cream,borderBottom:`1px solid ${G.rule}` }}>
        <div style={{ maxWidth:900,margin:'0 auto' }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
              <span style={{ width:16,height:1,background:G.gold,display:'inline-block' }}/>Démo interactive
            </div>
            <h2 style={{ fontFamily:G.display,fontSize:'clamp(40px,5vw,68px)',textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em' }}>
              Explorez<br/><span style={{ color:G.gold }}>la plateforme.</span>
            </h2>
          </div>
          <DashboardDemo/>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'96px 40px',borderBottom:`1px solid ${G.rule}` }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ marginBottom:56 }}>
            <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
              <span style={{ width:16,height:1,background:G.gold,display:'inline-block' }}/>Fonctionnalités
            </div>
            <h2 style={{ fontFamily:G.display,fontSize:'clamp(40px,5vw,68px)',textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em' }}>
              Tout ce dont<br/><span style={{ color:G.gold }}>vous avez besoin.</span>
            </h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:G.rule }}>
            {[
              { icon:Camera,   title:'Upload en 1 clic',      desc:"Uploadez votre vidéo depuis votre téléphone ou ordinateur. Notre IA fait le reste." },
              { icon:Clock,    title:'Rapport en 5 heures',    desc:"Un rapport complet livré en 5 heures avec heatmaps, stats individuelles et collectives." },
              { icon:FileText, title:'Rapports PDF',           desc:"Exportez votre rapport professionnel avec heatmaps et statistiques. Prêt à partager." },
              { icon:Users,    title:"Suivi d'effectif",       desc:"Suivez individuellement vos joueurs, analysez leurs performances et leur progression." },
              { icon:Shield,   title:'Analyse intelligente',   desc:"IA développée pour le football, conçue pour analyser chaque action avec précision." },
              { icon:Activity, title:'Support dédié 🇫🇷',      desc:"Une équipe basée en France, disponible et réactive pour répondre à vos besoins." },
            ].map((f,i) => (
              <div key={i}
                style={{ background:G.paper,padding:'36px 32px',cursor:'default',transition:'background .2s',borderTop:`2px solid transparent`,position:'relative' }}
                onMouseEnter={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderTopColor=G.gold}}
                onMouseLeave={e=>{e.currentTarget.style.background=G.paper;e.currentTarget.style.borderTopColor='transparent'}}
              >
                <div style={{ width:36,height:36,background:G.goldBg,border:`1px solid ${G.goldBdr}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:18 }}>
                  <f.icon style={{ width:16,height:16,color:G.gold }}/>
                </div>
                <h3 style={{ fontFamily:G.display,fontSize:20,textTransform:'uppercase',letterSpacing:'.03em',marginBottom:10 }}>{f.title}</h3>
                <p style={{ fontSize:13,lineHeight:1.75,color:G.muted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section style={{ padding:'96px 40px',background:G.cream,borderBottom:`1px solid ${G.rule}` }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:52,gap:40 }}>
            <div>
              <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
                <span style={{ width:16,height:1,background:G.gold,display:'inline-block' }}/>Comment ça marche
              </div>
              <h2 style={{ fontFamily:G.display,fontSize:'clamp(44px,5.5vw,72px)',textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em' }}>
                3 étapes.<br/><span style={{ color:G.gold,fontFamily:G.serif,fontStyle:'italic',fontWeight:400,fontSize:'.55em',letterSpacing:0,lineHeight:1.3,display:'block' }}>C'est tout.</span>
              </h2>
            </div>
            <p style={{ maxWidth:260,fontSize:14,lineHeight:1.75,color:G.muted,paddingBottom:8 }}>
              Pas de logiciel, pas de caméra spéciale. Votre vidéo filmée depuis la tribune suffit.
            </p>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:G.rule }}>
            {[
              {n:'01',title:'Importez votre vidéo',    desc:'MP4, MOV, AVI. Depuis votre téléphone ou ordinateur. Aucun logiciel à installer.'},
              {n:'02',title:"Notre IA analyse",          desc:"Une intelligence artificielle développée en interne, entraînée spécifiquement sur le football. Elle lit le jeu comme un œil expert — les zones, les mouvements, les schémas."},
              {n:'03',title:'Exploitez vos données',    desc:'Rapport PDF + dashboard interactif en 5h. Heatmaps, stats individuelles et collectives.'},
            ].map((s,i) => (
              <div key={i}
                style={{ background:G.paper,padding:'40px 36px',position:'relative',overflow:'hidden',cursor:'default',transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#fff'}
                onMouseLeave={e=>e.currentTarget.style.background=G.paper}
              >
                <div style={{ position:'absolute',bottom:-24,right:-8,fontFamily:G.display,fontSize:160,lineHeight:1,color:'rgba(15,15,13,0.03)',pointerEvents:'none',userSelect:'none' }}>{s.n}</div>
                <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.16em',textTransform:'uppercase',color:G.gold,marginBottom:20 }}>— {s.n}</div>
                <h3 style={{ fontFamily:G.display,fontSize:24,textTransform:'uppercase',letterSpacing:'.03em',marginBottom:12,lineHeight:1.05 }}>{s.title}</h3>
                <p style={{ fontSize:13,lineHeight:1.75,color:G.muted }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:'96px 40px',borderBottom:`1px solid ${G.rule}` }}>
        <div style={{ maxWidth:900,margin:'0 auto' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:52 }}>
            <div>
              <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
                <span style={{ width:16,height:1,background:G.gold,display:'inline-block' }}/>Offres limitées
              </div>
              <h2 style={{ fontFamily:G.display,fontSize:'clamp(44px,5.5vw,72px)',textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em' }}>
                Tarifs simples,<br/><span style={{ color:G.gold }}>sans surprise.</span>
              </h2>
            </div>
            <p style={{ fontSize:13,color:G.muted,textAlign:'right',lineHeight:1.7 }}>Sans engagement.</p>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,background:G.rule }}>
            {/* Coach */}
            <div style={{ background:G.paper,padding:'48px 40px',position:'relative',transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#fff'}
              onMouseLeave={e=>e.currentTarget.style.background=G.paper}
            >
              <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:G.rule,transition:'background .2s' }}
                onMouseEnter={e=>e.target.style.background=G.gold}
                onMouseLeave={e=>e.target.style.background=G.rule}
              />
              <span style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.16em',textTransform:'uppercase',color:G.gold,display:'block',marginBottom:14 }}>Pour les coachs</span>
              <div style={{ fontFamily:G.display,fontSize:36,textTransform:'uppercase',letterSpacing:'.03em',marginBottom:16 }}>Coach</div>
              <div style={{ display:'flex',alignItems:'baseline',gap:4,marginBottom:4 }}>
                <span style={{ fontFamily:G.mono,fontSize:18,color:G.muted }}>€</span>
                <span style={{ fontFamily:G.display,fontSize:80,lineHeight:1,letterSpacing:'-.02em' }}>29</span>
              </div>
              <div style={{ fontFamily:G.mono,fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',color:G.muted,marginBottom:32 }}>/ mois · sans engagement</div>
              <ul style={{ listStyle:'none',display:'flex',flexDirection:'column',gap:9,marginBottom:36 }}>
                {['3 matchs analysés / mois','1 équipe','Rapports collectifs et individuels','Suivi progression match après match','Tableau de bord complet','Support client dédié','Accessible sur tous supports'].map(item => (
                  <li key={item} style={{ fontSize:13,color:G.ink2,display:'flex',alignItems:'flex-start',gap:10 }}>
                    <span style={{ color:G.gold,flexShrink:0,marginTop:2 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" style={{ fontFamily:G.mono,fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',fontWeight:700,padding:'13px 30px',borderRadius:2,background:G.ink,color:'#fff',border:'none',cursor:'pointer',textDecoration:'none',display:'inline-block',transition:'background .15s' }}
                onMouseEnter={e=>e.target.style.background=G.gold}
                onMouseLeave={e=>e.target.style.background=G.ink}
              >Choisir Coach</Link>
            </div>

            {/* Club */}
            <div style={{ background:G.ink,padding:'48px 40px',position:'relative',transition:'background .2s',color:'#fff' }}
              onMouseEnter={e=>e.currentTarget.style.background='#1a1a17'}
              onMouseLeave={e=>e.currentTarget.style.background=G.ink}
            >
              <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:G.gold,boxShadow:`0 0 12px rgba(201,162,39,0.4)` }}/>
              <span style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.16em',textTransform:'uppercase',color:G.gold,display:'block',marginBottom:14 }}>⚡ Recommandé · Pour les clubs</span>
              <div style={{ fontFamily:G.display,fontSize:36,textTransform:'uppercase',letterSpacing:'.03em',marginBottom:16,color:'#fff' }}>Club</div>
              <div style={{ display:'flex',alignItems:'baseline',gap:4,marginBottom:4 }}>
                <span style={{ fontFamily:G.mono,fontSize:18,color:'rgba(255,255,255,.35)' }}>€</span>
                <span style={{ fontFamily:G.display,fontSize:80,lineHeight:1,letterSpacing:'-.02em',color:'#fff' }}>99</span>
              </div>
              <div style={{ fontFamily:G.mono,fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:32 }}>/ mois · sans engagement</div>
              <ul style={{ listStyle:'none',display:'flex',flexDirection:'column',gap:9,marginBottom:36 }}>
                {['10 matchs analysés / mois','Multi-catégories (N3, U19, U17…)','Multi-équipes','Gestion effectif illimitée','Vue globale progression du club','Support prioritaire dédié','Accessible sur tous supports'].map(item => (
                  <li key={item} style={{ fontSize:13,color:'rgba(255,255,255,.6)',display:'flex',alignItems:'flex-start',gap:10 }}>
                    <span style={{ color:G.gold,flexShrink:0,marginTop:2 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" style={{ fontFamily:G.mono,fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',fontWeight:700,padding:'13px 30px',borderRadius:2,background:G.gold,color:G.ink,border:'none',cursor:'pointer',textDecoration:'none',display:'inline-block',transition:'background .15s' }}
                onMouseEnter={e=>e.target.style.background='#d4af3a'}
                onMouseLeave={e=>e.target.style.background=G.gold}
              >Choisir Club</Link>
            </div>
          </div>
          <p style={{ textAlign:'center',fontFamily:G.mono,fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',color:G.muted,marginTop:20 }}>Sans engagement</p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      {/* ── WAITLIST ── */}
      <section id="waitlist" style={{ background:G.ink, borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
        <WaitlistSection />
      </section>

      <section id="contact" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',background:G.cream,borderBottom:`1px solid ${G.rule}` }}>
        <div style={{ padding:'80px 60px',borderRight:`1px solid ${G.rule}`,display:'flex',flexDirection:'column',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:20 }}>
              <span style={{ width:16,height:1,background:G.gold,display:'inline-block' }}/>Contact
            </div>
            <h2 style={{ fontFamily:G.display,fontSize:'clamp(42px,5vw,68px)',textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',marginBottom:24 }}>
              Contactez-<br/><span style={{ color:G.gold }}>nous.</span>
            </h2>
            <p style={{ fontSize:14,lineHeight:1.8,color:G.ink2,maxWidth:340,marginBottom:36 }}>
              Smart Video Analysis
            </p>
          </div>
          <a href="mailto:contact@insightball.com" style={{ fontFamily:G.serif,fontStyle:'italic',fontSize:18,color:G.gold,textDecoration:'none',borderBottom:`1px solid rgba(201,162,39,0.25)`,paddingBottom:3,display:'inline-block',transition:'border-color .15s' }}
            onMouseEnter={e=>e.target.style.borderBottomColor=G.gold}
            onMouseLeave={e=>e.target.style.borderBottomColor='rgba(201,162,39,0.25)'}
          >contact@insightball.com</a>
        </div>
        <div style={{ padding:'80px 60px',background:G.paper }}>
          <form onSubmit={handleContactSubmit} style={{ display:'flex',flexDirection:'column' }}>
            {[
              {label:'Nom',  type:'text',  key:'name',    ph:'Votre nom'},
              {label:'Email',type:'email', key:'email',   ph:'votre@email.com'},
            ].map(f => (
              <div key={f.key} style={{ borderBottom:`1px solid ${G.rule}`,padding:'16px 0',display:'flex',flexDirection:'column',gap:5 }}>
                <label style={{ fontFamily:G.mono,fontSize:8,letterSpacing:'.22em',textTransform:'uppercase',color:G.muted }}>{f.label}</label>
                <input type={f.type} required value={contactForm[f.key]}
                  onChange={e=>setContactForm({...contactForm,[f.key]:e.target.value})}
                  placeholder={f.ph}
                  style={{ background:'transparent',border:'none',outline:'none',color:G.ink,fontFamily:G.serif,fontSize:15 }}
                />
              </div>
            ))}
            <div style={{ borderBottom:`1px solid ${G.rule}`,padding:'16px 0',display:'flex',flexDirection:'column',gap:5 }}>
              <label style={{ fontFamily:G.mono,fontSize:8,letterSpacing:'.22em',textTransform:'uppercase',color:G.muted }}>Message</label>
              <textarea required rows={5} value={contactForm.message}
                onChange={e=>setContactForm({...contactForm,message:e.target.value})}
                placeholder="Votre message…"
                style={{ background:'transparent',border:'none',outline:'none',color:G.ink,fontFamily:G.serif,fontSize:15,resize:'none' }}
              />
            </div>
            <button type="submit" style={{
              marginTop:28,alignSelf:'flex-start',
              fontFamily:G.mono,fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',fontWeight:700,
              padding:'13px 32px',borderRadius:2,background:G.ink,color:'#fff',
              border:'none',cursor:'pointer',transition:'background .15s'
            }}
              onMouseEnter={e=>e.target.style.background=G.gold}
              onMouseLeave={e=>e.target.style.background=G.ink}
            >Envoyer →</button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:G.ink,borderTop:`2px solid ${G.gold}`,padding:'40px 40px 32px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:32,paddingBottom:28,borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
          {/* Logo + tagline */}
          <div style={{ display:'flex',alignItems:'center',gap:14 }}>
            <img src="/logo.svg" alt="InsightBall" style={{ width:36,height:36 }}/>
            <div>
              <div style={{ fontFamily:G.display,fontSize:20,letterSpacing:'.06em',color:'#fff',lineHeight:1 }}>
                INSIGHT<span style={{ color:G.gold }}>BALL</span>
              </div>
              <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginTop:4 }}>
                Smart Video Analysis
              </div>
            </div>
          </div>
          {/* Nav links */}
          <div style={{ display:'flex',gap:32,paddingTop:4 }}>
            {[['#demo','Démo'],['#features','Fonctionnalités'],['#pricing','Tarifs'],['#waitlist','Accès anticipé'],['#contact','Contact']].map(([h,l]) => (
              <a key={h} href={h} style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.35)',textDecoration:'none',transition:'color .15s' }}
                onMouseEnter={e=>e.target.style.color='rgba(255,255,255,.7)'}
                onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.35)'}
              >{l}</a>
            ))}
          </div>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.2)' }}>
            © 2026 InsightBall · Tous droits réservés
          </div>
          <div style={{ fontFamily:G.mono,fontSize:9,letterSpacing:'.08em',color:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',gap:6 }}>
            We live football <span style={{ color:'rgba(201,162,39,0.5)' }}>♥</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
