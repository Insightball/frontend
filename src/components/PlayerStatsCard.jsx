import { User, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const G = {
  paper:   '#f5f2eb',
  cream:   '#faf8f4',
  white:   '#ffffff',
  ink:     '#0f0f0d',
  muted:   'rgba(15,15,13,0.45)',
  muted2:  'rgba(15,15,13,0.65)',
  rule:    'rgba(15,15,13,0.09)',
  gold:    '#c9a227',
  goldBg:  'rgba(201,162,39,0.08)',
  goldBdr: 'rgba(201,162,39,0.28)',
  green:   '#16a34a',
  red:     '#dc2626',
  blue:    '#2563eb',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function getRatingColor(rating) {
  if (rating >= 8) return G.green
  if (rating >= 7) return G.gold
  if (rating >= 6) return '#d97706'
  return G.red
}

function PlayerStatsCard({ player, stats, onClick }) {
  const trend = stats?.trend
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? G.green : trend < 0 ? G.red : G.muted
  const trendLabel = trend > 0 ? 'En progression' : trend < 0 ? 'En baisse' : 'Stable'

  return (
    <div
      onClick={() => onClick && onClick(player)}
      style={{
        background: G.white,
        border: `1px solid ${G.rule}`,
        borderRadius: 10,
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow .15s, border-color .15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,15,13,0.08)'
        e.currentTarget.style.borderColor = G.goldBdr
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = G.rule
      }}
    >
      {/* Header — photo + info + rating */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Photo */}
        {player.photo_url ? (
          <img
            src={player.photo_url}
            alt={player.name}
            style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: `1px solid ${G.rule}` }}
          />
        ) : (
          <div style={{ width: 46, height: 46, borderRadius: 8, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={18} color={G.gold} />
          </div>
        )}

        {/* Nom + poste + numéro */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: G.mono, fontSize: 12, fontWeight: 700, color: G.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {player.name}
            </span>
            {player.number && (
              <span style={{ fontFamily: G.mono, fontSize: 8, fontWeight: 700, padding: '2px 7px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold, borderRadius: 4, flexShrink: 0 }}>
                #{player.number}
              </span>
            )}
          </div>
          <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
            {player.position}
          </span>
        </div>

        {/* Rating */}
        {stats?.rating !== undefined && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: G.display, fontSize: 28, lineHeight: 1, color: getRatingColor(stats.rating) }}>
              {Number(stats.rating).toFixed(1)}
            </div>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 2 }}>Note</div>
          </div>
        )}
      </div>

      {/* Stats grille */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        {[
          { label: 'Passes',   value: stats?.passes   ?? 0 },
          { label: 'Km',       value: stats?.distance ? `${stats.distance}` : '0' },
          { label: 'Duels',    value: stats?.duels    ?? 0 },
        ].map(s => (
          <div key={s.label} style={{ background: G.paper, borderRadius: 6, padding: '8px 6px', textAlign: 'center' }}>
            <div style={{ fontFamily: G.display, fontSize: 20, lineHeight: 1, color: G.ink, marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trend */}
      {stats?.trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 10, borderTop: `1px solid ${G.rule}` }}>
          <TrendIcon size={12} color={trendColor} />
          <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', color: trendColor }}>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

export default PlayerStatsCard
