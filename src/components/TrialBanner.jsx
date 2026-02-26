import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const G = {
  mono: "'JetBrains Mono', monospace",
  gold: '#c9a227',
}

export default function TrialBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [daysLeft, setDaysLeft] = useState(null)

  useEffect(() => {
    if (user?.trial_ends_at) {
      const diff = new Date(user.trial_ends_at) - new Date()
      setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
    }
  }, [user])

  if (dismissed) return null
  if (!user || user.plan !== 'COACH' || daysLeft === null) return null
  if (daysLeft > 7) return null

  const urgent = daysLeft <= 1
  const bg     = urgent ? '#fff1f0' : '#fffbeb'
  const color  = urgent ? '#dc2626' : '#92400e'
  const border = urgent ? '#fecaca' : '#fde68a'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 14px',
      background: bg,
      border: `1px solid ${border}`,
      marginBottom: 20,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={12} color={color} />
        <span style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color, fontWeight: 600 }}>
          Essai gratuit — {daysLeft === 0 ? 'expire aujourd\'hui' : `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/dashboard/settings" style={{
          fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
          padding: '5px 14px', background: color, color: '#fff',
          textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          S'abonner →
        </Link>
        <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: 2, display: 'flex' }}>
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
