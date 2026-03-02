import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL
const SUB_API = `${API}/api/subscription`

// ─── Design tokens (from theme.js) ─────────────────────────
const T = {
  bg:      '#f5f2eb',
  surface: '#ffffff',
  dark:    '#0a0908',
  ink:     '#1a1916',
  muted:   'rgba(26,25,22,0.45)',
  rule:    'rgba(26,25,22,0.09)',
  gold:    '#c9a227',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.22)',
  red:     '#dc2626',
  font:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

const PLAN_LABELS = {
  CLUB: 'Club',
  CLUB_PRO: 'Club Pro',
}


export default function ClubInvite() {
  const { token } = useParams()
  const [searchParams] = useSearchParams()

  // ── State ──
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Formulaire nouveau compte
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')

  const cancelled = searchParams.get('cancelled') === 'true'

  // ── Fetch invite au chargement ──
  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${SUB_API}/club-invite/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.detail || 'Invitation introuvable')
        }
        return res.json()
      })
      .then((data) => {
        setInvite(data)
        if (data.first_name && data.last_name) {
          setName(`${data.first_name} ${data.last_name}`)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  // ── Validation + submit ──
  const handleAccept = async () => {
    setFormError('')

    if (!invite.has_existing_account) {
      if (!name.trim()) {
        setFormError('Le nom est requis')
        return
      }
      if (!password) {
        setFormError('Le mot de passe est requis')
        return
      }
      if (password.length < 8) {
        setFormError('Le mot de passe doit contenir au moins 8 caractères')
        return
      }
      if (password !== confirmPassword) {
        setFormError('Les mots de passe ne correspondent pas')
        return
      }
    }

    setSubmitting(true)
    try {
      const body = invite.has_existing_account
        ? {}
        : { name: name.trim(), password }

      const res = await fetch(`${SUB_API}/club-invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Une erreur est survenue')
      }

      const { checkout_url } = await res.json()
      if (checkout_url) {
        window.location.href = checkout_url
      } else {
        setFormError('Erreur lors de la création de la session de paiement')
      }
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render helpers ──
  const planLabel = invite ? (PLAN_LABELS[invite.plan_tier] || invite.plan_tier) : ''
  const priceDisplay = invite ? `${invite.plan_price}€/mois` : ''

  // ── Loading ──
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.loadingPulse}>Chargement de l'invitation...</div>
        </div>
      </div>
    )
  }

  // ── Error (invitation introuvable, expirée, déjà utilisée) ──
  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>
            INSIGHT<span style={{ color: T.gold }}>BALL</span>
          </div>
          <div style={styles.errorIcon}>✕</div>
          <h1 style={styles.errorTitle}>Invitation non disponible</h1>
          <p style={styles.errorText}>{error}</p>
          <p style={{ ...styles.errorText, marginTop: 24 }}>
            Contactez{' '}
            <a href="mailto:contact@insightball.com" style={styles.link}>
              contact@insightball.com
            </a>{' '}
            pour obtenir une nouvelle invitation.
          </p>
        </div>
      </div>
    )
  }

  // ── Main ──
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          INSIGHT<span style={{ color: T.gold }}>BALL</span>
        </div>

        {/* Cancelled banner */}
        {cancelled && (
          <div style={styles.cancelledBanner}>
            Paiement annulé — vous pouvez réessayer ci-dessous.
          </div>
        )}

        {/* Welcome header */}
        <div style={styles.welcomeSection}>
          <p style={styles.welcomeLabel}>Invitation club</p>
          <h1 style={styles.clubName}>{invite.club_name}</h1>
          {invite.city && <p style={styles.city}>{invite.city}</p>}
        </div>

        {/* Offer card */}
        <div style={styles.offerCard}>
          <div style={styles.offerHeader}>
            <span style={styles.planBadge}>{planLabel}</span>
            <span style={styles.price}>{priceDisplay}</span>
          </div>
          <div style={styles.offerDetails}>
            <div style={styles.offerRow}>
              <span style={styles.offerLabel}>Matchs analysés</span>
              <span style={styles.offerValue}>{invite.quota_matches} / mois</span>
            </div>
            <div style={styles.offerRow}>
              <span style={styles.offerLabel}>Paiement</span>
              <span style={styles.offerValue}>CB ou SEPA</span>
            </div>
            <div style={styles.offerRow}>
              <span style={styles.offerLabel}>Engagement</span>
              <span style={styles.offerValue}>Sans engagement</span>
            </div>
          </div>
          <div style={styles.offerIncludes}>
            <p style={styles.includesTitle}>Inclus</p>
            <ul style={styles.includesList}>
              <li>Rapports tactiques automatiques</li>
              <li>Heatmaps individuelles et collectives</li>
              <li>Statistiques joueurs et équipe</li>
              <li>Export PDF</li>
              <li>Gestion multi-équipes</li>
              <li>Portail de gestion abonnement</li>
            </ul>
          </div>
        </div>

        {/* Account section */}
        {invite.has_existing_account ? (
          <div style={styles.existingAccount}>
            <p style={styles.existingText}>
              Bonjour <strong>{invite.existing_user_name || invite.first_name}</strong>,
              votre compte existant sera mis à niveau vers le plan {planLabel}.
            </p>
            <p style={styles.existingSubtext}>
              Vos matchs, joueurs et statistiques seront conservés.
            </p>
          </div>
        ) : (
          <div style={styles.formSection}>
            <p style={styles.formLabel}>Créez votre compte</p>
            <div style={styles.readonlyField}>
              <span style={styles.readonlyLabel}>Email</span>
              <span style={styles.readonlyValue}>{invite.email}</span>
            </div>
            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              autoComplete="name"
            />
            <input
              type="password"
              placeholder="Mot de passe (min. 8 caractères)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              autoComplete="new-password"
            />
          </div>
        )}

        {/* Error */}
        {formError && <p style={styles.formError}>{formError}</p>}

        {/* CTA */}
        <button
          onClick={handleAccept}
          disabled={submitting}
          style={{
            ...styles.cta,
            opacity: submitting ? 0.6 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting
            ? 'Redirection vers le paiement...'
            : `Souscrire — ${priceDisplay}`}
        </button>

        <p style={styles.ctaSubtext}>
          Paiement sécurisé via Stripe · Sans engagement · Résiliation en 1 clic
        </p>

        {/* Footer */}
        <div style={styles.footer}>
          <p>
            Une question ?{' '}
            <a href="mailto:contact@insightball.com" style={styles.link}>
              contact@insightball.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}


// ─── Styles ─────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: T.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    fontFamily: T.font,
  },
  card: {
    background: T.surface,
    border: `1px solid ${T.rule}`,
    maxWidth: 480,
    width: '100%',
    padding: '40px 32px',
    position: 'relative',
  },
  logo: {
    fontFamily: T.display,
    fontSize: 22,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    color: T.ink,
    marginBottom: 32,
  },
  cancelledBanner: {
    background: 'rgba(220,38,38,0.06)',
    border: '1px solid rgba(220,38,38,0.15)',
    color: T.red,
    fontSize: 11,
    fontFamily: T.font,
    letterSpacing: '.02em',
    padding: '10px 14px',
    marginBottom: 24,
  },
  welcomeSection: {
    marginBottom: 28,
  },
  welcomeLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.12em',
    color: T.gold,
    margin: '0 0 8px',
  },
  clubName: {
    fontFamily: T.display,
    fontSize: 28,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '.02em',
    color: T.ink,
    margin: 0,
    lineHeight: 1.1,
  },
  city: {
    fontSize: 12,
    color: T.muted,
    margin: '6px 0 0',
    letterSpacing: '.02em',
  },
  // ── Offer card ──
  offerCard: {
    background: T.bg,
    border: `1px solid ${T.rule}`,
    borderTop: `3px solid ${T.gold}`,
    padding: '20px',
    marginBottom: 28,
  },
  offerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `1px solid ${T.rule}`,
  },
  planBadge: {
    background: T.goldBg,
    border: `1px solid ${T.goldBdr}`,
    color: T.gold,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.1em',
    padding: '4px 10px',
  },
  price: {
    fontSize: 18,
    fontWeight: 700,
    color: T.ink,
    fontFamily: T.font,
  },
  offerDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16,
  },
  offerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerLabel: {
    fontSize: 11,
    color: T.muted,
    letterSpacing: '.02em',
  },
  offerValue: {
    fontSize: 12,
    color: T.ink,
    fontWeight: 600,
  },
  offerIncludes: {
    borderTop: `1px solid ${T.rule}`,
    paddingTop: 14,
  },
  includesTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.1em',
    color: T.muted,
    margin: '0 0 10px',
  },
  includesList: {
    margin: 0,
    padding: '0 0 0 16px',
    fontSize: 11,
    color: T.ink,
    lineHeight: 1.9,
  },
  // ── Existing account ──
  existingAccount: {
    background: T.goldBg,
    border: `1px solid ${T.goldBdr}`,
    padding: '16px 18px',
    marginBottom: 24,
  },
  existingText: {
    fontSize: 12,
    color: T.ink,
    lineHeight: 1.6,
    margin: 0,
  },
  existingSubtext: {
    fontSize: 11,
    color: T.muted,
    margin: '8px 0 0',
    lineHeight: 1.5,
  },
  // ── Form ──
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.1em',
    color: T.muted,
    margin: '0 0 14px',
  },
  readonlyField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: T.bg,
    border: `1px solid ${T.rule}`,
    marginBottom: 10,
  },
  readonlyLabel: {
    fontSize: 10,
    color: T.muted,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
  },
  readonlyValue: {
    fontSize: 12,
    color: T.ink,
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: 13,
    fontFamily: T.font,
    border: `1px solid ${T.rule}`,
    background: T.surface,
    color: T.ink,
    outline: 'none',
    marginBottom: 10,
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  formError: {
    fontSize: 11,
    color: T.red,
    margin: '0 0 16px',
    lineHeight: 1.5,
  },
  // ── CTA ──
  cta: {
    width: '100%',
    padding: '14px 24px',
    background: T.gold,
    color: T.dark,
    border: 'none',
    fontSize: 11,
    fontFamily: T.font,
    fontWeight: 700,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    transition: 'opacity 0.15s',
    boxSizing: 'border-box',
  },
  ctaSubtext: {
    fontSize: 10,
    color: T.muted,
    textAlign: 'center',
    margin: '12px 0 0',
    letterSpacing: '.02em',
  },
  // ── Footer ──
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTop: `1px solid ${T.rule}`,
    fontSize: 11,
    color: T.muted,
    textAlign: 'center',
  },
  link: {
    color: T.gold,
    textDecoration: 'none',
  },
  // ── Loading & Error ──
  loadingPulse: {
    fontSize: 11,
    color: T.muted,
    textAlign: 'center',
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    padding: '60px 0',
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(220,38,38,0.08)',
    color: T.red,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20,
  },
  errorTitle: {
    fontFamily: T.display,
    fontSize: 20,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: T.ink,
    margin: '0 0 12px',
  },
  errorText: {
    fontSize: 12,
    color: T.muted,
    lineHeight: 1.6,
    margin: 0,
  },
}
