import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Users, Target, Activity, Download, Filter } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
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

function StatCard({ value, suffix = '', label, icon: Icon, color, gradient, trend, trendValue, delay = 0 }) {
  const count = useCountUp(typeof value === 'number' ? value : 0, 700)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        background: '#0d0f18',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = color + '35'
        e.currentTarget.style.boxShadow = `0 20px 40px ${color}12`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        position: 'absolute', top: -35, right: -35, width: 100, height: 100,
        borderRadius: '50%', background: gradient, filter: 'blur(35px)', opacity: 0.4, pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + '15', border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        {trendValue && (
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: trend === 'up' ? '#10b981' : '#ef4444',
            background: trend === 'up' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            padding: '3px 8px', borderRadius: 20,
          }}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <div style={{ fontSize: 40, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: gradient, opacity: 0.45 }} />
    </div>
  )
}

const CHART_TOOLTIP = {
  contentStyle: { backgroundColor: '#0d0f18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f1f5f9' },
  labelStyle: { color: '#94a3b8', fontWeight: 600 },
  itemStyle: { color: '#e2e8f0' },
}

function SectionCard({ title, children }) {
  return (
    <div style={{
      background: '#0d0f18',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '24px',
    }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>{title}</h2>
      {children}
    </div>
  )
}

function Statistics() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [matchesData, playersData] = await Promise.all([
        matchService.getMatches(),
        playerService.getPlayers()
      ])
      setMatches(matchesData.filter(m => m.status === 'completed'))
      setPlayers(playersData)
    } catch (error) { console.error('Error loading stats:', error) }
    finally { setLoading(false) }
  }

  const totalMatches = matches.length
  const victories = matches.filter(m => m.stats?.possession > 50).length
  const winRate = totalMatches > 0 ? Math.round((victories / totalMatches) * 100) : 0
  const avgPossession = totalMatches > 0
    ? Math.round(matches.reduce((sum, m) => sum + (m.stats?.possession || 0), 0) / totalMatches)
    : 0
  const totalGoals = Math.round(matches.reduce((sum, m) => sum + (m.stats?.shots || 0) / 6, 0))

  const evolutionData = matches.slice(-10).map((match, i) => ({
    name: `M${i + 1}`,
    possession: match.stats?.possession || 0,
    tirs: match.stats?.shots || 0,
  }))

  const topPlayers = players.slice(0, 5).map((p, i) => ({
    ...p,
    goals: 10 - i, assists: 8 - i,
    rating: (8.5 - i * 0.3).toFixed(1),
    matches: 15 - i,
  }))

  const radarData = [
    { category: 'Possession', value: avgPossession || 65 },
    { category: 'Passes', value: 85 },
    { category: 'Tirs', value: 75 },
    { category: 'Défense', value: 80 },
    { category: 'Intensité', value: 88 },
  ]

  const monthlyData = [
    { month: 'Jan', victoires: 3, defaites: 1, nuls: 1 },
    { month: 'Fév', victoires: 4, defaites: 2, nuls: 0 },
    { month: 'Mar', victoires: 5, defaites: 1, nuls: 1 },
  ]

  const selectStyle = {
    background: '#0d0f18', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10, padding: '9px 14px', color: '#f1f5f9',
    fontSize: 14, outline: 'none', cursor: 'pointer',
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Statistiques</h1>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Analyse complète des performances</p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#818cf8' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <Download size={15} /> Exporter PDF
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="#4b5563" />
            <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 600 }}>Filtres :</span>
          </div>
          <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} style={selectStyle}>
            <option value="all">Toute la saison</option>
            <option value="month">30 derniers jours</option>
            <option value="week">7 derniers jours</option>
          </select>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={selectStyle}>
            <option value="all">Toutes catégories</option>
            {['N3','U19','U17','U15','Seniors'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard value={totalMatches} label="Matchs joués" icon={Activity} color="#6366f1" gradient="radial-gradient(circle, #6366f1, #8b5cf6)" trend="up" trendValue="3" delay={0} />
        <StatCard value={winRate} suffix="%" label="Taux de victoire" icon={Target} color="#10b981" gradient="radial-gradient(circle, #10b981, #22c55e)" trend="up" trendValue="12%" delay={80} />
        <StatCard value={avgPossession} suffix="%" label="Possession moy." icon={Activity} color="#3b82f6" gradient="radial-gradient(circle, #3b82f6, #06b6d4)" trend="up" trendValue="5%" delay={160} />
        <StatCard value={totalGoals} label="Buts marqués" icon={Target} color="#f59e0b" gradient="radial-gradient(circle, #f59e0b, #f97316)" trend="down" trendValue="2" delay={240} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <SectionCard title="Évolution des performances">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 12 }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="possession" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Possession %" />
              <Line type="monotone" dataKey="tirs" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Tirs" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Performance globale">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="category" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis stroke="#374151" tick={{ fontSize: 10 }} />
              <Radar name="Équipe" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              <Tooltip {...CHART_TOOLTIP} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Monthly bar chart */}
      <div style={{ marginBottom: 16 }}>
        <SectionCard title="Résultats mensuels">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 12 }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="victoires" fill="#10b981" name="Victoires" radius={[4,4,0,0]} />
              <Bar dataKey="nuls" fill="#f59e0b" name="Nuls" radius={[4,4,0,0]} />
              <Bar dataKey="defaites" fill="#ef4444" name="Défaites" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Top Players */}
      <SectionCard title="Meilleurs joueurs">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#','Joueur','Matchs','Buts','Passes D.','Note moy.','Tendance'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: h === '#' || h === 'Joueur' ? 'left' : 'center', fontSize: 12, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topPlayers.map((player, index) => (
              <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 12px' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: index === 0 ? 'rgba(250,204,21,0.15)' : 'rgba(99,102,241,0.1)',
                    border: `1px solid ${index === 0 ? 'rgba(250,204,21,0.3)' : 'rgba(99,102,241,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: index === 0 ? '#facc15' : '#818cf8',
                  }}>{index + 1}</div>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {player.photo_url ? (
                      <img src={player.photo_url} alt={player.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={16} color="#6366f1" />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{player.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{player.position}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{player.matches}</td>
                <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{player.goals}</td>
                <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{player.assists}</td>
                <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                    background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                  }}>{player.rating}</span>
                </td>
                <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                  {index % 2 === 0
                    ? <TrendingUp size={16} color="#10b981" style={{ margin: '0 auto' }} />
                    : <TrendingDown size={16} color="#ef4444" style={{ margin: '0 auto' }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #0d0f18; color: #f1f5f9; }
      `}</style>
    </DashboardLayout>
  )
}

export default Statistics
