import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Check, Lock, X } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { T, globalStyles } from '../theme'

// Overlay fullscreen → intentionnellement dark
const G = {
  bg:     T.dark,    bg2:     T.dark2,
  gold:   T.gold,    goldD:   T.goldD,
  goldBg: T.goldBg2, goldBdr: T.goldBdr,
  mono:   T.mono,    display: T.display,
  border: 'rgba(255,255,255,0.07)',
  muted:  'rgba(245,242,235,0.50)',
  text:   '#f5f2eb',
}

function Spinner() {
  return <span style={{ width: 13, height: 13, border: `2px solid ${G.bg}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
}

// ── Composant principal exporté ────────────────────────────────
// Usage : <TrialUpgradeGate onClose={() => ...} />
// S'affiche en overlay fullscreen quand l'user trial veut un 2ème match

export default function TrialUpgradeGate({ onClose }) {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirming, setConfirming] = useState(false) // étape confirmation avant débit
  const [error, setError] = useState('')

  const handleConfirmCoach = async () => {
    setLoading(true); setError('')
    try {
      // trial_end='now' → prélevé immédiatement, quota 4/mois débloqué
      await api.post('/subscription/end-trial')
      setSuccess(true)
      if (refreshUser) await refreshUser()
      setTimeout(() => {
        onClose?.()
        navigate('/dashboard/matches/upload')
      }, 2000)
    } catch (e) {
      const detail = e?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Erreur — réessayez')
      setLoading(false)
      setConfirming(false)
    }
  }

  const features = [
    '4 matchs analysés par mois',
    'Rapports tactiques PDF complets',
    'Statistiques individuelles joueurs',
    'Heatmaps & données de performance',
    'Suivi progression match après match',
  ]

  return (
    <>
      <style>{`${globalStyles} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,9,8,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn .25s ease',
        backdropFilter: 'blur(6px)',
      }}>

        <div style={{
          width: '100%', maxWidth: 480,
          background: G.bg2,
          border: `1px solid ${G.goldBdr}`,
          borderTop: `3px solid ${G.gold}`,
          animation: 'slideUp .3s ease',
          position: 'relative',
        }}>

          {/* Bouton fermer */}
          {onClose && (
            <button onClick={onClose} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            }}>
              <X size={14} color={G.muted} />
            </button>
          )}

          {/* Header */}
          <div style={{ padding: '32px 32px 24px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: G.goldBg, border: `1px solid ${G.goldBdr}`,
              padding: '6px 14px', marginBottom: 20,
            }}>
              <Zap size={11} color={G.gold} />
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold }}>
                Match offert utilisé
              </span>
            </div>

            <h2 style={{
              fontFamily: G.display, fontSize: 42, textTransform: 'uppercase',
              lineHeight: .88, letterSpacing: '.01em', color: G.text, margin: '0 0 14px',
            }}>
              Continuez à<br /><span style={{ color: G.gold }}>analyser.</span>
            </h2>

            <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, lineHeight: 1.7, margin: 0 }}>
              Votre match gratuit a été utilisé. Activez le plan Coach pour débloquer <strong style={{ color: G.text }}>4 matchs par mois</strong> dès maintenant.
            </p>
          </div>

          {/* Séparateur */}
          <div style={{ height: 1, background: G.border }} />

          {/* Prix */}
          <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: G.display, fontSize: 56, lineHeight: 1, color: G.text }}>39</span>
            <div>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: G.gold }}>€/mois</div>
              <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>prélevé aujourd'hui</div>
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: '0 32px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, background: G.goldBg, border: `1px solid ${G.goldBdr}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Check size={10} color={G.gold} />
                </div>
                <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.04em' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Séparateur */}
          <div style={{ height: 1, background: G.border }} />

          {/* CTA */}
          <div style={{ padding: '20px 32px 28px' }}>
            {error && (
              <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: G.mono, fontSize: 10, color: '#ef4444', letterSpacing: '.04em' }}>
                  ⚠ {error}
                </span>
              </div>
            )}

            {success ? (
              <div style={{
                padding: '14px', background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Check size={14} color="#22c55e" />
                <span style={{ fontFamily: G.mono, fontSize: 10, color: '#22c55e', letterSpacing: '.06em' }}>
                  Plan activé — redirection en cours...
                </span>
              </div>
            ) : confirming ? (
              // ── Étape confirmation — résumé avant débit ──
              <>
                <div style={{ marginBottom: 16, padding: '14px 16px', background: G.goldBg, border: `1px solid ${G.goldBdr}` }}>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 10 }}>
                    Ce qui va se passer
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      '⚡ Votre trial se termine maintenant',
                      '💳 39€ prélevés immédiatement',
                      '📊 4 matchs/mois débloqués',
                      '🔁 Renouvellement mensuel automatique',
                      '❌ Résiliable à tout moment depuis les paramètres',
                    ].map(item => (
                      <div key={item} style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, lineHeight: 1.5 }}>{item}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <button
                    onClick={() => { setConfirming(false); setError('') }}
                    style={{
                      flex: 1, padding: '13px', background: 'transparent',
                      border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9,
                      letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted,
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmCoach}
                    disabled={loading}
                    style={{
                      flex: 2, padding: '13px',
                      background: loading ? 'rgba(201,162,39,0.5)' : G.gold,
                      border: 'none', color: G.bg,
                      fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em',
                      textTransform: 'uppercase', fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = G.goldD }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = G.gold }}
                  >
                    {loading ? <><Spinner /> Activation...</> : <>💳 Payer 39€ maintenant</>}
                  </button>
                </div>
              </>
            ) : (
              // ── Bouton principal ──
              <>
                <button
                  onClick={() => setConfirming(true)}
                  style={{
                    width: '100%', padding: '15px',
                    background: G.gold,
                    border: 'none', color: G.bg,
                    fontFamily: G.mono, fontSize: 11, letterSpacing: '.14em',
                    textTransform: 'uppercase', fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    marginBottom: 12, transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                  onMouseLeave={e => e.currentTarget.style.background = G.gold}
                >
                  Activer le plan Coach <ArrowRight size={13} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Lock size={10} color={G.muted} />
                  <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.28)', letterSpacing: '.06em' }}>
                    Paiement sécurisé Stripe · Résiliable à tout moment
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
