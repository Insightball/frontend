import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  paper:'#f5f2eb', cream:'#faf8f4',
  ink:'#0f0f0d', muted:'rgba(15,15,13,0.42)', rule:'rgba(15,15,13,0.09)',
  gold:'#c9a227', goldD:'#a8861f', goldBg:'rgba(201,162,39,0.07)', goldBdr:'rgba(201,162,39,0.25)',
  mono:"'JetBrains Mono', monospace", display:"'Anton', sans-serif",
}

const inputStyle = {
  width:'100%', background:'transparent',
  border:'none', borderBottom:'1px solid rgba(15,15,13,0.15)',
  padding:'12px 0', color:G.ink, fontSize:15,
  outline:'none', fontFamily:G.mono,
  transition:'border-color .15s', boxSizing:'border-box',
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(formData.email, formData.password); navigate('/dashboard') }
    catch { setError('Email ou mot de passe incorrect') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:G.cream, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`${FONTS} * { box-sizing:border-box; } ::placeholder { color:rgba(15,15,13,0.25); }`}</style>
      <div style={{ width:'100%', maxWidth:440, padding:'0 24px' }}>

        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:48, textDecoration:'none', justifyContent:'center' }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width:32, height:32 }} />
          <span style={{ fontFamily:G.display, fontSize:20, letterSpacing:'.06em', color:G.ink }}>
            INSIGHT<span style={{ color:G.gold }}>BALL</span>
          </span>
        </Link>

        <div style={{ background:G.paper, border:`1px solid ${G.rule}`, borderTop:`2px solid ${G.gold}`, padding:'40px 36px' }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:G.gold, display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <span style={{ width:16, height:1, background:G.gold, display:'inline-block' }} />Connexion
            </div>
            <h1 style={{ fontFamily:G.display, fontSize:42, textTransform:'uppercase', letterSpacing:'.02em', lineHeight:.9, color:G.ink, margin:0 }}>
              Bon retour.
            </h1>
          </div>

          {error && (
            <div style={{ marginBottom:24, padding:'12px 16px', background:'rgba(239,68,68,0.06)', borderLeft:'2px solid #ef4444' }}>
              <p style={{ fontFamily:G.mono, fontSize:11, color:'#ef4444', margin:0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ borderBottom:`1px solid ${G.rule}`, paddingBottom:20, marginBottom:20 }}>
              <label style={{ fontFamily:G.mono, fontSize:8, letterSpacing:'.2em', textTransform:'uppercase', color:G.muted, display:'block', marginBottom:8 }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email:e.target.value})}
                placeholder="votre@email.com" required style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = G.gold}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(15,15,13,0.15)'}
              />
            </div>
            <div style={{ marginBottom:28 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontFamily:G.mono, fontSize:8, letterSpacing:'.2em', textTransform:'uppercase', color:G.muted }}>Mot de passe</label>
                <Link to="/forgot-password" style={{ fontFamily:G.mono, fontSize:8, letterSpacing:'.1em', textTransform:'uppercase', color:G.gold, textDecoration:'none' }}>Oublié ?</Link>
              </div>
              <input type="password" name="password" value={formData.password} onChange={e => setFormData({...formData, password:e.target.value})}
                placeholder="••••••••" required style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = G.gold}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(15,15,13,0.15)'}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'14px', background:loading ? 'rgba(201,162,39,0.5)' : G.gold,
              color:G.ink, fontFamily:G.mono, fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:700,
              border:'none', cursor:loading ? 'not-allowed' : 'pointer', transition:'background .15s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.background = G.goldD }}
              onMouseLeave={e => { if(!loading) e.currentTarget.style.background = G.gold }}
            >
              {loading ? 'Connexion...' : <>Se connecter <ArrowRight size={14} /></>}
            </button>
          </form>

          <div style={{ marginTop:28, paddingTop:24, borderTop:`1px solid ${G.rule}`, textAlign:'center' }}>
            <p style={{ fontFamily:G.mono, fontSize:10, letterSpacing:'.08em', color:G.muted }}>
              Pas encore de compte ?{' '}
              <Link to="/signup" style={{ color:G.gold, textDecoration:'none' }}>Créer un compte</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontFamily:G.mono, fontSize:9, letterSpacing:'.08em', color:G.muted }}>
          En vous connectant, vous acceptez nos{' '}
          <Link to="/terms" style={{ color:G.muted, textDecoration:'underline' }}>CGU</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
