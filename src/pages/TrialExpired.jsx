import { useState } from 'react'
import { Lock, Zap, Users, ArrowRight, CreditCard, Shield } from 'lucide-react'
import api from '../services/api'

const G = {
  bg: '#0a0908', gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  text: '#f5f2eb', muted: 'rgba(245,242,235,0.45)', border: 'rgba(255,255,255,0.07)',
  green: '#22c55e', greenBg: 'rgba(34,197,94,0.06)', greenBdr: 'rgba(34,197,94,0.18)',
}

export default function TrialExpired() {
  const [coachLoading, setCoachLoading] = useState(false)
  const [error, setError] = useState('')

  const [copied, setCopied] = useState(false)

  // Flow COACH — Stripe Checkout
  const handleChooseCoach = async () => {
    setCoachLoading(true); setError('')
    try {
      const r = await api.post('/subscription/create-checkout-session', {
        plan: 'coach',
        success_url: `${window.location.origin}/dashboard?subscribed=true`,
        cancel_url:  `${window.location.origin}/dashboard`,
      })
      window.location.href = r.data.url
    } catch (e) {
      setError('Erreur lors de la redirection vers le paiement')
      setCoachLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,9,8,0.97)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Icône */}
      <div style={{ width: 52, height: 52, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <Lock size={20} color={G.gold} />
      </div>

      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>
          Période d'essai terminée
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,50px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: '0 0 14px' }}>
          Continuez avec<br /><span style={{ color: G.gold }}>INSIGHTBALL.</span>
        </h1>
        <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, maxWidth: 400, margin: '0 auto', lineHeight: 1.65 }}>
          Votre essai de 7 jours est terminé. Choisissez votre plan pour accéder à votre dashboard et à toutes vos analyses.
        </p>
      </div>

      {/* Bloc rassurant */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: G.greenBg, border: `1px solid ${G.greenBdr}`, marginBottom: 24, maxWidth: 560, width: '100%' }}>
        <Shield size={13} color={G.green} style={{ flexShrink: 0 }} />
        <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.55)', lineHeight: 1.6, margin: 0, letterSpacing: '.04em' }}>
          Paiement sécurisé Stripe · Premier débit au démarrage · Résiliable en 1 clic depuis vos paramètres, aucune question posée.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: '10px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontFamily: G.mono, fontSize: 11, color: '#ef4444', maxWidth: 560, width: '100%' }}>
          {typeof error === 'string' ? error : 'Une erreur est survenue'}
        </div>
      )}

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, background: G.border, width: '100%', maxWidth: 560, marginBottom: 20 }}>

        {/* COACH — Stripe Checkout */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: `2px solid ${G.gold}`, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={13} color={G.gold} />
              <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold }}>COACH</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: G.display, fontSize: 34, color: G.text, lineHeight: 1 }}>
                39<span style={{ fontFamily: G.mono, fontSize: 11, color: G.muted }}>€</span>
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted }}>/mois · 4 matchs</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {['Rapports PDF complets', 'Statistiques joueurs', 'Heatmaps tactiques', 'Support email'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 4, background: G.gold, flexShrink: 0 }} />
                <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>{f}</span>
              </div>
            ))}
          </div>

          <button onClick={handleChooseCoach} disabled={coachLoading} style={{
            marginTop: 'auto', padding: '12px',
            background: G.gold, border: 'none',
            color: '#0f0f0d',
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            fontWeight: 700, cursor: coachLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity .15s',
          }}
            onMouseEnter={e => { if (!coachLoading) e.currentTarget.style.opacity = '.85' }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {coachLoading
              ? <span style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
              : <><CreditCard size={11} /> Choisir COACH <ArrowRight size={11} /></>
            }
          </button>
        </div>

        {/* CLUB — Nous contacter */}
        <div style={{ background: 'rgba(201,162,39,0.04)', borderTop: `2px solid ${G.gold}`, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={13} color={G.gold} />
              <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold }}>CLUB</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: G.display, fontSize: 22, color: G.text, lineHeight: 1.1 }}>
                Sur mesure
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted }}>à partir de 99€/mois</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {['Multi-équipes illimité', 'Dashboard club', 'Matchs selon vos besoins', 'Support prioritaire'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 4, background: G.gold, flexShrink: 0 }} />
                <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, margin: 0 }}>Contactez-nous :</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: G.mono, fontSize: 11, color: G.text, fontWeight: 700 }}>contact@insightball.com</span>
              <button onClick={() => { navigator.clipboard.writeText('contact@insightball.com'); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{
                padding: '4px 10px', background: 'transparent', border: `1px solid ${G.goldBdr}`,
                fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
                color: copied ? G.green : G.muted, cursor: 'pointer', transition: 'color .15s',
              }}>
                {copied ? '✓ Copié' : 'Copier'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.18)', letterSpacing: '.06em', textAlign: 'center' }}>
        Sans engagement · Résiliable à tout moment · Paiement sécurisé Stripe
      </p>
    </div>
  )
}
