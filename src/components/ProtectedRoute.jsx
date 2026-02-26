import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../services/api'
import TrialExpired from '../pages/TrialExpired'

const G = { mono: "'JetBrains Mono', monospace", gold: '#c9a227', bg: '#0a0908' }

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const [trialStatus, setTrialStatus] = useState(null)
  const [trialLoading, setTrialLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || loading) { setTrialLoading(false); return }
    api.get('/subscription/trial-status')
      .then(r => setTrialStatus(r.data))
      .catch(() => setTrialStatus({ access: 'trial' })) // fallback permissif
      .finally(() => setTrialLoading(false))
  }, [isAuthenticated, loading])

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

  // Non connecté → login
  if (!isAuthenticated) {
    return <Navigate to="/x-portal-7f2a/login" replace />
  }

  // Trial expiré sans abonnement → dashboard flouté + overlay paiement
  if (trialStatus?.access === 'expired') {
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
