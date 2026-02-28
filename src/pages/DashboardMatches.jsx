import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Video, Calendar, Clock, MapPin, Plus, ChevronRight, TrendingUp } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import TrialUpgradeGate from '../components/TrialUpgradeGate'
import matchService from '../services/matchService'
import api from '../services/api'
import { T } from '../theme'

// ── Helpers ───────────────────────────────────────────────────

function useCountUp(target, duration = 700) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let v = 0; const step = target / (duration / 16)
    const t = setInterval(() => {
      v += step
      if (v >= target) { setCount(target); clearInterval(t) } else setCount(Math.floor(v))
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return count
}

const statusCfg = {
  pending:    { label: 'En attente', color: T.orange, bg: T.orangeBg, bdr: T.orangeBdr, icon: Clock },
  processing: { label: 'En cours',   color: T.blue,   bg: T.blueBg,   bdr: T.blueBdr,   icon: TrendingUp },
  completed:  { label: 'Terminé',    color: T.green,  bg: T.greenBg,  bdr: T.greenBdr,  icon: Video },
  error:      { label: 'Erreur',     color: T.red,    bg: T.redBg,    bdr: T.redBdr,    icon: Video },
}

function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg.pending
  return (
    <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 9px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.bdr}`, flexShrink: 0 }}>
      {cfg.label}
    </span>
  )
}

function KpiCard({ label, value, icon: Icon, accent = false, delay = 0 }) {
  const count = useCountUp(value, 650)
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{
      background: T.surface, padding: '18px 20px',
      borderTop: `2px solid ${accent ? T.gold : T.rule}`,
      opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity .35s ease, transform .35s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,25,22,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted }}>{label}</span>
        <div style={{ width: 26, height: 26, background: T.goldBg, border: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={11} color={T.gold} />
        </div>
      </div>
      <div style={{ fontFamily: T.display, fontSize: 42, lineHeight: 1, color: T.ink }}>{count}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
function DashboardMatches() {
  const navigate = useNavigate()
  const [matches, setMatches]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [filter, setFilter]                 = useState('all')
  const [isMobile, setIsMobile]             = useState(false)
  const [showUpgradeGate, setShowUpgradeGate] = useState(false)
  const [trialStatus, setTrialStatus]       = useState(null)
  const [trialLoading, setTrialLoading]     = useState(true)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    loadMatches()
    api.get('/subscription/trial-status')
      .then(r => setTrialStatus(r.data))
      .catch(() => {})
      .finally(() => setTrialLoading(false))
  }, [])

  const loadMatches = async () => {
    try { setLoading(true); const data = await matchService.getMatches(); setMatches(data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleNewMatch = (e) => {
    e.preventDefault()
    if (trialLoading) return
    const { access, trial_active, match_used } = trialStatus || {}
    if (access === 'expired' || access === 'no_trial') { navigate('/dashboard/settings'); return }
    if (trial_active && match_used) { setShowUpgradeGate(true); return }
    navigate('/dashboard/matches/upload')
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter)

  const stats = [
    { label: 'Total',       value: matches.length,                                        icon: Video,      accent: true, delay: 0   },
    { label: 'En attente',  value: matches.filter(m => m.status === 'pending').length,    icon: Clock,                   delay: 60  },
    { label: 'En analyse',  value: matches.filter(m => m.status === 'processing').length, icon: TrendingUp,              delay: 120 },
    { label: 'Terminés',    value: matches.filter(m => m.status === 'completed').length,  icon: Video,                   delay: 180 },
  ]

  const filters = [
    { key: 'all',        label: 'Tous' },
    { key: 'pending',    label: 'En attente' },
    { key: 'processing', label: 'En cours' },
    { key: 'completed',  label: 'Terminés' },
  ]

  const disabled = trialLoading

  return (
    <DashboardLayout>
      <style>{`
        .match-link:hover { background: ${T.goldBg} !important; border-left-color: ${T.gold} !important; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {showUpgradeGate && <TrialUpgradeGate onClose={() => setShowUpgradeGate(false)} />}

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'space-between', gap: isMobile ? 16 : 0, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.rule}` }}>
        <div>
          <p style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 14, height: 1, background: T.gold, display: 'inline-block' }} />Mes matchs
          </p>
          <h1 style={{ fontFamily: T.display, fontSize: isMobile ? 32 : 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em' }}>
            <span style={{ color: T.ink }}>Historique</span><br />
            <span style={{ color: T.gold }}>& analyses.</span>
          </h1>
        </div>

        <a href="#" onClick={handleNewMatch} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '11px 22px', marginTop: isMobile ? 0 : 8,
          background: disabled ? 'rgba(201,162,39,0.35)' : T.gold,
          color: T.dark,
          fontFamily: T.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
          textDecoration: 'none', transition: 'background .12s',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = T.goldD }}
          onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = T.gold }}
        >
          {trialLoading
            ? <span style={{ width: 12, height: 12, border: `2px solid ${T.dark}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
            : <Plus size={13} />
          }
          Nouveau match
        </a>
      </div>

      {/* ── KPI ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 1, background: T.rule, marginBottom: 20 }}>
        {stats.map(s => <KpiCard key={s.label} {...s} />)}
      </div>

      {/* ── FILTRES ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: T.rule, borderBottom: `1px solid ${T.rule}` }}>
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            flex: isMobile ? 1 : 'initial',
            padding: isMobile ? '9px 4px' : '9px 20px',
            fontSize: isMobile ? 8 : 9,
            fontFamily: T.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
            background: filter === key ? T.goldBg : T.surface,
            color: filter === key ? T.gold : T.muted,
            borderTop: `2px solid ${filter === key ? T.gold : 'transparent'}`,
            borderBottom: 'none', borderLeft: 'none', borderRight: `1px solid ${T.rule}`,
            cursor: 'pointer', transition: 'all .12s', whiteSpace: 'nowrap',
          }}>
            {label}
            {!isMobile && key !== 'all' && (
              <span style={{ marginLeft: 6, fontFamily: T.mono, fontSize: 8, color: filter === key ? T.gold : T.muted }}>
                ({matches.filter(m => m.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── LISTE ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 26, height: 26, border: `2px solid ${T.goldBdr}`, borderTopColor: T.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: T.muted }}>Chargement...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ background: T.surface, borderTop: `2px solid ${T.gold}`, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, background: T.goldBg, border: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Video size={22} color={T.gold} />
          </div>
          <h3 style={{ fontFamily: T.display, fontSize: 24, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 10, color: T.ink }}>
            {filter === 'all' ? 'Aucun match' : 'Aucun résultat'}
          </h3>
          <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginBottom: 24, letterSpacing: '.05em', lineHeight: 1.7 }}>
            {filter === 'all' ? 'Uploadez votre premier match pour démarrer l\'analyse' : 'Aucun match dans cette catégorie'}
          </p>
          {filter === 'all' && (
            <a href="#" onClick={handleNewMatch} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: T.gold, color: T.dark, fontFamily: T.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none' }}>
              <Plus size={12} /> Ajouter un match
            </a>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.rule }}>
          {filteredMatches.map((match, i) => {
            const cfg = statusCfg[match.status] || statusCfg.pending
            return (
              <Link key={match.id} to={`/dashboard/matches/${match.id}`}
                className="match-link"
                style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  background: T.surface,
                  borderLeft: `2px solid transparent`,
                  textDecoration: 'none',
                  transition: 'background .12s, border-left-color .12s',
                  animation: `fadeIn .3s ease ${i * 40}ms both`,
                  overflow: 'hidden',
                }}
              >
                {/* Indicateur status gauche */}
                <div style={{ width: 4, alignSelf: 'stretch', background: cfg.color, opacity: 0.5, flexShrink: 0 }} />

                <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                  {/* Date */}
                  <div style={{ textAlign: 'center', flexShrink: 0, width: 40 }}>
                    <div style={{ fontFamily: T.display, fontSize: 22, lineHeight: 1, color: T.ink }}>{new Date(match.date).getDate()}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: T.muted, marginTop: 2 }}>
                      {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>

                  <div style={{ width: 1, height: 36, background: T.rule, flexShrink: 0 }} />

                  {/* Infos match */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: T.display, fontSize: isMobile ? 16 : 20, textTransform: 'uppercase', letterSpacing: '.03em', color: T.ink }}>
                        vs {match.opponent}
                      </h3>
                      <StatusBadge status={match.status} />
                      {match.category && (
                        <span style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: '.1em', padding: '2px 7px', border: `1px solid ${T.rule}`, color: T.muted }}>
                          {match.category}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '.04em' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={9} />{formatDate(match.date)}
                      </div>
                      {match.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={9} />{match.location}
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    {match.score_home !== null && match.score_away !== null && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: T.display, fontSize: 24, lineHeight: 1, color: T.ink }}>{match.score_home}</span>
                        <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>–</span>
                        <span style={{ fontFamily: T.display, fontSize: 24, lineHeight: 1, color: T.ink }}>{match.score_away}</span>
                        <span style={{
                          fontFamily: T.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase',
                          padding: '2px 8px',
                          color: match.score_home > match.score_away ? T.green : match.score_home < match.score_away ? T.red : T.orange,
                          background: match.score_home > match.score_away ? T.greenBg : match.score_home < match.score_away ? T.redBg : T.orangeBg,
                          border: `1px solid ${match.score_home > match.score_away ? T.greenBdr : match.score_home < match.score_away ? T.redBdr : T.orangeBdr}`,
                        }}>
                          {match.score_home > match.score_away ? 'Victoire' : match.score_home < match.score_away ? 'Défaite' : 'Nul'}
                        </span>
                      </div>
                    )}

                    {/* Barre progression si en cours */}
                    {match.status === 'processing' && match.progress > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4, letterSpacing: '.06em' }}>
                          <span>Analyse en cours...</span><span>{match.progress}%</span>
                        </div>
                        <div style={{ height: 2, background: T.rule }}>
                          <div style={{ height: '100%', width: `${match.progress}%`, background: T.blue, transition: 'width .3s' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <ChevronRight size={13} color={T.muted} style={{ flexShrink: 0 }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}

export default DashboardMatches
