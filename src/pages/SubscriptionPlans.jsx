import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`
const G = {
  paper:'#f5f2eb', cream:'#faf8f4',
  ink:'#0f0f0d', muted:'rgba(15,15,13,0.42)', rule:'rgba(15,15,13,0.09)',
  gold:'#c9a227', goldD:'#a8861f', goldBg:'rgba(201,162,39,0.07)', goldBdr:'rgba(201,162,39,0.25)',
  mono:"'JetBrains Mono', monospace", display:"'Anton', sans-serif",
}

function SubscriptionPlans() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading]           = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const plans = [
    { id:'coach', name:'COACH', price:39, tag:'Pour les coachs',
      features:['4 matchs analysés / mois','1 équipe','Rapports collectifs et individuels','Suivi progression match après match','Tableau de bord complet','Support dédié','Accessible sur tous supports'] },
    { id:'club', name:'CLUB', price:129, tag:'⚡ Recommandé', popular:true,
      features:['12 matchs analysés / mois','Multi-équipes','Gestion effectif illimitée','Vue globale club','Multi-utilisateurs','Dashboard club avancé','Support prioritaire dédié'] },
  ]

  const handleSelectPlan = async (planId) => {
    if (!user) { navigate('/signup'); return }
    try {
      setLoading(true); setSelectedPlan(planId)
      const response = await api.post('/subscription/create-checkout-session', {
        plan: planId,
        success_url: `${window.location.origin}/dashboard?payment=success`,
        cancel_url:  `${window.location.origin}/subscription/plans?payment=cancelled`,
      })
      window.location.href = response.data.url
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de la création de la session de paiement')
      setLoading(false); setSelectedPlan(null)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:G.cream, color:G.ink, padding:'0 40px 80px' }}>
      <style>{`${FONTS} * { box-sizing:border-box; } @keyframes spin { to { transform:rotate(360deg); } }`}</style>

      {/* Nav */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 0 60px', maxWidth:880, margin:'0 auto' }}>
        <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer' }}>
          <img src="/logo.svg" alt="" style={{ width:28, height:28 }} />
          <span style={{ fontFamily:G.display, fontSize:16, letterSpacing:'.06em', color:G.ink }}>
            INSIGHT<span style={{ color:G.gold }}>BALL</span>
          </span>
        </button>
        {user && (
          <button onClick={() => navigate('/dashboard')} style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:G.muted, background:'none', border:'none', cursor:'pointer' }}>
            Tableau de bord →
          </button>
        )}
      </div>

      <div style={{ maxWidth:880, margin:'0 auto' }}>

        {/* Title */}
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:G.gold, display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:16 }}>
            <span style={{ width:16, height:1, background:G.gold }} />Tarifs
          </div>
          <h1 style={{ fontFamily:G.display, fontSize:'clamp(52px,7vw,88px)', textTransform:'uppercase', lineHeight:.85, letterSpacing:'.01em', margin:0, color:G.ink }}>
            Choisissez<br /><span style={{ color:G.gold }}>votre offre.</span>
          </h1>
        </div>

        {/* Plans */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:G.rule, marginBottom:1 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ background:plan.popular ? G.goldBg : G.paper, padding:'44px 40px', position:'relative', borderTop:`2px solid ${plan.popular ? G.gold : G.rule}` }}>
              {plan.popular && (
                <div style={{ position:'absolute', top:20, right:20, fontFamily:G.mono, fontSize:8, letterSpacing:'.14em', textTransform:'uppercase', color:G.gold, border:`1px solid ${G.goldBdr}`, padding:'4px 10px', background:G.paper }}>
                  ⚡ Recommandé
                </div>
              )}
              <span style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', color:G.gold, display:'block', marginBottom:12 }}>{plan.tag}</span>
              <div style={{ fontFamily:G.display, fontSize:32, textTransform:'uppercase', letterSpacing:'.03em', color:G.ink, marginBottom:20 }}>{plan.name}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:36 }}>
                <span style={{ fontFamily:G.display, fontSize:80, lineHeight:1, letterSpacing:'-.02em', color:G.ink }}>{plan.price}</span>
                <div>

                  <span style={{ fontFamily:G.mono, fontSize:10, color:G.muted, letterSpacing:'.08em' }}>€/mois</span>
                </div>
              </div>
              <ul style={{ listStyle:'none', padding:0, margin:'0 0 36px', display:'flex', flexDirection:'column', gap:9 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontFamily:G.mono, fontSize:11, color:G.ink, display:'flex', alignItems:'flex-start', gap:8, letterSpacing:'.04em' }}>
                    <span style={{ color:G.gold, flexShrink:0, marginTop:1 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleSelectPlan(plan.id)} disabled={loading && selectedPlan===plan.id}
                style={{
                  width:'100%', padding:'14px',
                  background:plan.popular ? G.gold : 'transparent',
                  color:G.ink, border:plan.popular ? 'none' : `1px solid ${G.rule}`,
                  fontFamily:G.mono, fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:700,
                  cursor:loading && selectedPlan===plan.id ? 'not-allowed' : 'pointer',
                  opacity:loading && selectedPlan===plan.id ? .6 : 1,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .15s',
                }}
                onMouseEnter={e => { if(plan.popular) e.currentTarget.style.background = G.goldD }}
                onMouseLeave={e => { if(plan.popular) e.currentTarget.style.background = G.gold }}
              >
                {loading && selectedPlan===plan.id
                  ? <><div style={{ width:12, height:12, border:`2px solid ${G.ink}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />Chargement...</>
                  : <>Choisir {plan.name} <ArrowRight size={13} /></>
                }
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign:'center', fontFamily:G.mono, fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:G.muted, marginTop:16 }}>Sans engagement</p>

        {/* FAQ */}
        <div style={{ marginTop:56, background:G.paper, border:`1px solid ${G.rule}`, borderTop:`2px solid ${G.rule}`, padding:'40px' }}>
          <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:G.gold, display:'flex', alignItems:'center', gap:8, marginBottom:28 }}>
            <span style={{ width:16, height:1, background:G.gold }} />Questions fréquentes
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:28 }}>
            {[
              { q:'Puis-je annuler ?',        a:'Oui, à tout moment. Aucun engagement, aucune pénalité.' },
              { q:'Comment ça marche ?',       a:"Uploadez votre vidéo, notre IA l'analyse, vous recevez un rapport tactique complet." },
              { q:'Paiement sécurisé ?',       a:'100% sécurisé via Stripe. Vos données sont chiffrées et protégées.' },
            ].map(({q,a}) => (
              <div key={q}>
                <div style={{ fontFamily:G.mono, fontSize:10, fontWeight:700, letterSpacing:'.08em', color:G.ink, marginBottom:8 }}>{q}</div>
                <div style={{ fontFamily:G.mono, fontSize:12, color:G.muted, lineHeight:1.7 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:28 }}>
          <button onClick={() => navigate('/')} style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:G.muted, background:'none', border:'none', cursor:'pointer', transition:'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = G.gold}
            onMouseLeave={e => e.currentTarget.style.color = G.muted}>
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlans
