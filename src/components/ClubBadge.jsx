import { Shield } from 'lucide-react'

function ClubBadge({ club, size = 'md', showName = true }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  if (!club) return null

  const primaryColor = club.primary_color || '#5EEAD4'
  const secondaryColor = club.secondary_color || '#2DD4BF'

  return (
    <div className="flex items-center gap-3">
      {/* Logo or Shield */}
      {club.logo_url ? (
        <img 
          src={club.logo_url} 
          alt={club.name}
          className={`${sizes[size]} rounded-lg object-cover`}
        />
      ) : (
        <div 
          className={`${sizes[size]} rounded-lg flex items-center justify-center`}
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
          }}
        >
          <Shield className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'} text-white`} />
        </div>
      )}

      {/* Club name */}
      {showName && (
        <div className="flex-1 min-w-0">
          <p className={`font-bold truncate ${textSizes[size]}`}>
            {club.name}
          </p>
        </div>
      )}
    </div>
  )
}

export default ClubBadge
