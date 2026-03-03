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
            {/* Blur pour effet chaleur */}
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 18 -7"
                result="heat"
              />
            </filter>

            {/* Gradient chaleur : transparent → jaune → orange → rouge */}
            <linearGradient id={colorMatrixId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#ffff00" stopOpacity="0.0" />
              <stop offset="30%"  stopColor="#ffff00" stopOpacity="0.6" />
              <stop offset="60%"  stopColor="#ff8800" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff0000" stopOpacity="1.0" />
            </linearGradient>
          </defs>

          {/* ── Terrain vert ── */}
          <rect x="0" y="0" width={VW} height={VH} fill="#2d6a2d" />

          {/* Bandes alternées subtiles */}
          {[0,1,2,3,4,5].map(i => (
            <rect key={i} x={i * (VW/6)} y="0" width={VW/6} height={VH}
              fill={i % 2 === 0 ? '#2d6a2d' : '#286428'} />
          ))}

          {/* ── Lignes terrain ── */}
          <g stroke="rgba(255,255,255,0.75)" strokeWidth="0.4" fill="none">
            {/* Contour */}
            <rect x="2" y="1.5" width="96" height="61.76" />
            {/* Ligne médiane */}
            <line x1="50" y1="1.5" x2="50" y2="63.26" />
            {/* Rond central */}
            <circle cx="50" cy="32.38" r="9.15" />
            <circle cx="50" cy="32.38" r="0.4" fill="white" stroke="none" />
            {/* Surface réparation gauche */}
            <rect x="2" y="18.05" width="16.5" height="28.66" />
            {/* Surface réparation droite */}
            <rect x="81.5" y="18.05" width="16.5" height="28.66" />
            {/* Surface but gauche */}
            <rect x="2" y="24.72" width="5.5" height="15.32" />
            {/* Surface but droite */}
            <rect x="92.5" y="24.72" width="5.5" height="15.32" />
            {/* Point de penalty gauche */}
            <circle cx="11" cy="32.38" r="0.5" fill="white" stroke="none" />
            {/* Point de penalty droit */}
            <circle cx="89" cy="32.38" r="0.5" fill="white" stroke="none" />
            {/* Arc surface gauche */}
            <path d="M 18.5 26.5 A 9.15 9.15 0 0 1 18.5 38.26" />
            {/* Arc surface droite */}
            <path d="M 81.5 26.5 A 9.15 9.15 0 0 0 81.5 38.26" />
            {/* Buts */}
            <rect x="0" y="27.88" width="2" height="9" />
            <rect x="98" y="27.88" width="2" height="9" />
            {/* Corners */}
            <path d="M 2 3 A 1.5 1.5 0 0 1 3.5 1.5" />
            <path d="M 98 3 A 1.5 1.5 0 0 0 96.5 1.5" />
            <path d="M 2 62 A 1.5 1.5 0 0 0 3.5 63.26" />
            <path d="M 98 62 A 1.5 1.5 0 0 1 96.5 63.26" />
          </g>

          {/* ── Heatmap layer ── */}
          {data && data.length > 0 && (
            <g filter={`url(#${filterId})`}>
              {data.map((point, i) => {
                const intensity = Math.max(0, Math.min(1, point.intensity ?? 0.5))
                // Couleur selon intensité : jaune → orange → rouge
                const r = 255
                const g = Math.round(255 * (1 - intensity))
                const b = 0
                const radius = 4 + intensity * 5
                return (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={(point.y / 100) * VH}
                    r={radius}
                    fill={`rgb(${r},${g},${b})`}
                    opacity={0.55 + intensity * 0.4}
                  />
                )
              })}
            </g>
          )}

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
          { color: '#ffaa00', label: 'Moyen' },
          { color: '#ff5500', label: 'Élevé' },
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
