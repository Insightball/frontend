import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, Users, Film, CheckCircle, Clock, ArrowRight, Award, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { useAuth } from '../context/AuthContext'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

/* ─── Palette ─────────────────────────────────── */
const G = {
  paper:   '#f5f2eb',
  cream:   '#faf8f4',
  ink:     '#0f0f0d',
  ink2:    '#2a2a26',
  muted:   'rgba(15,15,13,0.42)',
  rule:    'rgba(15,15,13,0.09)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.25)',
}

/* ─── Reusable mini-components ─────────────────── */

function SectionKicker({ children }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: '.2em',
        textTransform: 'uppercase',
        color: G.gold,
        marginBottom: 12,
      }}
    >
      <span style={{ display: 'inline-block', width: 16, height: 1, background: G.gold }} />
      {children}
    </div>
  )
}

function CardBox({ children, style = {} }) {
  return (
    <div
      style={{
        background: G.cream,
        border: `1px solid ${G.rule}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, accentTop }) {
  return (
    <div
      style={{
        background: G.cream,
        border: `1px solid ${G.rule}`,
        borderTop: `2px solid ${accentTop || G.rule}`,
        padding: '24px 22px',
        position: 'relative',
        transition: 'border-color .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = G.goldBdr}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = G.rule
        e.currentTarget.style.borderTopColor = accentTop || G.rule
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 36, height: 36,
            background: G.goldBg,
            border: `1px solid ${G.goldBdr}`,
          }}
        >
          <Icon style={{ width: 16, height: 16, color: G.gold }} />
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: G.muted,
          }}
        >
          {sub}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 52,
          lineHeight: 1,
          letterSpacing: '.01em',
          color: G.ink,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: G.muted }}>
        {label}
      </div>
    </div>
  )
}

/* ─── Main component ───────────────────────────── */
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
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const completedMatches  = matches.filter(m => m.status === 'completed').length
  const processingMatches = matches.filter(m => m.status === 'processing').length
  const totalPlayers      = players.length
  const quota             = 10

  const upcomingMatches = [
    { date: '2026-02-22', opponent: 'AS Furiani',     category: 'N3' },
    { date: '2026-03-01', opponent: 'FC Bastia-Borgo', category: 'N3' },
    { date: '2026-03-08', opponent: 'UF Zonza',       category: 'N3' },
  ]

  const topPlayers = players.slice(0, 5).map((p, i) => ({
    ...p,
    rating:  (8.5 - i * 0.3).toFixed(1),
    matches: 10 - i,
    trend:   i % 2 === 0 ? 'up' : 'down',
  }))

  const notifications = [
    { type: 'success', message: 'Match vs Lyon analysé avec succès',    time: 'Il y a 2h'     },
    { type: 'warning', message: 'Quota 7/10 matchs utilisés ce mois',  time: 'Il y a 1 jour'  },
    { type: 'info',    message: '3 joueurs en progression ce mois',     time: 'Il y a 2 jours' },
  ]

  /* ─── Status badge helper ─── */
  const StatusBadge = ({ status }) => {
    if (status === 'completed')
      return (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
          color: G.gold, border: `1px solid ${G.goldBdr}`,
          background: G.goldBg, padding: '3px 10px',
        }}>
          ✓ Terminé
        </span>
      )
    if (status === 'processing')
      return (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
          color: G.muted, border: `1px solid ${G.rule}`,
          background: 'transparent', padding: '3px 10px',
          animation: 'pulse 2s infinite',
        }}>
          ⏳ En cours
        </span>
      )
    return null
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '36px 40px', maxWidth: 1200 }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 40, borderBottom: `1px solid ${G.rule}`, paddingBottom: 28 }}>
          <SectionKicker>Tableau de bord</SectionKicker>
          <h1
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(36px, 4vw, 52px)',
              letterSpacing: '.02em',
              textTransform: 'uppercase',
              lineHeight: .92,
              color: G.ink,
              marginBottom: 6,
            }}
          >
            Bienvenue,{' '}
            <span style={{ color: G.gold }}>
              {user?.name?.split(' ')[0]}
            </span>
          </h1>
          <p style={{ fontSize: 14, color: G.muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.06em' }}>
            {user?.club_name || 'Votre club'}
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        {loading ? (
          <div className="grid grid-cols-4 gap-px" style={{ background: G.rule, marginBottom: 40 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: G.cream, padding: '24px 22px', height: 140 }}>
                <div style={{ background: G.rule, height: 36, width: 36, marginBottom: 16 }} />
                <div style={{ background: G.rule, height: 48, width: '60%', marginBottom: 8 }} />
                <div style={{ background: G.rule, height: 12, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-4 gap-px"
            style={{ background: G.rule, marginBottom: 40 }}
          >
            <StatCard
              icon={CheckCircle}
              label="Matchs analysés"
              value={completedMatches}
              sub="Ce mois"
              accentTop={G.gold}
            />
            <StatCard
              icon={Clock}
              label="En analyse"
              value={processingMatches}
              sub="Actif"
            />
            <StatCard
              icon={Users}
              label="Joueurs dans l'effectif"
              value={totalPlayers}
              sub="Effectif"
            />
            {/* Quota avec barre */}
            <div
              style={{
                background: G.cream,
                border: `1px solid ${G.rule}`,
                borderTop: `2px solid ${G.rule}`,
                padding: '24px 22px',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <div
                  className="flex items-center justify-center"
                  style={{ width: 36, height: 36, background: G.goldBg, border: `1px solid ${G.goldBdr}` }}
                >
                  <Film style={{ width: 16, height: 16, color: G.gold }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>
                  Quota
                </span>
              </div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 52, lineHeight: 1, color: G.ink, marginBottom: 4 }}>
                {quota - completedMatches}
              </div>
              <div style={{ fontSize: 12, color: G.muted, marginBottom: 12 }}>
                Matchs restants / {quota}
              </div>
              {/* Progress bar */}
              <div style={{ height: 2, background: G.rule, width: '100%' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(completedMatches / quota) * 100}%`,
                    background: G.gold,
                    transition: 'width .5s ease',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BODY GRID ── */}
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr 340px' }}>

          {/* ── Derniers matchs ── */}
          <div style={{ gridColumn: '1 / 3' }}>
            <CardBox style={{ marginBottom: 24 }}>
              {/* En-tête */}
              <div
                className="flex items-center justify-between"
                style={{ padding: '20px 24px', borderBottom: `1px solid ${G.rule}` }}
              >
                <div className="flex items-center gap-3">
                  <div style={{ width: 2, height: 20, background: G.gold }} />
                  <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, letterSpacing: '.04em', textTransform: 'uppercase', color: G.ink }}>
                    Derniers matchs
                  </h2>
                </div>
                <Link
                  to="/dashboard/matches"
                  className="flex items-center gap-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, textDecoration: 'none' }}
                >
                  Voir tout <ArrowRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>

              {/* Contenu */}
              <div style={{ padding: '0 24px 20px' }}>
                {loading ? (
                  <div style={{ padding: '20px 0' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height: 56, background: G.paper, borderBottom: `1px solid ${G.rule}` }} />
                    ))}
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center" style={{ padding: '48px 0' }}>
                    <Film style={{ width: 32, height: 32, color: G.muted, margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, color: G.muted, marginBottom: 20 }}>Aucun match analysé pour le moment</p>
                    <Link
                      to="/dashboard/matches"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase',
                        padding: '11px 28px',
                        background: G.ink, color: '#fff',
                        textDecoration: 'none', display: 'inline-block',
                      }}
                    >
                      Uploader un match →
                    </Link>
                  </div>
                ) : (
                  matches.slice(0, 4).map((match, i) => (
                    <Link
                      key={match.id}
                      to={`/dashboard/matches/${match.id}`}
                      className="flex items-center gap-4"
                      style={{
                        padding: '16px 0',
                        borderBottom: i < 3 ? `1px solid ${G.rule}` : 'none',
                        textDecoration: 'none',
                        transition: 'opacity .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {/* Date box */}
                      <div
                        className="text-center flex-shrink-0"
                        style={{ width: 44, padding: '6px 0', background: G.paper, border: `1px solid ${G.rule}` }}
                      >
                        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, lineHeight: 1, color: G.ink }}>
                          {new Date(match.date).getDate()}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                          {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3" style={{ marginBottom: 3 }}>
                          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, letterSpacing: '.02em', textTransform: 'uppercase', color: G.ink }}>
                            {match.category} — {match.opponent}
                          </span>
                          <StatusBadge status={match.status} />
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: G.muted, letterSpacing: '.06em' }}>
                          {new Date(match.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </div>
                      </div>

                      {match.status === 'completed' && match.stats && (
                        <div className="flex items-center gap-6 flex-shrink-0">
                          {[
                            { lbl: 'Possession', val: `${match.stats.possession}%` },
                            { lbl: 'Passes',     val: match.stats.passes },
                            { lbl: 'Tirs',       val: match.stats.shots },
                          ].map(s => (
                            <div key={s.lbl} className="text-center">
                              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, lineHeight: 1, color: G.gold, marginBottom: 2 }}>
                                {s.val}
                              </div>
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                                {s.lbl}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <ArrowRight style={{ width: 14, height: 14, color: G.gold, flexShrink: 0 }} />
                    </Link>
                  ))
                )}
              </div>
            </CardBox>

            {/* ── Top joueurs ── */}
            <CardBox>
              <div
                className="flex items-center justify-between"
                style={{ padding: '20px 24px', borderBottom: `1px solid ${G.rule}` }}
              >
                <div className="flex items-center gap-3">
                  <div style={{ width: 2, height: 20, background: G.gold }} />
                  <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, letterSpacing: '.04em', textTransform: 'uppercase', color: G.ink }}>
                    Top joueurs du mois
                  </h2>
                </div>
                <Link
                  to="/dashboard/players"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, textDecoration: 'none' }}
                >
                  Voir tout <ArrowRight style={{ width: 12, height: 12, display: 'inline' }} />
                </Link>
              </div>

              <div style={{ padding: '0 24px 16px' }}>
                {loading ? (
                  <div style={{ padding: '20px 0' }}>
                    {[1,2,3].map(i => <div key={i} style={{ height: 52, background: G.paper, marginBottom: 1 }} />)}
                  </div>
                ) : topPlayers.length === 0 ? (
                  <p style={{ padding: '32px 0', textAlign: 'center', fontSize: 14, color: G.muted }}>Aucun joueur enregistré</p>
                ) : (
                  topPlayers.map((player, i) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-4"
                      style={{
                        padding: '14px 0',
                        borderBottom: i < topPlayers.length - 1 ? `1px solid ${G.rule}` : 'none',
                      }}
                    >
                      {/* Rank */}
                      <div
                        style={{
                          fontFamily: "'Anton', sans-serif",
                          fontSize: 18, letterSpacing: '.02em',
                          color: i === 0 ? G.gold : G.muted,
                          width: 28, flexShrink: 0,
                          textAlign: 'center',
                        }}
                      >
                        {i + 1}
                      </div>

                      {/* Avatar */}
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={player.name}
                          style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0, border: `1px solid ${G.rule}` }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40, height: 40,
                            background: G.goldBg,
                            border: `1px solid ${G.goldBdr}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Users style={{ width: 16, height: 16, color: G.gold }} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div style={{ fontWeight: 500, fontSize: 14, color: G.ink, marginBottom: 2 }}>{player.name}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                          {player.position} · {player.matches} matchs
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, lineHeight: 1, color: G.gold, letterSpacing: '.01em' }}>
                          {player.rating}
                        </div>
                      </div>

                      <div>
                        <TrendingUp
                          style={{
                            width: 14, height: 14,
                            color: player.trend === 'up' ? G.gold : G.muted,
                            transform: player.trend === 'up' ? 'none' : 'rotate(180deg)',
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBox>
          </div>

          {/* ── Colonne droite ── */}
          <div className="flex flex-col gap-6">

            {/* Alertes */}
            <CardBox>
              <div
                className="flex items-center gap-3"
                style={{ padding: '18px 20px', borderBottom: `1px solid ${G.rule}` }}
              >
                <div style={{ width: 2, height: 18, background: G.gold }} />
                <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, letterSpacing: '.04em', textTransform: 'uppercase', color: G.ink }}>
                  Alertes
                </h2>
              </div>
              <div style={{ padding: '4px 0' }}>
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3"
                    style={{
                      padding: '14px 20px',
                      borderBottom: i < notifications.length - 1 ? `1px solid ${G.rule}` : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 28, height: 28, flexShrink: 0,
                        background: n.type === 'success' ? G.goldBg : 'rgba(15,15,13,0.04)',
                        border: `1px solid ${n.type === 'success' ? G.goldBdr : G.rule}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {n.type === 'success' && <CheckCircle style={{ width: 12, height: 12, color: G.gold }} />}
                      {n.type === 'warning' && <AlertCircle style={{ width: 12, height: 12, color: G.muted }} />}
                      {n.type === 'info'    && <TrendingUp  style={{ width: 12, height: 12, color: G.muted }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 12, color: G.ink2, lineHeight: 1.5, marginBottom: 3 }}>{n.message}</p>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.08em', color: G.muted }}>
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBox>

            {/* Prochains matchs */}
            <CardBox>
              <div
                className="flex items-center gap-3"
                style={{ padding: '18px 20px', borderBottom: `1px solid ${G.rule}` }}
              >
                <div style={{ width: 2, height: 18, background: G.gold }} />
                <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, letterSpacing: '.04em', textTransform: 'uppercase', color: G.ink }}>
                  Prochains matchs
                </h2>
              </div>
              <div style={{ padding: '4px 0' }}>
                {upcomingMatches.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                    style={{
                      padding: '14px 20px',
                      borderBottom: i < upcomingMatches.length - 1 ? `1px solid ${G.rule}` : 'none',
                    }}
                  >
                    {/* Date box */}
                    <div
                      style={{
                        width: 40, flexShrink: 0, textAlign: 'center',
                        padding: '5px 0',
                        background: G.paper,
                        border: `1px solid ${G.rule}`,
                      }}
                    >
                      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, lineHeight: 1, color: G.ink }}>
                        {new Date(m.date).getDate()}
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                        {new Date(m.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div style={{ fontWeight: 500, fontSize: 13, color: G.ink, marginBottom: 2 }}>{m.opponent}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: G.muted }}>
                        {m.category}
                      </div>
                    </div>

                    <Calendar style={{ width: 14, height: 14, color: G.gold, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </CardBox>

            {/* CTA upload */}
            <div
              style={{
                background: G.ink,
                padding: '24px 20px',
                borderTop: `2px solid ${G.gold}`,
              }}
            >
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, letterSpacing: '.03em', textTransform: 'uppercase', color: '#fff', marginBottom: 6, lineHeight: 1 }}>
                Analyser<br/><span style={{ color: G.gold }}>un match</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, marginBottom: 18 }}>
                Uploadez votre vidéo et recevez votre rapport en 5h.
              </p>
              <Link
                to="/dashboard/matches"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase',
                  padding: '11px 24px',
                  background: G.gold, color: G.ink,
                  textDecoration: 'none', display: 'inline-block',
                  fontWeight: 700,
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#d4af3a'}
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
