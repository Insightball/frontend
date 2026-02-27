import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const G = {
  mono: "'JetBrains Mono', monospace",
}

export default function TrialBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [trialData, setTrialData] = useState(null)

  useEffect(() => {
    if (!user) return
    // Source de vérité = backend, pas le token JWT
    api.get('/subscription/trial-status')
      .then(r => setTrialData(r.data))
      .catch(() => {
        // Fallback local si backend KO
        if (user?.trial_ends_at) {
          const diff = new Date(user.trial_ends_at) - new Date()
          const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
          setTrialData({ access: days > 0 ? 'trial' : 'expired', days_left: days })
        } else {
          // Aucune info trial => on affiche quand même pour les nouveaux users
          setTrialData({ access: 'trial', days_left: 7 })
        }
      })
  }, [user])

  if (dismissed) return null
  if (!user) return null
  if (!trialData) return null

  // Affiche uniquement si trial actif ou expiré sans abonnement
  if (!['trial', 'expired'].includes(trialData.access)) return null

  const daysLeft = trialData.days_left ?? 0
  const expired  = trialData.access === 'expired'
  const urgent   = expired || daysLeft <= 2

  const bg     = urgent ? '#fff1f0' : '#fffbeb'
  const color  = urgent ? '#dc2626' : '#92400e'
  const border = urgent ? '#fecaca' : '#fde68a'

  const message = expired
    ? 'Essai expiré — accès limité'
    : daysLeft === 0
      ? "Essai gratuit — expire aujourd'hui"
      : `Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '8px 14px', background: bg,
      border: `1px solid ${border}`, marginBottom: 20, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={12} color={color} />
        <span style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color, fontWeight: 600 }}>
          {message}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/dashboard/settings" style={{
          fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
          padding: '5px 14px', background: color, color: '#fff',
          textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap', borderRadius: 3,
        }}>
          S'abonner →
        </Link>
        {!expired && (
          <button onClick={() => setDismissed(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color, padding: 2, display: 'flex',
          }}>
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
