import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, TrendingDown, Users, Film, CheckCircle, Clock, ArrowRight, AlertCircle, Upload, Zap, Target, Activity } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  cream:   '#f5f2eb',
  white:   '#ffffff',
  ink:     '#1a1916',
  ink2:    '#2a2a26',
  muted:   'rgba(26,25,22,0.45)',
  muted2:  'rgba(26,25,22,0.62)',
  rule:    'rgba(26,25,22,0.09)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.22)',
  green:   '#16a34a',
  red:     '#dc2626',
  blue:    '#2563eb',
  orange:  '#d97706',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
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

export default function DashboardHome() {
  const { user } = useAuth()
  const [matches, setMatches]   = useState([])
  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [tick, setTick]         = useState(0)

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

  // Animation compteur
  useEffect(() => {
    const t = setTimeout(() => setTick(1), 100)
    return () => clearTimeout(t)
  }, [])

  const completed  = matches.filter(m => m.status === 'completed').length
  const processing = matches.filter(m => m.status === 'processing').length
  const PLAN_QUOTAS = { COACH: 4, CLUB: 12 }
  const userPlan   = (user?.plan || 'COACH').toUpperCase()
  const quota      = PLAN_QUOTAS[userPlan] ?? 4
  const quotaUsed  = completed
  const quotaPct   = Math.min((quotaUsed / quota) * 100, 100)
  const quotaColor = quotaPct >= 80 ? G.red : quotaPct >= 50 ? G.orange : G.gold

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
    { type: 'success', msg: 'Dernier match analysé avec succès', time: 'Il y a 2h' },
    { type: 'warning', msg: `Quota ${completed}/${quota} matchs ce mois`,    time: 'Hier' },
    { type: 'info',    msg: '3 joueurs en progression ce mois', time: 'Il y a 2j' },
  ]
  const alertColor = { success: G.green, warning: G.orange, info: G.blue }
  const alertIcon  = { success: CheckCircle, warning: AlertCircle, info: TrendingUp }

  return (
    <DashboardLayout>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes growBar { from { width: 0%; } to { } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .match-row:hover { background: rgba(201,162,39,0.04) !important; }
        .player-row:hover { background: rgba(201,162,39,0.04) !important; }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{
        marginBottom: 28,
        padding: '28px 32px',
        background: G.ink,
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeUp .4s ease both',
      }}>
        {/* Fond décoratif — grille tactique subtile */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(201,162,39,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        {/* Grand texte décoratif en arrière plan */}
        <div style={{
          position: 'absolute', right: -20, top: -10,
          fontFamily: G.display, fontSize: 120, color: 'rgba(201,162,39,0.06)',
          textTransform: 'uppercase', letterSpacing: '-.02em',
          lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>
          DATA
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.9)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
              Tableau de bord · Saison 2025/26
            </div>
            <h1 style={{ fontFamily: G.display, fontSize: 'clamp(32px,4vw,52px)', textTransform: 'uppercase', lineHeight: .88, margin: 0, color: G.cream }}>
              {user?.club_name || 'Votre club'}
            </h1>
            <p style={{ fontFamily: G.mono, fontSize: 13, color: 'rgba(245,242,235,0.70)', letterSpacing: '.06em', marginTop: 10 }}>
              Bonjour, <span style={{ color: G.gold }}>{user?.name?.split(' ')[0]}</span>
            </p>
          </div>

          {/* Quota visuel dans le header */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.65)', marginBottom: 8 }}>
              Quota ce mois
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end', marginBottom: 8 }}>
              <span style={{ fontFamily: G.display, fontSize: 40, lineHeight: 1, color: quotaColor }}>{quota - quotaUsed}</span>
              <span style={{ fontFamily: G.mono, fontSize: 12, color: 'rgba(245,242,235,0.65)' }}>/ {quota} restants</span>
            </div>
            <div style={{ width: 160, height: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${quotaPct}%`,
                background: quotaColor,
                transition: 'width 1s cubic-bezier(.4,0,.2,1)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
        gap: 0,
        marginBottom: 24,
        border: `1px solid ${G.rule}`,
      }}>
        {[
          { label: 'Matchs analysés',    value: completed,      sub: 'Ce mois',  icon: Film,     accent: G.gold,   delay: 0   },
          { label: "En cours d'analyse", value: processing,     sub: 'Actif',    icon: Activity, accent: G.gold,  delay: 60  },
          { label: 'Joueurs effectif',   value: players.length, sub: 'Total',    icon: Users,    accent: G.gold,   delay: 120 },
          { label: 'Victoire / match',   value: `${completed > 0 ? Math.round((matches.filter(m=>m.score_home > m.score_away).length/completed)*100) : 0}%`, sub: 'Saison', icon: Target, accent: G.gold, delay: 180, isString: true },
        ].map((s, i) => (
          <div key={s.label} style={{
            background: 'transparent',
            borderRight: `1px solid ${G.rule}`,
            borderTop: `2px solid ${G.gold}`,
            padding: '20px 18px',
            animation: `fadeUp .4s ease ${s.delay}ms both`,
            transition: 'box-shadow .15s, transform .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,25,22,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={12} color={G.gold} />
              </div>
              <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted2 }}>{s.sub}</span>
            </div>
            {loading
              ? <div style={{ height: 44, background: G.rule, marginBottom: 8, opacity: 0.4 }} />
              : <div style={{ fontFamily: G.display, fontSize: 44, lineHeight: 1, color: G.ink, marginBottom: 4 }}>{s.value}</div>
            }
            <div style={{ fontFamily: G.mono, fontSize: 10, color: G.ink, letterSpacing: '.06em', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
        gap: 8,
        alignItems: 'start',
      }}>

        {/* ── Colonne principale ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Derniers matchs */}
          <div style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${G.rule}`, animation: 'fadeUp .4s ease 200ms both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${G.rule}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 2, height: 14, background: G.gold, display: 'inline-block' }} />
                <h2 style={{ fontFamily: G.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: G.ink }}>Derniers matchs</h2>
              </div>
              <Link to="/dashboard/matches" style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = G.gold}
                onMouseLeave={e => e.currentTarget.style.color = G.muted}
              >
                Voir tout <ArrowRight size={10} />
              </Link>
            </div>

            {loading ? (
              [1,2,3].map(i => <div key={i} style={{ height: 58, background: G.rule, margin: '1px 0', opacity: 0.4 }} />)
            ) : matches.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', background: 'transparent' }}>
                <div style={{ width: 48, height: 48, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Film size={20} color={G.gold} />
                </div>
                <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginBottom: 18 }}>Aucun match uploadé</p>
                <Link to="/dashboard/matches" style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', padding: '10px 22px', background: G.gold, color: G.ink, textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Upload size={11} /> Uploader →
                </Link>
              </div>
            ) : (
              matches.slice(0, 4).map((m, i) => (
                <Link key={m.id} to={`/dashboard/matches/${m.id}`} className="match-row"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < 3 ? `1px solid ${G.rule}` : 'none', textDecoration: 'none', transition: 'background .12s', background: 'transparent' }}
                >
                  <div style={{ width: 40, flexShrink: 0, textAlign: 'center', padding: '6px 0', background: G.goldBg, border: `1px solid ${G.goldBdr}` }}>
                    <div style={{ fontFamily: G.display, fontSize: 18, lineHeight: 1, color: G.ink }}>{new Date(m.date).getDate()}</div>
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
          <div style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${G.rule}`, animation: 'fadeUp .4s ease 280ms both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${G.rule}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 2, height: 14, background: G.gold, display: 'inline-block' }} />
                <h2 style={{ fontFamily: G.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: G.ink }}>Top joueurs du mois</h2>
              </div>
              <Link to="/dashboard/players" style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = G.gold}
                onMouseLeave={e => e.currentTarget.style.color = G.muted}
              >
                Voir tout <ArrowRight size={10} />
              </Link>
            </div>
            <div style={{ padding: '4px 0' }}>
              {loading ? [1,2,3,4,5].map(i => (
                <div key={i} style={{ height: 52, background: G.rule, margin: '1px 0', opacity: 0.4 }} />
              )) : topPlayers.length === 0 ? (
                <p style={{ padding: '28px 18px', fontFamily: G.mono, fontSize: 11, color: G.muted, textAlign: 'center' }}>Aucun joueur enregistré</p>
              ) : (
                topPlayers.map((p, i) => (
                  <div key={p.id} className="player-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: i < topPlayers.length-1 ? `1px solid ${G.rule}` : 'none', background: 'transparent', transition: 'background .12s' }}>
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

        {/* ── Colonne droite ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* CTA Upload — dark, impactant */}
          <div style={{
            background: G.ink, padding: '24px 20px',
            position: 'relative', overflow: 'hidden',
            animation: 'fadeUp .4s ease 100ms both',
          }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.05,
              backgroundImage: 'linear-gradient(rgba(201,162,39,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,1) 1px, transparent 1px)',
              backgroundSize: '24px 24px', pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Zap size={14} color={G.gold} />
                <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.7)' }}>Nouvelle analyse</span>
              </div>
              <div style={{ fontFamily: G.display, fontSize: 28, letterSpacing: '.02em', textTransform: 'uppercase', color: G.cream, lineHeight: .9, marginBottom: 12 }}>
                Analyser<br /><span style={{ color: G.gold }}>un match.</span>
              </div>
              <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.4)', lineHeight: 1.6, marginBottom: 18, letterSpacing: '.03em' }}>
                Uploadez votre vidéo, obtenez un rapport tactique complet.
              </p>
              <Link to="/dashboard/matches" style={{
                fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase',
                padding: '11px 20px', background: G.gold, color: G.ink,
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

          {/* Prochains matchs */}
          <div style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${G.rule}`, animation: 'fadeUp .4s ease 160ms both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderBottom: `1px solid ${G.rule}` }}>
              <span style={{ width: 2, height: 14, background: G.gold, display: 'inline-block' }} />
              <h2 style={{ fontFamily: G.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: G.ink }}>Prochains matchs</h2>
            </div>
            {upcoming.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < upcoming.length-1 ? `1px solid ${G.rule}` : 'none' }}>
                <div style={{ width: 36, textAlign: 'center', padding: '5px 0', background: G.goldBg, border: `1px solid ${G.goldBdr}`, flexShrink: 0 }}>
                  <div style={{ fontFamily: G.display, fontSize: 16, lineHeight: 1, color: G.ink }}>{new Date(m.date).getDate()}</div>
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

          {/* Alertes */}
          <div style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${G.rule}`, animation: 'fadeUp .4s ease 220ms both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderBottom: `1px solid ${G.rule}` }}>
              <span style={{ width: 2, height: 14, background: G.gold, display: 'inline-block' }} />
              <h2 style={{ fontFamily: G.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: G.ink }}>Alertes</h2>
            </div>
            {alerts.map((a, i) => {
              const Icon  = alertIcon[a.type]
              const color = alertColor[a.type]
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderBottom: i < alerts.length-1 ? `1px solid ${G.rule}` : 'none' }}>
                  <div style={{ width: 24, height: 24, background: color + '12', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={10} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: G.mono, fontSize: 10, color: G.ink2, lineHeight: 1.5, marginBottom: 2 }}>{a.msg}</p>
                    <p style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.08em', color: G.muted }}>{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vue Club si plan CLUB */}
          {userPlan === 'CLUB' && (
            <Link to="/dashboard/club" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', background: 'transparent', border: `1px solid ${G.rule}`,
              borderLeft: `3px solid ${G.gold}`, textDecoration: 'none',
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
