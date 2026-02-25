import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, TrendingDown, Users, Film, CheckCircle, Clock, ArrowRight, AlertCircle, Upload } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  bg:      '#0a0908',
  bg2:     '#0f0e0c',
  card:    'rgba(255,255,255,0.025)',
  border:  'rgba(255,255,255,0.07)',
  text:    '#f5f2eb',
  muted:   'rgba(245,242,235,0.60)',
  muted2:  'rgba(245,242,235,0.70)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.08)',
  goldBdr: 'rgba(201,162,39,0.25)',
  green:   '#22c55e',
  red:     '#ef4444',
  blue:    '#3b82f6',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function StatCard({ icon: Icon, label, value, sub, accent, loading }) {
  return (
    <div style={{
      background: G.card, border: `1px solid ${G.border}`,
      borderTop: `2px solid ${accent || G.border}`,
      padding: '22px 20px', transition: 'background .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = G.card}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 30, height: 30, background: (accent || G.gold) + '12', border: `1px solid ${(accent || G.gold)}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={13} color={accent || G.gold} />
        </div>
        <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted }}>{sub}</span>
      </div>
      {loading
        ? <div style={{ height: 50, background: 'rgba(255,255,255,0.04)', marginBottom: 8 }} />
        : <div style={{ fontFamily: G.display, fontSize: 52, lineHeight: 1, color: G.text, letterSpacing: '.01em', marginBottom: 6 }}>{value}</div>
      }
      <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.08em' }}>{label}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    completed:  { label: '✓ Terminé',  color: G.green },
    processing: { label: '⏳ En cours', color: G.blue },
    pending:    { label: '◦ En attente', color: G.gold },
  }[status]
  if (!cfg) return null
  return (
    <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: cfg.color, border: `1px solid ${cfg.color}30`, background: cfg.color + '10', padding: '3px 9px', flexShrink: 0 }}>
      {cfg.label}
    </span>
  )
}

function CardHead({ title, linkLabel, linkTo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${G.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 2, height: 16, background: G.gold, display: 'inline-block', flexShrink: 0 }} />
        <h2 style={{ fontFamily: G.display, fontSize: 15, letterSpacing: '.05em', textTransform: 'uppercase', color: G.text }}>{title}</h2>
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

function Skeleton({ h = 48 }) {
  return <div style={{ height: h, background: 'rgba(255,255,255,0.03)', marginBottom: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
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
  const quota      = 10

  const upcoming = [
    { date: '2026-03-01', opponent: 'FC Bastia-Borgo', cat: 'N3' },
    { date: '2026-03-08', opponent: 'UF Zonza',        cat: 'N3' },
    { date: '2026-03-15', opponent: 'AS Furiani',      cat: 'N3' },
  ]

  const topPlayers = players.slice(0, 5).map((p, i) => ({
    ...p,
    rating: (8.5 - i * 0.3).toFixed(1),
    trend: i % 2 === 0 ? 'up' : 'down',
  }))

  const alerts = [
    { type: 'success', msg: 'Dernier match analysé avec succès',        time: 'Il y a 2h' },
    { type: 'warning', msg: `Quota ${completed}/10 matchs ce mois`,     time: 'Hier' },
    { type: 'info',    msg: '3 joueurs en progression ce mois',         time: 'Il y a 2j' },
  ]

  const alertColor = { success: G.gold, warning: '#f59e0b', info: G.blue }
  const alertIcon  = { success: CheckCircle, warning: AlertCircle, info: TrendingUp }

  return (
    <DashboardLayout>
      <style>{`
        ${FONTS} * { box-sizing:border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
          Tableau de bord
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: 'clamp(36px,3.5vw,52px)', textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.02em', color: G.text, marginBottom: 6 }}>
          Bonjour,{' '}<span style={{ color: G.gold }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ fontFamily: G.mono, fontSize: 12, color: 'rgba(245,242,235,0.75)', letterSpacing: '.08em', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          {user?.club_logo && <img src={user.club_logo} alt="" style={{ height: 18, width: 18, objectFit: 'contain' }} />}
          <span>{user?.club_name || 'Votre club'}</span>
          <span style={{ color: 'rgba(245,242,235,0.35)' }}>·</span>
          <span>Saison 2025/26</span>
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 1, background: G.border, marginBottom: 1 }}>
        <StatCard icon={Film}        label="Matchs analysés"        value={completed}  sub="Ce mois" accent={G.gold}  loading={loading} />
        <StatCard icon={Clock}       label="En cours d'analyse"     value={processing} sub="Actif"   accent={G.blue}  loading={loading} />
        <StatCard icon={Users}       label="Joueurs effectif"       value={players.length} sub="Total" loading={loading} />
        {/* Quota */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.border}`, padding: '22px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Film size={13} color={G.gold} />
            </div>
            <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted }}>Quota</span>
          </div>
          <div style={{ fontFamily: G.display, fontSize: 52, lineHeight: 1, color: G.text, marginBottom: 4 }}>{quota - completed}</div>
          <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, marginBottom: 12, letterSpacing: '.06em' }}>restants / {quota}</div>
          <div style={{ height: 2, background: G.border }}>
            <div style={{ height: '100%', width: `${(completed / quota) * 100}%`, background: completed/quota > 0.8 ? G.red : G.gold, transition: 'width .6s' }} />
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 280px', gap: 1, background: G.border, marginTop: 0, alignItems: 'start' }}>

        {/* ── Col gauche + centre ── */}
        <div style={{ gridColumn: isMobile ? '1' : '1/3', display: 'flex', flexDirection: 'column', gap: 1 }}>

          {/* Derniers matchs */}
          <div style={{ background: G.card, border: `1px solid ${G.border}` }}>
            <CardHead title="Derniers matchs" linkLabel="Voir tout" linkTo="/dashboard/matches" />
            <div style={{ padding: '4px 0' }}>
              {loading ? [1,2,3].map(i => <Skeleton key={i} h={60} />) :
               matches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <Film size={28} color={G.muted} style={{ margin: '0 auto 14px', display: 'block' }} />
                  <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.65)', marginBottom: 20, letterSpacing: '.06em' }}>Aucun match analysé</p>
                  <Link to="/dashboard/matches" style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', padding: '11px 24px', background: G.gold, color: '#0a0908', textDecoration: 'none', fontWeight: 700 }}>
                    Uploader →
                  </Link>
                </div>
               ) : (
                matches.slice(0, 4).map((m, i) => (
                  <Link key={m.id} to={`/dashboard/matches/${m.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < 3 ? `1px solid ${G.border}` : 'none', textDecoration: 'none', transition: 'background .12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Date box */}
                    <div style={{ width: 40, flexShrink: 0, textAlign: 'center', padding: '5px 0', background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}` }}>
                      <div style={{ fontFamily: G.display, fontSize: 18, lineHeight: 1, color: G.text }}>{new Date(m.date).getDate()}</div>
                      <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                        {new Date(m.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: G.display, fontSize: 14, letterSpacing: '.03em', textTransform: 'uppercase', color: G.text }}>
                          {m.category} — {m.opponent}
                        </span>
                        <StatusBadge status={m.status} />
                      </div>
                      <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted, letterSpacing: '.06em' }}>
                        {new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                      </div>
                    </div>
                    {m.status === 'completed' && m.stats && (
                      <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
                        {[{l:'Poss',v:`${m.stats.possession}%`},{l:'Passes',v:m.stats.passes},{l:'Tirs',v:m.stats.shots}].map(s => (
                          <div key={s.l} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: G.display, fontSize: 18, lineHeight: 1, color: G.gold }}>{s.v}</div>
                            <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <ArrowRight size={12} color={G.muted} style={{ flexShrink: 0 }} />
                  </Link>
                ))
               )}
            </div>
          </div>

          {/* Top joueurs */}
          <div style={{ background: G.card, border: `1px solid ${G.border}` }}>
            <CardHead title="Top joueurs du mois" linkLabel="Voir tout" linkTo="/dashboard/players" />
            <div style={{ padding: '4px 0' }}>
              {loading ? [1,2,3,4,5].map(i => <Skeleton key={i} h={52} />) :
               topPlayers.length === 0 ? (
                <p style={{ padding: '32px 20px', fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.65)', textAlign: 'center' }}>Aucun joueur enregistré</p>
               ) : (
                topPlayers.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < topPlayers.length-1 ? `1px solid ${G.border}` : 'none' }}>
                    <div style={{ fontFamily: G.display, fontSize: 16, color: i===0 ? G.gold : G.muted, width: 20, textAlign: 'center', flexShrink: 0 }}>{i+1}</div>
                    {p.photo_url
                      ? <img src={p.photo_url} alt={p.name} style={{ width: 34, height: 34, objectFit: 'cover', flexShrink: 0, border: `1px solid ${G.border}` }} />
                      : <div style={{ width: 34, height: 34, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: G.display, fontSize: 11, color: G.gold }}>{p.name?.[0]}</span>
                        </div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: G.mono, fontSize: 12, color: G.text, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{p.position}</div>
                    </div>
                    <div style={{ fontFamily: G.display, fontSize: 24, color: G.gold, flexShrink: 0 }}>{p.rating}</div>
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
          <div style={{ background: G.card, border: `1px solid ${G.border}` }}>
            <CardHead title="Alertes" />
            {alerts.map((a, i) => {
              const Icon  = alertIcon[a.type]
              const color = alertColor[a.type]
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderBottom: i < alerts.length-1 ? `1px solid ${G.border}` : 'none' }}>
                  <div style={{ width: 26, height: 26, background: color + '12', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={11} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted2, lineHeight: 1.5, marginBottom: 3 }}>{a.msg}</p>
                    <p style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.08em', color: G.muted }}>{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Prochains matchs */}
          <div style={{ background: G.card, border: `1px solid ${G.border}` }}>
            <CardHead title="Prochains matchs" />
            {upcoming.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < upcoming.length-1 ? `1px solid ${G.border}` : 'none' }}>
                <div style={{ width: 38, textAlign: 'center', padding: '4px 0', background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, flexShrink: 0 }}>
                  <div style={{ fontFamily: G.display, fontSize: 16, lineHeight: 1, color: G.text }}>{new Date(m.date).getDate()}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
                    {new Date(m.date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 11, color: G.text, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.opponent}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{m.cat}</div>
                </div>
                <Calendar size={11} color={G.muted} />
              </div>
            ))}
          </div>

          {/* CTA upload */}
          <div style={{ background: G.goldBg, border: `1px solid ${G.goldBdr}`, borderTop: `2px solid ${G.gold}`, padding: '22px 18px' }}>
            <div style={{ fontFamily: G.display, fontSize: 22, letterSpacing: '.03em', textTransform: 'uppercase', color: G.text, lineHeight: 1, marginBottom: 8 }}>
              Analyser<br /><span style={{ color: G.gold }}>un match</span>
            </div>
            <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, lineHeight: 1.6, marginBottom: 18, letterSpacing: '.04em' }}>
              Uploadez votre vidéo et obtenez un rapport complet en 5h.
            </p>
            <Link to="/dashboard/matches" style={{
              fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase',
              padding: '10px 20px', background: G.gold, color: '#0a0908',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700,
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = G.goldD}
              onMouseLeave={e => e.currentTarget.style.background = G.gold}
            >
              <Upload size={11} /> Uploader
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
