function HeatmapPlayer({ data, playerName }) {
  // data = array of {x, y, intensity} points
  // x, y are percentages 0-100 of field dimensions
  
  const getColor = (intensity) => {
    // Gradient from blue (low) to red (high)
    if (intensity >= 0.8) return '#EF4444' // red-500
    if (intensity >= 0.6) return '#F59E0B' // amber-500
    if (intensity >= 0.4) return '#10B981' // green-500
    if (intensity >= 0.2) return '#3B82F6' // blue-500
    return '#6366F1' // indigo-500
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4">
      <h3 className="font-semibold mb-4">{playerName} - Heatmap</h3>
      
      {/* Football field */}
      <div className="relative bg-green-900/20 rounded-lg overflow-hidden" style={{ paddingBottom: '66.67%' }}>
        {/* Field lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 66.67" preserveAspectRatio="none">
          {/* Outer rectangle */}
          <rect x="1" y="1" width="98" height="64.67" fill="none" stroke="#10B981" strokeWidth="0.3" opacity="0.3" />
          
          {/* Center line */}
          <line x1="50" y1="1" x2="50" y2="65.67" stroke="#10B981" strokeWidth="0.3" opacity="0.3" />
          
          {/* Center circle */}
          <circle cx="50" cy="33.33" r="8" fill="none" stroke="#10B981" strokeWidth="0.3" opacity="0.3" />
          
          {/* Penalty areas */}
          <rect x="1" y="20" width="15" height="26.67" fill="none" stroke="#10B981" strokeWidth="0.3" opacity="0.3" />
          <rect x="84" y="20" width="15" height="26.67" fill="none" stroke="#10B981" strokeWidth="0.3" opacity="0.3" />
          
          {/* Goal areas */}
          <rect x="1" y="26.67" width="5" height="13.33" fill="none" stroke="#10B981" strokeWidth="0.3" opacity="0.3" />
          <rect x="94" y="26.67" width="5" height="13.33" fill="none" stroke="#10B981" strokeWidth="0.3" opacity="0.3" />
        </svg>

        {/* Heatmap points */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 66.67" preserveAspectRatio="none">
          {data && data.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={point.intensity * 3 + 1}
              fill={getColor(point.intensity)}
              opacity={0.6}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Faible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Moyen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-400">Élevé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-400">Très élevé</span>
        </div>
      </div>
    </div>
  )
}

export default HeatmapPlayer
