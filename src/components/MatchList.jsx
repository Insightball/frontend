import { useState } from 'react'
import { Search, Clock, Loader, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const G = {
  bg: '#0a0908', bg2: '#0f0e0c',
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.45)',
  text: '#f5f2eb', green: '#22c55e', red: '#ef4444',
}

const STATUS_CONFIG = {
  pending:    { label: 'En attente',  color: G.gold,    icon: Clock },
  processing: { label: 'En cours',    color: '#3b82f6', icon: Loader },
  completed:  { label: 'Terminé',     color: G.green,   icon: CheckCircle },
  error:      { label: 'Erreur',      color: G.red,     icon: AlertCircle },
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = s.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: s.color + '18', color: s.color, border: `1px solid ${s.color}30` }}>
      <Icon size={9} /> {s.label}
    </span>
  )
}

function MatchCard({ match, onClick }) {
  const [hovered, setHovered] = useState(false)
  const hasScore = match.score_home !== null && match.score_away !== null
  const won = hasScore && match.score_home > match.score_away
  const lost = hasScore && match.score_home < match.score_away
  const resultColor = !hasScore ? G.goldBdr : won ? G.green + '60' : lost ? G.red + '60' : G.gold + '60'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(201,162,39,0.04)' : G.bg2,
        border: `1px solid ${hovered ? G.goldBdr : G.border}`,
        borderLeft: `3px solid ${resultColor}`,
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'all .15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 6 }}>
          {match.category} · {match.type} · {new Date(match.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>
        <div style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: G.text, letterSpacing: '.02em', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          vs {match.opponent}
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        {hasScore ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: G.display, fontSize: 32, color: G.text, lineHeight: 1 }}>
              {match.score_home} — {match.score_away}
            </div>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: won ? G.green : lost ? G.red : G.gold, marginTop: 4 }}>
              {won ? 'Victoire' : lost ? 'Défaite' : 'Nul'}
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted }}>— : —</div>
        )}
        <ChevronRight size={16} color={hovered ? G.gold : G.muted} style={{ transition: 'color .15s' }} />
      </div>
    </div>
  )
}

function MatchList({ matches = [] }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  const filtered = matches.filter(m => {
    const matchSearch = m.opponent?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || m.category === category
    const matchStatus = status === 'all' || m.status === status
    return matchSearch && matchCat && matchStatus
  })

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`,
    padding: '10px 14px', color: G.text, fontFamily: G.mono, fontSize: 12,
    outline: 'none', transition: 'border-color .15s',
  }

  return (
    <div>
      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={12} color={G.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Rechercher un adversaire..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: 36, boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = G.goldBdr}
            onBlur={e => e.target.style.borderColor = G.border}
          />
        </div>

        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', minWidth: 160 }}>
          <option value="all">Toutes catégories</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="R1">Régional 1</option>
          <option value="R2">Régional 2</option>
          <option value="R3">Régional 3</option>
          <option value="D1">Départemental 1</option>
          <option value="U19">U19</option>
          <option value="U17">U17</option>
          <option value="U15">U15</option>
          <option value="Seniors">Seniors</option>
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', minWidth: 160 }}>
          <option value="all">Tous les statuts</option>
          <option value="completed">Terminés</option>
          <option value="processing">En cours</option>
          <option value="pending">En attente</option>
          <option value="error">Erreurs</option>
        </select>
      </div>

      {/* Compteur */}
      <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginBottom: 16 }}>
        {filtered.length} match{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
      </div>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
          {filtered.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={() => navigate(`/dashboard/matches/${match.id}`)}
            />
          ))}
        </div>
      ) : (
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, padding: '64px 24px', textAlign: 'center' }}>
          <Search size={28} color={G.muted} style={{ marginBottom: 16 }} />
          <div style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: G.text, marginBottom: 8 }}>Aucun match trouvé</div>
          <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted }}>Modifiez vos filtres ou créez un nouveau match</div>
        </div>
      )}
    </div>
  )
}

export default MatchList
