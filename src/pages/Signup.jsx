import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { T } from '../theme'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  bg: T.dark, ink: T.ink, paper: T.bg,
  muted: 'rgba(245,242,235,0.55)', ruleW: 'rgba(255,255,255,0.07)',
  gold: T.gold, goldD: T.goldD,
  goldBg: T.goldBg, goldBdr: T.goldBdr,
  mono: T.mono, display: T.display,
}

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', role: '', clubName: '', city: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const cleanPhone = (v) => v.replace(/[^0-9+\s\-().]/g, '')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (formData.password !== formData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (formData.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return }
    if (!formData.firstName.trim() || !formData.lastName.trim()) { setError('Prénom et nom requis'); return }
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) { setError('Numéro de téléphone invalide (10 chiffres minimum)'); return }
    if (!formData.clubName.trim()) { setError('Nom du club requis'); return }
    if (!formData.role) { setError('Poste requis'); return }
    if (!formData.city.trim()) { setError('Ville requise'); return }
    setLoading(true)
    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`
      await signup({ name: fullName, email: formData.email, password: formData.password, plan: 'COACH', phone: formData.phone.trim(), club_name: formData.clubName.trim(), city: formData.city.trim(), role: formData.role })
      navigate('/onboarding')
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Une erreur est survenue.'
      setError(msg); setLoading(false)
    }
  }

  const iStyle = (name) => ({
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `2px solid ${focused === name ? G.gold : G.ruleW}`,
    padding: '10px 0', color: G.paper, fontSize: 15,
    outline: 'none', fontFamily: G.mono,
    transition: 'border-color .15s', boxSizing: 'border-box',
  })

  const fields = [
    { label: 'Prénom', name: 'firstName', type: 'text', ph: '' },
    { label: 'Nom', name: 'lastName', type: 'text', ph: '' },
    { label: 'Email', name: 'email', type: 'email', ph: 'votre@email.com' },
    { label: 'Téléphone', name: 'phone', type: 'tel', ph: '06 12 34 56 78' },
    { label: 'Poste', name: 'role', type: 'select', options: ['Éducateur', 'Entraîneur', 'Directeur Sportif', 'Analyste Vidéo'] },
    { label: 'Nom du club', name: 'clubName', type: 'text', ph: '' },
    { label: 'Ville', name: 'city', type: 'text', ph: '' },
    { label: 'Mot de passe', name: 'password', type: 'password', ph: '••••••••', hint: '8 caractères minimum' },
    { label: 'Confirmer le mot de passe', name: 'confirmPassword', type: 'password', ph: '••••••••' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: G.bg }}>
      <style>{`
        ${FONTS} * { box-sizing: border-box; }
        ::placeholder { color: rgba(245,242,235,0.18); font-family:'JetBrains Mono',monospace; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64,
        background: G.bg, borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Insightball" style={{ width: 28, height: 28 }} />
          <span style={{ fontFamily: G.display, fontSize: 17, letterSpacing: '.08em', color: '#fff' }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </Link>
        <Link to="/login" style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = G.gold} onMouseLeave={e => e.target.style.color = 'rgba(245,242,235,0.4)'}>
          Déjà un compte
        </Link>
      </header>

      {/* Content */}
      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>
              Créer un compte
            </div>
            <h1 style={{ fontFamily: G.display, fontSize: 'clamp(44px,5vw,60px)', textTransform: 'uppercase', lineHeight: .88, margin: 0, color: '#fff' }}>
              Démarrez<br /><span style={{ color: G.gold }}>aujourd'hui.</span>
            </h1>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderTop: `2px solid ${G.gold}`, padding: '40px 36px' }}>

            {error && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderLeft: '2px solid #ef4444' }}>
                <p style={{ fontFamily: G.mono, fontSize: 11, color: '#ef4444', margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {fields.map(f => (
                <div key={f.name} style={{ marginBottom: 24 }}>
                  <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={formData[f.name]}
                      onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                      required style={{ ...iStyle(f.name), cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%23c9a227\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center' }}
                      onFocus={() => setFocused(f.name)} onBlur={() => setFocused(null)}>
                      <option value="" disabled style={{ color: 'rgba(245,242,235,0.18)' }}>Sélectionner</option>
                      {f.options.map(o => <option key={o} value={o} style={{ background: '#0a0908', color: '#f5f2eb' }}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={formData[f.name]}
                      onChange={e => {
                        const val = f.name === 'phone' ? cleanPhone(e.target.value) : e.target.value
                        setFormData({ ...formData, [f.name]: val })
                      }}
                      placeholder={f.ph} required style={iStyle(f.name)}
                      onFocus={() => setFocused(f.name)} onBlur={() => setFocused(null)} />
                  )}
                  {f.hint && <p style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(245,242,235,0.25)', margin: '4px 0 0', letterSpacing: '.06em' }}>{f.hint}</p>}
                </div>
              ))}

              <button type="submit" disabled={loading} style={{
                width: '100%', marginTop: 8, padding: '14px',
                background: loading ? 'rgba(201,162,39,0.5)' : G.gold,
                color: G.ink, fontFamily: G.mono, fontSize: 11,
                letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = G.goldD }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = G.gold }}>
                {loading
                  ? <><span style={{ width: 12, height: 12, border: `2px solid ${G.ink}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} /> Création...</>
                  : <>Créer mon compte <ArrowRight size={13} /></>}
              </button>
            </form>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.3)', margin: 0 }}>
                Déjà un compte ?{' '}
                <Link to="/login" style={{ color: G.gold, textDecoration: 'none', fontWeight: 700 }}>Se connecter</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
