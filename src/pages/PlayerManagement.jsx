import { useState, useEffect } from 'react'
import { Plus, Users as UsersIcon, Search, Filter, Shield, Zap, Target } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PlayerCard from '../components/PlayerCard'
import PlayerForm from '../components/PlayerForm'
import playerService from '../services/playerService'
import { useAuth } from '../context/AuthContext'

// Hook pour animer les chiffres
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

function StatCard({ value, label, icon: Icon, color, gradient, delay = 0 }) {
  const count = useCountUp(value, 700)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        background: '#0d0f18',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14, padding: '20px',
        position: 'relative', overflow: 'hidden', cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = color + '35'
        e.currentTarget.style.boxShadow = `0 16px 32px ${color}12`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 90, height: 90,
        borderRadius: '50%', background: gradient, filter: 'blur(30px)', opacity: 0.35, pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: color + '15', border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 38, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.03em' }}>{count}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: gradient, opacity: 0.4 }} />
    </div>
  )
}

function PlayerManagement() {
  const { user } = useAuth()
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { loadPlayers() }, [])
  useEffect(() => { filterPlayers() }, [players, selectedCategory, selectedPosition, searchQuery])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const data = await playerService.getPlayers()
      setPlayers(data)
    } catch (error) { console.error('Error loading players:', error) }
    finally { setLoading(false) }
  }

  const filterPlayers = () => {
    let filtered = [...players]
    if (selectedCategory !== 'all') filtered = filtered.filter(p => p.category === selectedCategory)
    if (selectedPosition !== 'all') filtered = filtered.filter(p => p.position === selectedPosition)
    if (searchQuery) filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.number.toString().includes(searchQuery)
    )
    setFilteredPlayers(filtered)
  }

  const handleAddPlayer = async (playerData) => {
    await playerService.createPlayer(playerData)
    await loadPlayers()
    setIsFormOpen(false)
  }

  const handleEditPlayer = async (playerData) => {
    await playerService.updatePlayer(editingPlayer.id, playerData)
    await loadPlayers()
    setEditingPlayer(null)
    setIsFormOpen(false)
  }

  const handleDeletePlayer = async (player) => {
    if (!confirm(`Supprimer ${player.name} ?`)) return
    try { await playerService.deletePlayer(player.id); await loadPlayers() }
    catch { alert('Erreur lors de la suppression') }
  }

  const openEditForm = (player) => { setEditingPlayer(player); setIsFormOpen(true) }
  const closeForm = () => { setIsFormOpen(false); setEditingPlayer(null) }

  const groupedPlayers = {
    'Gardien': filteredPlayers.filter(p => p.position === 'Gardien'),
    'Défenseur': filteredPlayers.filter(p => p.position === 'Défenseur'),
    'Milieu': filteredPlayers.filter(p => p.position === 'Milieu'),
    'Attaquant': filteredPlayers.filter(p => p.position === 'Attaquant'),
  }

  const positionColors = {
    'Gardien': { color: '#f59e0b', label: 'Gardiens' },
    'Défenseur': { color: '#3b82f6', label: 'Défenseurs' },
    'Milieu': { color: '#8b5cf6', label: 'Milieux' },
    'Attaquant': { color: '#ef4444', label: 'Attaquants' },
  }

  const stats = [
    { label: 'Total joueurs', value: players.length, icon: UsersIcon, color: '#6366f1', gradient: 'radial-gradient(circle, #6366f1, #8b5cf6)', delay: 0 },
    { label: 'Gardiens', value: players.filter(p => p.position === 'Gardien').length, icon: Shield, color: '#f59e0b', gradient: 'radial-gradient(circle, #f59e0b, #f97316)', delay: 70 },
    { label: 'Défenseurs', value: players.filter(p => p.position === 'Défenseur').length, icon: Shield, color: '#3b82f6', gradient: 'radial-gradient(circle, #3b82f6, #06b6d4)', delay: 140 },
    { label: 'Milieux', value: players.filter(p => p.position === 'Milieu').length, icon: Zap, color: '#8b5cf6', gradient: 'radial-gradient(circle, #8b5cf6, #a78bfa)', delay: 210 },
    { label: 'Attaquants', value: players.filter(p => p.position === 'Attaquant').length, icon: Target, color: '#ef4444', gradient: 'radial-gradient(circle, #ef4444, #f97316)', delay: 280 },
  ]

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Effectif</h1>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Gérez vos joueurs</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 22px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, borderRadius: 10, border: 'none',
              cursor: 'pointer', fontSize: 15,
              boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={17} />
            Ajouter un joueur
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="#4b5563" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', background: '#0d0f18',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
                padding: '11px 16px 11px 40px', color: '#f1f5f9', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={14} color="#4b5563" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                background: '#0d0f18', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '11px 16px 11px 34px',
                color: '#f1f5f9', fontSize: 14, outline: 'none', cursor: 'pointer', minWidth: 180,
              }}
            >
              <option value="all">Toutes catégories</option>
              {['N3','U19','U17','U15','Seniors'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <select
            value={selectedPosition}
            onChange={e => setSelectedPosition(e.target.value)}
            style={{
              background: '#0d0f18', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '11px 16px',
              color: '#f1f5f9', fontSize: 14, outline: 'none', cursor: 'pointer', minWidth: 160,
            }}
          >
            <option value="all">Tous les postes</option>
            <option value="Gardien">Gardiens</option>
            <option value="Défenseur">Défenseurs</option>
            <option value="Milieu">Milieux</option>
            <option value="Attaquant">Attaquants</option>
          </select>
        </div>
      </div>

      {/* Players List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)',
            borderTopColor: '#6366f1', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#4b5563', fontSize: 14 }}>Chargement...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div style={{
          background: '#0d0f18', border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '64px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UsersIcon size={26} color="#6366f1" />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            {players.length === 0 ? 'Aucun joueur' : 'Aucun résultat'}
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            {players.length === 0 ? 'Commencez par ajouter vos joueurs' : 'Essayez de modifier vos filtres'}
          </p>
          {players.length === 0 && (
            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: 600, borderRadius: 10, border: 'none',
                cursor: 'pointer', fontSize: 14,
                boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
              }}
            >
              <Plus size={16} />
              Ajouter votre premier joueur
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {Object.entries(groupedPlayers).map(([position, positionPlayers], i) => {
            if (positionPlayers.length === 0) return null
            const { color, label } = positionColors[position]
            return (
              <div key={position} style={{ animation: `fadeIn 0.4s ease ${i * 80}ms both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 99, background: color }} />
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{label}</h2>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: color + '15', color: color,
                  }}>{positionPlayers.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {positionPlayers.map(player => (
                    <PlayerCard key={player.id} player={player} onEdit={openEditForm} onDelete={handleDeletePlayer} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PlayerForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingPlayer ? handleEditPlayer : handleAddPlayer}
        player={editingPlayer}
        category={selectedCategory !== 'all' ? selectedCategory : undefined}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #0d0f18; color: #f1f5f9; }
      `}</style>
    </DashboardLayout>
  )
}

export default PlayerManagement
