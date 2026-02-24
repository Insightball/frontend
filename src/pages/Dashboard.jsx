import { useState } from 'react'
import { TrendingUp, Activity, Target, BarChart2 } from 'lucide-react'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  paper:'#f5f2eb', cream:'#faf8f4', white:'#ffffff',
  ink:'#0f0f0d', ink2:'#2a2a26',
  muted:'rgba(15,15,13,0.42)', rule:'rgba(15,15,13,0.09)',
  gold:'#c9a227', goldD:'#a8861f',
  goldBg:'rgba(201,162,39,0.07)', goldBdr:'rgba(201,162,39,0.25)',
  mono:"'JetBrains Mono', monospace", display:"'Anton', sans-serif",
}

function Dashboard() {
  const [mode, setMode] = useState('collectif')

  const recoveryZones = [
    { label: 'DEF 1/3', pct: 65 },
    { label: 'MID 1/3', pct: 85 },
    { label: 'ATT 1/3', pct: 40 },
  ]

  const shots = [
    { x: 25, y: 30, on: true  }, { x: 50, y: 50, on: true  },
    { x: 60, y: 35, on: true  }, { x: 35, y: 65, on: false },
    { x: 70, y: 55, on: false }, { x: 45, y: 25, on: true  },
  ]

  return (
    <div style={{ minHeight: '100vh', background: G.cream, paddingTop: 80, paddingBottom: 48 }}>
      <style>{`${FONTS} * { box-sizing: border-box; } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${G.rule}`, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>Flux Live</span>
            </div>
            <span style={{ color: G.rule, fontSize: 16 }}>|</span>
            <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.08em' }}>Match · 882-X6</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['collectif', 'individuel'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '8px 20px',
                background: mode === m ? G.ink : 'transparent',
                color: mode === m ? '#fff' : G.muted,
                border: mode === m ? 'none' : `1px solid ${G.rule}`,
                fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
                cursor: 'pointer', transition: 'all .15s',
              }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: G.rule }}>

          {/* Dynamique du match col 1-2 */}
          <div style={{ gridColumn: '1 / 3', background: G.white, border: `1px solid ${G.rule}`, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={13} color={G.gold} />
              </div>
              <h3 style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, margin: 0 }}>Dynamique du Match</h3>
            </div>
            <div style={{ height: 200, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={G.gold} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={G.gold} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0,45,90,135,180].map(y => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(15,15,13,0.06)" strokeWidth="1" />
                ))}
                <path d="M 0 110 Q 100 70 200 90 T 400 80 T 600 100 T 800 85 L 800 180 L 0 180 Z" fill="url(#areaGrad)" />
                <path d="M 0 110 Q 100 70 200 90 T 400 80 T 600 100 T 800 85" fill="none" stroke={G.gold} strokeWidth="2" />
                <text x="10" y="175" fill="rgba(15,15,13,0.35)" fontSize="10" fontFamily="monospace">0'</text>
                <text x="390" y="175" fill="rgba(15,15,13,0.35)" fontSize="10" fontFamily="monospace">MT</text>
                <text x="775" y="175" fill="rgba(15,15,13,0.35)" fontSize="10" fontFamily="monospace">90'</text>
              </svg>
            </div>
          </div>

          {/* Passes Totales */}
          <div style={{ background: G.white, border: `1px solid ${G.rule}`, borderTop: `2px solid ${G.gold}`, padding: '24px' }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, marginBottom: 12 }}>Passes Totales</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
              <div style={{ fontFamily: G.display, fontSize: 64, lineHeight: 1, color: G.ink }}>482</div>
              <div style={{ fontFamily: G.display, fontSize: 28, lineHeight: 1, color: G.gold }}>88%</div>
            </div>
            <div style={{ height: 3, background: G.paper }}>
              <div style={{ height: '100%', width: '88%', background: G.gold }} />
            </div>
          </div>

          {/* Zones récupération */}
          <div style={{ background: G.white, border: `1px solid ${G.rule}`, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={13} color={G.gold} />
              </div>
              <h3 style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, margin: 0 }}>Zones de Récupération</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recoveryZones.map(z => (
                <div key={z.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.08em' }}>{z.label}</span>
                    <span style={{ fontFamily: G.mono, fontSize: 9, color: G.ink2, letterSpacing: '.04em' }}>{z.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: G.paper, border: `1px solid ${G.rule}` }}>
                    <div style={{ height: '100%', width: `${z.pct}%`, background: G.gold }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pressing Haut */}
          <div style={{ background: G.white, border: `1px solid ${G.rule}`, padding: '24px' }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, marginBottom: 12 }}>Pressing Haut</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <div style={{ fontFamily: G.display, fontSize: 64, lineHeight: 1, color: G.ink }}>18</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={14} color="#22c55e" />
                <span style={{ fontFamily: G.mono, fontSize: 12, color: '#22c55e' }}>+4</span>
              </div>
            </div>
            <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>Top 5% moyenne ligue</div>
          </div>

          {/* Carte tirs */}
          <div style={{ background: G.white, border: `1px solid ${G.rule}`, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={13} color={G.gold} />
              </div>
              <h3 style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, margin: 0 }}>
                Carte des Tirs ({shots.length})
              </h3>
            </div>
            <svg width="100%" viewBox="0 0 200 130" style={{ display: 'block' }}>
              <rect width="200" height="130" fill={G.cream} />
              <g stroke="rgba(15,15,13,0.12)" strokeWidth="1" fill="none">
                <rect x="4" y="4" width="192" height="122" />
                <line x1="100" y1="4" x2="100" y2="126" />
                <circle cx="100" cy="65" r="20" />
                <rect x="4" y="43" width="30" height="44" />
                <rect x="166" y="43" width="30" height="44" />
                <rect x="4" y="52" width="14" height="26" />
                <rect x="182" y="52" width="14" height="26" />
              </g>
              {shots.map((s, i) => (
                <circle key={i} cx={s.x * 2} cy={s.y * 1.3} r={s.on ? 5 : 4}
                  fill={s.on ? G.gold : '#ef4444'} fillOpacity={0.85} stroke="#fff" strokeWidth="1" />
              ))}
            </svg>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: G.mono, fontSize: 9, color: G.muted }}>
                <span style={{ width: 8, height: 8, background: G.gold, borderRadius: '50%', display: 'inline-block' }} />
                Cadré ({shots.filter(s => s.on).length})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: G.mono, fontSize: 9, color: G.muted }}>
                <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
                Non cadré ({shots.filter(s => !s.on).length})
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
