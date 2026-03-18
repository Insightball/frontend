import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import TrialExpired from '../pages/TrialExpired'

const G = { mono: "'JetBrains Mono', monospace", gold: '#c9a227', bg: '#0a0908' }

// Cache global — persiste entre navigations dashboard sans re-fetch
let _trialCache = { data: null, userId: null, subId: null, ts: 0 }
const CACHE_TTL = 60_000 // 1 minute — suffisant, le trial ne change pas toutes les secondes

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  const [trialStatus, setTrialStatus] = useState(null)
  const [trialLoading, setTrialLoading] = useState(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || loading) { setTrialLoading(false); return }

    // Vérifier le cache — même user + même sub + pas expiré
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

    // Pas de cache valide → fetch
    if (fetchedRef.current) return
    fetchedRef.current = true
    setTrialLoading(true)

    api.get('/subscription/trial-status')
      .then(r => {
        setTrialStatus(r.data)
        _trialCache = {
          data: r.data,
          userId: user?.id,
          subId: user?.stripe_subscription_id || null,
          ts: Date.now(),
        }
      })
      .catch(() => {
        const fallback = { access: 'trial' }
        setTrialStatus(fallback)
        _trialCache = {
          data: fallback,
          userId: user?.id,
          subId: user?.stripe_subscription_id || null,
          ts: Date.now(),
        }
      })
      .finally(() => setTrialLoading(false))
  }, [isAuthenticated, loading, user?.stripe_subscription_id])

  // Reset ref quand la subscription change (pour forcer un re-fetch)
  useEffect(() => {
    fetchedRef.current = false
  }, [user?.stripe_subscription_id])

  // Loader — affiché uniquement si pas de cache (première visite)
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

  // Non connecté → login
  if (!isAuthenticated) {
    return <Navigate to="/x-portal-7f2a/login" replace />
  }

  // Trial expiré OU sub annulée (user qui a déjà eu un trial mais n'a plus de sub active)
  // On ne bloque PAS les nouveaux users sans trial (pas encore de trial_ends_at)
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

  // Accès complet (trial actif ou abonné)
  return children
}

export default ProtectedRoute
