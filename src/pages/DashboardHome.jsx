import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, Film, CheckCircle, Clock, ArrowRight, AlertCircle, Upload, Zap, Activity, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import matchService from '../services/matchService'
import playerService from '../services/playerService'
import api from '../services/api'
import { T } from '../theme'

// ── Composants atomiques ──────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = {
    completed:  { label: 'Terminé',    color: T.green,  bg: T.greenBg,  bdr: T.greenBdr  },
    processing: { label: 'En cours',   color: T.blue,   bg: T.blueBg,   bdr: T.blueBdr   },
    pending:    { label: 'En attente', color: T.orange, bg: T.orangeBg, bdr: T.orangeBdr },
    error:      { label: 'Erreur',     color: T.red,    bg: T.redBg,    bdr: T.redBdr    },
  }[status]
  if (!cfg) return null
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
      color: cfg.color, border: `1px solid ${cfg.bdr}`,
      background: cfg.bg, padding: '3px 9px', flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  )
}

function KpiCard({ label, value, sub, accent = false, delay = 0 }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{
      background: T.surface,
      borderTop: `2px solid ${accent ? T.gold : T.rule}`,
      padding: '18px 20px',
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity .35s ease, transform .35s ease',
    }}>
      <p style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: T.display, fontSize: 40, lineHeight: 1, color: T.ink, letterSpacing: '.01em' }}>{value}</p>
      {sub && <p style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 6, letterSpacing: '.04em' }}>{sub}</p>}
    </div>
  )
}

