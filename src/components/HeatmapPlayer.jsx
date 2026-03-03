function HeatmapPlayer({ data, playerName }) {
  // data = array of {x, y, intensity} points
  // x, y are percentages 0-100 of field dimensions

  const filterId = `heatblur_${playerName?.replace(/\s+/g, '') ?? 'team'}`
  const colorMatrixId = `heatcolor_${playerName?.replace(/\s+/g, '') ?? 'team'}`

  // Field aspect ratio : 105m x 68m → viewBox 100 x 64.76
  const VW = 100
  const VH = 64.76

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(26,25,22,0.09)', borderTop: '2px solid rgba(201,162,39,0.22)', padding: '24px' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#c9a227', marginBottom: 16 }}>
        — {playerName} · Heatmap
      </div>

      <div style={{ position: 'relative', width: '100%', paddingBottom: `${(VH / VW) * 100}%`, background: '#2d6a2d', overflow: 'hidden' }}>
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Blur fort pour fusion des zones — type heatmap pro */}
            <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.8" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 20 -5"
                result="heat"
              />
            </filter>
          </defs>

          {/* ── Terrain vert ── */}
          <rect x="0" y="0" width={VW} height={VH} fill="#2d6a2d" />

          {/* Bandes alternées subtiles */}
          {[0,1,2,3,4,5].map(i => (
            <rect key={i} x={i * (VW/6)} y="0" width={VW/6} height={VH}
              fill={i % 2 === 0 ? '#2d6a2d' : '#286428'} />
          ))}

          {/* ── Heatmap layer — AVANT les lignes ── */}
          {data && data.length > 0 && (
            <g filter={`url(#${filterId})`}>
              {data.map((point, i) => {
                const t = Math.max(0, Math.min(1, point.intensity ?? 0.5))
                // Transparence → jaune → orange → rouge (pas de bleu)
                let r, g, b
                if (t < 0.5) {
                  // jaune pâle → jaune vif
                  const s = t / 0.5
                  r = 255; g = 255; b = 0
                  // on ajuste juste l'opacité dans ce range
                } else if (t < 0.75) {
                  // jaune → orange
                  const s = (t - 0.5) / 0.25
                  r = 255; g = Math.round(255 * (1 - s * 0.6)); b = 0
                } else {
                  // orange → rouge vif
                  const s = (t - 0.75) / 0.25
                  r = 255; g = Math.round(100 * (1 - s)); b = 0
                }
                const radius = 5 + t * 6
                return (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={(point.y / 100) * VH}
                    r={radius}
                    fill={`rgb(${r},${g},${b})`}
                    opacity={t < 0.3 ? t * 1.2 : 0.5 + t * 0.45}
                  />
                )
              })}
            </g>
          )}

          {/* ── Lignes terrain AU-DESSUS de la heatmap ── */}
          <g stroke="rgba(255,255,255,0.85)" strokeWidth="0.4" fill="none">
            <rect x="2" y="1.5" width="96" height="61.76" />
            <line x1="50" y1="1.5" x2="50" y2="63.26" />
            <circle cx="50" cy="32.38" r="9.15" />
            <circle cx="50" cy="32.38" r="0.4" fill="white" stroke="none" />
            <rect x="2" y="18.05" width="16.5" height="28.66" />
            <rect x="81.5" y="18.05" width="16.5" height="28.66" />
            <rect x="2" y="24.72" width="5.5" height="15.32" />
            <rect x="92.5" y="24.72" width="5.5" height="15.32" />
            <circle cx="11" cy="32.38" r="0.5" fill="white" stroke="none" />
            <circle cx="89" cy="32.38" r="0.5" fill="white" stroke="none" />
            <path d="M 18.5 26.5 A 9.15 9.15 0 0 1 18.5 38.26" />
            <path d="M 81.5 26.5 A 9.15 9.15 0 0 0 81.5 38.26" />
            <rect x="0" y="27.88" width="2" height="9" />
            <rect x="98" y="27.88" width="2" height="9" />
            <path d="M 2 3 A 1.5 1.5 0 0 1 3.5 1.5" />
            <path d="M 98 3 A 1.5 1.5 0 0 0 96.5 1.5" />
            <path d="M 2 62 A 1.5 1.5 0 0 0 3.5 63.26" />
            <path d="M 98 62 A 1.5 1.5 0 0 1 96.5 63.26" />
          </g>

          {/* État vide */}
          {(!data || data.length === 0) && (
            <text x="50" y="35" textAnchor="middle" fill="rgba(255,255,255,0.3)"
              fontSize="4" fontFamily="monospace">
              Données non disponibles
            </text>
          )}
        </svg>
      </div>

      {/* Légende */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        {[
          { color: '#ffff00', label: 'Faible' },
          { color: '#ff8800', label: 'Moyen' },
          { color: '#ff4400', label: 'Élevé' },
          { color: '#ff0000', label: 'Très élevé' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.08em', color: 'rgba(26,25,22,0.45)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeatmapPlayer
