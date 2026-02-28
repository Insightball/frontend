import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Video, Calendar, Clock, TrendingUp, MapPin, Plus, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import TrialUpgradeGate from '../components/TrialUpgradeGate'
import matchService from '../services/matchService'
import api from '../services/api'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  cream:   '#f5f2eb',
  white:   '#ffffff',
  ink:     '#1a1916',
  muted:   'rgba(26,25,22,0.45)',
  muted2:  'rgba(26,25,22,0.62)',
  rule:    'rgba(26,25,22,0.09)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.22)',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let start = 0; const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) } else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return count
}

function StatCard({ label, value, icon: Icon, color, delay = 0 }) {
  const count = useCountUp(value, 700)
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{
      opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(14px)',
      transition: 'all .45s cubic-bezier(.34,1.56,.64,1)',
      background: G.white, border: `1px solid ${G.rule}`,
      borderTop: `2px solid ${G.gold}`, padding: '20px 18px',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,25,22,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>{label}</span>
        <div style={{ width: 28, height: 28, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={13} color={G.gold} />
        </div>
      </div>
      <div style={{ fontFamily: G.display, fontSize: 44, lineHeight: 1, color: G.ink, letterSpacing: '.01em' }}>{count}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending:    { label: 'En attente', color: '#f59e0b' },
    processing: { label: 'En cours',   color: '#3b82f6' },
    completed:  { label: 'Terminé',    color: '#22c55e' },
    error:      { label: 'Erreur',     color: '#ef4444' },
  }
  const { label, color } = map[status] || map.pending
  return (
    <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: color + '12', color, border: `1px solid ${color}25`, flexShrink: 0 }}>
      {label}
    </span>
  )
}

