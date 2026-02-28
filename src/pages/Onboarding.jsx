import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, Smartphone, Camera, Video, Zap } from 'lucide-react'
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

// 4 étapes + écran bienvenue (step 5)
const STEPS = [
  { id: 1, code: '01', label: 'Profil'   },
  { id: 2, code: '02', label: 'Club'     },
  { id: 3, code: '03', label: 'Équipe'   },
  { id: 4, code: '04', label: 'Tournage' },
]

const ROLES    = ['Éducateur', 'Entraîneur', 'Directeur Sportif', 'Analyste Vidéo']
const LEVELS   = ['National', 'Régional', 'Départemental']
const DIPLOMAS = ['CFI', 'DF', 'BMF', 'BEF', 'DES', 'BEPF']

// Indicatifs pays avec drapeaux
const COUNTRIES = [
  { code: 'FR', flag: '🇫🇷', dial: '+33', label: 'France' },
  { code: 'BE', flag: '🇧🇪', dial: '+32', label: 'Belgique' },
  { code: 'CH', flag: '🇨🇭', dial: '+41', label: 'Suisse' },
  { code: 'LU', flag: '🇱🇺', dial: '+352', label: 'Luxembourg' },
  { code: 'MA', flag: '🇲🇦', dial: '+212', label: 'Maroc' },
  { code: 'DZ', flag: '🇩🇿', dial: '+213', label: 'Algérie' },
  { code: 'TN', flag: '🇹🇳', dial: '+216', label: 'Tunisie' },
  { code: 'SN', flag: '🇸🇳', dial: '+221', label: 'Sénégal' },
  { code: 'CI', flag: '🇨🇮', dial: '+225', label: "Côte d'Ivoire" },
  { code: 'CM', flag: '🇨🇲', dial: '+237', label: 'Cameroun' },
  { code: 'ES', flag: '🇪🇸', dial: '+34', label: 'Espagne' },
  { code: 'PT', flag: '🇵🇹', dial: '+351', label: 'Portugal' },
  { code: 'DE', flag: '🇩🇪', dial: '+49', label: 'Allemagne' },
  { code: 'IT', flag: '🇮🇹', dial: '+39', label: 'Italie' },
  { code: 'GB', flag: '🇬🇧', dial: '+44', label: 'Royaume-Uni' },
  { code: 'NL', flag: '🇳🇱', dial: '+31', label: 'Pays-Bas' },
  { code: 'OTHER', flag: '🌍', dial: '+', label: 'Autre' },
]

const TEAM_CATEGORIES = ['Séniors', 'U19', 'U18', 'U17', 'U16', 'U15', 'U14']
const TEAM_LEVELS     = ['National', 'Régional', 'Départemental']

const NB_TEAMS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+']

const FILMING_OPTIONS = [
  { id: 'smartphone_hand',  icon: Smartphone, label: 'Smartphone à la main',   desc: 'Quelqu\'un filme en suivant le jeu depuis le bord du terrain' },
  { id: 'smartphone_fixed', icon: Smartphone, label: 'Smartphone fixe',         desc: 'Posé sur trépied ou tribunes, plan large, sans bougé' },
  { id: 'ai_camera',        icon: Camera,     label: 'Caméra intelligente',      desc: 'Avec suivi automatique du ballon (Pixellot, Veo, etc.)' },
  { id: 'drone',            icon: Video,      label: 'Drone',                    desc: 'Vue du dessus, plan d\'ensemble du terrain' },
  { id: 'multiple',         icon: Video,      label: 'Plusieurs angles',         desc: 'Plusieurs caméras ou combinaison de sources' },
  { id: 'no_setup',         icon: Zap,        label: 'Pas encore de setup',      desc: 'Je cherche comment filmer, j\'ai besoin de conseils' },
]