function SectionHeader({ title, to, label = 'Voir tout' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${T.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 2, height: 14, background: T.gold, display: 'inline-block', flexShrink: 0 }} />
        <h2 style={{ fontFamily: T.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: T.ink }}>{title}</h2>
      </div>
      {to && (
        <Link to={to} style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, transition: 'color .12s' }}
          onMouseEnter={e => e.currentTarget.style.color = T.gold}
          onMouseLeave={e => e.currentTarget.style.color = T.muted}
        >
          {label} <ArrowRight size={9} />
        </Link>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function DashboardHome() {
  const { user }            = useAuth()
  const [matches, setMatches]     = useState([])
  const [players, setPlayers]     = useState([])
  const [quotaData, setQuotaData] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [isMobile, setIsMobile]   = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [m, p, q] = await Promise.all([
          matchService.getMatches({ limit: 4 }),
          playerService.getPlayers(),
          api.get('/matches/quota'),
        ])
        setMatches(m); setPlayers(p); setQuotaData(q.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [])

  const quota     = quotaData?.quota    ?? 4
  const quotaUsed = quotaData?.used     ?? 0
  const quotaLeft = quotaData?.remaining ?? quota
  const quotaPct  = Math.min((quotaUsed / quota) * 100, 100)
  const quotaColor = quotaPct >= 100 ? T.red : quotaPct >= 75 ? T.orange : T.gold

  const completed  = matches.filter(m => m.status === 'completed').length
  const processing = matches.filter(m => m.status === 'processing').length
  const recentMatches = matches.slice(0, 4)
  const topPlayers    = players.slice(0, 5)
  const userPlan      = (user?.plan || 'COACH').toUpperCase()

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  // Skeleton rows
  const SkeletonRow = ({ h = 56 }) => (
    <div style={{ height: h, background: `linear-gradient(90deg, ${T.rule} 25%, rgba(26,25,22,0.04) 50%, ${T.rule} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
  )

  return (
    <DashboardLayout>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .match-row:hover  { background: ${T.goldBg} !important; }
        .player-row:hover { background: ${T.goldBg} !important; }
        .action-row:hover { background: ${T.goldBg} !important; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        background: T.dark, padding: isMobile ? '20px 18px' : '28px 32px',
        marginBottom: 24, position: 'relative', overflow: 'hidden',
        animation: 'fadeUp .4s ease both',
      }}>
        {/* Grille déco */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(201,162,39,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        {/* Mot décoratif */}
        <div style={{
          position: 'absolute', right: -10, bottom: -16,
          fontFamily: T.display, fontSize: 96, color: 'rgba(201,162,39,0.05)',
          textTransform: 'uppercase', lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>DATA</div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'flex-end', justifyContent: 'space-between', gap: isMobile ? 14 : 20 }}>
          <div>
            <p style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.7)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 1, background: T.gold, display: 'inline-block' }} />
              Tableau de bord · Saison 2025/26
            </p>
            <h1 style={{ fontFamily: T.display, fontSize: isMobile ? 30 : 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#f5f2eb' }}>
              {user?.club_name || 'Mon équipe'}<br />
              <span style={{ color: T.gold }}>Bonjour, {user?.name?.split(' ')[0] || 'Coach'}.</span>
            </h1>
          </div>

          {/* Quota */}
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', marginBottom: 6 }}>Quota ce mois</p>
            <p style={{ fontFamily: T.display, fontSize: isMobile ? 26 : 36, lineHeight: 1, color: quotaColor }}>
              {quotaLeft}<span style={{ fontFamily: T.mono, fontSize: 10, color: 'rgba(245,242,235,0.4)', marginLeft: 4 }}>/ {quota} restants</span>
            </p>
            <div style={{ marginTop: 8, height: 3, width: '100%', maxWidth: 140, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ height: '100%', width: `${100 - quotaPct}%`, background: quotaColor, transition: 'width .4s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 1, background: T.rule, marginBottom: 24 }}>
        <KpiCard label="Matchs analysés"  value={completed}            sub="Ce mois"    accent delay={0}   />
        <KpiCard label="En cours"         value={processing}           sub="En analyse"         delay={60}  />
        <KpiCard label="Joueurs effectif" value={players.length}       sub="Enregistrés"        delay={120} />
        <KpiCard label="Matchs restants"  value={quotaLeft}            sub={`Plan ${userPlan}`} delay={180} />
      </div>

      {/* ── CONTENU 2 COLONNES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: 1, background: T.rule, alignItems: 'start' }}>

        {/* ── COL GAUCHE ── mobile: order 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.rule, order: isMobile ? 2 : 1 }}>

          {/* Derniers matchs */}
          <div style={{ background: T.surface, animation: 'fadeUp .4s ease 80ms both' }}>
            <SectionHeader title="Derniers matchs" to="/dashboard/matches" />
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '1px 0' }}>
                {[1,2,3].map(i => <SkeletonRow key={i} />)}
              </div>
            ) : recentMatches.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Film size={28} color={T.goldBdr} style={{ marginBottom: 12 }} />
                <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: '.06em' }}>Aucun match analysé</p>
                <Link to="/dashboard/matches/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '10px 20px', background: T.gold, color: T.dark, fontFamily: T.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none' }}>
                  <Upload size={11} /> Uploader un match
                </Link>
              </div>
            ) : recentMatches.map((m, i) => (
              <Link key={m.id} to={`/dashboard/matches/${m.id}`} className="match-row" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px',
                borderBottom: i < recentMatches.length - 1 ? `1px solid ${T.rule}` : 'none',
                textDecoration: 'none', background: T.surface,
                transition: 'background .12s',
              }}>
                {/* Date box */}
                <div style={{ width: 38, textAlign: 'center', flexShrink: 0, padding: '5px 0', borderLeft: `2px solid ${T.goldBdr}`, paddingLeft: 8 }}>
                  <div style={{ fontFamily: T.display, fontSize: 18, lineHeight: 1, color: T.ink }}>{new Date(m.date).getDate()}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: T.muted, marginTop: 2 }}>
                    {new Date(m.date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: T.display, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.03em', color: T.ink }}>
                      vs {m.opponent}
                    </span>
                    {m.category && (
                      <span style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: '.1em', padding: '2px 7px', border: `1px solid ${T.rule}`, color: T.muted }}>{m.category}</span>
                    )}
                  </div>
                  {m.score_home !== null && m.score_away !== null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: T.display, fontSize: 20, lineHeight: 1, color: T.ink }}>{m.score_home} – {m.score_away}</span>
                      <span style={{
                        fontFamily: T.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase',
                        padding: '2px 7px',
                        color: m.score_home > m.score_away ? T.green : m.score_home < m.score_away ? T.red : T.orange,
                        background: m.score_home > m.score_away ? T.greenBg : m.score_home < m.score_away ? T.redBg : T.orangeBg,
                        border: `1px solid ${m.score_home > m.score_away ? T.greenBdr : m.score_home < m.score_away ? T.redBdr : T.orangeBdr}`,
                      }}>
                        {m.score_home > m.score_away ? 'Victoire' : m.score_home < m.score_away ? 'Défaite' : 'Nul'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StatusBadge status={m.status} />
                      {m.status === 'processing' && m.progress > 0 && (
                        <div style={{ flex: 1, maxWidth: 120, height: 2, background: T.rule }}>
                          <div style={{ height: '100%', width: `${m.progress}%`, background: T.blue }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <ChevronRight size={13} color={T.muted} style={{ flexShrink: 0 }} />
              </Link>
            ))}
          </div>

          {/* Effectif */}
          <div style={{ background: T.surface, animation: 'fadeUp .4s ease 140ms both' }}>
            <SectionHeader title="Effectif" to="/dashboard/players" />
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[1,2,3,4].map(i => <SkeletonRow key={i} h={48} />)}
              </div>
            ) : topPlayers.length === 0 ? (
              <p style={{ padding: '28px 20px', fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: 'center', letterSpacing: '.06em' }}>
                Aucun joueur enregistré
              </p>
            ) : topPlayers.map((p, i) => (
              <div key={p.id} className="player-row" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 20px',
                borderBottom: i < topPlayers.length - 1 ? `1px solid ${T.rule}` : 'none',
                background: T.surface, transition: 'background .12s',
              }}>
                <span style={{ fontFamily: T.display, fontSize: 13, color: i === 0 ? T.gold : T.muted, width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                {p.photo_url
                  ? <img src={p.photo_url} alt={p.name} style={{ width: 30, height: 30, objectFit: 'cover', flexShrink: 0, border: `1px solid ${T.rule}` }} />
                  : <div style={{ width: 30, height: 30, background: T.goldBg, border: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: T.display, fontSize: 10, color: T.gold }}>{p.name?.[0]}</span>
                    </div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ink, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: T.muted, marginTop: 1 }}>{p.position}</div>
                </div>
                {p.number && (
                  <span style={{ fontFamily: T.display, fontSize: 14, color: T.muted }}>{p.number}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── COL DROITE ── mobile: order 1 (CTA en premier) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.rule, order: isMobile ? 1 : 2 }}>

          {/* CTA Upload */}
          <div style={{
            background: T.dark, padding: '24px 20px',
            position: 'relative', overflow: 'hidden',
            animation: 'fadeUp .4s ease 60ms both',
          }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.05,
              backgroundImage: 'linear-gradient(rgba(201,162,39,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Zap size={12} color={T.gold} />
                <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.65)' }}>Nouvelle analyse</span>
              </div>
              <div style={{ fontFamily: T.display, fontSize: 30, letterSpacing: '.02em', textTransform: 'uppercase', color: '#f5f2eb', lineHeight: .9, marginBottom: 12 }}>
                Analyser<br /><span style={{ color: T.gold }}>un match.</span>
              </div>
              <p style={{ fontFamily: T.mono, fontSize: 10, color: 'rgba(245,242,235,0.38)', lineHeight: 1.65, marginBottom: 18, letterSpacing: '.03em' }}>
                Uploadez votre vidéo, obtenez un rapport tactique complet.
              </p>
              <Link to="/dashboard/matches/upload" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', background: T.gold, color: T.dark,
                fontFamily: T.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700,
                textDecoration: 'none', transition: 'background .12s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.goldD}
                onMouseLeave={e => e.currentTarget.style.background = T.gold}
              >
                <Upload size={11} /> Uploader
              </Link>
            </div>
          </div>

          {/* Activité */}
          <div style={{ background: T.surface, animation: 'fadeUp .4s ease 120ms both' }}>
            <SectionHeader title="Activité" />
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[1, 2].map(i => <SkeletonRow key={i} h={52} />)}
              </div>
            ) : (
              <div>
                {/* Ligne quota */}
                <div className="action-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${T.rule}`, background: T.surface, transition: 'background .12s' }}>
                  <div style={{ width: 28, height: 28, background: quotaColor + '14', border: `1px solid ${quotaColor}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={11} color={quotaColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: T.mono, fontSize: 10, color: T.ink, lineHeight: 1.4 }}>
                      {quotaUsed}/{quota} matchs utilisés ce mois
                    </p>
                    <div style={{ marginTop: 5, height: 2, background: T.rule }}>
                      <div style={{ height: '100%', width: `${quotaPct}%`, background: quotaColor, transition: 'width .4s' }} />
                    </div>
                  </div>
                </div>

                {completed > 0 && (
                  <div className="action-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${T.rule}`, background: T.surface, transition: 'background .12s' }}>
                    <div style={{ width: 28, height: 28, background: T.greenBg, border: `1px solid ${T.greenBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle size={11} color={T.green} />
                    </div>
                    <p style={{ fontFamily: T.mono, fontSize: 10, color: T.ink, lineHeight: 1.4 }}>
                      {completed} match{completed > 1 ? 's' : ''} analysé{completed > 1 ? 's' : ''} ce mois
                    </p>
                  </div>
                )}

                {processing > 0 && (
                  <div className="action-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: T.surface, transition: 'background .12s' }}>
                    <div style={{ width: 28, height: 28, background: T.blueBg, border: `1px solid ${T.blueBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={11} color={T.blue} />
                    </div>
                    <p style={{ fontFamily: T.mono, fontSize: 10, color: T.ink, lineHeight: 1.4 }}>
                      {processing} analyse{processing > 1 ? 's' : ''} en cours
                    </p>
                  </div>
                )}

                {completed === 0 && processing === 0 && (
                  <p style={{ padding: '20px', fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '.04em' }}>
                    Aucune activité récente
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Vue Club si plan CLUB */}
          {userPlan === 'CLUB' && (
            <Link to="/dashboard/club" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px', background: T.surface,
              borderLeft: `3px solid ${T.gold}`, textDecoration: 'none',
              transition: 'background .12s', animation: 'fadeUp .4s ease 180ms both',
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.goldBg}
              onMouseLeave={e => e.currentTarget.style.background = T.surface}
            >
              <div>
                <div style={{ fontFamily: T.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: T.ink, marginBottom: 3 }}>Vue Club</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '.06em' }}>Vision directeur sportif</div>
              </div>
              <ArrowRight size={13} color={T.gold} />
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
