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

  // Détection des états
  const isTrialingStripe = trialData.access === 'full' && trialData.trial_active
  const isTrialingLocal  = trialData.access === 'trial' && trialData.trial_active
  const isTrialing       = isTrialingStripe || isTrialingLocal
  const isExpired        = trialData.access === 'expired'
  const hasSubscription  = trialData.access === 'full' && !trialData.trial_active

  // Pas de banner si abonnement actif payant ou pas de trial du tout
  if (hasSubscription) return null
  if (!isTrialing && !isExpired) return null

  const daysLeft = trialData.days_left ?? 0
  const urgent   = isExpired || daysLeft <= 2
  const noSub    = !user?.stripe_subscription_id

  // Style selon urgence
  const bg     = isExpired ? '#fef2f2' : urgent ? '#fffbeb' : 'rgba(201,162,39,0.06)'
  const color  = isExpired ? '#dc2626' : urgent ? '#92400e' : T.gold
  const border = isExpired ? '#fecaca' : urgent ? '#fde68a' : 'rgba(201,162,39,0.2)'
  const Icon   = isExpired ? AlertTriangle : Clock

  // Message adapté
  const mainMsg = isExpired
    ? 'Essai terminé — active ton abonnement pour continuer'
    : noSub && daysLeft > 2
      ? `Essai gratuit · ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''} — active ton essai pour débloquer ton match offert`
      : daysLeft === 0
        ? "Dernier jour d'essai — expire aujourd'hui"
        : `${daysLeft} jour${daysLeft > 1 ? 's' : ''} d'essai restant${daysLeft > 1 ? 's' : ''}`

  const ctaLabel = isExpired
    ? 'Choisir un plan'
    : noSub
      ? 'Activer mon essai'
      : "S'abonner"

  const mainMsg = isExpired
    ? 'Essai terminé — active ton abonnement pour continuer'
    : noSub && daysLeft > 2
      ? `Essai gratuit · ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''} — active ton essai pour débloquer ton match offert`
      : daysLeft === 0
        ? "Dernier jour d'essai — expire aujourd'hui"
        : `${daysLeft} jour${daysLeft > 1 ? 's' : ''} d'essai restant${daysLeft > 1 ? 's' : ''}`

  const ctaLabel = isExpired
    ? 'Choisir un plan'
    : noSub
      ? 'Activer mon essai'
      : "S'abonner"

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
          {ctaLabel}
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