const inputStyle = (focused = false) => ({
  width: '100%', background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${focused ? G.goldBdr : G.border}`,
  padding: '12px 14px', color: G.text,
  fontFamily: G.mono, fontSize: 12, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
})

const labelStyle = {
  display: 'block', fontFamily: G.mono, fontSize: 8,
  letterSpacing: '.2em', textTransform: 'uppercase',
  color: 'rgba(245,242,235,0.4)', marginBottom: 8,
}

export default function Onboarding() {
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Step 1 — Profil
  const [profileData, setProfileData] = useState({
    role: '', level: '', diploma: '',
    dialCode: 'FR', phone: '', city: '', country: 'FR',
  })

  // Step 2 — Club
  const [clubData, setClubData] = useState({
    name: user?.club_name || '',
    nb_teams: '',
  })

  // Step 3 — Équipe principale
  const [teamData, setTeamData] = useState({
    category: '',
    level: '',
  })

  // Step 4 — Filming (multi-sélection)
  const [filmingSetup, setFilmingSetup] = useState([])

  const toggleFilming = (id) => {
    setFilmingSetup(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectedCountry = COUNTRIES.find(c => c.code === profileData.dialCode) || COUNTRIES[0]

  /* ── Handlers ── */
  const handleSaveProfile = async () => {
    if (!profileData.role || !profileData.level) { setError('Poste et niveau requis'); return }
    if (!profileData.phone.trim()) { setError('Téléphone requis'); return }
    if (!profileData.city.trim()) { setError('Ville requise'); return }
    setSaving(true); setError('')
    try {
      await api.patch('/account/profile', {
        role: profileData.role,
        level: profileData.level,
        phone: `${selectedCountry.dial} ${profileData.phone}`,
        city: profileData.city,
        country: profileData.dialCode,
        diploma: profileData.diploma,
      })
    } catch (e) { console.warn('Profile save failed:', e) }
    finally { setSaving(false) }
    setStep(2)
  }

  const handleSaveClub = async () => {
    if (!clubData.name.trim()) { setError('Nom du club requis'); return }
    if (!clubData.nb_teams)    { setError('Nombre d\'équipes requis'); return }
    setSaving(true); setError('')
    try {
      try {
        await api.patch('/club/me', { name: clubData.name, nb_teams: clubData.nb_teams })
      } catch (e) {
        if (e?.response?.status === 404) {
          await api.post('/club/', { name: clubData.name, nb_teams: clubData.nb_teams })
        } else throw e
      }
      setStep(3)
    } catch (e) { setError('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  const handleSaveTeam = async () => {
    if (!teamData.category || !teamData.level) { setError('Catégorie et niveau requis'); return }
    setSaving(true); setError('')
    try {
      await api.patch('/account/profile', {
        team_category: teamData.category,
        team_level: teamData.level,
      })
    } catch (e) { console.warn('Team save failed:', e) }
    finally { setSaving(false) }
    setStep(4)
  }

  const handleSaveFilming = async () => {
    if (filmingSetup.length === 0) { setError('Sélectionnez au moins un setup de tournage'); return }
    setSaving(true); setError('')
    try {
      await api.patch('/account/profile', { filming_setup: filmingSetup.join(',') })
    } catch (e) { console.warn('Filming save failed:', e) }
    finally { setSaving(false) }
    setStep(5) // écran bienvenue
  }

  // Écran bienvenue (step 5) — pas dans les STEPS
  if (step === 5) {
    return <WelcomeScreen navigate={navigate} />
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(245,242,235,0.18); font-family: 'JetBrains Mono',monospace; font-size: 12px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .step-card { animation: fadeUp .3s ease forwards; }
        select option { background: #0f0e0c; color: #f5f2eb; }
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
        <div style={{ height: '100%', background: G.gold, width: `${(step / 4) * 100}%`, transition: 'width .4s ease' }} />
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 24px 0', flexWrap: 'wrap' }}>
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
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 1 sur 4</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>profil.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>Dites-nous qui vous êtes</p>
            </div>

            {error && <ErrBox msg={error} onClose={() => setError('')} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Rôle */}
              <div>
                <label style={labelStyle}>Votre rôle *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ROLES.map(r => (
                    <ChipBtn key={r} label={r} active={profileData.role === r} onClick={() => setProfileData(p => ({ ...p, role: r }))} />
                  ))}
                </div>
              </div>

              {/* Niveau */}
              <div>
                <label style={labelStyle}>Niveau de compétition *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {LEVELS.map(l => (
                    <ChipBtn key={l} label={l} active={profileData.level === l} onClick={() => setProfileData(p => ({ ...p, level: l }))} />
                  ))}
                </div>
              </div>

              {/* Diplôme optionnel */}
              <div>
                <label style={labelStyle}>Diplôme <span style={{ color: 'rgba(245,242,235,0.2)' }}>(optionnel)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {DIPLOMAS.map(d => (
                    <ChipBtn key={d} label={d} active={profileData.diploma === d} onClick={() => setProfileData(p => ({ ...p, diploma: p.diploma === d ? '' : d }))} />
                  ))}
                </div>
              </div>

              {/* Téléphone avec indicatif */}
              <div>
                <label style={labelStyle}>Téléphone *</label>
                <div style={{ display: 'flex', gap: 0 }}>
                  {/* Sélecteur pays */}
                  <select
                    value={profileData.dialCode}
                    onChange={e => setProfileData(p => ({ ...p, dialCode: e.target.value }))}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`,
                      borderRight: 'none', padding: '12px 10px', color: G.text,
                      fontFamily: G.mono, fontSize: 12, outline: 'none', cursor: 'pointer',
                      minWidth: 90, flexShrink: 0,
                    }}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
                    ))}
                  </select>
                  {/* Numéro */}
                  <input
                    value={profileData.phone}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="6 00 00 00 00"
                    type="tel"
                    style={{ ...inputStyle(), flex: 1, borderRadius: 0 }}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = G.border}
                  />
                </div>
              </div>

              {/* Ville + Pays */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Ville *</label>
                  <input
                    value={profileData.city}
                    onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))}
                    placeholder="Lyon"
                    style={inputStyle()}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = G.border}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Pays *</label>
                  <select
                    value={profileData.country}
                    onChange={e => setProfileData(p => ({ ...p, country: e.target.value, dialCode: e.target.value }))}
                    style={{ ...inputStyle(), cursor: 'pointer' }}
                  >
                    {COUNTRIES.filter(c => c.code !== 'OTHER').map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                    ))}
                    <option value="OTHER">🌍 Autre</option>
                  </select>
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
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 2 sur 4</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>club.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>Quelques infos sur votre structure</p>
            </div>

            {error && <ErrBox msg={error} onClose={() => setError('')} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Nom */}
              <div>
                <label style={labelStyle}>Nom du club *</label>
                <input
                  value={clubData.name}
                  onChange={e => setClubData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex : FC Lyon Nord"
                  style={inputStyle()}
                  onFocus={e => e.target.style.borderColor = G.goldBdr}
                  onBlur={e => e.target.style.borderColor = G.border}
                />
              </div>

              {/* Nombre d'équipes foot à 11 */}
              <div>
                <label style={labelStyle}>Nombre d'équipes foot à 11 *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {NB_TEAMS_OPTIONS.map(n => (
                    <ChipBtn key={n} label={n} active={clubData.nb_teams === n} onClick={() => setClubData(p => ({ ...p, nb_teams: n }))} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <BtnBack onClick={() => { setError(''); setStep(1) }} />
              <BtnPrimary onClick={handleSaveClub} saving={saving} flex label="Continuer" />
            </div>
          </div>
        )}

        {/* ── STEP 3 — ÉQUIPE PRINCIPALE ── */}
        {step === 3 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 3 sur 4</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Votre<br /><span style={{ color: G.gold }}>équipe.</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em' }}>
                Votre équipe principale — les joueurs s'ajoutent dans le dashboard
              </p>
            </div>

            {error && <ErrBox msg={error} onClose={() => setError('')} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Catégorie */}
              <div>
                <label style={labelStyle}>Catégorie *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TEAM_CATEGORIES.map(c => (
                    <ChipBtn key={c} label={c} active={teamData.category === c} onClick={() => setTeamData(p => ({ ...p, category: c }))} />
                  ))}
                </div>
              </div>

              {/* Niveau */}
              <div>
                <label style={labelStyle}>Niveau *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TEAM_LEVELS.map(l => (
                    <ChipBtn key={l} label={l} active={teamData.level === l} onClick={() => setTeamData(p => ({ ...p, level: l }))} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <BtnBack onClick={() => { setError(''); setStep(2) }} />
              <BtnPrimary onClick={handleSaveTeam} saving={saving} flex label="Continuer" />
            </div>
          </div>
        )}

        {/* ── STEP 4 — FILMING ── */}
        {step === 4 && (
          <div className="step-card" style={{ width: '100%', maxWidth: 580 }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>Étape 4 sur 4</div>
              <h1 style={{ fontFamily: G.display, fontSize: 'clamp(38px,5vw,52px)', textTransform: 'uppercase', lineHeight: .88, color: G.text, margin: 0 }}>
                Comment vous<br /><span style={{ color: G.gold }}>filmez ?</span>
              </h1>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 14, letterSpacing: '.04em', lineHeight: 1.6 }}>
                Ça nous aide à optimiser l'analyse pour votre setup.<br />
                <span style={{ color: 'rgba(245,242,235,0.4)' }}>Plusieurs réponses possibles.</span>
              </p>
            </div>

            {error && <ErrBox msg={error} onClose={() => setError('')} />}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: G.border, marginBottom: 20 }}>
              {FILMING_OPTIONS.map(opt => {
                const Icon = opt.icon
                const selected = filmingSetup.includes(opt.id)
                return (
                  <button key={opt.id} onClick={() => toggleFilming(opt.id)} style={{
                    padding: '18px 16px', background: selected ? 'rgba(201,162,39,0.06)' : G.bg2,
                    border: 'none', borderLeft: `3px solid ${selected ? G.gold : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left', transition: 'background .15s',
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
                    <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.65)', lineHeight: 1.5, margin: 0 }}>{opt.desc}</p>
                  </button>
                )
              })}
            </div>

            {/* Conseil si "pas encore de setup" sélectionné */}
            {filmingSetup.includes('no_setup') && (
              <div style={{ padding: '14px 16px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, marginBottom: 16 }}>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 6 }}>💡 Notre recommandation</div>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.65)', lineHeight: 1.6, margin: 0 }}>
                  Un smartphone posé sur un trépied en tribune, à 5-7m de hauteur, plan large centré. C'est le setup le plus simple et celui qui donne les meilleurs résultats avec InsightBall.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <BtnBack onClick={() => { setError(''); setStep(3) }} />
              <BtnPrimary onClick={handleSaveFilming} saving={saving} flex label="Terminer" />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

/* ── ÉCRAN BIENVENUE ─────────────────────────────────────────── */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="80" height="80" viewBox="0 0 375 375" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="ob_a"><path d="M 53.835938 221 L 320.835938 221 L 320.835938 341.449219 L 53.835938 341.449219 Z" clip-rule="nonzero"/></clipPath><clipPath id="ob_b"><path d="M 88 201 L 320.835938 201 L 320.835938 302 L 88 302 Z" clip-rule="nonzero"/></clipPath><clipPath id="ob_c"><path d="M 116 160 L 320.835938 160 L 320.835938 265 L 116 265 Z" clip-rule="nonzero"/></clipPath><clipPath id="ob_d"><path d="M 53.835938 33.199219 L 275 33.199219 L 275 212 L 53.835938 212 Z" clip-rule="nonzero"/></clipPath></defs><g clip-path="url(#ob_a)"><path fill="#ffffff" d="M 170.027344 311.558594 L 187.496094 321.617188 L 303.652344 254.589844 L 321.117188 244.464844 L 321.117188 264.648438 L 187.496094 341.800781 L 170.027344 331.738281 L 152.558594 321.617188 L 135.15625 311.558594 L 120.710938 303.222656 L 117.6875 301.496094 L 100.222656 291.4375 L 53.871094 264.648438 L 53.871094 231.257812 L 71.335938 221.199219 L 71.335938 254.589844 L 117.6875 281.3125 L 135.15625 291.4375 L 152.558594 301.496094 Z" fill-rule="evenodd"/></g><g clip-path="url(#ob_b)"><path fill="#ffffff" d="M 106.207031 234.40625 L 152.558594 261.191406 L 170.027344 271.253906 L 187.496094 281.3125 L 268.78125 234.40625 L 286.183594 224.347656 L 303.652344 214.285156 L 321.117188 204.164062 L 321.117188 224.347656 L 303.652344 234.40625 L 286.183594 244.464844 L 187.496094 301.496094 L 170.027344 291.4375 L 152.558594 281.3125 L 135.15625 271.253906 L 88.804688 244.464844 L 88.804688 211.136719 L 106.207031 201.078125 Z" fill-rule="evenodd"/></g><g clip-path="url(#ob_c)"><path fill="#ffffff" d="M 313.898438 181.386719 C 315.871094 181.386719 317.722656 182.191406 319.019531 183.488281 C 320.316406 184.785156 321.117188 186.636719 321.117188 188.609375 C 321.117188 190.585938 320.316406 192.4375 319.019531 193.734375 C 317.722656 195.027344 315.871094 195.832031 313.898438 195.832031 C 312.046875 195.832031 310.378906 195.152344 309.082031 193.980469 L 187.496094 264.15625 C 165.335938 251.378906 143.179688 238.601562 121.082031 225.828125 L 121.082031 204.84375 C 120.15625 204.472656 119.292969 203.917969 118.613281 203.238281 C 117.316406 201.941406 116.515625 200.089844 116.515625 198.113281 C 116.515625 196.140625 117.316406 194.289062 118.613281 192.992188 C 119.910156 191.695312 121.761719 190.894531 123.738281 190.894531 C 125.710938 190.894531 127.5625 191.695312 128.859375 192.992188 C 130.15625 194.289062 130.957031 196.140625 130.957031 198.113281 C 130.957031 200.089844 130.15625 201.941406 128.859375 203.238281 C 128.179688 203.917969 127.316406 204.472656 126.390625 204.84375 L 126.390625 222.804688 L 187.554688 258.105469 L 306.675781 189.351562 C 306.675781 189.105469 306.613281 188.855469 306.613281 188.609375 C 306.613281 186.636719 307.417969 184.785156 308.714844 183.488281 C 310.070312 182.191406 311.859375 181.386719 313.898438 181.386719 Z M 143.796875 194.78125 L 143.796875 212.742188 L 187.496094 237.984375 C 227.242188 215.027344 266.988281 192.066406 306.738281 169.167969 C 306.675781 168.859375 306.675781 168.488281 306.675781 168.179688 C 306.675781 166.207031 307.476562 164.355469 308.773438 163.058594 C 310.070312 161.761719 311.921875 160.960938 313.898438 160.960938 C 315.871094 160.960938 317.722656 161.761719 319.019531 163.058594 C 320.316406 164.355469 321.117188 166.207031 321.117188 168.179688 C 321.117188 170.15625 320.316406 172.007812 319.019531 173.304688 C 317.722656 174.597656 315.871094 175.402344 313.898438 175.402344 C 312.167969 175.402344 310.566406 174.785156 309.269531 173.734375 L 187.496094 244.035156 L 138.488281 215.765625 L 138.488281 194.78125 C 137.5625 194.410156 136.699219 193.855469 136.019531 193.175781 C 134.722656 191.882812 133.921875 190.03125 133.921875 188.054688 C 133.921875 186.078125 134.722656 184.226562 136.019531 182.933594 C 137.316406 181.636719 139.167969 180.832031 141.140625 180.832031 C 143.117188 180.832031 144.96875 181.636719 146.265625 182.933594 C 147.5625 184.226562 148.363281 186.078125 148.363281 188.054688 C 148.363281 190.03125 147.5625 191.882812 146.265625 193.175781 C 145.585938 193.855469 144.722656 194.410156 143.796875 194.78125 Z" fill-rule="nonzero"/></g><g clip-path="url(#ob_d)"><path fill="#c9a227" d="M 187.496094 33.199219 L 204.960938 43.257812 L 222.429688 53.320312 L 239.894531 63.441406 L 257.363281 73.5 L 274.828125 83.5625 L 257.300781 93.683594 L 239.832031 103.746094 L 222.367188 113.804688 L 204.960938 123.925781 L 187.496094 133.988281 L 141.140625 160.773438 L 123.675781 170.835938 L 106.207031 180.894531 L 88.742188 190.957031 L 71.335938 201.078125 L 53.871094 211.136719 L 53.871094 110.347656 Z M 187.496094 53.378906 L 71.335938 120.410156 L 71.335938 140.589844 L 88.804688 130.53125 L 187.496094 73.5625 L 204.960938 63.441406 Z M 187.496094 93.683594 L 106.207031 140.589844 L 88.742188 150.652344 L 71.273438 160.710938 L 71.273438 180.894531 L 88.804688 170.835938 L 106.269531 160.773438 L 123.738281 150.714844 L 187.554688 113.867188 L 205.023438 103.804688 L 222.429688 93.683594 L 239.894531 83.625 L 222.429688 73.5625 L 204.960938 83.625 Z" fill-rule="evenodd"/></g></svg>`

function WelcomeScreen({ navigate }) {
  const [visible, setVisible] = useState(false)

  useState(() => {
    setTimeout(() => setVisible(true), 50)
  })

  return (
    <div style={{
      minHeight: '100vh', background: G.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
      opacity: visible ? 1 : 0, transition: 'opacity .6s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .w1 { animation: fadeUp .5s ease .1s both; }
        .w2 { animation: fadeUp .5s ease .35s both; }
        .w3 { animation: fadeUp .5s ease .6s both; }
        .w4 { animation: fadeUp .5s ease .85s both; }
        .w5 { animation: fadeUp .5s ease 1.1s both; }
      `}</style>

      {/* Logo SVG animé */}
      <div className="w1" style={{
        width: 96, height: 96,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 36,
        animation: 'fadeUp .5s ease .1s both, pulse 3s ease 1.2s infinite',
      }}>
        <div dangerouslySetInnerHTML={{ __html: LOGO_SVG }} style={{ width: 96, height: 96 }} />
      </div>

      {/* Headline */}
      <h1 className="w2" style={{
        fontFamily: G.display, fontSize: 'clamp(42px,7vw,72px)',
        textTransform: 'uppercase', lineHeight: .88, color: G.text,
        margin: '0 0 8px', letterSpacing: '.01em',
      }}>
        On rentre<br />
        <span style={{ color: G.gold }}>dans le match.</span>
      </h1>

      {/* Sous-titre */}
      <p className="w3" style={{
        fontFamily: G.mono, fontSize: 12, color: 'rgba(245,242,235,0.5)',
        lineHeight: 1.8, marginTop: 24, maxWidth: 460, letterSpacing: '.04em',
      }}>
        Votre profil est configuré. Analysez votre premier match,<br />
        découvrez ce que les données révèlent sur votre jeu.
      </p>

      {/* Match offert — mise en avant */}
      <div className="w4" style={{
        marginTop: 36, marginBottom: 36,
        padding: '20px 32px',
        background: 'rgba(201,162,39,0.07)',
        border: '1px solid rgba(201,162,39,0.25)',
        borderLeft: '3px solid #c9a227',
        maxWidth: 400, width: '100%',
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#c9a227', marginBottom: 8 }}>
          🎁 Offre de bienvenue
        </div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, color: '#f5f2eb', textTransform: 'uppercase', lineHeight: 1, marginBottom: 8 }}>
          1 match offert
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(245,242,235,0.60)', lineHeight: 1.6, margin: 0 }}>
          Votre première analyse est incluse. Uploadez votre vidéo, recevez votre rapport tactique complet.
        </p>
      </div>

      {/* CTA */}
      <button
        className="w5"
        onClick={() => navigate('/dashboard/matches/upload')}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 36px', background: G.gold, color: G.bg,
          fontFamily: G.mono, fontSize: 11, letterSpacing: '.16em',
          textTransform: 'uppercase', fontWeight: 700, border: 'none',
          cursor: 'pointer', transition: 'opacity .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Analyser mon premier match <ChevronRight size={16} />
      </button>

      {/* Lien discret dashboard */}
      <button
        className="w5"
        onClick={() => navigate('/dashboard')}
        style={{
          marginTop: 16, fontFamily: G.mono, fontSize: 9,
          letterSpacing: '.1em', textTransform: 'uppercase',
          color: 'rgba(245,242,235,0.2)', background: 'none',
          border: 'none', cursor: 'pointer',
        }}
      >
        Explorer le dashboard d'abord →
      </button>
    </div>
  )
}

/* ── Composants utilitaires ── */
function ChipBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em',
      background: active ? G.goldBg : 'transparent',
      border: `1px solid ${active ? G.goldBdr : 'rgba(255,255,255,0.1)'}`,
      color: active ? G.gold : G.muted, cursor: 'pointer',
      transition: 'all .12s',
    }}>
      {label}
    </button>
  )
}

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
    <button onClick={onClick} style={{
      padding: '14px 20px', background: 'transparent',
      border: `1px solid ${G.border}`, fontFamily: G.mono,
      fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
      color: G.muted, cursor: 'pointer',
    }}>←</button>
  )
}

function ErrBox({ msg, onClose }) {
  return (
    <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderLeft: '2px solid #ef4444', fontFamily: G.mono, fontSize: 11, color: '#ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {msg}
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>}
    </div>
  )
}

function Spinner() {
  return <span style={{ width: 12, height: 12, border: `2px solid ${G.bg}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
}
