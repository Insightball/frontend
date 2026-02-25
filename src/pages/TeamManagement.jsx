import { useState, useEffect } from 'react'
import { Users, UserPlus, TrendingUp } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import playerService from '../services/playerService'

const G = {
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(15,15,13,0.09)', muted: 'rgba(15,15,13,0.42)',
}

function TeamManagement() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPlayers() }, [])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const data = await playerService.getPlayers()
      setPlayers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const playersByCategory = players.reduce((acc, p) => {
    const cat = p.category || 'Autres'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const cardStyle = {
    background: '#ffffff',
    border: `1px solid rgba(15,15,13,0.09)`,
    padding: '24px',
  }

  const sectionTitle = {
    fontFamily: G.mono, fontSize: 10, letterSpacing: '.16em',
    textTransform: 'uppercase', color: '#0f0f0d', marginBottom: 18,
    display: 'flex', alignItems: 'center', gap: 10,
  }

  const stats = [
    {
      label: 'Total joueurs',
      value: players.length,
      color: G.gold,
    },
    {
      label: 'Catégories',
      value: Object.keys(playersByCategory).length,
      color: '#3b82f6',
    },
    {
      label: 'Joueurs actifs',
      value: players.filter(p => p.status === 'actif').length,
      color: '#22c55e',
    },
    {
      label: 'Blessés',
      value: players.filter(p => p.status === 'blessé').length,
      color: '#ef4444',
    },
  ]

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Gestion équipe
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: 44, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#0f0f0d', margin: 0 }}>
          Mon<br /><span style={{ color: G.gold }}>club.</span>
        </h1>
      </div>

      {/* Stats globales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1, background: G.border, marginBottom: 1 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#ffffff', padding: '20px 18px', borderTop: `2px solid ${s.color}` }}>
            <div style={{ fontFamily: G.display, fontSize: 40, lineHeight: 1, color: s.color, marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Effectif par catégorie */}
      <div style={{ ...cardStyle, marginBottom: 1 }}>
        <div style={sectionTitle}>
          <div style={{ width: 3, height: 16, background: G.gold }} />
          Effectif par catégorie
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.1em' }}>
            Chargement...
          </div>
        ) : Object.keys(playersByCategory).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: 'rgba(15,15,13,0.12)', marginBottom: 10 }}>Aucun joueur</div>
            <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.08em' }}>
              Ajoutez des joueurs depuis la page Effectif
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
            {Object.entries(playersByCategory).map(([cat, catPlayers]) => (
              <div key={cat} style={{
                background: '#ffffff', padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{
                    fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em',
                    textTransform: 'uppercase', padding: '3px 12px',
                    background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold,
                  }}>{cat}</span>
                  <span style={{ fontFamily: G.mono, fontSize: 11, color: '#0f0f0d', letterSpacing: '.04em' }}>
                    {catPlayers.length} joueur{catPlayers.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Gardien', 'Défenseur', 'Milieu', 'Attaquant'].map(pos => {
                    const n = catPlayers.filter(p => p.position === pos).length
                    return n > 0 ? (
                      <span key={pos} style={{
                        fontFamily: G.mono, fontSize: 9, letterSpacing: '.06em',
                        padding: '2px 10px', border: `1px solid rgba(15,15,13,0.09)`,
                        color: G.muted,
                      }}>
                        {pos.charAt(0)} {n}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance globale */}
      <div style={{ ...cardStyle }}>
        <div style={sectionTitle}>
          <div style={{ width: 3, height: 16, background: G.gold }} />
          Performance globale
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
          {[
            { label: 'Taux de présence', value: '—', color: '#22c55e' },
            { label: 'Matchs gagnés',    value: '—', color: G.gold },
            { label: 'Joueurs blessés',  value: players.filter(p => p.status === 'blessé').length, color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: '#ffffff', padding: '14px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em' }}>{label}</span>
              <span style={{ fontFamily: G.display, fontSize: 26, color, letterSpacing: '.02em' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

    </DashboardLayout>
  )
}

export default TeamManagement
