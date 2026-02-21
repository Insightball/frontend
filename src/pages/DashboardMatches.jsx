import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Video, Calendar, TrendingUp, Clock, MapPin, Plus, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import matchService from '../services/matchService'

// Hook pour animer les chiffres
function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return count
}

function StatCard({ label, value, icon: Icon, color, gradient, delay = 0 }) {
  const count = useCountUp(value, 800)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        background: '#0d0f18',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = color + '40'
        e.currentTarget.style.boxShadow = `0 20px 40px ${color}15`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Gradient glow en fond */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: gradient,
        filter: 'blur(40px)',
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, letterSpacing: '0.03em' }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: color + '15',
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
      </div>

      <div style={{ fontSize: 42, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {count}
      </div>

      {/* Barre décorative en bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2, background: gradient, opacity: 0.5,
      }} />
    </div>
  )
}

function DashboardMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadMatches() }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const data = await matchService.getMatches()
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'En attente', class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
      processing: { label: 'En cours', class: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
      completed: { label: 'Terminé', class: 'bg-green-500/10 text-green-500 border-green-500/30' },
      error: { label: 'Erreur', class: 'bg-red-500/10 text-red-500 border-red-500/30' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
        {badge.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true
    return match.status === filter
  })

  const stats = [
    {
      label: 'Total matchs',
      value: matches.length,
      icon: Video,
      color: '#6366f1',
      gradient: 'radial-gradient(circle, #6366f1, #8b5cf6)',
      delay: 0,
    },
    {
      label: 'En attente',
      value: matches.filter(m => m.status === 'pending').length,
      icon: Clock,
      color: '#f59e0b',
      gradient: 'radial-gradient(circle, #f59e0b, #f97316)',
      delay: 80,
    },
    {
      label: 'En cours',
      value: matches.filter(m => m.status === 'processing').length,
      icon: TrendingUp,
      color: '#3b82f6',
      gradient: 'radial-gradient(circle, #3b82f6, #06b6d4)',
      delay: 160,
    },
    {
      label: 'Terminés',
      value: matches.filter(m => m.status === 'completed').length,
      icon: TrendingUp,
      color: '#10b981',
      gradient: 'radial-gradient(circle, #10b981, #22c55e)',
      delay: 240,
    },
  ]

  const filterButtons = [
    { key: 'all', label: 'Tous', activeColor: '#6366f1' },
    { key: 'pending', label: 'En attente', activeColor: '#f59e0b' },
    { key: 'processing', label: 'En cours', activeColor: '#3b82f6' },
    { key: 'completed', label: 'Terminés', activeColor: '#10b981' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes Matchs</h1>
            <p className="text-gray-400">Gérez vos matchs et consultez les analyses</p>
          </div>
          <Link
            to="/dashboard/matches/upload"
            className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau match
          </Link>
        </div>

        {/* Stats Cards animées */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          {filterButtons.map(({ key, label, activeColor }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: filter === key ? 'none' : '1px solid rgba(255,255,255,0.08)',
                background: filter === key ? activeColor : 'transparent',
                color: filter === key ? '#fff' : '#9ca3af',
                boxShadow: filter === key ? `0 4px 15px ${activeColor}40` : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div style={{
            background: '#0d0f18',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '64px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Video size={28} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>Aucun match</h3>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              {filter === 'all' ? 'Commencez par uploader votre premier match' : `Aucun match dans cette catégorie`}
            </p>
            <Link
              to="/dashboard/matches/upload"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: 600, borderRadius: 10,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}
            >
              <Plus size={18} />
              Ajouter un match
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filteredMatches.map((match, i) => (
              <Link
                key={match.id}
                to={`/dashboard/matches/${match.id}`}
                style={{
                  display: 'block',
                  background: '#0d0f18',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14,
                  padding: '20px 24px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  animation: `fadeIn 0.4s ease ${i * 60}ms both`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.background = '#111320'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.background = '#0d0f18'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>vs {match.opponent}</h3>
                      {getStatusBadge(match.status)}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#6b7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} />
                        {formatDate(match.date)}
                      </div>
                      {match.category && (
                        <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 12 }}>
                          {match.category}
                        </span>
                      )}
                      {match.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} />
                          {match.location}
                        </div>
                      )}
                    </div>

                    {match.score_home !== null && match.score_away !== null && (
                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{match.score_home}</span>
                        <span style={{ color: '#374151', fontWeight: 700 }}>—</span>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{match.score_away}</span>
                        <span style={{
                          marginLeft: 8, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: match.score_home > match.score_away ? 'rgba(16,185,129,0.1)' : match.score_home < match.score_away ? 'rgba(239,68,68,0.1)' : 'rgba(107,114,128,0.1)',
                          color: match.score_home > match.score_away ? '#10b981' : match.score_home < match.score_away ? '#ef4444' : '#6b7280',
                        }}>
                          {match.score_home > match.score_away ? 'Victoire' : match.score_home < match.score_away ? 'Défaite' : 'Nul'}
                        </span>
                      </div>
                    )}

                    {match.status === 'processing' && match.progress > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                          <span>Analyse en cours...</span>
                          <span>{match.progress}%</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${match.progress}%`,
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: 99, transition: 'width 0.3s',
                          }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <ChevronRight size={18} color="#374151" style={{ marginLeft: 16, flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  )
}

export default DashboardMatches
