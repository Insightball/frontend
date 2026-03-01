import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, AlertTriangle, ArrowRight, Shield, Users, BarChart2 } from 'lucide-react'
import { T } from '../theme'

const API = import.meta.env.VITE_API_URL || 'https://backend-pued.onrender.com'

const G = {
  bg:     T.bg,
  dark:   T.dark,
  ink:    T.ink,
  muted:  T.muted,
  gold:   T.gold,
  mono:   T.mono,
  display: T.display,
  border: T.rule,
  borderDark: T.ruleDark,
}

const inputStyle = (focused) => ({
  width: '100%',
  background: T.surface,
  border: `1px solid ${focused ? T.gold : T.rule}`,
  padding: '13px 16px',
  color: T.ink,
  fontFamily: T.mono,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .15s',
})

// Avantages affichés selon le plan
const PLAN_FEATURES = [
  { icon: BarChart2, label: 'Rapports tactiques automatiques' },
  { icon: Users,     label: 'Gestion multi-équipes' },
  { icon: Shield,    label: 'Heatmaps & stats joueurs' },
  { icon: CheckCircle, label: 'Export PDF illimité' },
]

export default function ClubInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const cancelled = searchParams.get('cancelled') === 'true'

  const [invite, setInvite]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isMobile, setIsMobile]   = useState(false)

  // Form — seulement pour nouveau user
  const [name, setName]         = useState('')
  const [password, setPassword] = useState('')
  const [focusName, setFocusName]     = useState(false)
  const [focusPass, setFocusPass]     = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetchInvite()
  }, [token])

  const fetchInvite = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/api/subscription/club-invite/${token}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data.detail === 'string' ? data.detail : 'Invitation introuvable ou expirée')
        return
      }
      const data = await res.json()
      setInvite(data)
    } catch {
      setError('Impossible de charger l\'invitation. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!invite) return

    // Nouveau user : nom + password requis
    if (!invite.has_existing_account) {
      if (!name.trim()) { setSubmitError('Entrez votre nom complet'); return }
      if (password.length < 8) { setSubmitError('Le mot de passe doit contenir au moins 8 caractères'); return }
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const body = invite.has_existing_account
        ? {}
        : { name: name.trim(), password }

      const res = await fetch(`${API}/api/subscription/club-invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(typeof data.detail === 'string' ? data.detail : 'Une erreur est survenue')
        return
      }

      // Redirect vers Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch {
      setSubmitError('Erreur réseau. Réessayez dans quelques secondes.')
    } finally {
      setSubmitting(false)
    }
  }

  const planLabel = invite?.plan_tier === 'CLUB_PRO' ? 'Club Pro' : 'Club'
  const planColor = invite?.plan_tier === 'CLUB_PRO' ? '#c9a227' : T.gold

  // ── États de chargement / erreur ──────────────────────────────────

  if (loading) return (
    <div style={{ minHeight: '100vh', background: G.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.5)' }}>
        Chargement...
      </span>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: G.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderTop: '2px solid #ef4444', padding: '32px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={18} color="#ef4444" />
          <span style={{ fontFamily: G.display, fontSize: 20, textTransform: 'uppercase', color: '#f5f2eb' }}>Invitation invalide</span>
        </div>
        <p style={{ fontFamily: G.mono, fontSize: 12, color: 'rgba(245,242,235,0.6)', lineHeight: 1.7, margin: '0 0 24px' }}>{error}</p>
        <button onClick={() => navigate('/')} style={{
          fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase',
          color: G.gold, background: 'none', border: `1px solid rgba(201,162,39,0.3)`,
          padding: '10px 20px', cursor: 'pointer',
        }}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  )

  // ── Page principale ───────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: G.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '24px 16px' : '48px 24px' }}>

      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: G.display, fontSize: isMobile ? 22 : 26, textTransform: 'uppercase', letterSpacing: '.04em', color: '#f5f2eb' }}>
          Insight<span style={{ color: G.gold }}>ball</span>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Bandeau annulation */}
        {cancelled && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(239,68,68,0.8)' }}>
              Paiement annulé. Vous pouvez réessayer ci-dessous.
            </span>
          </div>
        )}

        {/* Card principale */}
        <div style={{ background: '#0f0f0d', border: '1px solid rgba(255,255,255,0.07)', borderTop: `2px solid ${planColor}` }}>

          {/* Header offre */}
          <div style={{ padding: isMobile ? '24px 20px' : '32px 32px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 1, background: G.gold, display: 'inline-block' }} />
              Invitation personnelle
            </div>
            <h1 style={{ fontFamily: G.display, fontSize: isMobile ? 28 : 36, textTransform: 'uppercase', lineHeight: .9, letterSpacing: '.01em', color: '#f5f2eb', margin: '0 0 16px' }}>
              {invite.club_name || 'Votre club'}<br />
              <span style={{ color: G.gold }}>rejoint Insightball.</span>
            </h1>
            {invite.city && (
              <div style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.4)', letterSpacing: '.08em' }}>
                {invite.city}
              </div>
            )}
          </div>

          {/* Récap offre */}
          <div style={{ padding: isMobile ? '20px' : '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.35)', marginBottom: 6 }}>
                Plan sélectionné
              </div>
              <div style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: '#f5f2eb' }}>
                Insightball <span style={{ color: G.gold }}>{planLabel}</span>
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.45)', marginTop: 4 }}>
                {invite.quota_matches} matchs analysés par mois
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: G.display, fontSize: 32, color: G.gold, lineHeight: 1 }}>
                {invite.plan_price}€
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.35)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                par mois
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: isMobile ? '20px' : '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {PLAN_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={13} color={G.gold} />
                <span style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.6)', letterSpacing: '.04em' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Formulaire */}
          <div style={{ padding: isMobile ? '20px' : '24px 32px' }}>

            {invite.has_existing_account ? (
              /* User existant — pas de formulaire */
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)' }}>
                <div style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.55)', lineHeight: 1.6 }}>
                  Compte existant détecté pour <strong style={{ color: '#f5f2eb' }}>{invite.email}</strong>
                  {invite.existing_user_name && (
                    <span style={{ color: 'rgba(245,242,235,0.4)' }}> · {invite.existing_user_name}</span>
                  )}
                  <br />Votre abonnement Coach sera remplacé par le plan Club.
                </div>
              </div>
            ) : (
              /* Nouveau user — formulaire */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.35)', marginBottom: 8 }}>
                    Votre nom complet
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocusName(true)}
                    onBlur={() => setFocusName(false)}
                    placeholder="Jean Dupont"
                    style={{ ...inputStyle(focusName), background: 'rgba(255,255,255,0.04)', color: '#f5f2eb', border: `1px solid ${focusName ? G.gold : 'rgba(255,255,255,0.1)'}` }}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.35)', marginBottom: 8 }}>
                    Mot de passe
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusPass(true)}
                    onBlur={() => setFocusPass(false)}
                    placeholder="8 caractères minimum"
                    style={{ ...inputStyle(focusPass), background: 'rgba(255,255,255,0.04)', color: '#f5f2eb', border: `1px solid ${focusPass ? G.gold : 'rgba(255,255,255,0.1)'}` }}
                    autoComplete="new-password"
                    onKeyDown={e => { if (e.key === 'Enter') handleAccept() }}
                  />
                </div>
                <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.3)', lineHeight: 1.6 }}>
                  Compte créé pour <strong style={{ color: 'rgba(245,242,235,0.6)' }}>{invite.email}</strong>
                </div>
              </div>
            )}

            {/* Erreur submit */}
            {submitError && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={13} color="#ef4444" />
                <span style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(239,68,68,0.85)' }}>{submitError}</span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAccept}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '15px 24px',
                background: submitting ? 'rgba(201,162,39,0.4)' : G.gold,
                color: '#0f0f0d',
                fontFamily: G.mono,
                fontSize: 11,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = T.goldD || '#b8911f' }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = G.gold }}
            >
              {submitting
                ? 'Redirection vers le paiement...'
                : <>{invite.has_existing_account ? 'Mettre à niveau mon compte' : 'Créer mon compte et payer'} <ArrowRight size={14} /></>
              }
            </button>

            {/* Réassurance */}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Shield size={11} color="rgba(245,242,235,0.25)" />
              <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.25)', letterSpacing: '.06em' }}>
                Paiement sécurisé via Stripe · CB ou SEPA
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.2)', letterSpacing: '.08em' }}>
            Une question ? <a href="mailto:contact@insightball.com" style={{ color: 'rgba(201,162,39,0.5)', textDecoration: 'none' }}>contact@insightball.com</a>
          </span>
        </div>

      </div>
    </div>
  )
}
