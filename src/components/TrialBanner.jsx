import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, X, AlertTriangle, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { T } from '../theme'


export default function TrialBanner() {
  const { user }                  = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [trialData, setTrialData] = useState(null)

  useEffect(() => {
    if (!user) return
    api.get('/subscription/trial-status')
      .then(r => setTrialData(r.data))
      .catch(() => {
        // Fallback si backend KO
        if (user?.trial_ends_at) {
          const diff = new Date(user.trial_ends_at) - new Date()
          const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
          setTrialData({ access: days > 0 ? 'full' : 'expired', days_left: days, trial_active: days > 0, status: 'trialing' })
        }
      })
  }, [user])

  if (!user || !trialData) return null
  if (dismissed) return null
  // Banner trial COACH uniquement — le plan CLUB est sur devis, pas de trial
  if ((user?.plan || '').toUpperCase() !== 'COACH') return null

  // Afficher uniquement si trial en cours (trialing) ou expiré
  const isTrialing = trialData.access === 'full' && trialData.trial_active
  const isExpired  = trialData.access === 'expired'
  const noTrial    = trialData.access === 'no_trial'

  // Pas de banner si abonnement actif normal ou pas encore de trial
  if (!isTrialing && !isExpired) return null

  const daysLeft = trialData.days_left ?? 0
  const urgent   = isExpired || daysLeft <= 2

  const bg     = isExpired ? '#fef2f2' : urgent ? '#fffbeb' : '#f0fdf4'
  const color  = isExpired ? '#dc2626' : urgent ? '#92400e' : '#15803d'
  const border = isExpired ? '#fecaca' : urgent ? '#fde68a' : '#bbf7d0'
  const Icon   = isExpired ? AlertTriangle : Clock

  const mainMsg = isExpired
    ? 'Essai expiré — abonnez-vous pour continuer'
    : daysLeft === 0
      ? "Dernier jour d'essai — expire aujourd'hui"
      : `${daysLeft} jour${daysLeft > 1 ? 's' : ''} d'essai restant${daysLeft > 1 ? 's' : ''}`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '10px 16px',
      background: bg, border: `1px solid ${border}`,
      borderLeft: `3px solid ${color}`,
      marginBottom: 20, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <Icon size={14} color={color} style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '.06em', color, fontWeight: 700 }}>
          {mainMsg}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Link to="/dashboard/settings" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: T.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
          padding: '6px 16px', background: color, color: '#fff',
          textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap',
          transition: 'opacity .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <CreditCard size={11} />
          {isExpired ? 'Choisir un plan' : "S'abonner"}
        </Link>

        {!isExpired && (
          <button onClick={() => setDismissed(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color, padding: 4, display: 'flex', opacity: 0.6,
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
