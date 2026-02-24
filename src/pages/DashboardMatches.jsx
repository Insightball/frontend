import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Video, Calendar, Clock, TrendingUp, MapPin, Plus, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import matchService from '../services/matchService'

const G = {
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(15,15,13,0.09)', muted: 'rgba(15,15,13,0.42)',
}

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
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
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)',
      transition: 'all .45s cubic-bezier(.34,1.56,.64,1)',
      background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`,
      borderTop: `2px solid ${color}`, padding: '20px 18px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)' }}>{label}</span>
        <div style={{ width: 28, height: 28, background: color + '15', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={13} color={color} />
        </div>
      </div>
      <div style={{ fontFamily: G.display, fontSize: 42, lineHeight: 1, color: '#0f0f0d', letterSpacing: '.01em' }}>{count}</div>
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
    <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 10px', background: color + '12', color, border: `1px solid ${color}25` }}>
      {label}
    </span>
  )
}

function DashboardMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadMatches() }, [])

  const loadMatches = async () => {
    try { setLoading(true); const data = await matchService.getMatches(); setMatches(data) }
    catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter)

  const stats = [
    { label: 'Total matchs',  value: matches.length,                                             icon: Video,      color: G.gold,    delay: 0 },
    { label: 'En attente',    value: matches.filter(m => m.status === 'pending').length,          icon: Clock,      color: '#f59e0b', delay: 70 },
    { label: 'En cours',      value: matches.filter(m => m.status === 'processing').length,       icon: TrendingUp, color: '#3b82f6', delay: 140 },
    { label: 'Terminés',      value: matches.filter(m => m.status === 'completed').length,        icon: TrendingUp, color: '#22c55e', delay: 210 },
  ]

  const filters = [
    { key: 'all',        label: 'Tous' },
    { key: 'pending',    label: 'En attente', color: '#f59e0b' },
    { key: 'processing', label: 'En cours',   color: '#3b82f6' },
    { key: 'completed',  label: 'Terminés',   color: '#22c55e' },
  ]

  return (
    <DashboardLayout>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Mes matchs
          </div>
          <h1 style={{ fontFamily: G.display, fontSize: 44, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#0f0f0d', margin: 0 }}>
            Historique<br /><span style={{ color: G.gold }}>& analyses.</span>
          </h1>
        </div>
        <Link to="/dashboard/matches/upload" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', background: G.gold, color: '#0f0f0d',
          fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
          textDecoration: 'none', borderRadius: 2, transition: 'background .15s', marginTop: 8,
        }}>
          <Plus size={14} /> Nouveau match
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: G.border, marginBottom: 28 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {filters.map(({ key, label, color }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '8px 18px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            background: filter === key ? (color || G.gold) : 'transparent',
            color: filter === key ? '#0f0f0d' : G.muted,
            border: filter === key ? 'none' : `1px solid ${G.border}`,
            cursor: 'pointer', transition: 'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 28, height: 28, border: `2px solid ${G.goldBdr}`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)' }}>Chargement...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ background: '#faf8f4', border: `1px dashed ${G.goldBdr}`, padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Video size={24} color={G.gold} />
          </div>
          <h3 style={{ fontFamily: G.display, fontSize: 24, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8, color: '#0f0f0d' }}>Aucun match</h3>
          <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(15,15,13,0.45)', marginBottom: 24, letterSpacing: '.06em' }}>
            {filter === 'all' ? 'Uploadez votre premier match pour le faire analyser' : 'Aucun match dans cette catégorie'}
          </p>
          <Link to="/dashboard/matches/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: G.gold, color: '#0f0f0d', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none' }}>
            <Plus size={14} /> Ajouter un match
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
          {filteredMatches.map((match, i) => (
            <Link key={match.id} to={`/dashboard/matches/${match.id}`}
              style={{ display: 'block', background: '#ffffff', padding: '20px 24px', textDecoration: 'none', color: 'inherit', transition: 'background .15s', animation: `fadeIn .35s ease ${i * 50}ms both` }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.04)'; e.currentTarget.style.borderLeft = `3px solid ${G.gold}` }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0a0a08'; e.currentTarget.style.borderLeft = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontFamily: G.display, fontSize: 20, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', margin: 0 }}>vs {match.opponent}</h3>
                    <StatusBadge status={match.status} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} />{formatDate(match.date)}
                    </div>
                    {match.category && <span style={{ padding: '2px 8px', border: `1px solid rgba(15,15,13,0.09)`, color: 'rgba(15,15,13,0.45)' }}>{match.category}</span>}
                    {match.location && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{match.location}</div>}
                  </div>

                  {match.score_home !== null && match.score_away !== null && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: G.display, fontSize: 28, lineHeight: 1, color: '#0f0f0d' }}>{match.score_home}</span>
                      <span style={{ fontFamily: G.mono, fontSize: 12, color: 'rgba(15,15,13,0.45)' }}>—</span>
                      <span style={{ fontFamily: G.display, fontSize: 28, lineHeight: 1, color: '#0f0f0d' }}>{match.score_away}</span>
                      <span style={{
                        fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
                        marginLeft: 8, padding: '3px 10px',
                        background: match.score_home > match.score_away ? 'rgba(34,197,94,0.08)' : match.score_home < match.score_away ? 'rgba(239,68,68,0.08)' : 'rgba(245,242,235,0.05)',
                        color: match.score_home > match.score_away ? '#22c55e' : match.score_home < match.score_away ? '#ef4444' : G.muted,
                        border: `1px solid ${match.score_home > match.score_away ? 'rgba(34,197,94,0.2)' : match.score_home < match.score_away ? 'rgba(239,68,68,0.2)' : G.border}`,
                      }}>
                        {match.score_home > match.score_away ? 'Victoire' : match.score_home < match.score_away ? 'Défaite' : 'Nul'}
                      </span>
                    </div>
                  )}

                  {match.status === 'processing' && match.progress > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: G.mono, fontSize: 9, color: 'rgba(15,15,13,0.45)', marginBottom: 5, letterSpacing: '.08em' }}>
                        <span>Analyse en cours...</span><span>{match.progress}%</span>
                      </div>
                      <div style={{ height: 2, background: G.border, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${match.progress}%`, background: G.gold, transition: 'width .3s' }} />
                      </div>
                    </div>
                  )}
                </div>
                <ChevronRight size={16} color={G.muted} style={{ marginLeft: 16, flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  )
}

export default DashboardMatches
