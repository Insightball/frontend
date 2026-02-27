import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, TrendingDown, Users, Film, CheckCircle, Clock, ArrowRight, AlertCircle, Upload } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

/* ─── Palette CLAIRE — cohérente avec DashboardLayout ─── */
const G = {
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

function StatCard({ icon: Icon, label, value, sub, accent, loading }) {
  return (
    <div style={{
      background: G.white,
      border: `1px solid ${G.rule}`,
      borderTop: `2px solid ${accent || G.rule}`,
      padding: '20px 18px',
      transition: 'box-shadow .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,15,13,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={13} color={accent || G.gold} />
        </div>
        <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted }}>{sub}</span>
      </div>
      {loading
        ? <div style={{ height: 46, background: G.rule, marginBottom: 8, opacity: 0.5 }} />
        : <div style={{ fontFamily: G.display, fontSize: 48, lineHeight: 1, color: G.ink, marginBottom: 6 }}>{value}</div>
      }
      <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.08em' }}>{label}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    completed:  { label: 'Terminé',    color: G.green },
    processing: { label: 'En cours',   color: G.blue },
    pending:    { label: 'En attente', color: G.orange },
  }[status]
  if (!cfg) return null
  return (
    <span style={{
      fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
      color: cfg.color, border: `1px solid ${cfg.color}40`,
      background: cfg.color + '12', padding: '3px 9px', flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  )
}

function CardHead({ title, linkLabel, linkTo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${G.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 2, height: 14, background: G.gold, display: 'inline-block', flexShrink: 0 }} />
        <h2 style={{ fontFamily: G.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: G.ink }}>{title}</h2>
      </div>
      {linkLabel && (
        <Link to={linkTo} style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = G.muted}
        >
          {linkLabel} <ArrowRight size={10} />
        </Link>
      )}
    </div>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [matches, setMatches]   = useState([])
  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [m, p] = await Promise.all([
          matchService.getMatches({ limit: 5 }),
          playerService.getPlayers(),
        ])
        setMatches(m); setPlayers(p)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [])

  const completed  = matches.filter(m => m.status === 'completed').length
  const processing = matches.filter(m => m.status === 'processing').length
  const PLAN_QUOTAS = { COACH: 4, CLUB: 12 }
  const userPlan   = (user?.plan || 'COACH').toUpperCase()
  const quota      = PLAN_QUOTAS[userPlan] ?? 4

  const topPlayers = players.slice(0, 5).map((p, i) => ({
    ...p,
    rating: (8.5 - i * 0.3).toFixed(1),
    trend:  i % 2 === 0 ? 'up' : 'down',
  }))

  const upcoming = [
    { date: '2026-03-01', opponent: 'FC Bastia-Borgo', cat: 'N3' },
    { date: '2026-03-08', opponent: 'UF Zonza',        cat: 'N3' },
    { date: '2026-03-15', opponent: 'AS Furiani',      cat: 'N3' },
  ]

  const alerts = [
    { type: 'success', msg: 'Dernier match analysé avec succès',             time: 'Il y a 2h' },
    { type: 'warning', msg: `Quota ${completed}/${quota} matchs ce mois`,    time: 'Hier'      },
    { type: 'info',    msg: '3 joueurs en progression ce mois',              time: 'Il y a 2j' },
  ]
  const alertColor = { success: G.green, warning: G.orange, info: G.blue }
  const alertIcon  = { success: CheckCircle, warning: AlertCircle, info: TrendingUp }

  return (
    <DashboardLayout>
      <style>{`${FONTS} * { box-sizing: border-box; } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 28, paddingBottom: 22, borderBottom: `1px solid ${G.rule}` }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Tableau de bord
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user?.club_logo && (
            <img src={user.club_logo} alt="" style={{ height: 44, width: 44, objectFit: 'contain', flexShrink: 0 }} />
          )}
          <div>
            <h1 style={{ fontFamily: G.display, fontSize: 'clamp(28px,3vw,44px)', textTransform: 'uppercase', lineHeight: .9, color: G.ink, margin: 0 }}>
              {user?.club_name || 'Votre club'}
            </h1>
            <p style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.1em', marginTop: 5 }}>
              Saison 2025/26 · Bonjour, <span style={{ color: G.ink2 }}>{user?.name?.split(' ')[0]}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 1, background: G.rule, marginBottom: 24 }}>
        <StatCard icon={Film}  label="Matchs analysés"    value={completed}      sub="Ce mois" accent={G.gold}   loading={loading} />
        <StatCard icon={Clock} label="En cours d'analyse" value={processing}     sub="Actif"   accent={G.blue}   loading={loading} />
        <StatCard icon={Users} label="Joueurs effectif"   value={players.length} sub="Total"   loading={loading} />
        {/* Quota */}
        <div style={{ background: G.white, border: `1px solid ${G.rule}`, borderTop: `2px solid ${completed/quota > 0.8 ? G.red : G.gold}`, padding: '20px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Film size={13} color={G.gold} />
            </div>
            <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted }}>Quota</span>
          </div>
          <div style={{ fontFamily: G.display, fontSize: 48, lineHeight: 1, color: G.ink, marginBottom: 4 }}>
            {quota - completed}
          </div>
          <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, marginBottom: 10, letterSpacing: '.06em' }}>
            restants / {quota}
          </div>
          <div style={{ height: 2, background: G.rule }}>
            <div style={{ height: '100%', width: `${Math.min((completed/quota)*100, 100)}%`, background: completed/quota > 0.8 ? G.red : G.gold, transition: 'width .6s' }} />
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 260px', gap: 1, background: G.rule, alignItems: 'start' }}>

        {/* ── Col gauche + centre ── */}
        <div style={{ gridColumn: isMobile ? '1' : '1/3', display: 'flex', flexDirection: 'column', gap: 1, background: G.rule }}>

          {/* Derniers matchs */}
          <div style={{ background: G.white, border: `1px solid ${G.rule}` }}>
            <CardHead title="Derniers matchs" linkLabel="Voir tout" linkTo="/dashboard/matches" />
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} style={{ height: 58, background: G.cream, margin: '1px 0', opacity: 0.6 }} />
              ))
            ) : matches.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Film size={28} color={G.rule} style={{ marginBottom: 12 }} />
                <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginBottom: 18 }}>Aucun match uploadé</p>
                <Link to="/dashboard/matches" style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', padding: '10px 22px', background: G.gold, color: G.ink, textDecoration: 'none', fontWeight: 700 }}>
                  Uploader →
                </Link>
              </div>
            ) : (
              matches.slice(0, 4).map((m, i) => (
                <Link key={m.id} to={`/dashboard/matches/${m.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < 3 ? `1px solid ${G.rule}` : 'none', textDecoration: 'none', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = G.cream}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 38, flexShrink: 0, textAlign: 'center', padding: '5px 0', background: G.cream, border: `1px solid ${G.rule}` }}>
                    <div style={{ fontFamily: G.display, fontSize: 17, lineHeight: 1, color: G.ink }}>{new Date(m.date).getDate()}</div>
                    <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                      {new Date(m.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: G.display, fontSize: 14, letterSpacing: '.03em', textTransform: 'uppercase', color: G.ink }}>
                        {m.category} — {m.opponent}
                      </span>
                      <StatusBadge status={m.status} />
                    </div>
                    <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted, letterSpacing: '.06em' }}>
                      {new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                    </div>
                  </div>
                  {m.status === 'completed' && m.stats && (
                    <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                      {[{l:'Poss',v:`${m.stats.possession}%`},{l:'Passes',v:m.stats.passes},{l:'Tirs',v:m.stats.shots}].map(s => (
                        <div key={s.l} style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: G.display, fontSize: 17, lineHeight: 1, color: G.gold }}>{s.v}</div>
                          <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <ArrowRight size={11} color={G.muted} style={{ flexShrink: 0 }} />
                </Link>
              ))
            )}
          </div>

          {/* Top joueurs */}
          <div style={{ background: G.white, border: `1px solid ${G.rule}` }}>
            <CardHead title="Top joueurs du mois" linkLabel="Voir tout" linkTo="/dashboard/players" />
            <div style={{ padding: '4px 0' }}>
              {loading ? [1,2,3,4,5].map(i => (
                <div key={i} style={{ height: 52, background: G.cream, margin: '1px 0', opacity: 0.5 }} />
              )) : topPlayers.length === 0 ? (
                <p style={{ padding: '28px 18px', fontFamily: G.mono, fontSize: 11, color: G.muted, textAlign: 'center' }}>Aucun joueur enregistré</p>
              ) : (
                topPlayers.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: i < topPlayers.length-1 ? `1px solid ${G.rule}` : 'none' }}>
                    <div style={{ fontFamily: G.display, fontSize: 15, color: i===0 ? G.gold : G.muted, width: 20, textAlign: 'center', flexShrink: 0 }}>{i+1}</div>
                    {p.photo_url
                      ? <img src={p.photo_url} alt={p.name} style={{ width: 32, height: 32, objectFit: 'cover', flexShrink: 0, border: `1px solid ${G.rule}` }} />
                      : <div style={{ width: 32, height: 32, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: G.display, fontSize: 11, color: G.gold }}>{p.name?.[0]}</span>
                        </div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: G.mono, fontSize: 11, color: G.ink, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{p.position}</div>
                    </div>
                    <div style={{ fontFamily: G.display, fontSize: 22, color: G.gold, flexShrink: 0 }}>{p.rating}</div>
                    {p.trend === 'up'
                      ? <TrendingUp size={12} color={G.green} />
                      : <TrendingDown size={12} color={G.muted} />
                    }
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Col droite ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

          {/* Alertes */}
          <div style={{ background: G.white, border: `1px solid ${G.rule}` }}>
            <CardHead title="Alertes" />
            {alerts.map((a, i) => {
              const Icon  = alertIcon[a.type]
              const color = alertColor[a.type]
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '13px 16px', borderBottom: i < alerts.length-1 ? `1px solid ${G.rule}` : 'none' }}>
                  <div style={{ width: 26, height: 26, background: color + '12', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={11} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: G.ink2, lineHeight: 1.5, marginBottom: 3 }}>{a.msg}</p>
                    <p style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.08em', color: G.muted }}>{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Prochains matchs */}
          <div style={{ background: G.white, border: `1px solid ${G.rule}` }}>
            <CardHead title="Prochains matchs" />
            {upcoming.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: i < upcoming.length-1 ? `1px solid ${G.rule}` : 'none' }}>
                <div style={{ width: 36, textAlign: 'center', padding: '4px 0', background: G.cream, border: `1px solid ${G.rule}`, flexShrink: 0 }}>
                  <div style={{ fontFamily: G.display, fontSize: 15, lineHeight: 1, color: G.ink }}>{new Date(m.date).getDate()}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                    {new Date(m.date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 11, color: G.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.opponent}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{m.cat}</div>
                </div>
                <Calendar size={11} color={G.muted} />
              </div>
            ))}
          </div>

          {/* CTA upload */}
          <div style={{ background: G.gold, padding: '22px 18px' }}>
            <div style={{ fontFamily: G.display, fontSize: 22, letterSpacing: '.03em', textTransform: 'uppercase', color: G.ink, lineHeight: 1, marginBottom: 8 }}>
              Analyser<br />un match
            </div>
            <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.65)', lineHeight: 1.6, marginBottom: 18, letterSpacing: '.04em' }}>
              Uploadez votre vidéo, obtenez un rapport complet.
            </p>
            <Link to="/dashboard/matches" style={{
              fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase',
              padding: '10px 20px', background: G.ink, color: '#fff',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700,
              transition: 'opacity .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Upload size={11} /> Uploader
            </Link>
          </div>

          {/* Lien Vue Club si plan CLUB */}
          {userPlan === 'CLUB' && (
            <Link to="/dashboard/club" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', background: G.white, border: `1px solid ${G.rule}`,
              borderLeft: `3px solid ${G.gold}`, textDecoration: 'none',
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = G.cream}
              onMouseLeave={e => e.currentTarget.style.background = G.white}
            >
              <div>
                <div style={{ fontFamily: G.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: G.ink, marginBottom: 3 }}>Vue Club</div>
                <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>Vision directeur sportif →</div>
              </div>
              <ArrowRight size={14} color={G.gold} />
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
