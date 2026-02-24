import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  bg:      '#0a0908',
  paper:   '#f5f2eb',
  ink:     '#0f0f0d',
  muted:   'rgba(15,15,13,0.42)',
  rule:    'rgba(15,15,13,0.09)',
  ruleW:   'rgba(255,255,255,0.08)',
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
  const [focused, setFocused]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Email ou mot de passe incorrect'
      setError(msg)
      setLoading(false)
    }
  }

  const iStyle = (name) => ({
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `2px solid ${focused === name ? G.gold : G.ruleW}`,
    padding: '10px 0', color: G.paper, fontSize: 15,
    outline: 'none', fontFamily: G.mono,
    transition: 'border-color .15s', boxSizing: 'border-box',
  })

  return (
    <div style={{ minHeight: '100vh', background: G.bg }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(245,242,235,0.18); font-family: 'JetBrains Mono', monospace; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64,
        background: G.bg, borderBottom: `1px solid rgba(255,255,255,0.06)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width: 28, height: 28 }} />
          <span style={{ fontFamily: G.display, fontSize: 17, letterSpacing: '.08em', color: '#fff' }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </Link>
        <Link to="/x-portal-7f2a/signup" style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', textDecoration: 'none', transition: 'color .15s' }}
          onMouseEnter={e => e.target.style.color = G.gold}
          onMouseLeave={e => e.target.style.color = 'rgba(245,242,235,0.4)'}
        >
          Créer un compte →
        </Link>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 0' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid rgba(255,255,255,0.07)`,
            borderTop: `2px solid ${G.gold}`,
            padding: '44px 40px',
          }}>

            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
                Connexion
              </div>
              <h1 style={{ fontFamily: G.display, fontSize: 48, textTransform: 'uppercase', letterSpacing: '.02em', lineHeight: .88, color: '#fff', margin: 0 }}>
                Bon retour.
              </h1>
            </div>

            {error && (
              <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderLeft: '2px solid #ef4444' }}>
                <p style={{ fontFamily: G.mono, fontSize: 11, color: '#ef4444', margin: 0, letterSpacing: '.04em' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.35)', display: 'block', marginBottom: 8 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com" required autoComplete="email"
                  style={iStyle('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
              </div>

              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.35)' }}>Mot de passe</label>
                  <Link to="/x-portal-7f2a/forgot-password" style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, textDecoration: 'none' }}>Oublié ?</Link>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  style={iStyle('password')} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(201,162,39,0.5)' : G.gold,
                color: G.ink, fontFamily: G.mono, fontSize: 11,
                letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = G.goldD }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = G.gold }}
              >
                {loading
                  ? <><span style={{ width: 12, height: 12, border: `2px solid ${G.ink}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} /> Connexion...</>
                  : <>Se connecter <ArrowRight size={13} /></>
                }
              </button>
            </form>

            <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: 'rgba(245,242,235,0.3)', margin: 0 }}>
                Pas encore de compte ?{' '}
                <Link to="/x-portal-7f2a/signup" style={{ color: G.gold, textDecoration: 'none', fontWeight: 700 }}>Créer un compte</Link>
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', color: 'rgba(245,242,235,0.18)' }}>
            En vous connectant, vous acceptez nos{' '}
            <Link to="/terms" style={{ color: 'rgba(245,242,235,0.3)', textDecoration: 'underline' }}>CGU</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
