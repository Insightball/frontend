import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Users, Zap, ChevronRight, Plus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const G = {
  bg: '#0a0908', bg2: '#0f0e0c',
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.55)',
  text: '#f5f2eb', red: '#ef4444', green: '#22c55e',
}

const STEPS = [
  { id: 1, code: '01', label: 'Club' },
  { id: 2, code: '02', label: 'Effectif' },
  { id: 3, code: '03', label: 'Plan' },
]

const POSITIONS = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant']

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Club
  const [clubData, setClubData] = useState({ name: user?.club_name || '', primary_color: '#c9a227', secondary_color: '#0f0f0d' })

  // Step 2 — Joueurs
  const [players, setPlayers] = useState([])
  const [newPlayer, setNewPlayer] = useState({ name: '', number: '', position: 'Milieu' })
  const [addingPlayer, setAddingPlayer] = useState(false)

  // Step 3 — Plan (si pas encore abonné)
  const hasSubscription = user?.plan && user.plan !== 'FREE'

  const handleAddPlayer = () => {
    if (!newPlayer.name.trim()) return
    setPlayers(prev => [...prev, { ...newPlayer, id: Date.now() }])
    setNewPlayer({ name: '', number: '', position: 'Milieu' })
    setAddingPlayer(false)
  }

  const handleRemovePlayer = (id) => setPlayers(prev => prev.filter(p => p.id !== id))

  const handleSaveClub = async () => {
    if (!clubData.name.trim()) { setError('Nom du club requis'); return }
    setSaving(true); setError('')
    try {
      await api.patch('/club/me', {
        name: clubData.name,
        primary_color: clubData.primary_color,
        secondary_color: clubData.secondary_color,
      })
      setStep(2)
    } catch (e) {
      setError('Erreur lors de la sauvegarde')
    } finally { setSaving(false) }
  }

  const handleSavePlayers = async () => {
    setSaving(true); setError('')
    try {
      for (const p of players) {
        await api.post('/players/', { name: p.name, number: parseInt(p.number) || null, position: p.position })
      }
      if (hasSubscription) { navigate('/dashboard') } else { setStep(3) }
    } catch (e) {
      setError('Erreur lors de l\'ajout des joueurs')
    } finally { setSaving(false) }
  }

  const handleChoosePlan = async (plan) => {
    setSaving(true)
    try {
      const r = await api.post('/subscription/create-checkout-session', {
        plan: plan.toLowerCase(),
        success_url: `${window.location.origin}/dashboard?subscribed=true`,
        cancel_url: `${window.location.origin}/onboarding`,
      })
      window.location.href = r.data.url
    } catch (e) {
      setError('Erreur Stripe')
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(245,242,235,0.18); font-family: 'JetBrains Mono',monospace; font-size: 12px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .step-card { animation: fadeUp .3s ease forwards; }
      `}</style>

      {/* Header */}
      <header style={{ height: 60, borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
        <div style={{ fontFamily: G.display, fontSize: 16, letterSpacing: '.08em', color: G.text }}>
          INSIGHT<span style={{ color: G.gold }}>BALL</span>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
          Passer →
        </button>
      </header>

      {/* Progress bar */}
      <div style={{ height: 2, background: G.border }}>
        <div style={{ height: '100%', background: G.gold, width: `${(step / 3) * 100}%`, transition: 'width .4s ease' }} />
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 24px 0', gap: 0 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28,
                background: step > s.id ? G.gold : step === s.id ? G.goldBg : 'transparent',
                border: `1px solid ${step >= s.id ? G.goldBdr : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {step > s.id
                  ? <Check size={12} color={G.bg} strokeWidth={3} />
                  : <span style={{ fontFamily: G.mono, fontSize: 9, color: step === s.id ? G.gold : 'rgba(255,255,255,0.25)', letterSpacing: '.08em' }}>{s.code}</span>
                }
              </div>
              <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: step >= s.id ? G.gold : 'rgba(255,255,255,0.2)' }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: step > s.id ? G.gold : 'rgba(255,255,255,0.1)', margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        {/* ── STEP 1 — CLUB ── */}
        {step === 1 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ marginBottom: 36, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 1 sur 3</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(40px,5vw,56px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>club.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>
                Personnalisez l'identité de votre club
              </p>
            </div>

            <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.gold}`, padding: '32px' }}>
              {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderLeft: `2px solid ${G.red}`, fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</div>}

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 8 }}>Nom du club *</label>
                <input value={clubData.name} onChange={e => setClubData(p => ({ ...p, name: e.target.value }))}
                  placeholder="FC Toulouse"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, padding: '12px 14px', color: G.text, fontFamily: G.mono, fontSize: 13, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = G.goldBdr}
                  onBlur={e => e.target.style.borderColor = G.border} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Couleur principale', key: 'primary_color' },
                  { label: 'Couleur secondaire', key: 'secondary_color' },
                ].map(c => (
                  <div key={c.key}>
                    <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 8 }}>{c.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}` }}>
                      <input type="color" value={clubData[c.key]} onChange={e => setClubData(p => ({ ...p, [c.key]: e.target.value }))}
                        style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                      <span style={{ fontFamily: G.mono, fontSize: 11, color: G.muted }}>{clubData[c.key]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Aperçu badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}` }}>
                  <div style={{ width: 36, height: 36, background: clubData.primary_color, border: `2px solid ${clubData.secondary_color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: G.display, fontSize: 13, color: clubData.secondary_color }}>
                      {clubData.name ? clubData.name.slice(0, 2).toUpperCase() : 'FC'}
                    </span>
                  </div>
                  <span style={{ fontFamily: G.mono, fontSize: 11, color: G.text }}>{clubData.name || 'Nom du club'}</span>
                </div>
              </div>

              <button onClick={handleSaveClub} disabled={saving} style={{
                width: '100%', padding: '14px', background: saving ? 'rgba(201,162,39,0.4)' : G.gold,
                color: G.bg, fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
                fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {saving ? <><span style={{ width: 12, height: 12, border: `2px solid ${G.bg}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} /></> : <>Continuer <ArrowRight size={13} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 — EFFECTIF ── */}
        {step === 2 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ marginBottom: 36, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 2 sur 3</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(40px,5vw,56px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>effectif.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>
                Ajoutez vos joueurs — vous pourrez en ajouter d'autres plus tard
              </p>
            </div>

            <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.gold}`, padding: '32px' }}>
              {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderLeft: `2px solid ${G.red}`, fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</div>}

              {/* Liste joueurs */}
              {players.length > 0 && (
                <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
                  {players.map(p => (
                    <div key={p.id} style={{ background: G.bg2, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 28, height: 28, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: G.mono, fontSize: 9, color: G.gold }}>{p.number || '—'}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: G.mono, fontSize: 11, color: G.text }}>{p.name}</div>
                        <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>{p.position}</div>
                      </div>
                      <button onClick={() => handleRemovePlayer(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <X size={12} color={G.muted} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulaire ajout joueur */}
              {addingPlayer ? (
                <div style={{ background: 'rgba(201,162,39,0.04)', border: `1px solid ${G.goldBdr}`, padding: '16px', marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10, marginBottom: 10 }}>
                    <input value={newPlayer.name} onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))}
                      placeholder="Nom du joueur" autoFocus
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, padding: '10px 12px', color: G.text, fontFamily: G.mono, fontSize: 12, outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = G.goldBdr}
                      onBlur={e => e.target.style.borderColor = G.border}
                      onKeyDown={e => e.key === 'Enter' && handleAddPlayer()} />
                    <input value={newPlayer.number} onChange={e => setNewPlayer(p => ({ ...p, number: e.target.value }))}
                      placeholder="N°" type="number"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, padding: '10px 12px', color: G.text, fontFamily: G.mono, fontSize: 12, outline: 'none', textAlign: 'center' }}
                      onFocus={e => e.target.style.borderColor = G.goldBdr}
                      onBlur={e => e.target.style.borderColor = G.border} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {POSITIONS.map(pos => (
                      <button key={pos} onClick={() => setNewPlayer(p => ({ ...p, position: pos }))} style={{
                        padding: '5px 10px', fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
                        background: newPlayer.position === pos ? G.goldBg : 'transparent',
                        border: `1px solid ${newPlayer.position === pos ? G.goldBdr : 'rgba(255,255,255,0.1)'}`,
                        color: newPlayer.position === pos ? G.gold : G.muted, cursor: 'pointer',
                      }}>{pos}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setAddingPlayer(false)} style={{ flex: 1, padding: '9px', background: 'transparent', border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>Annuler</button>
                    <button onClick={handleAddPlayer} style={{ flex: 2, padding: '9px', background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.bg, fontWeight: 700, cursor: 'pointer' }}>
                      Ajouter
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingPlayer(true)} style={{
                  width: '100%', padding: '12px', marginBottom: 16,
                  background: 'transparent', border: `1px dashed ${G.goldBdr}`,
                  fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
                  color: G.gold, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Plus size={12} /> Ajouter un joueur
                </button>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setSaving(false); setStep(1) }} style={{ padding: '14px 20px', background: 'transparent', border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>
                  ←
                </button>
                <button onClick={handleSavePlayers} disabled={saving} style={{
                  flex: 1, padding: '14px', background: saving ? 'rgba(201,162,39,0.4)' : G.gold,
                  color: G.bg, fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
                  fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {saving
                    ? <span style={{ width: 12, height: 12, border: `2px solid ${G.bg}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
                    : players.length > 0 ? <>Enregistrer {players.length} joueur{players.length > 1 ? 's' : ''} <ArrowRight size={13} /></> : <>Passer cette étape <ChevronRight size={13} /></>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 — PLAN ── */}
        {step === 3 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 680 }}>
            <div style={{ marginBottom: 36, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 3 sur 3</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(40px,5vw,56px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>plan.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>
                Sans engagement · Résiliable à tout moment
              </p>
            </div>

            {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderLeft: `2px solid ${G.red}`, fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border, marginBottom: 16 }}>
              {[
                { id: 'COACH', icon: Zap, price: 29, color: G.gold, features: ['5 matchs / mois', 'Rapports PDF', 'Statistiques joueurs', 'Support email'] },
                { id: 'CLUB', icon: Users, price: 99, color: '#3b82f6', popular: true, features: ['20 matchs / mois', 'Multi-coachs', 'Gestion équipe complète', 'Support prioritaire'] },
              ].map(plan => {
                const Icon = plan.icon
                return (
                  <div key={plan.id} style={{ background: G.bg2, padding: '28px 24px', borderTop: `2px solid ${plan.color}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon size={14} color={plan.color} />
                        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: plan.color }}>{plan.id}</span>
                      </div>
                      <div style={{ fontFamily: G.display, fontSize: 32, color: G.text, lineHeight: 1 }}>
                        {plan.price}<span style={{ fontFamily: G.mono, fontSize: 11, color: G.muted }}>€/m</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 4, height: 4, background: plan.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => handleChoosePlan(plan.id)} disabled={saving} style={{
                      padding: '12px', marginTop: 'auto',
                      background: plan.color === G.gold ? G.gold : 'rgba(59,130,246,0.12)',
                      border: plan.color !== G.gold ? '1px solid rgba(59,130,246,0.35)' : 'none',
                      color: plan.color === G.gold ? G.bg : '#3b82f6',
                      fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
                      fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                    }}>
                      {saving ? '...' : `Choisir ${plan.id} →`}
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={() => navigate('/dashboard')} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.30)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Continuer sans abonnement →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
