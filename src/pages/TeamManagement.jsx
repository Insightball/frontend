import { useState, useEffect } from 'react'
import { Users, UserPlus, Calendar, Bell, MessageSquare, ChevronRight, TrendingUp } from 'lucide-react'
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
    try { setLoading(true); const data = await playerService.getPlayers(); setPlayers(data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const playersByCategory = players.reduce((acc, p) => {
    const cat = p.category || 'Autres'; if (!acc[cat]) acc[cat] = []; acc[cat].push(p); return acc
  }, {})

  const staff = [
    { id: '1', name: 'Jean Dupont',     role: 'Entraîneur Principal', category: 'N3' },
    { id: '2', name: 'Marie Martin',    role: 'Entraîneur Adjoint',   category: 'N3' },
    { id: '3', name: 'Pierre Lefebvre', role: 'Préparateur Physique',  category: 'Tous' },
    { id: '4', name: 'Sophie Bernard',  role: 'Entraîneur U19',        category: 'U19' },
  ]

  const trainingSchedule = [
    { day: 'Lundi',    time: '18h00 – 20h00', category: 'N3',  location: 'Terrain A' },
    { day: 'Mardi',    time: '17h00 – 19h00', category: 'U19', location: 'Terrain B' },
    { day: 'Mercredi', time: '18h00 – 20h00', category: 'N3',  location: 'Terrain A' },
    { day: 'Jeudi',    time: '17h00 – 19h00', category: 'U19', location: 'Terrain B' },
    { day: 'Vendredi', time: '18h00 – 20h00', category: 'N3',  location: 'Terrain A' },
  ]

  const upcomingMatches = [
    { date: '2026-02-22', category: 'N3',  opponent: 'FC Marseille', players: 18 },
    { date: '2026-02-23', category: 'U19', opponent: 'AS Monaco',    players: 16 },
  ]

  const cardStyle = { background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, padding: '24px' }
  const sectionTitle = { fontFamily: G.mono, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#0f0f0d', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }

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

      {/* Effectif par catégorie */}
      <div style={{ ...cardStyle, marginBottom: 1 }}>
        <div style={sectionTitle}>
          <div style={{ width: 3, height: 16, background: G.gold }} />
          Effectif par catégorie
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.1em' }}>Chargement...</div>
        ) : Object.keys(playersByCategory).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.08em' }}>Aucun joueur enregistré</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(playersByCategory).map(([cat, catPlayers]) => (
              <div key={cat} style={{ background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', padding: '3px 10px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold }}>{cat}</span>
                  <span style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>{catPlayers.length} joueurs</span>
                </div>
                <div style={{ display: 'flex', gap: 8, fontFamily: G.mono, fontSize: 9, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>
                  {['Gardien','Défenseur','Milieu','Attaquant'].map(pos => {
                    const n = catPlayers.filter(p => p.position === pos).length
                    return n > 0 ? <span key={pos} style={{ padding: '2px 8px', border: `1px solid rgba(15,15,13,0.09)` }}>{pos.charAt(0)} {n}</span> : null
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border, marginBottom: 1 }}>
        {/* Entraînements */}
        <div style={{ ...cardStyle, background: '#ffffff' }}>
          <div style={sectionTitle}>
            <div style={{ width: 3, height: 16, background: G.gold }} />
            Planning entraînements
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
            {trainingSchedule.map((t, i) => (
              <div key={i} style={{ background: '#ffffff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
                onMouseLeave={e => e.currentTarget.style.background = '#0a0a08'}>
                <div style={{ width: 56, flexShrink: 0 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: '#0f0f0d' }}>{t.day}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>{t.time}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: '#0f0f0d' }}>{t.category}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>{t.location}</div>
                </div>
                <Calendar size={12} color={G.muted} />
              </div>
            ))}
          </div>
        </div>

        {/* Prochains matchs */}
        <div style={{ ...cardStyle, background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={sectionTitle}>
              <div style={{ width: 3, height: 16, background: G.gold }} />
              Prochaines convocations
            </div>
            <button style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Créer <Bell size={10} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
            {upcomingMatches.map((match, i) => (
              <div key={i}
                style={{ background: '#ffffff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
                onMouseLeave={e => e.currentTarget.style.background = '#0a0a08'}>
                <div style={{ width: 40, height: 40, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 13, fontWeight: 700, color: G.gold, lineHeight: 1 }}>
                    {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric' })}
                  </div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(15,15,13,0.45)', letterSpacing: '.08em' }}>
                    {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 700, color: '#0f0f0d', letterSpacing: '.06em', marginBottom: 4 }}>vs {match.opponent}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '1px 8px', border: `1px solid ${G.goldBdr}`, color: G.gold }}>{match.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={9} />{match.players} joueurs</span>
                  </div>
                </div>
                <ChevronRight size={14} color={G.muted} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border }}>
        {/* Staff */}
        <div style={{ ...cardStyle, background: '#ffffff' }}>
          <div style={sectionTitle}>
            <div style={{ width: 3, height: 16, background: G.gold }} />
            Staff technique
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border, marginBottom: 12 }}>
            {staff.map(member => (
              <div key={member.id} style={{ background: '#ffffff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = '#0a0a08'}>
                <div style={{ width: 36, height: 36, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={14} color={G.gold} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 11, color: '#0f0f0d', letterSpacing: '.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em', marginTop: 2 }}>{member.role}</div>
                </div>
                <span style={{ fontFamily: G.mono, fontSize: 8, padding: '2px 8px', border: `1px solid rgba(15,15,13,0.09)`, color: 'rgba(15,15,13,0.45)', letterSpacing: '.08em' }}>{member.category}</span>
              </div>
            ))}
          </div>
          <button style={{ width: '100%', padding: '11px', background: 'transparent', border: `1px solid rgba(15,15,13,0.09)`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = G.goldBdr; e.currentTarget.style.color = G.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted }}>
            <UserPlus size={12} /> Ajouter un membre
          </button>
        </div>

        {/* Actions + Stats */}
        <div style={{ background: '#ffffff', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Actions */}
          <div>
            <div style={sectionTitle}>
              <div style={{ width: 3, height: 16, background: G.gold }} />
              Actions rapides
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
              {[
                { label: 'Créer convocation', icon: Bell, primary: true },
                { label: 'Message groupe',     icon: MessageSquare },
                { label: 'Planifier entraînement', icon: Calendar },
              ].map(({ label, icon: Icon, primary }) => (
                <button key={label} style={{
                  padding: '12px 16px', background: primary ? G.goldBg : '#0a0a08',
                  border: 'none', display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
                  color: primary ? G.gold : G.muted, cursor: 'pointer', transition: 'background .15s', textAlign: 'left',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = primary ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = primary ? G.goldBg : '#0a0a08'}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div>
            <div style={sectionTitle}>
              <div style={{ width: 3, height: 16, background: G.gold }} />
              Performance globale
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
              {[
                { label: 'Taux de présence', value: '92%', color: '#22c55e' },
                { label: 'Matchs gagnés',    value: '75%', color: G.gold },
                { label: 'Joueurs blessés',  value: '3',   color: '#ef4444' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#ffffff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>{label}</span>
                  <span style={{ fontFamily: G.display, fontSize: 22, color, letterSpacing: '.02em' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TeamManagement
