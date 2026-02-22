import { useState, useEffect } from 'react'
import { Plus, Users as UsersIcon, Search, Shield, Zap, Target } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PlayerCard from '../components/PlayerCard'
import PlayerForm from '../components/PlayerForm'
import playerService from '../services/playerService'
import { useAuth } from '../context/AuthContext'

const G = {
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.06)', muted: 'rgba(245,242,235,0.35)',
}

function useCountUp(target, duration = 700) {
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

function StatCard({ value, label, icon: Icon, color, delay = 0 }) {
  const count = useCountUp(value)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
      background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}`,
      borderTop: `2px solid ${color}`, padding: '18px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{label}</span>
        <div style={{ width: 26, height: 26, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={12} color={color} />
        </div>
      </div>
      <div style={{ fontFamily: G.display, fontSize: 40, lineHeight: 1, color: '#f5f2eb', letterSpacing: '.01em' }}>{count}</div>
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
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { loadPlayers() }, [])
  useEffect(() => { filterPlayers() }, [players, selectedPosition, searchQuery])

  const loadPlayers = async () => {
    try { setLoading(true); const data = await playerService.getPlayers(); setPlayers(data) }
    catch (error) { console.error('Error:', error) } finally { setLoading(false) }
  }

  const filterPlayers = () => {
    let f = [...players]
    if (selectedPosition !== 'all') f = f.filter(p => p.position === selectedPosition)
    if (searchQuery) f = f.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.number.toString().includes(searchQuery))
    setFilteredPlayers(f)
  }

  const handleAddPlayer = async (data) => { await playerService.createPlayer(data); await loadPlayers(); setIsFormOpen(false) }
  const handleEditPlayer = async (data) => { await playerService.updatePlayer(editingPlayer.id, data); await loadPlayers(); setEditingPlayer(null); setIsFormOpen(false) }
  const handleDeletePlayer = async (player) => {
    if (!confirm(`Supprimer ${player.name} ?`)) return
    try { await playerService.deletePlayer(player.id); await loadPlayers() }
    catch { alert('Erreur lors de la suppression') }
  }

  const positionGroups = {
    'Gardien':   { color: '#f59e0b', label: 'Gardiens' },
    'Défenseur': { color: '#3b82f6', label: 'Défenseurs' },
    'Milieu':    { color: G.gold,    label: 'Milieux' },
    'Attaquant': { color: '#ef4444', label: 'Attaquants' },
  }

  const stats = [
    { label: 'Total',      value: players.length,                                    icon: UsersIcon, color: G.gold,    delay: 0 },
    { label: 'Gardiens',   value: players.filter(p => p.position === 'Gardien').length,   icon: Shield,    color: '#f59e0b', delay: 60 },
    { label: 'Défenseurs', value: players.filter(p => p.position === 'Défenseur').length, icon: Shield,    color: '#3b82f6', delay: 120 },
    { label: 'Milieux',    value: players.filter(p => p.position === 'Milieu').length,    icon: Zap,       color: G.gold,    delay: 180 },
    { label: 'Attaquants', value: players.filter(p => p.position === 'Attaquant').length, icon: Target,    color: '#ef4444', delay: 240 },
  ]

  return (
    <DashboardLayout>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Effectif
          </div>
          <h1 style={{ fontFamily: G.display, fontSize: 44, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#f5f2eb', margin: 0 }}>
            Vos<br /><span style={{ color: G.gold }}>joueurs.</span>
          </h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: G.gold, color: '#0f0f0d', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background .15s', marginTop: 8 }}
          onMouseEnter={e => e.currentTarget.style.background = '#a8861f'}
          onMouseLeave={e => e.currentTarget.style.background = G.gold}
        >
          <Plus size={14} /> Ajouter un joueur
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1, background: G.border, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} color={G.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Nom ou numéro..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}`, padding: '10px 14px 10px 38px', color: '#f5f2eb', fontFamily: G.mono, fontSize: 11, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s', letterSpacing: '.04em' }}
            onFocus={e => e.target.style.borderColor = G.goldBdr}
            onBlur={e => e.target.style.borderColor = G.border}
          />
        </div>
        <select value={selectedPosition} onChange={e => setSelectedPosition(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}`, padding: '10px 14px', color: '#f5f2eb', fontFamily: G.mono, fontSize: 11, outline: 'none', cursor: 'pointer', letterSpacing: '.06em' }}>
          <option value="all">Tous les postes</option>
          <option value="Gardien">Gardiens</option>
          <option value="Défenseur">Défenseurs</option>
          <option value="Milieu">Milieux</option>
          <option value="Attaquant">Attaquants</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 28, height: 28, border: `2px solid ${G.goldBdr}`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>Chargement...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.01)', border: `1px dashed ${G.goldBdr}`, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <UsersIcon size={22} color={G.gold} />
          </div>
          <h3 style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', letterSpacing: '.03em', color: '#f5f2eb', marginBottom: 8 }}>
            {players.length === 0 ? 'Aucun joueur' : 'Aucun résultat'}
          </h3>
          <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.06em', color: G.muted, marginBottom: 20 }}>
            {players.length === 0 ? 'Commencez par ajouter vos joueurs' : 'Modifiez vos filtres'}
          </p>
          {players.length === 0 && (
            <button onClick={() => setIsFormOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: G.gold, color: '#0f0f0d', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              <Plus size={14} /> Ajouter
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {Object.entries(positionGroups).map(([position, { color, label }], i) => {
            const pos = filteredPlayers.filter(p => p.position === position)
            if (pos.length === 0) return null
            return (
              <div key={position} style={{ animation: `fadeIn .35s ease ${i * 70}ms both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 3, height: 18, background: color }} />
                  <h2 style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#f5f2eb', margin: 0 }}>{label}</h2>
                  <span style={{ fontFamily: G.mono, fontSize: 9, padding: '2px 10px', background: color + '12', color, border: `1px solid ${color}20`, letterSpacing: '.08em' }}>{pos.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: G.border }}>
                  {pos.map(player => <PlayerCard key={player.id} player={player} onEdit={p => { setEditingPlayer(p); setIsFormOpen(true) }} onDelete={handleDeletePlayer} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PlayerForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingPlayer(null) }} onSubmit={editingPlayer ? handleEditPlayer : handleAddPlayer} player={editingPlayer} />
    </DashboardLayout>
  )
}

export default PlayerManagement
