import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`
const G = {
  paper:'#f5f2eb', cream:'#faf8f4',
  ink:'#0f0f0d', muted:'rgba(15,15,13,0.42)', rule:'rgba(15,15,13,0.09)',
  gold:'#c9a227', goldD:'#a8861f', goldBg:'rgba(201,162,39,0.07)', goldBdr:'rgba(201,162,39,0.25)',
  mono:"'JetBrains Mono', monospace", display:"'Anton', sans-serif",
}

const inputStyle = {
  width:'100%', background:'transparent', border:'none',
  borderBottom:'1px solid rgba(15,15,13,0.15)',
  padding:'12px 0', color:G.ink, fontSize:15,
  outline:'none', fontFamily:G.mono,
  transition:'border-color .15s', boxSizing:'border-box',
}

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [step, setStep]               = useState(1)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [formData, setFormData]       = useState({ name:'', email:'', password:'', confirmPassword:'', clubName:'' })
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  const plans = [
    { id:'coach', name:'COACH', price:'29', oldPrice:'39', tag:'Pour les coachs',
      features:['3 matchs analysés / mois','1 équipe','Rapports collectifs et individuels','Suivi progression match après match','Tableau de bord complet','Support dédié'] },
    { id:'club', name:'CLUB', price:'99', oldPrice:'139', tag:'⚡ Recommandé', popular:true,
      features:['10 matchs analysés / mois','Multi-équipes','Multi-utilisateurs','Vue globale club','Tableau de bord avancé','Support prioritaire'] },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (formData.password !== formData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (formData.password.length < 8) { setError('Minimum 8 caractères'); return }
    setLoading(true)
    try { await signup({ ...formData, plan: selectedPlan }); navigate('/dashboard') }
    catch { setError('Une erreur est survenue.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:G.cream, color:G.ink, padding:'0 24px 48px' }}>
      <style>{`${FONTS} * { box-sizing:border-box; } ::placeholder { color:rgba(15,15,13,0.25); }`}</style>

      {/* Nav */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 0 40px', maxWidth:960, margin:'0 auto' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <img src="/logo.svg" alt="" style={{ width:28, height:28 }} />
          <span style={{ fontFamily:G.display, fontSize:16, letterSpacing:'.06em', color:G.ink }}>
            INSIGHT<span style={{ color:G.gold }}>BALL</span>
          </span>
        </Link>
        <Link to="/login" style={{ fontFamily:G.mono, fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:G.muted, textDecoration:'none' }}>
          Déjà un compte ?
        </Link>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto' }}>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:48, justifyContent:'center' }}>
          {[{n:'01',label:'Plan'},{n:'02',label:'Inscription'}].map((s,i) => (
            <div key={s.n} style={{ display:'flex', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, border:`1px solid ${step>i ? G.goldBdr : G.rule}`, background:step>i ? G.goldBg : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {step > i+1
                    ? <Check size={12} color={G.gold} />
                    : <span style={{ fontFamily:G.mono, fontSize:9, color:step>i ? G.gold : G.muted, letterSpacing:'.1em' }}>{s.n}</span>
                  }
                </div>
                <span style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:step>i ? G.gold : G.muted }}>{s.label}</span>
              </div>
              {i===0 && <div style={{ width:40, height:1, background:step>1 ? G.gold : G.rule, margin:'0 16px' }} />}
            </div>
          ))}
        </div>

        {/* STEP 1: Plans */}
        {step===1 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:G.gold, display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:16 }}>
                <span style={{ width:16, height:1, background:G.gold }} />Choisissez votre offre
              </div>
              <h1 style={{ fontFamily:G.display, fontSize:52, textTransform:'uppercase', lineHeight:.9, letterSpacing:'.01em', margin:0, color:G.ink }}>
                Démarrez<br /><span style={{ color:G.gold }}>aujourd'hui.</span>
              </h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:G.rule }}>
              {plans.map(plan => (
                <div key={plan.id}
                  style={{ background:plan.popular ? G.goldBg : G.paper, padding:'44px 40px', cursor:'pointer', position:'relative', borderTop:`2px solid ${plan.popular ? G.gold : G.rule}`, transition:'background .2s' }}
                  onClick={() => { setSelectedPlan(plan.id); setStep(2) }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = plan.popular ? G.goldBg : G.paper}
                >
                  {plan.popular && (
                    <div style={{ position:'absolute', top:20, right:20, fontFamily:G.mono, fontSize:8, letterSpacing:'.14em', textTransform:'uppercase', color:G.gold, border:`1px solid ${G.goldBdr}`, padding:'4px 10px', background:G.paper }}>
                      ⚡ Recommandé
                    </div>
                  )}
                  <span style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', color:G.gold, display:'block', marginBottom:12 }}>{plan.tag}</span>
                  <div style={{ fontFamily:G.display, fontSize:32, textTransform:'uppercase', letterSpacing:'.03em', marginBottom:20, color:G.ink }}>{plan.name}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:32 }}>
                    <span style={{ fontFamily:G.display, fontSize:72, lineHeight:1, letterSpacing:'-.02em', color:G.ink }}>{plan.price}</span>
                    <div>
                      <span style={{ fontFamily:G.mono, fontSize:16, color:G.muted, textDecoration:'line-through', display:'block' }}>{plan.oldPrice}€</span>
                      <span style={{ fontFamily:G.mono, fontSize:10, color:G.muted, letterSpacing:'.08em' }}>€/mois</span>
                    </div>
                  </div>
                  <ul style={{ listStyle:'none', padding:0, margin:'0 0 36px', display:'flex', flexDirection:'column', gap:8 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ fontFamily:G.mono, fontSize:11, color:G.ink, display:'flex', alignItems:'flex-start', gap:8, letterSpacing:'.04em' }}>
                        <span style={{ color:G.gold, flexShrink:0, marginTop:1 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button style={{ width:'100%', padding:'13px', background:plan.popular ? G.gold : 'transparent', color:plan.popular ? G.ink : G.ink, border:plan.popular ? 'none' : `1px solid ${G.rule}`, fontFamily:G.mono, fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:700, cursor:'pointer' }}>
                    Choisir {plan.name} →
                  </button>
                </div>
              ))}
            </div>
            <p style={{ textAlign:'center', fontFamily:G.mono, fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:G.muted, marginTop:20 }}>Sans engagement</p>
          </div>
        )}

        {/* STEP 2: Form */}
        {step===2 && (
          <div style={{ maxWidth:480, margin:'0 auto' }}>
            <div style={{ background:G.paper, border:`1px solid ${G.rule}`, borderTop:`2px solid ${G.gold}`, padding:'40px 36px' }}>
              <div style={{ marginBottom:32 }}>
                <button onClick={() => setStep(1)} style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:G.muted, background:'none', border:'none', cursor:'pointer', marginBottom:20 }}>
                  ← Changer de plan
                </button>
                <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', color:G.gold, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                  Plan <span style={{ border:`1px solid ${G.goldBdr}`, padding:'2px 10px', background:G.goldBg }}>{selectedPlan?.toUpperCase()}</span>
                </div>
                <h1 style={{ fontFamily:G.display, fontSize:38, textTransform:'uppercase', lineHeight:.9, letterSpacing:'.02em', color:G.ink, margin:0 }}>
                  Créer<br />mon compte.
                </h1>
              </div>

              {error && (
                <div style={{ marginBottom:20, padding:'12px 16px', background:'rgba(239,68,68,0.06)', borderLeft:'2px solid #ef4444' }}>
                  <p style={{ fontFamily:G.mono, fontSize:11, color:'#ef4444', margin:0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {[
                  { label:selectedPlan==='club' ? 'Nom du directeur' : 'Nom complet', name:'name', type:'text', ph:'Jean Dupont', required:true },
                  ...(selectedPlan==='club' ? [{label:'Nom du club',name:'clubName',type:'text',ph:'FC Toulouse',required:true}] : []),
                  { label:'Email', name:'email', type:'email', ph:'votre@email.com', required:true },
                  { label:'Mot de passe', name:'password', type:'password', ph:'••••••••', required:true },
                  { label:'Confirmer le mot de passe', name:'confirmPassword', type:'password', ph:'••••••••', required:true },
                ].map(f => (
                  <div key={f.name} style={{ borderBottom:`1px solid ${G.rule}`, paddingBottom:16, marginBottom:16 }}>
                    <label style={{ fontFamily:G.mono, fontSize:8, letterSpacing:'.2em', textTransform:'uppercase', color:G.muted, display:'block', marginBottom:6 }}>{f.label}</label>
                    <input type={f.type} name={f.name} value={formData[f.name]} onChange={e => setFormData({...formData,[f.name]:e.target.value})}
                      placeholder={f.ph} required={f.required} style={inputStyle}
                      onFocus={e => e.target.style.borderBottomColor = G.gold}
                      onBlur={e => e.target.style.borderBottomColor = 'rgba(15,15,13,0.15)'}
                    />
                    {f.name==='password' && <p style={{ fontFamily:G.mono, fontSize:8, color:G.muted, marginTop:4, letterSpacing:'.06em' }}>Minimum 8 caractères</p>}
                  </div>
                ))}
                <button type="submit" disabled={loading} style={{
                  marginTop:12, padding:'14px',
                  background:loading ? 'rgba(201,162,39,0.5)' : G.gold,
                  color:G.ink, fontFamily:G.mono, fontSize:11,
                  letterSpacing:'.14em', textTransform:'uppercase', fontWeight:700,
                  border:'none', cursor:loading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  {loading ? 'Création...' : <>Créer mon compte <ArrowRight size={14} /></>}
                </button>
              </form>

              <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${G.rule}`, textAlign:'center' }}>
                <p style={{ fontFamily:G.mono, fontSize:10, color:G.muted }}>
                  Déjà un compte ?{' '}
                  <Link to="/login" style={{ color:G.gold, textDecoration:'none' }}>Se connecter</Link>
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
