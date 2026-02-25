import { User, Edit2, Trash2, AlertCircle } from 'lucide-react'

const G = {
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.60)',
  text: '#f5f2eb', bg2: '#0f0e0c',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', orange: '#f59e0b', yellow: '#eab308',
}

const POS = {
  'Gardien':   { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#eab308' },
  'Défenseur': { bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.30)', color: '#3b82f6' },
  'Milieu':    { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.30)',  color: '#22c55e' },
  'Attaquant': { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)',  color: '#ef4444' },
}

const STATUS = {
  'actif':     { label: 'Actif',     color: G.green },
  'blessé':    { label: 'Blessé',    color: G.red   },
  'suspendu':  { label: 'Suspendu',  color: G.orange },
  'inactif':   { label: 'Inactif',   color: 'rgba(245,242,235,0.35)' },
}

const FOOT = {
  'droit':        { label: 'Pied D.', color: G.gold   },
  'gauche':       { label: 'Pied G.', color: G.blue   },
  'ambidextre':   { label: 'Ambi.',   color: G.green  },
}

function PlayerCard({ player, onEdit, onDelete }) {
  const pos    = POS[player.position]    || POS['Milieu']
  const status = STATUS[player.status]  || STATUS['actif']
  const foot   = FOOT[player.preferred_foot]

  return (
    <div
      style={{
        background: G.bg2, border: `1px solid ${G.border}`,
        padding: '18px', position: 'relative', transition: 'border-color .15s, box-shadow .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.30)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.boxShadow = 'none' }}
      className="player-card-root"
    >
      {/* Actions hover */}
      <div className="player-card-actions" style={{
        position: 'absolute', top: 12, right: 12,
        display: 'flex', gap: 4, opacity: 0, transition: 'opacity .15s',
      }}>
        <button onClick={() => onEdit(player)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${G.border}`, padding: '5px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Edit2 size={12} color={G.gold} />
        </button>
        <button onClick={() => onDelete(player)} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Trash2 size={12} color={G.red} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Photo */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {player.photo_url
            ? <img src={player.photo_url} alt={player.name} style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={26} color='rgba(245,242,235,0.20)' />
              </div>
          }
          {/* Numéro */}
          <div style={{
            position: 'absolute', bottom: -6, right: -6,
            width: 22, height: 22, background: G.gold,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: G.display, fontSize: 11, color: '#0f0f0d', fontWeight: 900,
          }}>
            {player.number}
          </div>
          {/* Dot status si non-actif */}
          {player.status && player.status !== 'actif' && (
            <div style={{ position: 'absolute', top: -4, left: -4, width: 10, height: 10, background: status.color, borderRadius: '50%', border: `2px solid ${G.bg2}` }} />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Nom */}
          <div style={{ fontFamily: G.display, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.03em', color: G.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {player.name}
          </div>

          {/* Catégorie */}
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', color: G.muted, marginBottom: 10 }}>
            {player.category}
          </div>

          {/* Badge poste + pied */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', padding: '3px 9px', background: pos.bg, border: `1px solid ${pos.border}`, color: pos.color }}>
              {player.position}
            </span>
            {foot && (
              <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', padding: '3px 9px', background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.10)`, color: foot.color }}>
                {foot.label}
              </span>
            )}
            {player.status && player.status !== 'actif' && (
              <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', padding: '3px 9px', background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.10)`, color: status.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={9} /> {status.label}
              </span>
            )}
          </div>

          {/* Stats physiques + matchs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {player.height && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: G.display, fontSize: 15, color: G.text, lineHeight: 1 }}>{player.height}</span>
                <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', color: G.muted, textTransform: 'uppercase' }}>cm</span>
              </div>
            )}
            {player.weight && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: G.display, fontSize: 15, color: G.text, lineHeight: 1 }}>{player.weight}</span>
                <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', color: G.muted, textTransform: 'uppercase' }}>kg</span>
              </div>
            )}
            {(player.height || player.weight) && <div style={{ width: 1, height: 20, background: G.border }} />}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: G.display, fontSize: 15, color: G.muted, lineHeight: 1 }}>{player.matches_played ?? 0}</span>
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', color: G.muted, textTransform: 'uppercase' }}>matchs</span>
            </div>
            {player.birth_date && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: G.display, fontSize: 15, color: G.muted, lineHeight: 1 }}>
                  {new Date().getFullYear() - new Date(player.birth_date).getFullYear()}
                </span>
                <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', color: G.muted, textTransform: 'uppercase' }}>ans</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .player-card-root:hover .player-card-actions { opacity: 1 !important; }
      `}</style>
    </div>
  )
}

export default PlayerCard
