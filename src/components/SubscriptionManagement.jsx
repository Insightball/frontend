import { useState, useEffect, useRef } from 'react'
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Zap, Users, Lock, X, Clock } from 'lucide-react'
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
    id: 'COACH', name: 'Coach', price: 39, icon: Zap, color: G.gold,
    features: ['4 matchs / mois', 'Rapports PDF', 'Statistiques joueurs', 'Support email'],
  },
  {
    id: 'CLUB', name: 'Club', price: 129, icon: Users, color: '#3b82f6',
    features: ['12 matchs / mois', 'Multi-équipes', 'Dashboard directeur sportif', 'Support prioritaire'],
  },
]

// ── Chargement Stripe.js ──────────────────────────────────────
let stripePromise = null
function getStripe() {
  if (!stripePromise) {
    stripePromise = new Promise((resolve) => {
      if (window.Stripe) { resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)); return }
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.onload = () => resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY))
      document.head.appendChild(script)
    })
  }
  return stripePromise
}

// ── Composant formulaire CB intégré ──────────────────────────
function InlineCardForm({ plan, onSuccess, onCancel }) {
  const cardRef           = useRef(null)
  const cardElementRef    = useRef(null)
  const stripeRef         = useRef(null)
  const [ready, setReady]   = useState(false)
  const [paying, setPaying] = useState(false)
  const [cardError, setCardError] = useState('')

  useEffect(() => {
    let mounted = true
    getStripe().then(stripe => {
      if (!mounted || !cardRef.current) return
      stripeRef.current = stripe
      const elements = stripe.elements({
        fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap' }],
      })
      const card = elements.create('card', {
        style: {
          base: {
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            color: '#f5f2eb',
            '::placeholder': { color: 'rgba(245,242,235,0.28)' },
            iconColor: '#c9a227',
          },
          invalid: { color: '#ef4444', iconColor: '#ef4444' },
        },
        hidePostalCode: true,
      })
      card.mount(cardRef.current)
      card.on('ready', () => setReady(true))
      card.on('change', e => setCardError(e.error?.message || ''))
      cardElementRef.current = card
    })
    return () => { mounted = false; cardElementRef.current?.destroy() }
  }, [])

  const handlePay = async () => {
    if (!stripeRef.current || !cardElementRef.current) return
    setPaying(true); setCardError('')
    try {
      // 1. Créer le SetupIntent backend
      const { data } = await api.post('/subscription/create-setup-intent')

      // 2. Confirmer avec Stripe Elements
      const { setupIntent, error } = await stripeRef.current.confirmCardSetup(
        data.client_secret,
        { payment_method: { card: cardElementRef.current } }
      )
      if (error) { setCardError(error.message); setPaying(false); return }

      // 3. Créer l'abonnement avec trial 7j
      await api.post('/subscription/confirm-plan', {
        plan: plan.id,
        payment_method_id: setupIntent.payment_method,
      })
      onSuccess()
    } catch (e) {
      setCardError(e?.response?.data?.detail || 'Erreur lors du paiement')
      setPaying(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: G.border }}>
      {/* Header */}
      <div style={{ background: G.bg2, padding: '16px 20px', borderTop: `2px solid ${plan.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: plan.color, marginBottom: 4 }}>
            Plan sélectionné
          </div>
          <div style={{ fontFamily: G.display, fontSize: 20, color: G.text, textTransform: 'uppercase' }}>
            {plan.name} — <span style={{ color: plan.color }}>{plan.price}€/mois</span>
          </div>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={14} color={G.muted} />
        </button>
      </div>

      {/* Bloc rassurant */}
      <div style={{ background: G.bg2, padding: '12px 20px', borderTop: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={12} color={G.gold} style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.55)', lineHeight: 1.6 }}>
          Essai gratuit 7 jours · Aucun débit aujourd'hui · Rappel email J-2 · Résiliable en 1 clic
        </span>
      </div>

      {/* Champ CB */}
      <div style={{ background: G.bg2, padding: '20px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: G.muted, marginBottom: 10 }}>
          Carte bancaire
        </div>
        <div
          ref={cardRef}
          style={{
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${cardError ? G.red : G.border}`,
            minHeight: 44,
            transition: 'border-color .15s',
          }}
        />
        {cardError && (
          <div style={{ fontFamily: G.mono, fontSize: 9, color: G.red, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={10} /> {cardError}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <Lock size={10} color={G.muted} />
          <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.35)', letterSpacing: '.06em' }}>
            Sécurisé par Stripe · Données chiffrées
          </span>
        </div>
      </div>

      {/* Bouton confirmer */}
      <div style={{ background: G.bg2, padding: '16px 20px', borderTop: `1px solid ${G.border}` }}>
        <button
          onClick={handlePay}
          disabled={paying || !ready}
          style={{
            width: '100%', padding: '13px',
            background: paying || !ready ? 'rgba(201,162,39,0.4)' : G.gold,
            border: 'none', color: '#0f0f0d',
            fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em',
            textTransform: 'uppercase', fontWeight: 700,
            cursor: paying || !ready ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {paying
            ? <><Spinner /> Activation en cours...</>
            : !ready
              ? 'Chargement...'
              : <><CreditCard size={13} /> Démarrer l'essai gratuit</>
          }
        </button>
        <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.25)', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
          Premier débit le {getDebitDate()} · Annulable avant depuis ce menu
        </p>
      </div>
    </div>
  )
}

function getDebitDate() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

function Spinner() {
  return <span style={{ width: 12, height: 12, border: '2px solid #0f0f0d', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
}

// ── Composant principal ───────────────────────────────────────
export default function SubscriptionManagement() {
  const { user, refreshUser } = useAuth()
  const [sub, setSub]                 = useState(null)
  const [trialData, setTrialData]     = useState(null)
  const [loading, setLoading]         = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [success, setSuccess]         = useState('')
  const [error, setError]             = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [subRes, trialRes] = await Promise.all([
        api.get('/subscription/subscription-status'),
        api.get('/subscription/trial-status'),
      ])
      setSub(subRes.data)
      setTrialData(trialRes.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handlePortal = async () => {
    setPortalLoading(true); setError('')
    try {
      const r = await api.post('/subscription/create-portal-session', { return_url: window.location.href })
      window.location.href = r.data.url
    } catch { setError('Erreur portail de gestion.'); setPortalLoading(false) }
  }

  const handleCancel = async () => {
    if (!window.confirm("Résilier l'abonnement ? Il restera actif jusqu'à la fin de la période en cours.")) return
    setCancelLoading(true); setError('')
    try {
      await api.post('/subscription/cancel-subscription')
      setSuccess('Abonnement résilié. Actif jusqu\'à la fin de la période.')
      await loadAll()
    } catch { setError('Erreur lors de la résiliation.') }
    finally { setCancelLoading(false) }
  }

  // Résiliation pendant le trial — ouvre modale de confirmation
  const handleCancelTrial = () => setShowCancelModal(true)

  // Confirmation effective après modale
  const confirmCancelTrial = async () => {
    setCancelLoading(true); setError(''); setShowCancelModal(false)
    try {
      await api.post('/subscription/cancel-subscription')
      setSuccess('Essai annulé. Aucun débit ne sera effectué.')
      await loadAll()
    } catch { setError("Erreur lors de l'annulation.") }
    finally { setCancelLoading(false) }
  }

  const handlePaymentSuccess = async () => {
    setSelectedPlan(null)
    setSuccess('Essai activé ! Bienvenue sur InsightBall.')
    await loadAll()
    if (refreshUser) refreshUser()
  }

  if (loading) return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', color: G.muted }}>
      Chargement...
    </div>
  )

  // Si formulaire CB ouvert
  if (selectedPlan) {
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <InlineCardForm
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setSelectedPlan(null)}
        />
      </>
    )
  }

  const isTrial   = trialData?.access === 'trial'
  const isExpired = trialData?.access === 'expired'
  const hasSub    = sub?.active
  const isTrialing = sub?.status === 'trialing'

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderLeft: `2px solid ${G.red}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={13} color={G.red} />
          <span style={{ fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.08)', borderLeft: `2px solid ${G.green}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={13} color={G.green} />
          <span style={{ fontFamily: G.mono, fontSize: 11, color: G.green }}>{success}</span>
        </div>
      )}

      {hasSub ? (
        /* ── ABONNEMENT ACTIF ou EN TRIAL ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>

          {/* Status */}
          <div style={{ background: G.bg2, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderLeft: `3px solid ${isTrialing ? G.gold : G.green}` }}>
            {isTrialing ? <Clock size={15} color={G.gold} /> : <CheckCircle size={15} color={G.green} />}
            <div>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: isTrialing ? G.gold : G.green, letterSpacing: '.06em' }}>
                {isTrialing ? `Essai en cours — ${trialData?.days_left ?? '?'} jour${(trialData?.days_left ?? 0) > 1 ? 's' : ''} restant${(trialData?.days_left ?? 0) > 1 ? 's' : ''}` : 'Abonnement actif'}
              </div>
              {sub.cancel_at_period_end && (
                <div style={{ fontFamily: G.mono, fontSize: 9, color: G.orange, marginTop: 2, letterSpacing: '.06em' }}>
                  {isTrialing ? 'Essai annulé — aucun débit ne sera effectué' : 'Annulation programmée en fin de période'}
                </div>
              )}
            </div>
          </div>

          {/* Plan + dates */}
          <div style={{ background: G.border, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ background: G.bg2, padding: '16px 20px' }}>
              <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 6 }}>Plan</div>
              <div style={{ fontFamily: G.display, fontSize: 28, color: G.gold }}>{user?.plan}</div>
            </div>
            {sub.current_period_end && (
              <div style={{ background: G.bg2, padding: '16px 20px' }}>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 6 }}>
                  {isTrialing ? 'Premier débit le' : sub.cancel_at_period_end ? 'Actif jusqu\'au' : 'Renouvellement'}
                </div>
                <div style={{ fontFamily: G.mono, fontSize: 13, color: G.text }}>
                  {new Date(sub.current_period_end * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ background: G.bg2, padding: '16px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!isTrialing && (
              <button onClick={handlePortal} disabled={portalLoading} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: G.gold, color: '#0f0f0d',
                fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
                border: 'none', cursor: portalLoading ? 'not-allowed' : 'pointer', opacity: portalLoading ? 0.6 : 1,
              }}>
                <ExternalLink size={12} />
                {portalLoading ? 'Redirection...' : 'Gérer l\'abonnement'}
              </button>
            )}

            {/* Bouton résilier — visible en trial ET en actif */}
            {!sub.cancel_at_period_end && (
              <button
                onClick={isTrialing ? handleCancelTrial : handleCancel}
                disabled={cancelLoading}
                style={{
                  padding: '10px 20px', background: 'transparent',
                  border: `1px solid rgba(239,68,68,0.25)`,
                  fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
                  color: 'rgba(239,68,68,0.60)', cursor: cancelLoading ? 'not-allowed' : 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = G.red; e.currentTarget.style.borderColor = G.red }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.60)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
              >
                {cancelLoading ? 'Annulation...' : isTrialing ? 'Annuler l\'essai' : 'Résilier'}
              </button>
            )}
          </div>

          {isTrialing && (
            <div style={{ background: G.bg2, padding: '10px 20px', borderTop: `1px solid ${G.border}` }}>
              <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.30)', margin: 0, lineHeight: 1.6 }}>
                Annulation en 1 clic · Aucune question posée · Aucun débit si annulé avant la fin du trial
              </p>
            </div>
          )}

          <div style={{ background: G.bg2, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6, borderTop: `1px solid ${G.border}` }}>
            <CreditCard size={11} color={G.muted} />
            <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>Paiements sécurisés par Stripe</span>
          </div>
        </div>

      {/* ── MODALE ANNULATION TRIAL ── */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: G.bg2, width: '100%', maxWidth: 460, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.orange}` }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: G.text }}>
                Annuler l'essai
              </span>
              <button onClick={() => setShowCancelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color={G.muted} />
              </button>
            </div>

            {/* Contenu — conditionnel selon match analysé ou non */}
            <div style={{ padding: '24px' }}>
              {!trialData?.match_used ? (
                /* Match pas encore analysé → avertissement */
                <div style={{ marginBottom: 24 }}>
                  <div style={{ padding: '16px', background: 'rgba(245,158,11,0.07)', border: `1px solid rgba(245,158,11,0.2)`, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <AlertCircle size={16} color={G.orange} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.75)', lineHeight: 1.7, margin: 0 }}>
                      Vous n'avez pas encore analysé votre match offert. Si vous annulez maintenant, vous perdez cet avantage définitivement.
                    </p>
                  </div>
                  <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, lineHeight: 1.7, margin: 0 }}>
                    Votre carte bancaire ne sera <strong style={{ color: G.text }}>pas débitée</strong> si vous annulez avant le {getDebitDate()}.
                  </p>
                </div>
              ) : (
                /* Match déjà analysé → message simple */
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, lineHeight: 1.7, margin: 0 }}>
                    Votre essai sera annulé. Vous conservez l'accès jusqu'à la fin des 7 jours.<br />
                    <strong style={{ color: G.text }}>Aucun débit ne sera effectué.</strong>
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1, padding: '11px', background: 'transparent',
                    border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9,
                    letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer',
                  }}
                >
                  {!trialData?.match_used ? 'Analyser mon match' : 'Retour'}
                </button>
                <button
                  onClick={confirmCancelTrial}
                  disabled={cancelLoading}
                  style={{
                    flex: 1, padding: '11px',
                    background: 'transparent',
                    border: `1px solid rgba(239,68,68,0.35)`,
                    fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
                    color: 'rgba(239,68,68,0.70)', cursor: cancelLoading ? 'not-allowed' : 'pointer',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = G.red; e.currentTarget.style.borderColor = G.red }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.70)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)' }}
                >
                  {cancelLoading ? 'Annulation...' : 'Confirmer l'annulation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      ) : (
        /* ── PAS D'ABONNEMENT — choisir un plan ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em', marginBottom: 4 }}>
            {isExpired ? 'Votre essai est terminé. Choisissez un plan pour continuer.' : 'Choisissez le plan adapté à votre structure'}
          </div>

          {/* Cards plans */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border }}>
            {PLANS.map(plan => {
              const Icon = plan.icon
              const isCurrent = user?.plan === plan.id
              return (
                <div key={plan.id} style={{
                  background: G.bg2, padding: '24px 20px',
                  borderTop: `2px solid ${isCurrent ? plan.color : G.border}`,
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={15} color={plan.color} />
                      <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: plan.color }}>{plan.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: G.display, fontSize: 28, color: G.text, lineHeight: 1 }}>
                        0<span style={{ fontFamily: G.mono, fontSize: 11, color: G.muted }}>€</span>
                      </div>
                      <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted }}>7 jours · puis {plan.price}€</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 4, height: 4, background: plan.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.06em', color: G.muted }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bouton → ouvre le formulaire inline */}
                  <button onClick={() => setSelectedPlan(plan)} style={{
                    padding: '11px',
                    background: plan.color === G.gold ? G.gold : 'rgba(59,130,246,0.15)',
                    border: plan.color !== G.gold ? `1px solid rgba(59,130,246,0.40)` : 'none',
                    color: plan.color === G.gold ? '#0f0f0d' : '#3b82f6',
                    fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
                    cursor: 'pointer', marginTop: 'auto', transition: 'opacity .15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <CreditCard size={11} /> Démarrer l'essai →
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={11} color={G.muted} />
            <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>
              Paiement sécurisé Stripe · 7 jours gratuits · Aucun débit aujourd'hui
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
