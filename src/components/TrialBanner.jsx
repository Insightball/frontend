import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, X, AlertTriangle, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const G = {
  mono: "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

export default function TrialBanner() {
  const { user }                      = useAuth()
  const [dismissed, setDismissed]     = useState(false)
  const [trialData, setTrialData]     = useState(null)
  const [debitDate, setDebitDate]     = useState('')

  useEffect(() => {
    if (!user) return
    api.get('/subscription/trial-status')
      .then(r => {
        setTrialData(r.data)
        // Calculer la date exacte de débit à afficher
        if (r.data?.trial_ends_at) {
          const d = new Date(r.data.trial_ends_at)
          setDebitDate(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }))
        } else if (r.data?.days_left > 0) {
          const d = new Date()
          d.setDate(d.getDate() + r.data.days_left)
          setDebitDate(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }))
        }
      })
      .catch(() => {
        if (user?.trial_ends_at) {
          const diff = new Date(user.trial_ends_at) - new Date()
          const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
          setTrialData({ access: days > 0 ? 'trial' : 'expired', days_left: days })
          const d = new Date(user.trial_ends_at)
          setDebitDate(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }))
        } else {
          const d = new Date()
          d.setDate(d.getDate() + 7)
          setTrialData({ access: 'trial', days_left: 7 })
          setDebitDate(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }))
        }
      })
  }, [user])

  if (!user || !trialData) return null
  if (!['trial', 'expired'].includes(trialData.access)) return null
  if (dismissed) return null

  const daysLeft = trialData.days_left ?? 0
  const expired  = trialData.access === 'expired'
  const urgent   = expired || daysLeft <= 2

  /* ── Styles selon urgence ── */
  const bg      = expired ? '#fef2f2' : urgent ? '#fffbeb' : '#f0fdf4'
  const color   = expired ? '#dc2626' : urgent ? '#92400e' : '#15803d'
  const border  = expired ? '#fecaca' : urgent ? '#fde68a' : '#bbf7d0'
  const Icon    = expired ? AlertTriangle : Clock

  /* ── Message principal ── */
  const mainMsg = expired
    ? 'Essai expiré — abonnez-vous pour continuer'
    : daysLeft === 0
      ? "Dernier jour d'essai — expire aujourd'hui"
      : `${daysLeft} jour${daysLeft > 1 ? 's' : ''} d'essai restant${daysLeft > 1 ? 's' : ''}`

  /* ── Sous-message date de débit ── */
  const subMsg = expired
    ? 'Votre accès est limité. Aucun débit effectué.'
    : debitDate
      ? `Débit le ${debitDate} — résiliable avant en 1 clic`
      : 'Résiliable à tout moment depuis vos paramètres'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '10px 16px',
      background: bg, border: `1px solid ${border}`,
      borderLeft: `3px solid ${color}`,
      marginBottom: 20, flexWrap: 'wrap',
    }}>
      {/* Icône + textes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <Icon size={14} color={color} style={{ flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: G.mono, fontSize: 11, letterSpacing: '.06em', color, fontWeight: 700, display: 'block' }}>
            {mainMsg}
          </span>
          <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.06em', color: color + 'bb', display: 'block', marginTop: 2 }}>
            {subMsg}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Link to="/dashboard/settings" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
          padding: '6px 16px', background: color, color: '#fff',
          textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap',
          transition: 'opacity .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <CreditCard size={11} />
          {expired ? 'Choisir un plan' : "S'abonner"}
        </Link>

        {/* Bouton fermer — seulement si pas expiré */}
        {!expired && (
          <button onClick={() => setDismissed(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color, padding: 4, display: 'flex', opacity: 0.6,
            transition: 'opacity .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            title="Fermer"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
