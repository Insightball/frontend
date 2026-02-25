/**
 * RecoverAccount.jsx
 * Page de récupération de compte supprimé
 * URL : /recover?token=xxx
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API = 'https://backend-pued.onrender.com/api'

const G = {
  bg: '#0a0908', bg2: '#0f0e0c',
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.35)',
  text: '#f5f2eb', red: '#ef4444', green: '#22c55e',
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

export default function RecoverAccount() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [step, setStep] = useState('confirming') // confirming | success | error
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRecover = async () => {
    if (!token) { setStep('error'); setError('Lien invalide.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/account/recover?token=${token}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      setEmail(data.email || '')
      setStep('success')
    } catch (e) {
      setStep('error')
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`${FONTS} * { box-sizing: border-box; margin: 0; }`}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <span style={{ fontFamily: G.display, fontSize: 22, letterSpacing: '.08em', color: G.text }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </div>

        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.gold}`, padding: '36px 32px' }}>

          {/* ── Confirmation ── */}
          {step === 'confirming' && (
            <>
              <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 8 }}>
                Récupération de compte
              </p>
              <h1 style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: G.text, marginBottom: 20, lineHeight: 1.1 }}>
                Récupérer<br />mon compte
              </h1>
              <div style={{ width: 40, height: 2, background: G.gold, marginBottom: 24 }} />
              <p style={{ fontFamily: G.mono, fontSize: 12, color: G.muted, lineHeight: 1.7, letterSpacing: '.03em', marginBottom: 32 }}>
                En cliquant sur le bouton ci-dessous, votre compte sera restauré avec
                <strong style={{ color: G.text }}> toutes vos données</strong> — matchs, joueurs et statistiques.
              </p>

              {/* Checklist données récupérées */}
              <div style={{ background: G.goldBg, border: `1px solid ${G.goldBdr}`, padding: '16px 20px', marginBottom: 28 }}>
                <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Ce qui sera restauré</p>
                {['Tous vos matchs analysés', 'Vos joueurs et effectifs', 'Toutes vos statistiques', 'Votre plan et abonnement'].map(item => (
                  <p key={item} style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginBottom: 6, letterSpacing: '.03em' }}>
                    <span style={{ color: G.green, marginRight: 8 }}>✓</span>{item}
                  </p>
                ))}
              </div>

              <button onClick={handleRecover} disabled={loading} style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(201,162,39,0.4)' : G.gold,
                border: 'none', fontFamily: G.mono, fontSize: 10,
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: '#0f0f0d', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Récupération...' : 'Restaurer mon compte →'}
              </button>
            </>
          )}

          {/* ── Succès ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.25)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: G.green, fontSize: 26 }}>✓</div>
              <h1 style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: G.text, marginBottom: 12, lineHeight: 1.1 }}>
                Compte<br />récupéré !
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, letterSpacing: '.04em', lineHeight: 1.6, marginBottom: 32 }}>
                Votre compte est restauré. Un email de confirmation a été envoyé à <strong style={{ color: G.text }}>{email}</strong>.
              </p>
              <button onClick={() => navigate('/x-portal-7f2a/login')} style={{
                width: '100%', padding: '13px', background: G.gold,
                border: 'none', fontFamily: G.mono, fontSize: 10,
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: '#0f0f0d', fontWeight: 700, cursor: 'pointer',
              }}>
                Se connecter →
              </button>
            </div>
          )}

          {/* ── Erreur ── */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.25)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: G.red, fontSize: 26 }}>×</div>
              <h1 style={{ fontFamily: G.display, fontSize: 26, textTransform: 'uppercase', color: G.text, marginBottom: 12 }}>Lien invalide</h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, letterSpacing: '.04em', marginBottom: 28, lineHeight: 1.6 }}>
                {error}
              </p>
              <button onClick={() => navigate('/')} style={{
                width: '100%', padding: '11px', background: 'transparent',
                border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 10,
                letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer',
              }}>
                Retour à l'accueil
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
