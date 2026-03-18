import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import TrialExpired from '../pages/TrialExpired'
import { T } from '../theme'

const G = { mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif", gold: '#c9a227', bg: '#0a0908' }

// Cache global — persiste entre navigations dashboard sans re-fetch
let _trialCache = { data: null, userId: null, subId: null, ts: 0 }
const CACHE_TTL = 60_000

function PendingApproval() {
  const { logout } = useAuth()
  return (
    <div style={{
      minHeight: '100vh', background: G.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          <img src="/logo.svg" alt="Insightball" style={{ width: 36, height: 36, marginBottom: 12 }} />
          <div style={{ fontFamily: G.display, fontSize: 18, letterSpacing: '.08em', color: '#f5f2eb' }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderTop: `2px solid ${G.gold}`, padding: '40px 32px',
        }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 20px',
            background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 28 }}>⏳</span>
          </div>

          <div style={{
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em',
            textTransform: 'uppercase', color: G.gold, marginBottom: 12,
          }}>
            Validation en cours
          </div>

          <h1 style={{
            fontFamily: G.display, fontSize: 32, textTransform: 'uppercase',
            lineHeight: .92, letterSpacing: '.02em', color: '#f5f2eb', margin: '0 0 16px',
          }}>
            Ton compte est<br /><span style={{ color: G.gold }}>en attente.</span>
          </h1>

          <p style={{
            fontFamily: G.mono, fontSize: 12, color: 'rgba(245,242,235,0.55)',
            lineHeight: 1.7, letterSpacing: '.03em', margin: '0 0 28px',
          }}>
            Merci pour ton inscription. Nous vérifions ton profil pour garantir la qualité de la communauté Insightball. Tu recevras un email dès que ton accès sera activé.
          </p>

          <div style={{
            background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.18)',
            borderLeft: `3px solid ${G.gold}`, padding: '14px 18px',
            textAlign: 'left', marginBottom: 24,
          }}>
            <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.7)', margin: 0, lineHeight: 1.6 }}>
              <span style={{ color: G.gold, fontWeight: 700 }}>En attendant</span> — tu peux compléter ton profil dans l'onboarding. Tout sera prêt quand ton compte sera validé.
            </p>
          </div>

          <button onClick={() => { logout(); window.location.href = '/login' }} style={{
            padding: '10px 20px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,242,235,0.45)',
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em',
            textTransform: 'uppercase', cursor: 'pointer',
            transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.3)'; e.currentTarget.style.color = G.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(245,242,235,0.45)' }}
          >
            Se déconnecter
          </button>
        </div>

        <p style={{
          fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.3)',
          marginTop: 20, letterSpacing: '.04em',
        }}>
          Une question ? <a href="mailto:contact@insightball.com" style={{ color: G.gold, textDecoration: 'none' }}>contact@insightball.com</a>
        </p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  const [trialStatus, setTrialStatus] = useState(null)
  const [trialLoading, setTrialLoading] = useState(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || loading) { setTrialLoading(false); return }

    const now = Date.now()
    const cacheValid = (
      _trialCache.data &&
      _trialCache.userId === user?.id &&
      _trialCache.subId === (user?.stripe_subscription_id || null) &&
      (now - _trialCache.ts) < CACHE_TTL
    )

    if (cacheValid) {
      setTrialStatus(_trialCache.data)
      setTrialLoading(false)
      return
    }

    if (fetchedRef.current) return
    fetchedRef.current = true
    setTrialLoading(true)

    api.get('/subscription/trial-status')
      .then(r => {
        setTrialStatus(r.data)
        _trialCache = { data: r.data, userId: user?.id, subId: user?.stripe_subscription_id || null, ts: Date.now() }
      })
      .catch(() => {
        const fallback = { access: 'trial' }
        setTrialStatus(fallback)
        _trialCache = { data: fallback, userId: user?.id, subId: user?.stripe_subscription_id || null, ts: Date.now() }
      })
      .finally(() => setTrialLoading(false))
  }, [isAuthenticated, loading, user?.stripe_subscription_id])

  useEffect(() => { fetchedRef.current = false }, [user?.stripe_subscription_id])

  // Loader
  if (loading || trialLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: G.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, border: `2px solid ${G.gold}`,
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin .7s linear infinite', margin: '0 auto 12px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold }}>
            Chargement...
          </span>
        </div>
      </div>
    )
  }

  // Non connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Compte non approuvé — écran d'attente
  if (user?.is_approved === false) {
    return <PendingApproval />
  }

  // Trial expiré OU sub annulée
  const isExpiredOrCanceled = (
    trialStatus?.access === 'expired' ||
    (trialStatus?.access === 'no_trial' && user?.trial_ends_at != null)
  )

  if (isExpiredOrCanceled) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.35 }}>
          {children}
        </div>
        <TrialExpired />
      </div>
    )
  }

  return children
}

export default ProtectedRoute
