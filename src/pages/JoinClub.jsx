/**
 * JoinClub.jsx
 * Page d'acceptation d'invitation club
 * Gère : déjà connecté / compte existant / nouveau compte
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API = 'https://backend-pued.onrender.com/api'

const G = {
  bg: '#0a0908', bg2: '#0f0e0c',
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.35)',
  text: '#f5f2eb', red: '#ef4444', green: '#22c55e',
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: `1px solid rgba(255,255,255,0.08)`,
  padding: '12px 16px', color: G.text,
  fontFamily: G.mono, fontSize: 13,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
}
const labelStyle = {
  fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em',
  textTransform: 'uppercase', color: G.muted, marginBottom: 8, display: 'block',
}

export default function JoinClub() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  // États possibles : checking | needs_auth | signup | login | accepting | success | error
  const [step, setStep] = useState('checking')
  const [error, setError] = useState('')
  const [inviteInfo, setInviteInfo] = useState(null) // club_name, role, category depuis le token

  // Formulaires
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) { setStep('error'); setError('Lien d\'invitation invalide.'); return }

    // Si déjà connecté → accepter directement
    const jwt = localStorage.getItem('insightball_token')
    if (jwt) {
      acceptWithToken(jwt)
    } else {
      // Pas connecté → afficher le choix
      setStep('needs_auth')
    }
  }, [token])

  const acceptWithToken = async (jwt) => {
    setStep('accepting')
    try {
      const res = await fetch(`${API}/club/members/accept?token=${token}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      setStep('success')
      setTimeout(() => { window.location.href = '/dashboard' }, 2000)
    } catch (e) {
      setStep('error')
      setError(e.message)
    }
  }

  const handleSignup = async () => {
    setError('')
    if (!signupForm.name || !signupForm.email || !signupForm.password) return setError('Tous les champs sont requis')
    if (signupForm.password !== signupForm.confirmPassword) return setError('Les mots de passe ne correspondent pas')
    if (signupForm.password.length < 8) return setError('Mot de passe minimum 8 caractères')

    setLoading(true)
    try {
      // Créer le compte en plan coach (sera rattaché au club via l'invitation)
      const signupRes = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          plan: 'COACH', // plan par défaut, sera rattaché au club
        })
      })
      const signupData = await signupRes.json()
      if (!signupRes.ok) throw new Error(signupData.detail || 'Erreur lors de la création du compte')

      // Sauvegarder le token
      localStorage.setItem('insightball_token', signupData.access_token)

      // Accepter l'invitation
      await acceptWithToken(signupData.access_token)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    setError('')
    if (!loginForm.email || !loginForm.password) return setError('Email et mot de passe requis')

    setLoading(true)
    try {
      const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) throw new Error(loginData.detail || 'Email ou mot de passe incorrect')

      localStorage.setItem('insightball_token', loginData.access_token)
      await acceptWithToken(loginData.access_token)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const btnPrimary = (disabled) => ({
    width: '100%', padding: '13px', background: disabled ? 'rgba(201,162,39,0.4)' : G.gold,
    border: 'none', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em',
    textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background .15s',
    marginTop: 8,
  })

  const btnSecondary = {
    width: '100%', padding: '11px', background: 'transparent',
    border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 10,
    letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted,
    cursor: 'pointer', marginTop: 8,
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`${FONTS} * { box-sizing: border-box; margin: 0; } input::placeholder { color: rgba(245,242,235,0.2); }`}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <span style={{ fontFamily: G.display, fontSize: 22, letterSpacing: '.08em', color: G.text }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </div>

        {/* Card */}
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.gold}`, padding: '36px 32px' }}>

          {/* ── Checking / Accepting ── */}
          {(step === 'checking' || step === 'accepting') && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 44, height: 44, border: `2px solid rgba(201,162,39,0.2)`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 20px' }} />
              <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>
                {step === 'accepting' ? 'Acceptation en cours...' : 'Vérification...'}
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 48, height: 48, background: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.25)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: G.green, fontSize: 22 }}>✓</div>
              <div style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: G.text, marginBottom: 10 }}>Invitation acceptée !</div>
              <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em' }}>Redirection vers le dashboard...</div>
            </div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.25)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: G.red, fontSize: 24 }}>×</div>
              <div style={{ fontFamily: G.display, fontSize: 26, textTransform: 'uppercase', color: G.text, marginBottom: 10 }}>Lien invalide</div>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, letterSpacing: '.04em', marginBottom: 24 }}>{error}</div>
              <button onClick={() => navigate('/')} style={btnSecondary}>Retour à l'accueil</button>
            </div>
          )}

          {/* ── Choix : Nouveau compte ou Se connecter ── */}
          {step === 'needs_auth' && (
            <>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 8 }}>Invitation reçue</div>
              <div style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: G.text, marginBottom: 24, lineHeight: 1.1 }}>
                Rejoindre<br />le club
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => setStep('signup')} style={btnPrimary(false)}>
                  Créer mon compte →
                </button>
                <button onClick={() => setStep('login')} style={btnSecondary}>
                  J'ai déjà un compte
                </button>
              </div>
            </>
          )}

          {/* ── Création de compte ── */}
          {step === 'signup' && (
            <>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 8 }}>Nouveau compte</div>
              <div style={{ fontFamily: G.display, fontSize: 26, textTransform: 'uppercase', color: G.text, marginBottom: 24 }}>Créer mon compte</div>

              {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, fontFamily: G.mono, fontSize: 11, color: G.red, marginBottom: 16 }}>{error}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input style={inputStyle} placeholder="Jean Dupont" value={signupForm.name}
                    onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="jean@club.fr" value={signupForm.email}
                    onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div>
                  <label style={labelStyle}>Mot de passe</label>
                  <input style={inputStyle} type="password" placeholder="8 caractères minimum" value={signupForm.password}
                    onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div>
                  <label style={labelStyle}>Confirmer le mot de passe</label>
                  <input style={inputStyle} type="password" placeholder="Répéter le mot de passe" value={signupForm.confirmPassword}
                    onChange={e => setSignupForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    onKeyDown={e => e.key === 'Enter' && handleSignup()} />
                </div>
                <button onClick={handleSignup} disabled={loading} style={btnPrimary(loading)}>
                  {loading ? 'Création...' : 'Créer et rejoindre →'}
                </button>
                <button onClick={() => { setStep('needs_auth'); setError('') }} style={btnSecondary}>
                  ← Retour
                </button>
              </div>
            </>
          )}

          {/* ── Connexion ── */}
          {step === 'login' && (
            <>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 8 }}>Compte existant</div>
              <div style={{ fontFamily: G.display, fontSize: 26, textTransform: 'uppercase', color: G.text, marginBottom: 24 }}>Se connecter</div>

              {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, fontFamily: G.mono, fontSize: 11, color: G.red, marginBottom: 16 }}>{error}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="jean@club.fr" value={loginForm.email}
                    onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div>
                  <label style={labelStyle}>Mot de passe</label>
                  <input style={inputStyle} type="password" placeholder="••••••••" value={loginForm.password}
                    onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <button onClick={handleLogin} disabled={loading} style={btnPrimary(loading)}>
                  {loading ? 'Connexion...' : 'Se connecter et rejoindre →'}
                </button>
                <button onClick={() => { setStep('needs_auth'); setError('') }} style={btnSecondary}>
                  ← Retour
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
