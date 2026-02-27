import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Users, Zap, ChevronRight, Plus, X, Video, Smartphone, Camera, CreditCard, Lock } from 'lucide-react'
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

// 5 étapes désormais : Profil / Club / Effectif / Filming / Plan
const STEPS = [
  { id: 1, code: '01', label: 'Profil'   },
  { id: 2, code: '02', label: 'Club'     },
  { id: 3, code: '03', label: 'Effectif' },
  { id: 4, code: '04', label: 'Tournage' },
  { id: 5, code: '05', label: 'Plan'     },
]

const ROLES     = ['Éducateur', 'Entraîneur', 'Directeur Sportif', 'Analyste Vidéo']
const LEVELS    = ['National', 'Régional', 'Départemental']
const DIPLOMAS  = ['CFI', 'DF', 'BMF', 'BEF', 'DES', 'BEPF']
const POSITIONS = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant']

const FILMING_OPTIONS = [
  {
    id: 'smartphone_hand',
    icon: Smartphone,
    label: 'Smartphone à la main',
    desc: 'Quelqu\'un filme en suivant le jeu depuis le bord du terrain',
  },
  {
    id: 'smartphone_fixed',
    icon: Smartphone,
    label: 'Smartphone fixe',
    desc: 'Posé sur trépied ou tribunes, plan large, sans bougé',
  },
  {
    id: 'camera_fixed',
    icon: Camera,
    label: 'Caméra / GoPro fixe',
    desc: 'Caméra dédiée sur pied ou tribune, plan large stable',
  },
  {
    id: 'drone',
    icon: Video,
    label: 'Drone',
    desc: 'Vue du dessus, plan d\'ensemble du terrain',
  },
  {
    id: 'multiple',
    icon: Video,
    label: 'Plusieurs angles',
    desc: 'Plusieurs caméras ou combinaison de sources',
  },
  {
    id: 'no_setup',
    icon: Video,
    label: 'Pas encore de setup',
    desc: 'Je cherche comment filmer, j\'ai besoin de conseils',
  },
]

