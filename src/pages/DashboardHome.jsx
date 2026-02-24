import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, Users, Film, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
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
  rule:    'rgba(15,15,13,0.09)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.25)',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function SectionKicker({ children }) {
  return (
    <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ display: 'inline-block', width: 16, height: 1, background: G.gold }} />
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, accentTop }) {
  return (
    <div style={{
      background: G.white, border: `1px solid ${G.rule}`,
      borderTop: `2px solid ${accentTop || G.rule}`,
      padding: '22px 20px', transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,15,13,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={G.gold} />
        </div>
        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>{sub}</span>
      </div>
      <div style={{ fontFamily: G.display, fontSize: 50, lineHeight: 1, letterSpacing: '.01em', color: G.ink, marginBottom: 6 }}>{value}</div>
      <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em' }}>{label}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'completed')
    return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.gold, border: `1px solid ${G.goldBdr}`, background: G.goldBg, padding: '3px 10px' }}>✓ Terminé</span>
  if (status === 'processing')
    return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.06)', padding: '3px 10px' }}>⏳ En cours</span>
  return null
}

function DashboardHome() {
  const { user } = useAuth()
  const [matches, setMatches]   = useState([])
  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [matchesData, playersData] = await Promise.all([
        matchService.getMatches({ limit: 5 }),
        playerService.getPlayers(),
      ])
      setMatches(matchesData)
      setPlayers(playersData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const completedMatches  = matches.filter(m => m.status === 'completed').length
  const processingMatches = matches.filter(m => m.status === 'processing').length
  const totalPlayers      = players.length
  const quota             = 10

  const upcomingMatches = [
    { date: '2026-02-22', opponent: 'AS Furiani',      category: 'N3' },
    { date: '2026-03-01', opponent: 'FC Bastia-Borgo', category: 'N3' },
    { date: '2026-03-08', opponent: 'UF Zonza',        category: 'N3' },
  ]

  const topPlayers = players.slice(0, 5).map((p, i) => ({
    ...p, rating: (8.5 - i * 0.3).toFixed(1), matchesCount: 10 - i, trend: i % 2 === 0 ? 'up' : 'down',
  }))

  const notifications = [
    { type: 'success', message: 'Match vs Lyon analysé avec succès',   time: 'Il y a 2h'      },
    { type: 'warning', message: 'Quota 7/10 matchs utilisés ce mois',  time: 'Il y a 1 jour'   },
    { type: 'info',    message: '3 joueurs en progression ce mois',    time: 'Il y a 2 jours'  },
  ]

  const CardHead = ({ title, linkLabel, linkTo }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${G.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 2, height: 18, background: G.gold }} />
        <h2 style={{ fontFamily: G.display, fontSize: 17, letterSpacing: '.04em', textTransform: 'uppercase', color: G.ink, margin: 0 }}>{title}</h2>
      </div>
      {linkLabel && (
        <Link to={linkTo} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          {linkLabel} <ArrowRight size={11} />
        </Link>
      )}
    </div>
  )

  return (
    <DashboardLayout>
      <style>{`${FONTS} * { box-sizing: border-box; }`}</style>
      <div style={{ maxWidth: 1200 }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32, borderBottom: `1px solid ${G.rule}`, paddingBottom: 24 }}>
          <SectionKicker>Tableau de bord</SectionKicker>
          <h1 style={{ fontFamily: G.display, fontSize: 'clamp(36px,4vw,52px)', letterSpacing: '.02em', textTransform: 'uppercase', lineHeight: .92, color: G.ink, margin: '0 0 6px' }}>
            Bienvenue,{' '}
            <span style={{ color: G.gold }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em', margin: 0 }}>
            {user?.club_name || 'Votre club'}
          </p>
        </div>

        {/* STAT CARDS */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: G.rule, marginBottom: 32 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: G.white, padding: '22px 20px', height: 130 }}>
                <div style={{ background: G.paper, height: 34, width: 34, marginBottom: 14 }} />
                <div style={{ background: G.paper, height: 44, width: '60%', marginBottom: 8 }} />
                <div style={{ background: G.paper, height: 10, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: G.rule, marginBottom: 32 }}>
            <StatCard icon={CheckCircle} label="Matchs analysés"         value={completedMatches}  sub="Ce mois"  accentTop={G.gold} />
            <StatCard icon={Clock}       label="En analyse"               value={processingMatches} sub="Actif" />
            <StatCard icon={Users}       label="Joueurs dans l'effectif"  value={totalPlayers}      sub="Effectif" />
            <div style={{ background: G.white, border: `1px solid ${G.rule}`, borderTop: `2px solid ${G.rule}`, padding: '22px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Film size={15} color={G.gold} />
                </div>
                <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>Quota</span>
              </div>
              <div style={{ fontFamily: G.display, fontSize: 50, lineHeight: 1, color: G.ink, marginBottom: 4 }}>{quota - completedMatches}</div>
              <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, marginBottom: 12, letterSpacing: '.04em' }}>Matchs restants / {quota}</div>
              <div style={{ height: 2, background: G.rule, width: '100%' }}>
                <div style={{ height: '100%', width: `${(completedMatches / quota) * 100}%`, background: G.gold, transition: 'width .5s' }} />
              </div>
            </div>
          </div>
        )}

        {/* BODY GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 1, background: G.rule, alignItems: 'start' }}>

          {/* Col gauche + centre */}
          <div style={{ gridColumn: '1 / 3', display: 'flex', flexDirection: 'column', gap: 1 }}>

            {/* Derniers matchs */}
            <div style={{ background: G.white, border: `1px solid ${G.rule}` }}>
              <CardHead title="Derniers matchs" linkLabel="Voir tout" linkTo="/dashboard/matches" />
              <div style={{ padding: '0 22px 16px' }}>
                {loading ? (
                  [1,2,3].map(i => <div key={i} style={{ height: 52, background: G.paper, marginBottom: 1, marginTop: 1 }} />)
                ) : matches.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '44px 0' }}>
                    <Film size={28} color={G.muted} style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginBottom: 20, letterSpacing: '.06em' }}>Aucun match analysé</p>
                    <Link to="/dashboard/matches" style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', padding: '11px 24px', background: G.ink, color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                      Uploader un match →
                    </Link>
                  </div>
                ) : (
                  matches.slice(0, 4).map((match, i) => (
                    <Link key={match.id} to={`/dashboard/matches/${match.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < 3 ? `1px solid ${G.rule}` : 'none', textDecoration: 'none', transition: 'opacity .15s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <div style={{ width: 44, flexShrink: 0, textAlign: 'center', padding: '6px 0', background: G.paper, border: `1px solid ${G.rule}` }}>
                        <div style={{ fontFamily: G.display, fontSize: 20, lineHeight: 1, color: G.ink }}>{new Date(match.date).getDate()}</div>
                        <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                          {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                          <span style={{ fontFamily: G.display, fontSize: 15, letterSpacing: '.02em', textTransform: 'uppercase', color: G.ink }}>
                            {match.category} — {match.opponent}
                          </span>
                          <StatusBadge status={match.status} />
                        </div>
                        <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>
                          {new Date(match.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </div>
                      </div>
                      {match.status === 'completed' && match.stats && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                          {[
                            { lbl: 'Poss',   val: `${match.stats.possession}%` },
                            { lbl: 'Passes', val: match.stats.passes },
                            { lbl: 'Tirs',   val: match.stats.shots },
                          ].map(s => (
                            <div key={s.lbl} style={{ textAlign: 'center' }}>
                              <div style={{ fontFamily: G.display, fontSize: 20, lineHeight: 1, color: G.gold, marginBottom: 2 }}>{s.val}</div>
                              <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{s.lbl}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <ArrowRight size={13} color={G.gold} style={{ flexShrink: 0 }} />
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Top joueurs */}
            <div style={{ background: G.white, border: `1px solid ${G.rule}` }}>
              <CardHead title="Top joueurs du mois" linkLabel="Voir tout" linkTo="/dashboard/players" />
              <div style={{ padding: '0 22px 16px' }}>
                {loading ? (
                  [1,2,3].map(i => <div key={i} style={{ height: 52, background: G.paper, marginBottom: 1, marginTop: 1 }} />)
                ) : topPlayers.length === 0 ? (
                  <p style={{ padding: '32px 0', textAlign: 'center', fontFamily: G.mono, fontSize: 11, color: G.muted }}>Aucun joueur enregistré</p>
                ) : (
                  topPlayers.map((player, i) => (
                    <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i < topPlayers.length - 1 ? `1px solid ${G.rule}` : 'none' }}>
                      <div style={{ fontFamily: G.display, fontSize: 18, color: i === 0 ? G.gold : G.muted, width: 24, flexShrink: 0, textAlign: 'center' }}>{i + 1}</div>
                      {player.photo_url ? (
                        <img src={player.photo_url} alt={player.name} style={{ width: 38, height: 38, objectFit: 'cover', flexShrink: 0, border: `1px solid ${G.rule}` }} />
                      ) : (
                        <div style={{ width: 38, height: 38, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Users size={14} color={G.gold} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: G.mono, fontSize: 12, color: G.ink, fontWeight: 500, marginBottom: 2 }}>{player.name}</div>
                        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                          {player.position} · {player.matchesCount} matchs
                        </div>
                      </div>
                      <div style={{ fontFamily: G.display, fontSize: 26, lineHeight: 1, color: G.gold }}>{player.rating}</div>
                      <TrendingUp size={13} color={player.trend === 'up' ? G.gold : G.muted}
                        style={{ transform: player.trend === 'up' ? 'none' : 'rotate(180deg)', flexShrink: 0 }} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

            {/* Alertes */}
            <div style={{ background: G.white, border: `1px solid ${G.rule}` }}>
              <CardHead title="Alertes" />
              {notifications.map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px', borderBottom: i < notifications.length - 1 ? `1px solid ${G.rule}` : 'none' }}>
                  <div style={{ width: 28, height: 28, flexShrink: 0, background: n.type === 'success' ? G.goldBg : G.paper, border: `1px solid ${n.type === 'success' ? G.goldBdr : G.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {n.type === 'success' && <CheckCircle size={12} color={G.gold} />}
                    {n.type === 'warning' && <AlertCircle size={12} color={G.muted} />}
                    {n.type === 'info'    && <TrendingUp  size={12} color={G.muted} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: G.ink2, lineHeight: 1.5, margin: '0 0 3px' }}>{n.message}</p>
                    <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', color: G.muted, margin: 0 }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prochains matchs */}
            <div style={{ background: G.white, border: `1px solid ${G.rule}` }}>
              <CardHead title="Prochains matchs" />
              {upcomingMatches.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i < upcomingMatches.length - 1 ? `1px solid ${G.rule}` : 'none' }}>
                  <div style={{ width: 40, flexShrink: 0, textAlign: 'center', padding: '5px 0', background: G.paper, border: `1px solid ${G.rule}` }}>
                    <div style={{ fontFamily: G.display, fontSize: 18, lineHeight: 1, color: G.ink }}>{new Date(m.date).getDate()}</div>
                    <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                      {new Date(m.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: G.mono, fontSize: 12, color: G.ink, fontWeight: 500, marginBottom: 2 }}>{m.opponent}</div>
                    <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: G.muted }}>{m.category}</div>
                  </div>
                  <Calendar size={13} color={G.gold} />
                </div>
              ))}
            </div>

            {/* CTA upload */}
            <div style={{ background: G.ink, padding: '24px 20px', borderTop: `2px solid ${G.gold}` }}>
              <div style={{ fontFamily: G.display, fontSize: 20, letterSpacing: '.03em', textTransform: 'uppercase', color: '#fff', marginBottom: 6, lineHeight: 1 }}>
                Analyser<br /><span style={{ color: G.gold }}>un match</span>
              </div>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, marginBottom: 18, letterSpacing: '.04em' }}>
                Uploadez votre vidéo et recevez votre rapport en 5h.
              </p>
              <Link to="/dashboard/matches" style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', padding: '11px 24px', background: G.gold, color: G.ink, textDecoration: 'none', display: 'inline-block', fontWeight: 700 }}
                onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                onMouseLeave={e => e.currentTarget.style.background = G.gold}
              >
                Uploader →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardHome
