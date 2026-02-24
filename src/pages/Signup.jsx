import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  bg:      '#0a0908',
  ink:     '#0f0f0d',
  paper:   '#f5f2eb',
  muted:   'rgba(245,242,235,0.35)',
  ruleW:   'rgba(255,255,255,0.07)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.25)',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [step, setStep]               = useState(1)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [formData, setFormData]       = useState({ name:'', email:'', password:'', confirmPassword:'', clubName:'' })
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [focused, setFocused]         = useState(null)

  const plans = [
    { id:'coach', name:'COACH', price:'29', oldPrice:'39', tag:'Pour les coachs',
      features:['3 matchs / mois','1 équipe','Rapports collectifs + individuels','Suivi progression','Tableau de bord','Support dédié'] },
    { id:'club', name:'CLUB', price:'99', oldPrice:'139', tag:'⚡ Recommandé', popular:true,
      features:['10 matchs / mois','Multi-équipes','Multi-utilisateurs','Vue globale club','Dashboard avancé','Support prioritaire'] },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (formData.password !== formData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (formData.password.length < 8) { setError('Minimum 8 caractères'); return }
    setLoading(true)
    try { await signup({ ...formData, plan: selectedPlan }); navigate('/dashboard') }
    catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Une erreur est survenue.'
      setError(msg); setLoading(false)
    }
  }

  const iStyle = (name) => ({
    width:'100%', background:'transparent', border:'none',
    borderBottom:`2px solid ${focused === name ? G.gold : G.ruleW}`,
    padding:'10px 0', color:G.paper, fontSize:15,
    outline:'none', fontFamily:G.mono,
    transition:'border-color .15s', boxSizing:'border-box',
  })

  const fields = [
    { label: selectedPlan==='club' ? 'Nom du directeur' : 'Nom complet', name:'name', type:'text', ph:'Jean Dupont' },
    ...(selectedPlan==='club' ? [{ label:'Nom du club', name:'clubName', type:'text', ph:'FC Toulouse' }] : []),
    { label:'Email', name:'email', type:'email', ph:'votre@email.com' },
    { label:'Mot de passe', name:'password', type:'password', ph:'••••••••', hint:'Minimum 8 caractères' },
    { label:'Confirmer le mot de passe', name:'confirmPassword', type:'password', ph:'••••••••' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:G.bg }}>
      <style>{`
        ${FONTS} * { box-sizing:border-box; }
        ::placeholder { color:rgba(245,242,235,0.18); font-family:'JetBrains Mono',monospace; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* HEADER */}
      <header style={{
        position:'fixed', top:0, left:0, right:0, height:64,
        background:G.bg, borderBottom:'1px solid rgba(255,255,255,0.06)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 40px', zIndex:100,
      }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width:28, height:28 }} />
          <span style={{ fontFamily:G.display, fontSize:17, letterSpacing:'.08em', color:'#fff' }}>
            INSIGHT<span style={{ color:G.gold }}>BALL</span>
          </span>
        </Link>
        <Link to="/login" style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(245,242,235,0.4)', textDecoration:'none' }}
          onMouseEnter={e=>e.target.style.color=G.gold} onMouseLeave={e=>e.target.style.color='rgba(245,242,235,0.4)'}>
          Déjà un compte →
        </Link>
      </header>

      {/* CONTENT */}
      <div style={{ paddingTop:64, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px 48px' }}>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:48 }}>
          {[{n:'01',label:'Plan'},{n:'02',label:'Inscription'}].map((s,i) => (
            <div key={s.n} style={{ display:'flex', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, border:`1px solid ${step>i ? G.goldBdr : 'rgba(255,255,255,0.15)'}`, background:step>i ? G.goldBg : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {step > i+1
                    ? <Check size={12} color={G.gold} />
                    : <span style={{ fontFamily:G.mono, fontSize:9, color:step>i ? G.gold : 'rgba(255,255,255,0.3)', letterSpacing:'.1em' }}>{s.n}</span>
                  }
                </div>
                <span style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:step>i ? G.gold : 'rgba(255,255,255,0.25)' }}>{s.label}</span>
              </div>
              {i===0 && <div style={{ width:40, height:1, background:step>1 ? G.gold : 'rgba(255,255,255,0.1)', margin:'0 16px' }} />}
            </div>
          ))}
        </div>

        {/* STEP 1 — Plans */}
        {step===1 && (
          <div style={{ width:'100%', maxWidth:760 }}>
            <div style={{ textAlign:'center', marginBottom:44 }}>
              <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:G.gold, display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:14 }}>
                <span style={{ width:16, height:1, background:G.gold }} />Choisissez votre offre
              </div>
              <h1 style={{ fontFamily:G.display, fontSize:'clamp(44px,5vw,64px)', textTransform:'uppercase', lineHeight:.88, letterSpacing:'.01em', margin:0, color:'#fff' }}>
                Démarrez<br /><span style={{ color:G.gold }}>aujourd'hui.</span>
              </h1>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(255,255,255,0.06)' }}>
              {plans.map(plan => (
                <div key={plan.id}
                  style={{ background:plan.popular ? 'rgba(201,162,39,0.05)' : 'rgba(255,255,255,0.02)', padding:'40px 36px', cursor:'pointer', position:'relative', borderTop:`2px solid ${plan.popular ? G.gold : 'rgba(255,255,255,0.1)'}`, transition:'background .2s' }}
                  onClick={() => { setSelectedPlan(plan.id); setStep(2) }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = plan.popular ? 'rgba(201,162,39,0.05)' : 'rgba(255,255,255,0.02)'}
                >
                  {plan.popular && (
                    <div style={{ position:'absolute', top:18, right:18, fontFamily:G.mono, fontSize:8, letterSpacing:'.14em', textTransform:'uppercase', color:G.gold, border:`1px solid ${G.goldBdr}`, padding:'3px 10px', background:'rgba(10,9,8,0.8)' }}>
                      ⚡ Recommandé
                    </div>
                  )}
                  <span style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', color:G.gold, display:'block', marginBottom:10 }}>{plan.tag}</span>
                  <div style={{ fontFamily:G.display, fontSize:28, textTransform:'uppercase', letterSpacing:'.03em', color:'#fff', marginBottom:18 }}>{plan.name}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:28 }}>
                    <span style={{ fontFamily:G.display, fontSize:66, lineHeight:1, color:'#fff' }}>{plan.price}</span>
                    <div>
                      <span style={{ fontFamily:G.mono, fontSize:14, color:'rgba(245,242,235,0.3)', textDecoration:'line-through', display:'block' }}>{plan.oldPrice}€</span>
                      <span style={{ fontFamily:G.mono, fontSize:10, color:'rgba(245,242,235,0.4)', letterSpacing:'.08em' }}>€/mois</span>
                    </div>
                  </div>
                  <ul style={{ listStyle:'none', padding:0, margin:'0 0 32px', display:'flex', flexDirection:'column', gap:7 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ fontFamily:G.mono, fontSize:11, color:'rgba(245,242,235,0.6)', display:'flex', alignItems:'flex-start', gap:8 }}>
                        <span style={{ color:G.gold, flexShrink:0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button style={{ width:'100%', padding:'12px', background:plan.popular ? G.gold : 'transparent', color:plan.popular ? G.ink : '#fff', border:plan.popular ? 'none' : '1px solid rgba(255,255,255,0.15)', fontFamily:G.mono, fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:700, cursor:'pointer' }}>
                    Choisir {plan.name} →
                  </button>
                </div>
              ))}
            </div>
            <p style={{ textAlign:'center', fontFamily:G.mono, fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(245,242,235,0.2)', marginTop:16 }}>Sans engagement</p>
          </div>
        )}

        {/* STEP 2 — Form */}
        {step===2 && (
          <div style={{ width:'100%', maxWidth:400 }}>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderTop:`2px solid ${G.gold}`, padding:'40px 36px' }}>

              <div style={{ marginBottom:32 }}>
                <button onClick={() => setStep(1)} style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(245,242,235,0.3)', background:'none', border:'none', cursor:'pointer', marginBottom:18 }}>
                  ← Changer de plan
                </button>
                <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', color:G.gold, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                  Plan <span style={{ border:`1px solid ${G.goldBdr}`, padding:'2px 10px', background:G.goldBg }}>{selectedPlan?.toUpperCase()}</span>
                </div>
                <h1 style={{ fontFamily:G.display, fontSize:40, textTransform:'uppercase', lineHeight:.88, letterSpacing:'.02em', color:'#fff', margin:0 }}>
                  Créer<br />mon compte.
                </h1>
              </div>

              {error && (
                <div style={{ marginBottom:20, padding:'12px 16px', background:'rgba(239,68,68,0.08)', borderLeft:'2px solid #ef4444' }}>
                  <p style={{ fontFamily:G.mono, fontSize:11, color:'#ef4444', margin:0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {fields.map(f => (
                  <div key={f.name} style={{ marginBottom:24 }}>
                    <label style={{ fontFamily:G.mono, fontSize:8, letterSpacing:'.22em', textTransform:'uppercase', color:G.muted, display:'block', marginBottom:6 }}>{f.label}</label>
                    <input type={f.type} value={formData[f.name]} onChange={e => setFormData({...formData,[f.name]:e.target.value})}
                      placeholder={f.ph} required style={iStyle(f.name)}
                      onFocus={() => setFocused(f.name)} onBlur={() => setFocused(null)} />
                    {f.hint && <p style={{ fontFamily:G.mono, fontSize:8, color:'rgba(245,242,235,0.25)', margin:'4px 0 0', letterSpacing:'.06em' }}>{f.hint}</p>}
                  </div>
                ))}

                <button type="submit" disabled={loading} style={{
                  width:'100%', marginTop:8, padding:'14px',
                  background:loading ? 'rgba(201,162,39,0.5)' : G.gold,
                  color:G.ink, fontFamily:G.mono, fontSize:11,
                  letterSpacing:'.16em', textTransform:'uppercase', fontWeight:700,
                  border:'none', cursor:loading ? 'not-allowed':'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .15s',
                }}
                  onMouseEnter={e=>{ if(!loading) e.currentTarget.style.background=G.goldD }}
                  onMouseLeave={e=>{ if(!loading) e.currentTarget.style.background=G.gold }}
                >
                  {loading
                    ? <><span style={{ width:12, height:12, border:`2px solid ${G.ink}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin .6s linear infinite' }}/> Création...</>
                    : <>Créer mon compte <ArrowRight size={13} /></>
                  }
                </button>
              </form>

              <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
                <p style={{ fontFamily:G.mono, fontSize:10, color:'rgba(245,242,235,0.3)', margin:0 }}>
                  Déjà un compte ?{' '}
                  <Link to="/login" style={{ color:G.gold, textDecoration:'none', fontWeight:700 }}>Se connecter</Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Signup