const inputStyle = (focused) => ({
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${focused ? G.goldBdr : G.border}`,
  padding: '12px 14px',
  color: G.text,
  fontFamily: G.mono,
  fontSize: 12,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .15s',
})

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Step 1 — Profil
  const [profileData, setProfileData] = useState({ role: '', level: '', phone: '', city: '', diploma: '' })

  // Step 2 — Club
  const [clubData, setClubData] = useState({ name: user?.club_name || '', primary_color: '#c9a227', secondary_color: '#0f0f0d' })

  // Step 3 — Joueurs
  const [players, setPlayers]         = useState([])
  const [newPlayer, setNewPlayer]     = useState({ name: '', number: '', position: 'Milieu' })
  const [addingPlayer, setAddingPlayer] = useState(false)

  // Step 4 — Filming
  const [filmingSetup, setFilmingSetup] = useState('')

  // Step 5 — Plan
  const hasSubscription = user?.plan && user.plan !== 'FREE'

  /* ── Handlers ── */
  const handleAddPlayer = () => {
    if (!newPlayer.name.trim()) return
    setPlayers(prev => [...prev, { ...newPlayer, id: Date.now() }])
    setNewPlayer({ name: '', number: '', position: 'Milieu' })
    setAddingPlayer(false)
  }
  const handleRemovePlayer = (id) => setPlayers(prev => prev.filter(p => p.id !== id))

  const handleSaveProfile = async () => {
    if (!profileData.role || !profileData.level) { setError('Poste et niveau requis'); return }
    setSaving(true); setError('')
    try {
      await api.patch('/account/profile', {
        role: profileData.role, level: profileData.level,
        phone: profileData.phone, city: profileData.city,
      })
    } catch (e) { console.warn('Profile save failed:', e) }
    finally { setSaving(false) }
    setStep(2)
  }

  const handleSaveClub = async () => {
    if (!clubData.name.trim()) { setError('Nom du club requis'); return }
    setSaving(true); setError('')
    try {
      try {
        await api.patch('/club/me', {
          name: clubData.name,
          primary_color: clubData.primary_color,
          secondary_color: clubData.secondary_color,
        })
      } catch (e) {
        if (e?.response?.status === 404) {
          await api.post('/club/', {
            name: clubData.name,
            primary_color: clubData.primary_color,
            secondary_color: clubData.secondary_color,
          })
        } else throw e
      }
      setStep(3)
    } catch (e) { setError('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  const handleSavePlayers = async () => {
    setSaving(true); setError('')
    try {
      for (const p of players) {
        await api.post('/players/', { name: p.name, number: parseInt(p.number) || null, position: p.position })
      }
      setStep(4)
    } catch (e) { setError("Erreur lors de l'ajout des joueurs") }
    finally { setSaving(false) }
  }

  const handleSaveFilming = async () => {
    // Sauvegarde non bloquante — si l'endpoint n'existe pas encore c'est ok
    try {
      await api.patch('/account/profile', { filming_setup: filmingSetup })
    } catch (e) { console.warn('filming save failed', e) }
    if (hasSubscription) { navigate('/dashboard') } else { setStep(5) }
  }

  const handleChoosePlan = async (plan) => {
    setSaving(true)
    try {
      const r = await api.post('/subscription/create-checkout-session', {
        plan: plan.toLowerCase(),
        success_url: `${window.location.origin}/dashboard?subscribed=true`,
        cancel_url:  `${window.location.origin}/onboarding`,
      })
      window.location.href = r.data.url
    } catch (e) { setError('Erreur Stripe'); setSaving(false) }
  }

  const totalSteps = 5

  return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(245,242,235,0.18); font-family: 'JetBrains Mono',monospace; font-size: 12px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
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
        <div style={{ height: '100%', background: G.gold, width: `${(step / totalSteps) * 100}%`, transition: 'width .4s ease' }} />
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 24px 0', gap: 0, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 26, height: 26,
                background: step > s.id ? G.gold : step === s.id ? G.goldBg : 'transparent',
                border: `1px solid ${step >= s.id ? G.goldBdr : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {step > s.id
                  ? <Check size={11} color={G.bg} strokeWidth={3} />
                  : <span style={{ fontFamily: G.mono, fontSize: 8, color: step === s.id ? G.gold : 'rgba(255,255,255,0.2)', letterSpacing: '.06em' }}>{s.code}</span>
                }
              </div>
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: step >= s.id ? G.gold : 'rgba(255,255,255,0.18)' }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: step > s.id ? G.gold : 'rgba(255,255,255,0.1)', margin: '0 10px' }} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 24px' }}>

        {/* ── STEP 1 — PROFIL ── */}
        {step === 1 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 1 sur 5</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>profil.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>Dites-nous qui vous êtes</p>
            </div>

            {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderLeft: `2px solid ${G.red}`, fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', marginBottom: 8 }}>Votre rôle *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ROLES.map(r => (
                    <button key={r} onClick={() => setProfileData(p => ({ ...p, role: r }))} style={{
                      padding: '7px 14px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em',
                      background: profileData.role === r ? G.goldBg : 'transparent',
                      border: `1px solid ${profileData.role === r ? G.goldBdr : 'rgba(255,255,255,0.1)'}`,
                      color: profileData.role === r ? G.gold : G.muted, cursor: 'pointer',
                    }}>{r}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', marginBottom: 8 }}>Niveau de compétition *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setProfileData(p => ({ ...p, level: l }))} style={{
                      padding: '7px 14px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em',
                      background: profileData.level === l ? G.goldBg : 'transparent',
                      border: `1px solid ${profileData.level === l ? G.goldBdr : 'rgba(255,255,255,0.1)'}`,
                      color: profileData.level === l ? G.gold : G.muted, cursor: 'pointer',
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', marginBottom: 8 }}>Diplôme <span style={{ color: 'rgba(245,242,235,0.2)' }}>(optionnel)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {DIPLOMAS.map(d => (
                    <button key={d} onClick={() => setProfileData(p => ({ ...p, diploma: profileData.diploma === d ? '' : d }))} style={{
                      padding: '7px 14px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em',
                      background: profileData.diploma === d ? G.goldBg : 'transparent',
                      border: `1px solid ${profileData.diploma === d ? G.goldBdr : 'rgba(255,255,255,0.1)'}`,
                      color: profileData.diploma === d ? G.gold : G.muted, cursor: 'pointer',
                    }}>{d}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', marginBottom: 8 }}>Téléphone</label>
                  <input value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+33 6 00 00 00 00" type="tel"
                    style={inputStyle(false)}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = G.border} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', marginBottom: 8 }}>Ville</label>
                  <input value={profileData.city} onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))}
                    placeholder="Ville"
                    style={inputStyle(false)}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = G.border} />
                </div>
              </div>
            </div>

            <BtnPrimary onClick={handleSaveProfile} saving={saving} label="Continuer" />
          </div>
        )}

        {/* ── STEP 2 — CLUB ── */}
        {step === 2 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 2 sur 5</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>club.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>Quelques infos sur votre structure</p>
            </div>

            {error && <ErrBox msg={error} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.4)', marginBottom: 8 }}>Nom du club *</label>
                <input value={clubData.name} onChange={e => setClubData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex : FC Lyon Nord"
                  style={inputStyle(false)}
                  onFocus={e => e.target.style.borderColor = G.goldBdr}
                  onBlur={e => e.target.style.borderColor = G.border} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <BtnBack onClick={() => setStep(1)} />
              <BtnPrimary onClick={handleSaveClub} saving={saving} label="Continuer" flex />
            </div>
          </div>
        )}

        {/* ── STEP 3 — EFFECTIF ── */}
        {step === 3 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 520 }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 3 sur 5</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>effectif.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>Optionnel — vous pouvez ajouter vos joueurs plus tard</p>
            </div>

            {error && <ErrBox msg={error} />}

            {players.length > 0 && (
              <div style={{ background: G.bg2, border: `1px solid ${G.border}`, marginBottom: 12 }}>
                {players.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < players.length - 1 ? `1px solid ${G.border}` : 'none' }}>
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

            {addingPlayer ? (
              <div style={{ background: 'rgba(201,162,39,0.04)', border: `1px solid ${G.goldBdr}`, padding: '16px', marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10, marginBottom: 10 }}>
                  <input value={newPlayer.name} onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nom du joueur" autoFocus
                    style={inputStyle(false)}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = G.border}
                    onKeyDown={e => e.key === 'Enter' && handleAddPlayer()} />
                  <input value={newPlayer.number} onChange={e => setNewPlayer(p => ({ ...p, number: e.target.value }))}
                    placeholder="N°" type="number"
                    style={{ ...inputStyle(false), textAlign: 'center' }}
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
                  <button onClick={handleAddPlayer} style={{ flex: 2, padding: '9px', background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.bg, fontWeight: 700, cursor: 'pointer' }}>Ajouter</button>
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
              <BtnBack onClick={() => setStep(2)} />
              <BtnPrimary onClick={handleSavePlayers} saving={saving} flex
                label={players.length > 0 ? `Enregistrer ${players.length} joueur${players.length > 1 ? 's' : ''}` : 'Passer cette étape'} />
            </div>
          </div>
        )}

        {/* ── STEP 4 — FILMING SETUP ── */}
        {step === 4 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 580 }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 4 sur 5</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Comment vous<br /><span style={{ color: G.gold }}>filmez ?</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em', lineHeight: 1.6 }}>
                Ça nous aide à optimiser l'analyse pour votre setup.<br />
                <span style={{ color: 'rgba(245,242,235,0.3)' }}>Optionnel — vous pouvez répondre plus tard</span>
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: G.border, marginBottom: 20 }}>
              {FILMING_OPTIONS.map(opt => {
                const Icon = opt.icon
                const selected = filmingSetup === opt.id
                return (
                  <button key={opt.id} onClick={() => setFilmingSetup(selected ? '' : opt.id)} style={{
                    padding: '18px 16px', background: selected ? 'rgba(201,162,39,0.06)' : G.bg2,
                    border: 'none',
                    borderLeft: selected ? `3px solid ${G.gold}` : '3px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background .15s',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = G.bg2 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon size={13} color={selected ? G.gold : 'rgba(245,242,235,0.4)'} />
                        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: selected ? G.gold : 'rgba(245,242,235,0.6)', fontWeight: 700 }}>
                          {opt.label}
                        </span>
                      </div>
                      {selected && (
                        <div style={{ width: 16, height: 16, background: G.gold, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={9} color={G.bg} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.35)', lineHeight: 1.5, margin: 0 }}>
                      {opt.desc}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Conseil si "pas encore de setup" */}
            {filmingSetup === 'no_setup' && (
              <div style={{ padding: '14px 16px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, marginBottom: 16 }}>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 6 }}>💡 Notre recommandation</div>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.65)', lineHeight: 1.6, margin: 0 }}>
                  Un smartphone posé sur un trépied en tribune, à 5-7m de hauteur, plan large centré sur le terrain. C'est le setup le plus simple et celui qui donne les meilleurs résultats avec InsightBall.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <BtnBack onClick={() => setStep(3)} />
              <BtnPrimary onClick={handleSaveFilming} saving={saving} flex
                label={filmingSetup ? 'Continuer' : 'Passer cette étape'} />
            </div>
          </div>
        )}

        {/* ── STEP 5 — PLAN ── */}
        {step === 5 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 680 }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 5 sur 5</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>plan.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em', lineHeight: 1.7 }}>
                7 jours d'essai gratuit · 1 match analysé offert · Sans engagement
              </p>
            </div>

            {/* Bloc rassurant CB */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', marginBottom: 24 }}>
              <Lock size={13} color={G.green} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.green, marginBottom: 4 }}>Carte bancaire requise — aucun prélèvement aujourd'hui</div>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.50)', lineHeight: 1.6, margin: 0 }}>
                  Votre CB ne sera débitée qu'au bout de 7 jours. Vous recevrez un rappel e-mail 2 jours avant. Résiliable en 1 clic depuis votre compte, aucune question posée.
                </p>
              </div>
            </div>

            {error && <ErrBox msg={error} />}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: G.border, marginBottom: 16 }}>
              {[
                {
                  id: 'COACH', icon: Zap, color: G.gold,
                  price: '39', trialLabel: 'Puis 39€/mois',
                  quota: '4 matchs / mois',
                  features: ['Rapports PDF complets', 'Statistiques joueurs', 'Heatmaps tactiques', 'Support email'],
                },
                {
                  id: 'CLUB', icon: Users, color: '#3b82f6',
                  price: '129', trialLabel: 'Puis 129€/mois',
                  quota: '12 matchs / mois',
                  features: ['Tout le plan Coach', 'Multi-équipes', 'Dashboard directeur sportif', 'Support prioritaire'],
                  popular: true,
                },
              ].map(plan => {
                const Icon = plan.icon
                return (
                  <div key={plan.id} style={{
                    background: plan.popular ? 'rgba(201,162,39,0.04)' : G.bg2,
                    borderTop: `2px solid ${plan.color}`,
                    padding: '24px 20px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    {plan.popular && (
                      <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, border: `1px solid ${G.goldBdr}`, padding: '3px 10px', alignSelf: 'flex-start', background: 'rgba(10,9,8,0.8)' }}>
                        ⚡ Recommandé
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon size={14} color={plan.color} />
                        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: plan.color }}>{plan.id}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: G.display, fontSize: 34, color: G.text, lineHeight: 1 }}>
                          0<span style={{ fontFamily: G.mono, fontSize: 11, color: G.muted }}>€</span>
                        </div>
                        <div style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(245,242,235,0.35)' }}>7 jours · {plan.quota}</div>
                      </div>
                    </div>

                    <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.35)', padding: '6px 10px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${G.border}` }}>
                      {plan.trialLabel} après l'essai
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 4, height: 4, background: plan.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => handleChoosePlan(plan.id)} disabled={!!saving} style={{
                      marginTop: 'auto', padding: '12px',
                      background: plan.color === G.gold ? G.gold : 'rgba(59,130,246,0.12)',
                      border: plan.color !== G.gold ? '1px solid rgba(59,130,246,0.35)' : 'none',
                      color: plan.color === G.gold ? G.bg : '#3b82f6',
                      fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
                      fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                      {saving
                        ? <Spinner />
                        : <><CreditCard size={11} /> Démarrer l'essai gratuit</>
                      }
                    </button>
                  </div>
                )
              })}
            </div>

            <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.25)', letterSpacing: '.06em', textAlign: 'center', lineHeight: 1.6 }}>
              🔒 Paiement sécurisé Stripe · Résiliable à tout moment depuis votre compte · Rappel e-mail J-2
            </p>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button onClick={() => navigate('/dashboard')} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.20)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Continuer sans abonnement →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Composants utilitaires ── */
function BtnPrimary({ onClick, saving, label, flex }) {
  return (
    <button onClick={onClick} disabled={saving} style={{
      flex: flex ? 1 : undefined,
      width: flex ? undefined : '100%',
      marginTop: flex ? 0 : 28,
      padding: '14px',
      background: saving ? 'rgba(201,162,39,0.4)' : G.gold,
      color: G.bg, fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em',
      textTransform: 'uppercase', fontWeight: 700, border: 'none',
      cursor: saving ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {saving ? <Spinner /> : <>{label} <ArrowRight size={13} /></>}
    </button>
  )
}

function BtnBack({ onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '14px 20px', background: 'transparent', border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>←</button>
  )
}

function ErrBox({ msg }) {
  return (
    <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderLeft: '2px solid #ef4444', fontFamily: G.mono, fontSize: 11, color: '#ef4444' }}>{msg}</div>
  )
}

function Spinner() {
  return <span style={{ width: 12, height: 12, border: `2px solid ${G.bg}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
}
