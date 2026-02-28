import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`
const G = {
  paper:'#f5f2eb', cream:'#faf8f4',
  ink:'#0f0f0d', muted:'rgba(15,15,13,0.42)', rule:'rgba(15,15,13,0.09)',
  gold:'#c9a227', goldD:'#a8861f', goldBg:'rgba(201,162,39,0.07)', goldBdr:'rgba(201,162,39,0.25)',
  mono:"'JetBrains Mono', monospace", display:"'Anton', sans-serif",
  red:'#dc2626', redBg:'rgba(220,38,38,0.06)', redBdr:'rgba(220,38,38,0.2)',
  green:'#16a34a', greenBg:'rgba(22,163,74,0.06)', greenBdr:'rgba(22,163,74,0.2)',
}

const PLANS = [
  {
    id: 'coach', name: 'COACH', tag: 'Pour les coachs',
    isQuote: false, popular: false,
    features: [
      '4 matchs analysés / mois',
      '1 équipe',
      'Rapports collectifs et individuels',
      'Suivi progression match après match',
      'Tableau de bord complet',
      'Support dédié',
      'Accessible sur tous supports',
    ],
  },
  {
    id: 'club', name: 'CLUB', tag: '⚡ Pour les clubs',
    isQuote: true, popular: true,
    features: [
      'Nombre de matchs adapté à vos besoins',
      'Multi-équipes illimité',
      'Gestion effectif illimitée',
      'Vue globale club',
      'Multi-utilisateurs',
      'Dashboard club avancé',
      'Support prioritaire dédié',
    ],
  },
]

function SubscriptionPlans() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [coachLoading, setCoachLoading] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteSuccess, setQuoteSuccess] = useState(false)
  const [error, setError] = useState('')

  // Flow COACH — Stripe Checkout avec trial 7j
  const handleSelectCoach = async () => {
    if (!user) { navigate('/signup'); return }
    setError('')
    try {
      setCoachLoading(true)
      const response = await api.post('/subscription/create-checkout-session', {
        plan: 'coach',
        success_url: `${window.location.origin}/dashboard?payment=success`,
        cancel_url:  `${window.location.origin}/subscription/plans?payment=cancelled`,
      })
      window.location.href = response.data.url
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Erreur lors de la redirection vers le paiement. Réessayez ou contactez le support.')
      setCoachLoading(false)
    }
  }

  // Flow CLUB — demande de devis, pas de Stripe
  const handleRequestQuote = async () => {
    if (!user) { navigate('/signup?intent=club'); return }
    if (quoteSuccess) return
    setError('')
    try {
      setQuoteLoading(true)
      await api.post('/subscription/request-club-quote', { message: '' })
      setQuoteSuccess(true)
    } catch (err) {
      console.error('Quote error:', err)
      setError("Erreur lors de l'envoi. Contactez-nous : contact@insightball.com")
    } finally {
      setQuoteLoading(false)
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

        {/* Titre */}
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:G.gold, display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:16 }}>
            <span style={{ width:16, height:1, background:G.gold }} />Tarifs
          </div>
          <h1 style={{ fontFamily:G.display, fontSize:'clamp(52px,7vw,88px)', textTransform:'uppercase', lineHeight:.85, letterSpacing:'.01em', margin:0, color:G.ink }}>
            Choisissez<br /><span style={{ color:G.gold }}>votre offre.</span>
          </h1>
          {/* Bandeau trial — COACH uniquement, pas CLUB */}
          <div style={{ marginTop:20, display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', background:G.goldBg, border:`1px solid ${G.goldBdr}` }}>
            <span style={{ fontFamily:G.mono, fontSize:10, color:G.gold, letterSpacing:'.06em' }}>
              🎁 Plan COACH · 7 jours gratuits · Aucun débit aujourd'hui · Résiliable avant le premier prélèvement
            </span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:G.redBg, border:`1px solid ${G.redBdr}`, marginBottom:24 }}>
            <AlertCircle size={14} color={G.red} style={{ flexShrink:0 }} />
            <span style={{ fontFamily:G.mono, fontSize:10, color:G.red, letterSpacing:'.04em' }}>{error}</span>
          </div>
        )}
        {quoteSuccess && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:G.greenBg, border:`1px solid ${G.greenBdr}`, marginBottom:24 }}>
            <CheckCircle size={14} color={G.green} style={{ flexShrink:0 }} />
            <span style={{ fontFamily:G.mono, fontSize:10, color:G.green, letterSpacing:'.04em' }}>
              Demande envoyée ✓ — Nous vous contacterons sous 24h pour construire votre offre sur mesure.
            </span>
          </div>
        )}

        {/* Plans */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:G.rule, marginBottom:1 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ background:plan.popular ? G.goldBg : G.paper, padding:'44px 40px', position:'relative', borderTop:`2px solid ${plan.popular ? G.gold : G.rule}` }}>

              {plan.popular && (
                <div style={{ position:'absolute', top:20, right:20, fontFamily:G.mono, fontSize:8, letterSpacing:'.14em', textTransform:'uppercase', color:G.gold, border:`1px solid ${G.goldBdr}`, padding:'4px 10px', background:G.paper }}>
                  Sur devis
                </div>
              )}

              <span style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', color:G.gold, display:'block', marginBottom:12 }}>{plan.tag}</span>
              <div style={{ fontFamily:G.display, fontSize:32, textTransform:'uppercase', letterSpacing:'.03em', color:G.ink, marginBottom:20 }}>{plan.name}</div>

              {/* Prix */}
              {plan.isQuote ? (
                <div style={{ marginBottom:36 }}>
                  <div style={{ fontFamily:G.display, fontSize:44, lineHeight:1, color:G.ink }}>Sur devis</div>
                  <div style={{ fontFamily:G.mono, fontSize:10, color:G.muted, letterSpacing:'.08em', marginTop:6 }}>à partir de 99€/mois</div>
                </div>
              ) : (
                <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:36 }}>
                  <span style={{ fontFamily:G.display, fontSize:80, lineHeight:1, letterSpacing:'-.02em', color:G.ink }}>39</span>
                  <span style={{ fontFamily:G.mono, fontSize:10, color:G.muted, letterSpacing:'.08em' }}>€/mois</span>
                </div>
              )}

              {/* Features */}
              <ul style={{ listStyle:'none', padding:0, margin:'0 0 36px', display:'flex', flexDirection:'column', gap:9 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontFamily:G.mono, fontSize:11, color:G.ink, display:'flex', alignItems:'flex-start', gap:8, letterSpacing:'.04em' }}>
                    <span style={{ color:G.gold, flexShrink:0, marginTop:1 }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.isQuote ? (
                quoteSuccess ? (
                  <div style={{ width:'100%', padding:'14px', background:G.greenBg, border:`1px solid ${G.greenBdr}`, fontFamily:G.mono, fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:G.green, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <CheckCircle size={13} color={G.green} /> Demande envoyée
                  </div>
                ) : (
                  <button onClick={handleRequestQuote} disabled={quoteLoading}
                    style={{ width:'100%', padding:'14px', background:G.gold, color:G.ink, border:'none', fontFamily:G.mono, fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:700, cursor:quoteLoading ? 'not-allowed' : 'pointer', opacity:quoteLoading ? .6 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .15s' }}
                    onMouseEnter={e => { if(!quoteLoading) e.currentTarget.style.background = G.goldD }}
                    onMouseLeave={e => { if(!quoteLoading) e.currentTarget.style.background = G.gold }}
                  >
                    {quoteLoading
                      ? <><div style={{ width:12, height:12, border:`2px solid ${G.ink}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />Envoi...</>
                      : <>Demander un devis <ArrowRight size={13} /></>
                    }
                  </button>
                )
              ) : (
                <button onClick={handleSelectCoach} disabled={coachLoading}
                  style={{ width:'100%', padding:'14px', background:'transparent', color:G.ink, border:`1px solid ${G.rule}`, fontFamily:G.mono, fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:700, cursor:coachLoading ? 'not-allowed' : 'pointer', opacity:coachLoading ? .6 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .15s' }}
                >
                  {coachLoading
                    ? <><div style={{ width:12, height:12, border:`2px solid ${G.ink}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />Chargement...</>
                    : <>Essayer COACH gratuitement <ArrowRight size={13} /></>
                  }
                </button>
              )}

              {/* Sous-CTA */}
              <p style={{ fontFamily:G.mono, fontSize:8, color:G.muted, textAlign:'center', margin:'10px 0 0', letterSpacing:'.06em' }}>
                {plan.isQuote
                  ? 'Offre personnalisée · Démo sur demande · Sans engagement'
                  : '7 jours gratuits · puis 39€/mois · Résiliable à tout moment'
                }
              </p>
            </div>
          ))}
        </div>

        <p style={{ textAlign:'center', fontFamily:G.mono, fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:G.muted, marginTop:16 }}>
          Sans engagement · Paiement sécurisé Stripe · COACH : 7 jours gratuits inclus
        </p>

        {/* FAQ */}
        <div style={{ marginTop:56, background:G.paper, border:`1px solid ${G.rule}`, borderTop:`2px solid ${G.rule}`, padding:'40px' }}>
          <div style={{ fontFamily:G.mono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:G.gold, display:'flex', alignItems:'center', gap:8, marginBottom:28 }}>
            <span style={{ width:16, height:1, background:G.gold }} />Questions fréquentes
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:28 }}>
            {[
              { q:'Puis-je annuler ?',          a:'Oui, à tout moment depuis vos paramètres. Aucun engagement, aucune pénalité.' },
              { q:'Comment ça marche ?',         a:"Uploadez votre vidéo, notre IA l'analyse et vous recevez un rapport tactique complet." },
              { q:"Le plan CLUB, c'est quoi ?",  a:'Un plan sur mesure pour les clubs multi-équipes. Contactez-nous pour construire votre offre.' },
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
