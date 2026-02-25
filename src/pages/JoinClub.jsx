/**
 * JoinClub.jsx
 * Page d'acceptation d'une invitation club via token
 * URL : /join?token=xxx
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API = 'https://backend-pued.onrender.com/api'

const G = {
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
}
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

export default function JoinClub() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('idle') // idle | loading | success | error | needs_login
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Lien d\'invitation invalide.'); return }
    const jwt = localStorage.getItem('insightball_token')
    if (!jwt) {
      // Pas connecté — rediriger vers login avec redirect
      setStatus('needs_login')
    } else {
      acceptInvitation(jwt)
    }
  }, [token])

  const acceptInvitation = async (jwt) => {
    setStatus('loading')
    try {
      const res = await fetch(`${API}/club/members/accept?token=${token}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      setStatus('success')
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  const goToLogin = () => {
    // Sauvegarder le token d'invitation pour y revenir après login
    sessionStorage.setItem('pending_invite_token', token)
    navigate(`/x-portal-7f2a/login?redirect=/join?token=${token}`)
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: `1px solid rgba(255,255,255,0.08)`,
    padding: '12px 16px', color: '#f5f2eb',
    fontFamily: G.mono, fontSize: 13, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color .15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0908', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`${FONTS} * { box-sizing: border-box; margin: 0; }`}</style>

      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: G.display, fontSize: 24, letterSpacing: '.08em', color: '#f5f2eb' }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#0f0e0c', border: `1px solid rgba(255,255,255,0.07)`, borderTop: `2px solid ${G.gold}`, padding: '36px 32px' }}>

          {/* Loading */}
          {status === 'loading' && (
            <>
              <div style={{ width: 48, height: 48, border: `2px solid rgba(201,162,39,0.2)`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 24px' }} />
              <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)' }}>
                Acceptation en cours...
              </div>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div style={{ width: 48, height: 48, background: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.2)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22 }}>
                ✓
              </div>
              <div style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: '#f5f2eb', marginBottom: 10 }}>
                Invitation acceptée !
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.4)', letterSpacing: '.06em' }}>
                Redirection vers le dashboard...
              </div>
            </>
          )}

          {/* Needs login */}
          {status === 'needs_login' && (
            <>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 16 }}>
                Invitation reçue
              </div>
              <div style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: '#f5f2eb', marginBottom: 12 }}>
                Connectez-vous
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.45)', letterSpacing: '.04em', lineHeight: 1.6, marginBottom: 28 }}>
                Vous devez être connecté pour accepter cette invitation.
              </div>
              <button onClick={goToLogin} style={{
                width: '100%', padding: '13px', background: G.gold,
                border: 'none', fontFamily: G.mono, fontSize: 10,
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: '#0f0f0d', fontWeight: 700, cursor: 'pointer',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                onMouseLeave={e => e.currentTarget.style.background = G.gold}>
                Se connecter pour accepter →
              </button>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.2)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22 }}>
                ×
              </div>
              <div style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: '#f5f2eb', marginBottom: 10 }}>
                Lien invalide
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.4)', letterSpacing: '.06em', marginBottom: 24 }}>
                {message || 'Ce lien d\'invitation est invalide ou a expiré.'}
              </div>
              <button onClick={() => navigate('/')} style={{
                padding: '10px 24px', background: 'transparent',
                border: `1px solid rgba(255,255,255,0.1)`,
                fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em',
                textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)',
                cursor: 'pointer',
              }}>
                Retour à l'accueil
              </button>
            </>
          )}

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