function DashboardMatches() {
  const navigate = useNavigate()
  const [matches, setMatches]                 = useState([])
  const [loading, setLoading]                 = useState(true)
  const [filter, setFilter]                   = useState('all')
  const [isMobile, setIsMobile]               = useState(false)
  const [showUpgradeGate, setShowUpgradeGate] = useState(false)
  const [trialStatus, setTrialStatus]         = useState(null)
  const [trialLoading, setTrialLoading]       = useState(true)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
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

    // FIX — Attendre que le statut soit chargé avant d'autoriser
    if (trialLoading) return

    const access       = trialStatus?.access
    const trial_active = trialStatus?.trial_active
    const match_used   = trialStatus?.match_used

    // Trial expiré → rediriger vers les paramètres pour s'abonner
    if (access === 'expired') {
      navigate('/dashboard/settings')
      return
    }

    // Pas encore de CB enregistrée → rediriger vers les paramètres
    if (access === 'no_trial') {
      navigate('/dashboard/settings')
      return
    }

    // Trial actif mais match déjà utilisé → overlay upgrade
    if (trial_active && match_used) {
      setShowUpgradeGate(true)
      return
    }

    navigate('/dashboard/matches/upload')
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter)

  const stats = [
    { label: 'Total matchs', value: matches.length,                                        icon: Video,      color: G.gold, delay: 0   },
    { label: 'En attente',   value: matches.filter(m => m.status === 'pending').length,    icon: Clock,      color: G.gold, delay: 70  },
    { label: 'En cours',     value: matches.filter(m => m.status === 'processing').length, icon: TrendingUp, color: G.gold, delay: 140 },
    { label: 'Terminés',     value: matches.filter(m => m.status === 'completed').length,  icon: TrendingUp, color: G.gold, delay: 210 },
  ]

  const filters = [
    { key: 'all',        label: 'Tous',       color: G.gold },
    { key: 'pending',    label: 'En attente', color: G.gold },
    { key: 'processing', label: 'En cours',   color: G.gold },
    { key: 'completed',  label: 'Terminés',   color: G.gold },
  ]

  // Bouton désactivé pendant le chargement du statut trial
  const newMatchDisabled = trialLoading

  return (
    <DashboardLayout>
      <style>{`
        ${FONTS} * { box-sizing:border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* Overlay upgrade si trial exhausted */}
      {showUpgradeGate && (
        <TrialUpgradeGate onClose={() => setShowUpgradeGate(false)} />
      )}

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${G.rule}` }}>
        <div>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Mes matchs
          </div>
          <h1 style={{ fontFamily: G.display, fontSize: 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', margin: 0 }}>
            <span style={{ color: G.ink }}>Historique</span><br />
            <span style={{ color: G.gold }}>& analyses.</span>
          </h1>
        </div>
        <a href="#" onClick={handleNewMatch} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 24px',
          background: newMatchDisabled ? 'rgba(201,162,39,0.4)' : G.gold,
          color: '#0a0908',
          fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
          textDecoration: 'none', transition: 'background .15s', marginTop: 8,
          cursor: newMatchDisabled ? 'not-allowed' : 'pointer',
          opacity: newMatchDisabled ? 0.6 : 1,
        }}
          onMouseEnter={e => { if (!newMatchDisabled) e.currentTarget.style.background = G.goldD }}
          onMouseLeave={e => { if (!newMatchDisabled) e.currentTarget.style.background = G.gold }}
        >
          <Plus size={14} /> Nouveau match
        </a>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 1, background: G.rule, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── FILTRES ── */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 24, background: G.rule }}>
        {filters.map(({ key, label, color }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            flex: 1, padding: '10px 0',
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            background: filter === key ? G.goldBg : G.white,
            color: filter === key ? G.gold : G.muted,
            borderTop: `2px solid ${filter === key ? color : 'transparent'}`,
            border: 'none', cursor: 'pointer', transition: 'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {/* ── LISTE ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 28, height: 28, border: `2px solid ${G.goldBdr}`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>Chargement...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ background: G.white, border: `1px solid ${G.rule}`, borderTop: `2px solid ${G.gold}`, padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Video size={24} color={G.gold} />
          </div>
          <h3 style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 10, color: G.ink }}>
            {filter === 'all' ? 'Aucun match' : 'Aucun résultat'}
          </h3>
          <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginBottom: 28, letterSpacing: '.06em', lineHeight: 1.7 }}>
            {filter === 'all' ? 'Uploadez votre premier match pour le faire analyser' : 'Aucun match dans cette catégorie'}
          </p>
          <a href="#" onClick={handleNewMatch} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: G.gold, color: '#0a0908', fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none' }}>
            <Plus size={14} /> Ajouter un match
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.rule }}>
          {filteredMatches.map((match, i) => (
            <Link key={match.id} to={`/dashboard/matches/${match.id}`}
              style={{ display: 'block', background: G.white, padding: '20px 24px', textDecoration: 'none', transition: 'background .15s, border-left .15s', animation: `fadeIn .35s ease ${i * 50}ms both`, borderLeft: '2px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = G.goldBg; e.currentTarget.style.borderLeft = `2px solid ${G.gold}` }}
              onMouseLeave={e => { e.currentTarget.style.background = G.white;  e.currentTarget.style.borderLeft = '2px solid transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: G.display, fontSize: 20, textTransform: 'uppercase', letterSpacing: '.03em', color: G.ink, margin: 0 }}>vs {match.opponent}</h3>
                    <StatusBadge status={match.status} />
                    {match.category && <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', padding: '2px 8px', border: `1px solid ${G.rule}`, color: G.muted }}>{match.category}</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={10} />{formatDate(match.date)}
                    </div>
                    {match.location && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{match.location}</div>}
                  </div>
                  {match.score_home !== null && match.score_away !== null && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: G.display, fontSize: 28, lineHeight: 1, color: G.ink }}>{match.score_home}</span>
                      <span style={{ fontFamily: G.mono, fontSize: 14, color: G.muted }}>–</span>
                      <span style={{ fontFamily: G.display, fontSize: 28, lineHeight: 1, color: G.ink }}>{match.score_away}</span>
                      <span style={{
                        fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
                        marginLeft: 6, padding: '3px 10px',
                        background: match.score_home > match.score_away ? 'rgba(34,197,94,0.1)' : match.score_home < match.score_away ? 'rgba(239,68,68,0.1)' : 'rgba(245,242,235,0.05)',
                        color: match.score_home > match.score_away ? '#22c55e' : match.score_home < match.score_away ? '#ef4444' : G.muted,
                        border: `1px solid ${match.score_home > match.score_away ? 'rgba(34,197,94,0.2)' : match.score_home < match.score_away ? 'rgba(239,68,68,0.2)' : G.rule}`,
                      }}>
                        {match.score_home > match.score_away ? 'Victoire' : match.score_home < match.score_away ? 'Défaite' : 'Nul'}
                      </span>
                    </div>
                  )}
                  {match.status === 'processing' && match.progress > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: G.mono, fontSize: 8, color: G.muted, marginBottom: 5, letterSpacing: '.08em' }}>
                        <span>Analyse en cours...</span><span>{match.progress}%</span>
                      </div>
                      <div style={{ height: 2, background: G.rule }}>
                        <div style={{ height: '100%', width: `${match.progress}%`, background: G.gold, transition: 'width .3s' }} />
                      </div>
                    </div>
                  )}
                </div>
                <ChevronRight size={15} color={G.muted} style={{ marginLeft: 16, flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default DashboardMatches
