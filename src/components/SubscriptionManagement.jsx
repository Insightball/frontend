import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Zap, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const G = {
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.60)',
  text: '#f5f2eb', bg2: '#0f0e0c',
  green: '#22c55e', red: '#ef4444', orange: '#f59e0b',
}

const PLANS = [
  {
    id: 'COACH',
    name: 'Coach',
    price: 29,
    icon: Zap,
    color: G.gold,
    features: ['5 matchs / mois', 'Rapports PDF', 'Statistiques joueurs', 'Support email'],
  },
  {
    id: 'CLUB',
    name: 'Club',
    price: 99,
    icon: Users,
    color: '#3b82f6',
    features: ['20 matchs / mois', 'Multi-coachs', 'Gestion équipe complète', 'Support prioritaire'],
  },
]

export default function SubscriptionManagement() {
  const { user } = useAuth()
  const [sub, setSub]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)
  const [portalLoading, setPortalLoading]     = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => { loadSub() }, [])

  const loadSub = async () => {
    try {
      setLoading(true)
      const r = await api.get('/subscription/subscription-status')
      setSub(r.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleCheckout = async (planId) => {
    setCheckoutLoading(planId)
    setError('')
    try {
      const r = await api.post('/subscription/create-checkout-session', {
        plan: planId.toLowerCase(),
        success_url: `${window.location.origin}/dashboard?subscribed=true`,
        cancel_url: window.location.href,
      })
      window.location.href = r.data.url
    } catch (e) {
      setError('Erreur lors de la création du paiement. Réessayez.')
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const r = await api.post('/subscription/create-portal-session', {
        return_url: window.location.href,
      })
      window.location.href = r.data.url
    } catch (e) {
      setError('Erreur portail de gestion.')
      setPortalLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Annuler l\'abonnement ? Il restera actif jusqu\'à la fin de la période.')) return
    try {
      await api.post('/subscription/cancel-subscription')
      await loadSub()
    } catch (e) { setError('Erreur lors de l\'annulation.') }
  }

  if (loading) return (
    <div style={{ padding: '32px', textAlign: 'center', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', color: G.muted }}>
      Chargement...
    </div>
  )

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderLeft: `2px solid ${G.red}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={13} color={G.red} />
          <span style={{ fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</span>
        </div>
      )}

      {sub?.active ? (
        /* ── ABONNEMENT ACTIF ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>

          {/* Status actif */}
          <div style={{ background: G.bg2, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderLeft: `3px solid ${G.green}` }}>
            <CheckCircle size={15} color={G.green} />
            <div>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: G.green, letterSpacing: '.06em' }}>Abonnement actif</div>
              {sub.cancel_at_period_end && (
                <div style={{ fontFamily: G.mono, fontSize: 9, color: G.orange, marginTop: 2, letterSpacing: '.06em' }}>
                  Annulation programmée en fin de période
                </div>
              )}
            </div>
          </div>

          {/* Plan + renouvellement */}
          <div style={{ background: G.bg2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border }}>
            <div style={{ background: G.bg2, padding: '16px 20px' }}>
              <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 6 }}>Plan</div>
              <div style={{ fontFamily: G.display, fontSize: 28, color: G.gold }}>{user?.plan}</div>
            </div>
            {sub.current_period_end && (
              <div style={{ background: G.bg2, padding: '16px 20px' }}>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 6 }}>
                  {sub.cancel_at_period_end ? 'Actif jusqu\'au' : 'Renouvellement'}
                </div>
                <div style={{ fontFamily: G.mono, fontSize: 13, color: G.text }}>
                  {new Date(sub.current_period_end * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ background: G.bg2, padding: '16px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handlePortal} disabled={portalLoading} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: G.gold, color: '#0f0f0d',
              fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
              border: 'none', cursor: portalLoading ? 'not-allowed' : 'pointer',
              opacity: portalLoading ? 0.6 : 1,
            }}>
              <ExternalLink size={12} />
              {portalLoading ? 'Redirection...' : 'Gérer l\'abonnement'}
            </button>

            {!sub.cancel_at_period_end && (
              <button onClick={handleCancel} style={{
                padding: '10px 20px', background: 'transparent',
                border: `1px solid rgba(239,68,68,0.25)`,
                fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
                color: 'rgba(239,68,68,0.60)', cursor: 'pointer', transition: 'all .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = G.red; e.currentTarget.style.borderColor = G.red }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.60)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}>
                Annuler
              </button>
            )}
          </div>

          <div style={{ background: G.bg2, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={11} color={G.muted} />
            <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>Paiements sécurisés par Stripe</span>
          </div>
        </div>

      ) : (
        /* ── PAS D'ABONNEMENT ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em', marginBottom: 4 }}>
            Choisissez le plan adapté à votre structure
          </div>

          {/* Cards plans */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border }}>
            {PLANS.map(plan => {
              const Icon = plan.icon
              const isLoading = checkoutLoading === plan.id
              const isCurrent = user?.plan === plan.id
              return (
                <div key={plan.id} style={{
                  background: G.bg2, padding: '24px 20px',
                  borderTop: `2px solid ${isCurrent ? plan.color : G.border}`,
                  display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={15} color={plan.color} />
                      <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: plan.color }}>{plan.name}</span>
                    </div>
                    <div style={{ fontFamily: G.display, fontSize: 28, color: G.text, lineHeight: 1 }}>
                      {plan.price}<span style={{ fontFamily: G.mono, fontSize: 11, color: G.muted }}>€/m</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 4, height: 4, background: plan.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.06em', color: G.muted }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => handleCheckout(plan.id)} disabled={isLoading} style={{
                    padding: '11px', background: isLoading ? 'rgba(201,162,39,0.4)' : plan.color === G.gold ? G.gold : 'rgba(59,130,246,0.15)',
                    border: plan.color !== G.gold ? `1px solid rgba(59,130,246,0.40)` : 'none',
                    color: plan.color === G.gold ? '#0f0f0d' : '#3b82f6',
                    fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: 'auto', transition: 'all .15s',
                  }}>
                    {isLoading ? 'Redirection...' : `Choisir ${plan.name} →`}
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={11} color={G.muted} />
            <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>Paiement sécurisé Stripe · Résiliable à tout moment</span>
          </div>
        </div>
      )}
    </div>
  )
}
