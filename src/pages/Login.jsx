import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  bg:      '#0a0908',
  paper:   '#f5f2eb',
  ink:     '#0f0f0d',
  ruleW:   'rgba(255,255,255,0.08)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [focused, setFocused]     = useState(null)
  const [showPass, setShowPass]   = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

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

  const handleForgot = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await fetch('https://backend-pued.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      setForgotSent(true)
    } catch {
      // On affiche succès même en cas d'erreur (sécurité)
      setForgotSent(true)
    } finally {
      setForgotLoading(false)
    }
  }

  const iStyle = (name) => ({
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `2px solid ${focused === name ? G.gold : G.ruleW}`,
    padding: '10px 0', color: G.paper, fontSize: 15,
    outline: 'none', fontFamily: G.mono,
    transition: 'border-color .15s', boxSizing: 'border-box',
  })

  const labelStyle = {
    fontFamily: G.mono, fontSize: 8, letterSpacing: '.22em',
    textTransform: 'uppercase', color: 'rgba(245,242,235,0.65)',
    display: 'block', marginBottom: 8,
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(245,242,235,0.30); font-family: 'JetBrains Mono', monospace; }
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
        <Link to="/x-portal-7f2a/signup" style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.60)', textDecoration: 'none', transition: 'color .15s' }}
          onMouseEnter={e => e.target.style.color = G.gold}
          onMouseLeave={e => e.target.style.color = 'rgba(245,242,235,0.60)'}
        >
          Créer un compte →
        </Link>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 0' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* ── MODALE MOT DE PASSE OUBLIÉ ── */}
          {showForgot && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
              <div style={{ width: '100%', maxWidth: 380, background: '#0f0e0c', border: `1px solid rgba(255,255,255,0.07)`, borderTop: `2px solid ${G.gold}`, padding: '36px 32px' }}>
                {forgotSent ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: '#fff', marginBottom: 12 }}>
                      Email envoyé <span style={{ color: G.gold }}>✓</span>
                    </div>
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.55)', lineHeight: 1.7, marginBottom: 24 }}>
                      Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.
                    </p>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail('') }}
                      style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', background: G.gold, color: G.ink, border: 'none', padding: '11px 24px', cursor: 'pointer', fontWeight: 700 }}>
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>
                      Mot de passe oublié
                    </div>
                    <h2 style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: '#fff', marginBottom: 8, lineHeight: 1 }}>
                      Réinitialiser.
                    </h2>
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.50)', lineHeight: 1.7, marginBottom: 24 }}>
                      Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                    <form onSubmit={handleForgot}>
                      <label style={labelStyle}>Email</label>
                      <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                        placeholder="votre@email.com"
                        style={{ ...iStyle('forgot'), marginBottom: 24 }} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => setShowForgot(false)}
                          style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid rgba(255,255,255,0.1)`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.45)', cursor: 'pointer' }}>
                          Annuler
                        </button>
                        <button type="submit" disabled={forgotLoading}
                          style={{ flex: 2, padding: '11px', background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.ink, fontWeight: 700, cursor: 'pointer' }}>
                          {forgotLoading ? 'Envoi...' : 'Envoyer le lien →'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

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
              {/* Email */}
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com" required autoComplete="email"
                  style={iStyle('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe</label>
                  <button type="button" onClick={() => setShowForgot(true)}
                    style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Oublié ?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"
                    style={{ ...iStyle('password'), paddingRight: 36 }}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,235,0.40)', padding: 4, display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.color = G.gold}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,242,235,0.40)'}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
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
              <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: 'rgba(245,242,235,0.55)', margin: 0 }}>
                Pas encore de compte ?{' '}
                <Link to="/x-portal-7f2a/signup" style={{ color: G.gold, textDecoration: 'none', fontWeight: 700 }}>Créer un compte</Link>
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', color: 'rgba(245,242,235,0.45)' }}>
            En vous connectant, vous acceptez nos{' '}
            <Link to="/terms" style={{ color: 'rgba(245,242,235,0.65)', textDecoration: 'underline' }}>CGU</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
