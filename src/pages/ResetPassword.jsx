import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

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

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [focused, setFocused]       = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  const labelStyle = {
    fontFamily: G.mono, fontSize: 8, letterSpacing: '.22em',
    textTransform: 'uppercase', color: 'rgba(245,242,235,0.65)',
    display: 'block', marginBottom: 8,
  }

  const iStyle = (name) => ({
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `2px solid ${focused === name ? G.gold : G.ruleW}`,
    padding: '10px 0', color: G.paper, fontSize: 15,
    outline: 'none', fontFamily: G.mono,
    transition: 'border-color .15s', boxSizing: 'border-box',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('https://backend-pued.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      setSuccess(true)
      setTimeout(() => navigate('/x-portal-7f2a/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(245,242,235,0.30); font-family: 'JetBrains Mono', monospace; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64,
        background: G.bg, borderBottom: `1px solid rgba(255,255,255,0.06)`,
        display: 'flex', alignItems: 'center', padding: '0 40px', zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width: 28, height: 28 }} />
          <span style={{ fontFamily: G.display, fontSize: 17, letterSpacing: '.08em', color: '#fff' }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </Link>
      </header>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 0' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid rgba(255,255,255,0.07)`,
            borderTop: `2px solid ${G.gold}`,
            padding: '44px 40px',
          }}>
            {/* Token manquant */}
            {!token ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', color: '#fff', marginBottom: 12 }}>
                  Lien <span style={{ color: '#ef4444' }}>invalide.</span>
                </div>
                <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.50)', lineHeight: 1.7, marginBottom: 24 }}>
                  Ce lien de réinitialisation est invalide ou a expiré.
                </p>
                <Link to="/x-portal-7f2a/login" style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, textDecoration: 'none' }}>
                  ← Retour à la connexion
                </Link>
              </div>
            ) : success ? (
              /* Succès */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', color: '#fff', marginBottom: 12 }}>
                  Mot de passe <span style={{ color: G.gold }}>mis à jour ✓</span>
                </div>
                <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.55)', lineHeight: 1.7, marginBottom: 24 }}>
                  Redirection automatique dans 3 secondes...
                </p>
                <Link to="/x-portal-7f2a/login" style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, textDecoration: 'none' }}>
                  Se connecter →
                </Link>
              </div>
            ) : (
              /* Formulaire */
              <>
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
                    Nouveau mot de passe
                  </div>
                  <h1 style={{ fontFamily: G.display, fontSize: 44, textTransform: 'uppercase', letterSpacing: '.02em', lineHeight: .88, color: '#fff', margin: 0 }}>
                    Réinitialiser.
                  </h1>
                </div>

                {error && (
                  <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderLeft: '2px solid #ef4444' }}>
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: '#ef4444', margin: 0 }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Nouveau mot de passe */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>Nouveau mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} required value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="8 caractères minimum"
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

                  {/* Confirmer */}
                  <div style={{ marginBottom: 36 }}>
                    <label style={labelStyle}>Confirmer le mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showConf ? 'text' : 'password'} required value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Répéter le mot de passe"
                        style={{ ...iStyle('confirm'), paddingRight: 36 }}
                        onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} />
                      <button type="button" onClick={() => setShowConf(v => !v)}
                        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,235,0.40)', padding: 4, display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.color = G.gold}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,242,235,0.40)'}>
                        {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '14px',
                    background: loading ? 'rgba(201,162,39,0.5)' : G.gold,
                    color: G.ink, fontFamily: G.mono, fontSize: 11,
                    letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = G.goldD }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = G.gold }}>
                    {loading
                      ? <><span style={{ width: 12, height: 12, border: `2px solid ${G.ink}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} /> Mise à jour...</>
                      : <>Mettre à jour <ArrowRight size={13} /></>
                    }
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
