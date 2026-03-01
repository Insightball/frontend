import { useState, useEffect, useRef } from 'react'
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Zap, Users, Lock, X, Clock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { T } from '../theme'

// Les modales restent dark (overlays plein écran) → on garde bg2/border/text/muted dark intentionnellement
const G = {
  gold:    T.gold,    goldD:  T.goldD,
  goldBg:  T.goldBg2, goldBdr: T.goldBdr,
  mono:    T.mono,    display: T.display,
  border:  'rgba(255,255,255,0.07)',  // dark — intentionnel pour modales
  muted:   'rgba(245,242,235,0.60)', // dark — intentionnel pour modales
  text:    '#f5f2eb',                 // dark — intentionnel pour modales
  bg2:     T.dark,
  green:   T.green, red: T.red, orange: T.orange,
}

const PLANS = [
  {
    id: 'COACH', name: 'Coach', price: 39, icon: Zap, color: G.gold,
    features: ['4 matchs / mois', 'Rapports PDF', 'Statistiques joueurs', 'Support email'],
  },
  {
    id: 'CLUB', name: 'Club', price: 99, icon: Users, color: '#3b82f6',
    features: ['10 matchs / mois', 'Multi-équipes', 'Dashboard directeur sportif', 'Support prioritaire'],
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

function getDebitDate() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

function Spinner() {
  return <span style={{ width: 12, height: 12, border: '2px solid #0f0f0d', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
}

// ── Modale de confirmation générique ─────────────────────────
function ConfirmModal({ title, body, confirmLabel, confirmColor = G.red, onConfirm, onCancel, loading }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.80)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: G.bg2, width: '100%', maxWidth: 440, border: `1px solid ${G.border}`, borderTop: `2px solid ${confirmColor}` }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: G.text }}>{title}</span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} color={G.muted} />
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          {body}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={onCancel} style={{
              flex: 1, padding: '11px', background: 'transparent',
              border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9,
              letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer',
            }}>
              Annuler
            </button>
            <button onClick={onConfirm} disabled={loading} style={{
              flex: 1, padding: '11px', background: confirmColor === G.gold ? G.gold : 'transparent',
              border: confirmColor !== G.gold ? `1px solid ${confirmColor}` : 'none',
              fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
              color: confirmColor === G.gold ? '#0f0f0d' : confirmColor,
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700,
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'En cours...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modale confirmation Coach — 2 étapes anti-erreur ─────────
// Étape 1 : résumé de ce qui va se passer
// Étape 2 : "Tapez CONFIRMER pour valider" → évite tout clic accidentel
function ConfirmCoachModal({ isTrialing, onConfirm, onCancel, loading }) {
  const [step, setStep] = useState(1) // 1 = résumé, 2 = saisie confirmation
  const [input, setInput] = useState('')
  const isValid = input.trim().toUpperCase() === 'CONFIRMER'

  const amount = isTrialing ? 'prélevé immédiatement' : 'prélevé au prochain cycle'
  const label  = isTrialing
    ? 'Fin du trial · Prélèvement 39€ immédiat'
    : 'Activation plan Coach · 39€/mois'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: G.bg2, width: '100%', maxWidth: 440, border: `1px solid ${G.goldBdr}`, borderTop: `2px solid ${G.gold}` }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 4 }}>
              {step === 1 ? 'Confirmation requise' : 'Étape 2 / 2'}
            </div>
            <span style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: G.text }}>
              {step === 1 ? 'Activer plan Coach' : 'Validation finale'}
            </span>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} color={G.muted} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {step === 1 ? (
            <>
              {/* Résumé clair de ce qui va se passer */}
              <div style={{ padding: '16px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, marginBottom: 16 }}>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, marginBottom: 10 }}>
                  Ce qui va se passer
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    isTrialing ? '⚡ Votre trial se termine maintenant' : '✅ Plan Coach activé immédiatement',
                    `💳 39€ ${amount}`,
                    '📊 4 matchs/mois débloqués',
                    '🔁 Renouvellement mensuel automatique',
                    '❌ Résiliable à tout moment depuis ce menu',
                  ].map(item => (
                    <div key={item} style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, lineHeight: 1.5 }}>{item}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onCancel} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9,
                  letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer',
                }}>
                  Annuler
                </button>
                <button onClick={() => setStep(2)} style={{
                  flex: 1, padding: '11px', background: G.gold,
                  border: 'none', fontFamily: G.mono, fontSize: 9,
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  color: '#0f0f0d', cursor: 'pointer', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  Je comprends <ArrowRight size={11} />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Étape 2 — saisie manuelle pour éviter tout clic accidentel */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, lineHeight: 1.7, marginBottom: 16 }}>
                  Pour confirmer le prélèvement de <strong style={{ color: G.text }}>39€</strong>, tapez <strong style={{ color: G.gold, letterSpacing: '.08em' }}>CONFIRMER</strong> ci-dessous :
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="CONFIRMER"
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isValid ? G.gold : G.border}`,
                    color: G.text, fontFamily: G.mono, fontSize: 13,
                    letterSpacing: '.1em', outline: 'none',
                    transition: 'border-color .15s', boxSizing: 'border-box',
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && isValid && !loading) onConfirm() }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setStep(1); setInput('') }} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9,
                  letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer',
                }}>
                  Retour
                </button>
                <button
                  onClick={onConfirm}
                  disabled={!isValid || loading}
                  style={{
                    flex: 1, padding: '11px',
                    background: isValid && !loading ? G.gold : 'rgba(201,162,39,0.25)',
                    border: 'none', fontFamily: G.mono, fontSize: 9,
                    letterSpacing: '.1em', textTransform: 'uppercase',
                    color: isValid && !loading ? '#0f0f0d' : 'rgba(201,162,39,0.4)',
                    cursor: !isValid || loading ? 'not-allowed' : 'pointer',
                    fontWeight: 700, transition: 'all .15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {loading ? <><Spinner /> Activation...</> : '💳 Payer 39€'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Composant formulaire CB intégré ──────────────────────────
function InlineCardForm({ plan, onSuccess, onCancel, alreadyTrialed }) {
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
      const { data } = await api.post('/subscription/create-setup-intent')
      const { setupIntent, error } = await stripeRef.current.confirmCardSetup(
        data.client_secret,
        { payment_method: { card: cardElementRef.current } }
      )
      if (error) { setCardError(error.message); setPaying(false); return }
      await api.post('/subscription/confirm-plan', {
        plan: plan.id,
        payment_method_id: setupIntent.payment_method,
      })
      onSuccess()
    } catch (e) {
      const detail = e?.response?.data?.detail
      setCardError(typeof detail === 'string' ? detail : 'Erreur lors du paiement')
      setPaying(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: G.border }}>
      <div style={{ background: G.bg2, padding: '16px 20px', borderTop: `2px solid ${plan.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: plan.color, marginBottom: 4 }}>Plan sélectionné</div>
          <div style={{ fontFamily: G.display, fontSize: 20, color: G.text, textTransform: 'uppercase' }}>
            {plan.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontFamily: G.display, fontSize: 26, color: G.gold, lineHeight: 1 }}>{alreadyTrialed ? `${plan.price}€` : '0€'}</span>
            <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>{alreadyTrialed ? '/mois' : "aujourd'hui"}</span>
            {!alreadyTrialed && <>
              <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.25)' }}>·</span>
              <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>puis {plan.price}€/mois après 7 jours</span>
            </>}
          </div>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={14} color={G.muted} />
        </button>
      </div>

      {!alreadyTrialed && (
        <div style={{ background: G.bg2, padding: '12px 20px', borderTop: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={12} color={G.gold} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.55)', lineHeight: 1.6 }}>
            Essai gratuit 7 jours · Aucun débit aujourd'hui · Rappel email J-3 · Résiliable en 1 clic
          </span>
        </div>
      )}

      <div style={{ background: G.bg2, padding: '20px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: G.muted, marginBottom: 10 }}>Carte bancaire</div>
        <div ref={cardRef} style={{
          padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${cardError ? G.red : G.border}`, minHeight: 44, transition: 'border-color .15s',
        }} />
        {cardError && (
          <div style={{ fontFamily: G.mono, fontSize: 9, color: G.red, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={10} /> {cardError}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <Lock size={10} color={G.muted} />
          <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.35)', letterSpacing: '.06em' }}>Sécurisé par Stripe · Données chiffrées</span>
        </div>
      </div>

      <div style={{ background: G.bg2, padding: '16px 20px', borderTop: `1px solid ${G.border}` }}>
        <button onClick={handlePay} disabled={paying || !ready} style={{
          width: '100%', padding: '13px',
          background: paying || !ready ? 'rgba(201,162,39,0.4)' : G.gold,
          border: 'none', color: '#0f0f0d',
          fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em',
          textTransform: 'uppercase', fontWeight: 700,
          cursor: paying || !ready ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {paying ? <><Spinner /> Activation en cours...</> : !ready ? 'Chargement...' : alreadyTrialed ? <><CreditCard size={13} /> S'abonner — {plan.price}€/mois</> : <><CreditCard size={13} /> Démarrer l'essai gratuit</>}
        </button>
        <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.25)', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
          {alreadyTrialed ? `Débit immédiat de ${plan.price}€ · Résiliable à tout moment` : `Premier débit le ${getDebitDate()} · Annulable avant depuis ce menu`}
        </p>
      </div>
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────
export default function SubscriptionManagement({ onTrialStatusChange }) {
  const { user, refreshUser } = useAuth()
  const [sub, setSub]                   = useState(null)
  const [trialData, setTrialData]       = useState(null)
  const [loading, setLoading]           = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [success, setSuccess]           = useState('')
  const [error, setError]               = useState('')

  // Modales — plus de window.confirm()
  const [showCancelModal, setShowCancelModal]       = useState(false)
  const [showCoachModal, setShowCoachModal]         = useState(false)
  const [showCancelSubModal, setShowCancelSubModal] = useState(false)
  const [copied, setCopied]                         = useState(false)
  const [isMobile, setIsMobile]                     = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [subRes, trialRes] = await Promise.all([
        api.get('/subscription/subscription-status'),
        api.get('/subscription/trial-status'),
      ])
      // Sécurité : ne jamais stocker un objet erreur Pydantic comme donnée
      if (subRes.data && typeof subRes.data === 'object' && !subRes.data.type) {
        setSub(subRes.data)
      }
      if (trialRes.data && typeof trialRes.data === 'object' && !trialRes.data.type) {
        setTrialData(trialRes.data)
      }
      // Notifier CoachSettings du statut réel pour le libellé du plan
      if (onTrialStatusChange) {
        onTrialStatusChange(trialRes.data?.trial_active === true)
      }
    } catch (e) {
      console.error('loadAll error:', e)
      const detail = e?.response?.data?.detail
      if (detail) {
        setError(typeof detail === 'string' ? detail : 'Erreur de chargement de l\'abonnement')
      }
    }
    finally { setLoading(false) }
  }

  const handlePortal = async () => {
    setPortalLoading(true); setError('')
    try {
      const r = await api.post('/subscription/create-portal-session', { return_url: window.location.href })
      window.location.href = r.data.url
    } catch { setError('Erreur portail de gestion.'); setPortalLoading(false) }
  }

  // Résiliation abonnement actif — via modale
  const confirmCancelSub = async () => {
    setCancelLoading(true); setError(''); setShowCancelSubModal(false)
    try {
      await api.post('/subscription/cancel-subscription')
      setSuccess("Abonnement résilié. Actif jusqu'à la fin de la période.")
      await loadAll()
    } catch { setError('Erreur lors de la résiliation.') }
    finally { setCancelLoading(false) }
  }

  // Résiliation trial — via modale existante
  const confirmCancelTrial = async () => {
    setCancelLoading(true); setError(''); setShowCancelModal(false)
    try {
      await api.post('/subscription/cancel-subscription')
      setSuccess('Essai annulé. Aucun débit ne sera effectué.')
      await loadAll()
    } catch { setError("Erreur lors de l'annulation.") }
    finally { setCancelLoading(false) }
  }

  // Activation Coach (fin trial + prélèvement immédiat) — via modale 2 étapes
  const confirmCoach = async () => {
    setUpgradeLoading(true); setError('')
    try {
      await api.post('/subscription/end-trial')
      setShowCoachModal(false)
      setSuccess('Plan Coach activé ! 4 matchs/mois débloqués.')
      await loadAll()
      if (refreshUser) refreshUser()
    } catch (e) {
      const detail = e?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : "Erreur lors de l'activation")
      setShowCoachModal(false)
    } finally {
      setUpgradeLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    setSelectedPlan(null)
    setSuccess('Essai activé ! Bienvenue sur Insightball.')
    await loadAll()
    if (refreshUser) refreshUser()
    window.location.reload()
  }

  if (loading) return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', color: G.muted }}>
      Chargement...
    </div>
  )

  const isExpired  = trialData?.access === 'expired'
  const hasSub     = sub?.active
  const isTrialing = sub?.status === 'trialing'
  const alreadyTrialed = user?.trial_ends_at != null || trialData?.match_used === true || isExpired

  if (selectedPlan) {
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <InlineCardForm plan={selectedPlan} onSuccess={handlePaymentSuccess} onCancel={() => setSelectedPlan(null)} alreadyTrialed={alreadyTrialed} />
      </>
    )
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderLeft: `2px solid ${G.red}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={13} color={G.red} />
          <span style={{ fontFamily: G.mono, fontSize: 11, color: G.red }}>{typeof error === 'string' ? error : 'Une erreur est survenue'}</span>
        </div>
      )}

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.08)', borderLeft: `2px solid ${G.green}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={13} color={G.green} />
          <span style={{ fontFamily: G.mono, fontSize: 11, color: G.green }}>{typeof success === 'string' ? success : ''}</span>
        </div>
      )}

      {hasSub ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>

          {/* Status */}
          <div style={{ background: G.bg2, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderLeft: `3px solid ${isTrialing ? G.gold : G.green}` }}>
            {isTrialing ? <Clock size={15} color={G.gold} /> : <CheckCircle size={15} color={G.green} />}
            <div>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: isTrialing ? G.gold : G.green, letterSpacing: '.06em' }}>
                {isTrialing ? `Essai en cours — ${trialData?.days_left ?? '?'} jour${(trialData?.days_left ?? 0) > 1 ? 's' : ''} restant${(trialData?.days_left ?? 0) > 1 ? 's' : ''}` : 'Abonnement actif'}
              </div>
              {sub?.cancel_at_period_end && (
                <div style={{ fontFamily: G.mono, fontSize: 9, color: G.orange, marginTop: 2, letterSpacing: '.06em' }}>
                  {isTrialing ? 'Essai annulé — aucun débit ne sera effectué' : 'Annulation programmée en fin de période'}
                </div>
              )}
            </div>
          </div>

          {/* Plan + dates */}
          <div style={{ background: G.border, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <div style={{ background: G.bg2, padding: '16px 20px' }}>
              <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 6 }}>Plan</div>
              <div style={{ fontFamily: G.display, fontSize: 28, color: G.gold }}>{user?.plan}</div>
            </div>
            {sub.current_period_end && (
              <div style={{ background: G.bg2, padding: '16px 20px' }}>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 6 }}>
                  {isTrialing && !sub?.cancel_at_period_end ? 'Premier débit le' : sub?.cancel_at_period_end ? "Accès jusqu'au" : 'Renouvellement'}
                </div>
                <div style={{ fontFamily: G.mono, fontSize: 13, color: G.text }}>
                  {new Date(sub.current_period_end * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ background: G.bg2, padding: '16px 20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10, flexWrap: 'wrap' }}>
            {!isTrialing && (
              <button onClick={handlePortal} disabled={portalLoading} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: G.gold, color: '#0f0f0d',
                fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
                border: 'none', cursor: portalLoading ? 'not-allowed' : 'pointer', opacity: portalLoading ? 0.6 : 1,
              }}>
                <ExternalLink size={12} />
                {portalLoading ? 'Redirection...' : "Gérer l'abonnement"}
              </button>
            )}

            {/* Confirmer plan Coach pendant trial → modale 2 étapes */}
            {isTrialing && user?.plan === 'COACH' && !sub?.cancel_at_period_end && (
              <button onClick={() => setShowCoachModal(true)} disabled={upgradeLoading} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: G.gold, color: '#0f0f0d',
                fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
                border: 'none', cursor: upgradeLoading ? 'not-allowed' : 'pointer', opacity: upgradeLoading ? 0.6 : 1,
              }}>
                <Zap size={12} />
                {upgradeLoading ? 'Activation...' : 'Confirmer plan Coach — 39€/mois'}
              </button>
            )}

            {/* Upgrade COACH → CLUB : contact direct */}
            {user?.plan === 'COACH' && !sub?.cancel_at_period_end && (
              <div style={{
                padding: '14px 20px', background: G.goldBg,
                border: `1px solid ${G.goldBdr}`,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={12} color={G.gold} />
                  <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.gold, fontWeight: 700 }}>
                    Passer au plan Club
                  </span>
                </div>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, lineHeight: 1.6, margin: 0 }}>
                  Offre sur mesure pour votre club. Contactez-nous :
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: G.mono, fontSize: 13, color: G.text, fontWeight: 700, letterSpacing: '.04em' }}>
                    contact@insightball.com
                  </span>
                  <button onClick={() => { navigator.clipboard.writeText('contact@insightball.com'); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{
                    padding: '4px 10px', background: 'transparent', border: `1px solid ${G.border}`,
                    fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
                    color: copied ? G.green : G.muted, cursor: 'pointer', transition: 'color .15s',
                  }}>
                    {copied ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
              </div>
            )}

            {/* Réactivation — annulation en cours mais user change d'avis */}
            {sub?.cancel_at_period_end && (
              <button onClick={handlePortal} disabled={portalLoading} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: G.goldBg, color: G.gold,
                border: `1px solid ${G.goldBdr}`,
                fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
                cursor: portalLoading ? 'not-allowed' : 'pointer', opacity: portalLoading ? 0.6 : 1,
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.80'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ArrowRight size={12} />
                {portalLoading ? 'Redirection...' : 'Réactiver mon abonnement'}
              </button>
            )}

            {/* Résilier — modale selon contexte */}
            {!sub?.cancel_at_period_end && (
              <button
                onClick={() => isTrialing ? setShowCancelModal(true) : setShowCancelSubModal(true)}
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
                {cancelLoading ? 'Annulation...' : isTrialing ? "Annuler l'essai" : 'Résilier'}
              </button>
            )}

          </div>

          {isTrialing && (
            <div style={{ background: G.bg2, padding: '10px 20px', borderTop: `1px solid ${G.border}` }}>
              <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.30)', margin: 0, lineHeight: 1.6 }}>
                Annulation en 1 clic · Aucun débit si annulé avant la fin du trial
              </p>
            </div>
          )}

          <div style={{ background: G.bg2, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6, borderTop: `1px solid ${G.border}` }}>
            <CreditCard size={11} color={G.muted} />
            <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>Paiements sécurisés par Stripe</span>
          </div>
        </div>

      ) : (
        /* ── PAS D'ABONNEMENT — choisir un plan ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em', marginBottom: 4 }}>
            {isExpired ? 'Votre essai est terminé. Choisissez un plan pour continuer.' : 'Choisissez le plan adapté à votre structure'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 1, background: G.border }}>
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
                      {plan.id === 'CLUB' ? (
                        <>
                          <div style={{ fontFamily: G.display, fontSize: 20, color: G.text, lineHeight: 1.1 }}>Sur devis</div>
                          <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted }}>à partir de 99€/mois</div>
                        </>
                      ) : alreadyTrialed ? (
                        <>
                          <div style={{ fontFamily: G.display, fontSize: 28, color: G.text, lineHeight: 1 }}>
                            {plan.price}<span style={{ fontFamily: G.mono, fontSize: 11, color: G.muted }}>€</span>
                          </div>
                          <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted }}>/mois · {plan.features[0]}</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontFamily: G.display, fontSize: 28, color: G.text, lineHeight: 1 }}>
                            0<span style={{ fontFamily: G.mono, fontSize: 11, color: G.muted }}>€</span>
                          </div>
                          <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted }}>7 jours · puis {plan.price}€</div>
                        </>
                      )}
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

                  {plan.id === 'CLUB' ? (
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <p style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, margin: 0 }}>Contactez-nous :</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: G.mono, fontSize: 11, color: G.text, fontWeight: 700 }}>contact@insightball.com</span>
                        <button onClick={() => { navigator.clipboard.writeText('contact@insightball.com'); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{
                          padding: '3px 8px', background: 'transparent', border: `1px solid ${G.border}`,
                          fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase',
                          color: copied ? G.green : G.muted, cursor: 'pointer',
                        }}>
                          {copied ? '✓' : 'Copier'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setSelectedPlan(plan)} style={{
                      padding: '11px', background: G.gold, border: 'none',
                      color: '#0f0f0d', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em',
                      textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', marginTop: 'auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <CreditCard size={11} /> {alreadyTrialed ? "S'abonner — 39€/mois →" : 'Démarrer l\'essai →'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={11} color={G.muted} />
            <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>
              {alreadyTrialed ? 'Paiement sécurisé Stripe · Résiliable à tout moment' : 'Paiement sécurisé Stripe · 7 jours gratuits · Aucun débit aujourd\'hui'}
            </span>
          </div>
        </div>
      )}

      {/* ── MODALE ANNULATION TRIAL ── */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: G.bg2, width: '100%', maxWidth: 460, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.orange}` }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: G.text }}>Annuler l'essai</span>
              <button onClick={() => setShowCancelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color={G.muted} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              {!trialData?.match_used ? (
                // Match offert pas encore uploadé
                <div style={{ marginBottom: 24 }}>
                  <div style={{ padding: '16px', background: 'rgba(245,158,11,0.07)', border: `1px solid rgba(245,158,11,0.2)`, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <AlertCircle size={16} color={G.orange} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.75)', lineHeight: 1.7, margin: 0 }}>
                      Vous n'avez pas encore uploadé votre match offert. Si vous annulez maintenant, vous perdez cet avantage définitivement.
                    </p>
                  </div>
                  <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, lineHeight: 1.7, margin: 0 }}>
                    Votre carte bancaire ne sera <strong style={{ color: G.text }}>pas débitée</strong> si vous annulez avant le {getDebitDate()}.
                  </p>
                </div>
              ) : (
                // Match uploadé — analyse en cours ou terminée
                <div style={{ marginBottom: 24 }}>
                  <div style={{ padding: '16px', background: 'rgba(245,158,11,0.07)', border: `1px solid rgba(245,158,11,0.2)`, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <AlertCircle size={16} color={G.orange} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.75)', lineHeight: 1.7, margin: 0 }}>
                      Votre match est en cours d'analyse. Si vous annulez, vous conservez l'accès au rapport jusqu'à la fin des 7 jours.
                    </p>
                  </div>
                  <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, lineHeight: 1.7, margin: 0 }}>
                    Votre carte bancaire ne sera <strong style={{ color: G.text }}>pas débitée</strong> si vous annulez avant le {getDebitDate()}.
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCancelModal(false)} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9,
                  letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer',
                }}>
                  {!trialData?.match_used ? 'Uploader mon match' : 'Retour'}
                </button>
                <button onClick={confirmCancelTrial} disabled={cancelLoading} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: `1px solid rgba(239,68,68,0.35)`,
                  fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
                  color: 'rgba(239,68,68,0.70)', cursor: cancelLoading ? 'not-allowed' : 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = G.red; e.currentTarget.style.borderColor = G.red }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.70)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)' }}
                >
                  {cancelLoading ? 'Annulation...' : "Confirmer l'annulation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE RÉSILIATION ABONNEMENT ACTIF ── */}
      {showCancelSubModal && (
        <ConfirmModal
          title="Résilier l'abonnement"
          body={
            <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, lineHeight: 1.7, margin: 0 }}>
              Votre abonnement sera résilié à la fin de la période en cours.<br />
              <strong style={{ color: G.text }}>Vous conservez l'accès jusqu'à cette date.</strong>
            </p>
          }
          confirmLabel="Confirmer la résiliation"
          confirmColor={G.red}
          onConfirm={confirmCancelSub}
          onCancel={() => setShowCancelSubModal(false)}
          loading={cancelLoading}
        />
      )}

      {/* ── MODALE COACH — 2 étapes anti-erreur ── */}
      {showCoachModal && (
        <ConfirmCoachModal
          isTrialing={isTrialing}
          onConfirm={confirmCoach}
          onCancel={() => setShowCoachModal(false)}
          loading={upgradeLoading}
        />
      )}

      {/* Modale devis CLUB supprimée — remplacé par mailto direct */}
    </div>
  )
}
