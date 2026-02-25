import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import playerService from '../services/playerService'

const G = {
  bg: '#0a0908', bg2: '#0f0e0c',
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.35)',
  text: '#f5f2eb', green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
}

export default function TeamManagement() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPlayers() }, [])

  const loadPlayers = async () => {
    try { setLoading(true); const data = await playerService.getPlayers(); setPlayers(data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const playersByCategory = players.reduce((acc, p) => {
    const cat = p.category || 'Autres'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const stats = [
    { label: 'Total joueurs',  value: players.length,                                    color: G.gold  },
    { label: 'Catégories',     value: Object.keys(playersByCategory).length,              color: G.blue  },
    { label: 'Actifs',         value: players.filter(p => p.status === 'actif').length,   color: G.green },
    { label: 'Blessés',        value: players.filter(p => p.status === 'blessé').length,  color: G.red   },
  ]

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Gestion équipe
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: G.text, margin: 0 }}>
          Mon<br /><span style={{ color: G.gold }}>club.</span>
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: G.border, marginBottom: 1 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: G.bg2, padding: '24px 20px', borderTop: `2px solid ${s.color}` }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontFamily: G.display, fontSize: 48, lineHeight: 1, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Effectif par catégorie */}
      <div style={{ background: G.bg2, border: `1px solid ${G.border}`, marginBottom: 1 }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, background: G.gold }} />
          <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted }}>Effectif par catégorie</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>Chargement...</div>
        ) : Object.keys(playersByCategory).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', color: 'rgba(245,242,235,0.08)', marginBottom: 12 }}>Aucun joueur</div>
            <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.08em' }}>Ajoutez des joueurs depuis la page Effectif</div>
          </div>
        ) : Object.entries(playersByCategory).map(([cat, catPlayers], i, arr) => (
          <div key={cat} style={{
            padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: i < arr.length - 1 ? `1px solid ${G.border}` : 'none', transition: 'background .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', padding: '3px 12px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold }}>{cat}</span>
              <span style={{ fontFamily: G.mono, fontSize: 11, color: G.text, letterSpacing: '.04em' }}>{catPlayers.length} joueur{catPlayers.length > 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Gardien', 'Défenseur', 'Milieu', 'Attaquant'].map(pos => {
                const n = catPlayers.filter(p => p.position === pos).length
                return n > 0 ? <span key={pos} style={{ fontFamily: G.mono, fontSize: 9, padding: '2px 10px', border: `1px solid ${G.border}`, color: G.muted }}>{pos.charAt(0)} {n}</span> : null
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div style={{ background: G.bg2, border: `1px solid ${G.border}` }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, background: G.gold }} />
          <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted }}>Performance globale</span>
        </div>
        {[
          { label: 'Taux de présence', value: '—',                                                    color: G.green },
          { label: 'Matchs gagnés',    value: '—',                                                    color: G.gold  },
          { label: 'Joueurs blessés',  value: players.filter(p => p.status === 'blessé').length,       color: G.red   },
        ].map(({ label, value, color }, i, arr) => (
          <div key={label} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < arr.length - 1 ? `1px solid ${G.border}` : 'none' }}>
            <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em' }}>{label}</span>
            <span style={{ fontFamily: G.display, fontSize: 28, color }}>{value}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
