import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  paper:   '#f5f2eb',
  cream:   '#faf8f4',
  ink:     '#0f0f0d',
  muted:   'rgba(15,15,13,0.42)',
  rule:    'rgba(15,15,13,0.09)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.25)',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Debug: vérifier que les 2 champs sont bien transmis
      console.log('Login attempt:', { email, passwordLength: password.length })
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      // Afficher le vrai message d'erreur du serveur si disponible
      const msg = err?.response?.data?.detail
        || err?.message
        || 'Email ou mot de passe incorrect'
      setError(msg)
      setLoading(false)
    }
    // PAS de finally ici — si navigate() réussit on ne veut pas setLoading(false)
    // car le composant sera démonté. setLoading(false) uniquement dans le catch.
  }

  const inputStyle = (focused) => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${focused ? G.gold : 'rgba(15,15,13,0.15)'}`,
    padding: '10px 0',
    color: G.ink,
    fontSize: 15,
    outline: 'none',
    fontFamily: G.mono,
    transition: 'border-color .15s',
    boxSizing: 'border-box',
  })

  const [focusedField, setFocusedField] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: G.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(15,15,13,0.22); font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo — remplace le <Header /> supprimé */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52, textDecoration: 'none', justifyContent: 'center' }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width: 30, height: 30 }} />
          <span style={{ fontFamily: G.display, fontSize: 20, letterSpacing: '.08em', color: G.ink }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </Link>

        {/* Card */}
        <div style={{
          background: G.paper,
          border: `1px solid ${G.rule}`,
          borderTop: `2px solid ${G.gold}`,
          padding: '40px 36px',
        }}>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
              Connexion
            </div>
            <h1 style={{ fontFamily: G.display, fontSize: 44, textTransform: 'uppercase', letterSpacing: '.02em', lineHeight: .88, color: G.ink, margin: 0 }}>
              Bon retour.
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderLeft: '2px solid #ef4444' }}>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: '#ef4444', letterSpacing: '.04em', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                style={inputStyle(focusedField === 'email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: G.muted }}>
                  Mot de passe
                </label>
                <Link to="/forgot-password" style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, textDecoration: 'none' }}>
                  Oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={inputStyle(focusedField === 'password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'rgba(201,162,39,0.55)' : G.gold,
                color: G.ink,
                fontFamily: G.mono,
                fontSize: 11,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = G.goldD }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = G.gold }}
            >
              {loading
                ? <><span style={{ display:'inline-block', width:12, height:12, border:`2px solid ${G.ink}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin .6s linear infinite' }} /> Connexion...</>
                : <>Se connecter <ArrowRight size={13} /></>
              }
            </button>

          </form>

          {/* Footer card */}
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: `1px solid ${G.rule}`, textAlign: 'center' }}>
            <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: G.muted, margin: 0 }}>
              Pas encore de compte ?{' '}
              <Link to="/signup" style={{ color: G.gold, textDecoration: 'none', fontWeight: 700 }}>
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 18, fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', color: 'rgba(15,15,13,0.25)' }}>
          En vous connectant, vous acceptez nos{' '}
          <Link to="/terms" style={{ color: 'rgba(15,15,13,0.35)', textDecoration: 'underline' }}>CGU</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Login
