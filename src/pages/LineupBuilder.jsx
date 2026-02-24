import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Save, ArrowLeft, Users as UsersIcon, RefreshCw } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import TacticalBoard from '../components/TacticalBoard'
import PlayerSelector from '../components/PlayerSelector'
import { FORMATIONS, FORMATION_LIST } from '../utils/formations'
import playerService from '../services/playerService'

const G = {
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(15,15,13,0.09)', muted: 'rgba(15,15,13,0.42)',
}

function LineupBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const matchId = searchParams.get('matchId')

  const [selectedFormation, setSelectedFormation] = useState('4-4-2')
  const [selectedCategory, setSelectedCategory] = useState('N3')
  const [players, setPlayers] = useState([])
  const [lineup, setLineup] = useState({ starters: [], substitutes: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPlayers() }, [])

  const loadPlayers = async () => {
    try { setLoading(true); const data = await playerService.getPlayers(); setPlayers(data.filter(p => p.status === 'actif')) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleFormationChange = (k) => { setSelectedFormation(k); setLineup({ starters: [], substitutes: [] }) }

  const handlePlayerPlace = (player, positionId) => {
    const existingIdx = lineup.starters.findIndex(p => p.positionId === positionId)
    if (existingIdx >= 0) {
      const replaced = lineup.starters[existingIdx]
      setLineup(prev => ({
        starters: prev.starters.map(p => p.positionId === positionId ? { ...player, positionId } : p),
        substitutes: [...prev.substitutes, replaced],
      }))
    } else {
      setLineup(prev => ({ ...prev, starters: [...prev.starters, { ...player, positionId }] }))
    }
  }

  const handlePlayerRemove = (playerId) => {
    const player = lineup.starters.find(p => p.id === playerId)
    setLineup(prev => ({ starters: prev.starters.filter(p => p.id !== playerId), substitutes: player ? [...prev.substitutes, player] : prev.substitutes }))
  }

  const handleSave = async () => {
    try {
      const data = {
        formation: selectedFormation, category: selectedCategory,
        starters: lineup.starters.map(p => ({ player_id: p.id, position_id: p.positionId, number: p.number, name: p.name })),
        substitutes: lineup.substitutes.map(p => ({ player_id: p.id, number: p.number, name: p.name })),
      }
      if (matchId) navigate(`/dashboard/matches/${matchId}`)
      else alert('Composition sauvegardée !')
    } catch (e) { console.error(e); alert('Erreur') }
  }

  const isComplete = lineup.starters.length === 11
  const categories = ['N3', 'R1', 'R2', 'U19', 'U17', 'U15', 'Seniors']

  const selectStyle = {
    background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`,
    padding: '12px 14px', color: '#0f0f0d',
    fontFamily: G.mono, fontSize: 12, outline: 'none', cursor: 'pointer', width: '100%',
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.12em' }}>Chargement...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', cursor: 'pointer', marginBottom: 20, padding: 0, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = G.muted}>
          <ArrowLeft size={13} /> Retour
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 16, height: 1, background: G.gold }} />Composition tactique
            </div>
            <h1 style={{ fontFamily: G.display, fontSize: 40, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#0f0f0d', margin: 0 }}>
              Aligner<br /><span style={{ color: G.gold }}>votre équipe.</span>
            </h1>
            <p style={{ fontFamily: G.mono, fontSize: 10, color: isComplete ? '#22c55e' : G.muted, marginTop: 10, letterSpacing: '.08em' }}>
              {isComplete ? '✓ Composition complète (11/11)' : `${lineup.starters.length}/11 joueurs placés`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => { if (confirm('Réinitialiser ?')) setLineup({ starters: [], substitutes: [] }) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'transparent', border: `1px solid rgba(15,15,13,0.09)`, color: 'rgba(15,15,13,0.45)', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.goldBdr; e.currentTarget.style.color = G.gold }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted }}>
              <RefreshCw size={12} /> Reset
            </button>
            <button onClick={handleSave} disabled={!isComplete}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: isComplete ? G.gold : 'rgba(201,162,39,0.15)', color: isComplete ? '#0f0f0d' : G.muted, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: isComplete ? 'pointer' : 'not-allowed', transition: 'background .15s' }}>
              <Save size={12} /> Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 1, background: G.border }}>
        {/* Left - Board */}
        <div style={{ background: '#ffffff', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 8 }}>Dispositif</div>
              <select value={selectedFormation} onChange={e => handleFormationChange(e.target.value)} style={selectStyle}>
                {FORMATION_LIST.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 8 }}>Catégorie</div>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={selectStyle}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Tactical board */}
          <div style={{ aspectRatio: '2/3' }}>
            <TacticalBoard formation={FORMATIONS[selectedFormation]} lineup={lineup} onPlayerPlace={handlePlayerPlace} onPlayerRemove={handlePlayerRemove} />
          </div>

          {/* Substitutes */}
          <div style={{ border: `1px solid rgba(15,15,13,0.09)`, padding: '20px' }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 12, height: 1, background: G.gold }} />
              Remplaçants ({lineup.substitutes.length})
            </div>
            {lineup.substitutes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>Aucun remplaçant</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {lineup.substitutes.map(player => (
                  <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#faf8f4', border: `1px solid rgba(15,15,13,0.09)` }}>
                    <div style={{ width: 28, height: 28, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: G.display, fontSize: 14, color: G.gold, flexShrink: 0 }}>
                      {player.number}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: G.mono, fontSize: 10, color: '#0f0f0d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '.04em' }}>{player.name}</div>
                      <div style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>{player.position}</div>
                    </div>
                    <button onClick={() => setLineup(prev => ({ ...prev, substitutes: prev.substitutes.filter(p => p.id !== player.id) }))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Player selector */}
        <div style={{ background: '#faf8f4', border: `1px solid rgba(15,15,13,0.09)`, padding: '24px' }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <UsersIcon size={12} color={G.gold} />
            Joueurs disponibles
          </div>
          <PlayerSelector players={players} lineup={lineup} onDragStart={() => {}} selectedCategory={selectedCategory} />
        </div>
      </div>
      <style>{`select option { background: #0a0a08; }`}</style>
    </DashboardLayout>
  )
}

export default LineupBuilder
