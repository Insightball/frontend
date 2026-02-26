import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Calendar, Users, Video, ChevronRight, ChevronLeft, Check, X, Lock, CreditCard } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import matchService from '../services/matchService'
import api from '../services/api'
import playerService from '../services/playerService'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`
const G = {
  ink: '#0f0f0d', gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  muted: 'rgba(15,15,13,0.42)', border: 'rgba(15,15,13,0.09)',
  card: 'rgba(255,255,255,0.02)',
}

const S = {
  card: { background: G.card, border: `1px solid rgba(15,15,13,0.09)`, padding: 28 },
  label: { display: 'block', fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 8 },
  input: {
    width: '100%', background: '#ffffff',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '12px 16px', color: '#0f0f0d',
    fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
    outline: 'none', transition: 'border-color .15s', boxSizing: 'border-box',
  },
  select: {
    width: '100%', background: '#ffffff',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '12px 16px', color: '#0f0f0d',
    fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
    outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
  },
}

function Field({ label, children }) {
  return <div><label style={S.label}>{label}</label>{children}</div>
}

function UploadMatch() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [trialStatus, setTrialStatus] = useState(null)
  const [trialLoading, setTrialLoading] = useState(true)
  const [players, setPlayers] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const [matchData, setMatchData] = useState({
    date: '', opponent: '', competition: '', location: '',
    score_home: '', score_away: '', category: 'N3',
    weather: 'Ensoleillé', pitch_type: 'Naturel',
  })
  const [lineup, setLineup] = useState({ starters: [], substitutes: [] })
  const [videoFile, setVideoFile] = useState(null)

  useEffect(() => { loadPlayers() }, [])
  useEffect(() => {
    api.get('/subscription/trial-status')
      .then(r => setTrialStatus(r.data))
      .catch(() => setTrialStatus({ access: 'trial' }))
      .finally(() => setTrialLoading(false))
  }, [])
  const loadPlayers = async () => {
    try {
      const data = await playerService.getPlayers()
      setPlayers(data.filter(p => p.status === 'actif'))
    } catch (error) { console.error('Error:', error) }
  }

  const handleMatchChange = (e) => setMatchData({ ...matchData, [e.target.name]: e.target.value })

  const positions = ['GB', 'DD', 'DC', 'DG', 'MDC', 'MIL', 'MOF', 'AD', 'AG', 'AVT']

  const addStarter = () => {
    if (lineup.starters.length >= 11) return
    setLineup({ ...lineup, starters: [...lineup.starters, { player_id: '', player_name: '', number: '', position: 'MIL' }] })
  }
  const removeStarter = (i) => setLineup({ ...lineup, starters: lineup.starters.filter((_, idx) => idx !== i) })
  const updateStarter = (i, field, value) => {
    const updated = [...lineup.starters]
    updated[i] = { ...updated[i], [field]: value }
    if (field === 'player_id' && value) {
      const p = players.find(p => p.id === value)
      if (p) { updated[i].player_name = p.name; updated[i].number = p.number; updated[i].position = p.position || 'MIL' }
    }
    setLineup({ ...lineup, starters: updated })
  }

  const addSubstitute = () => {
    if (lineup.substitutes.length >= 5) return
    setLineup({ ...lineup, substitutes: [...lineup.substitutes, { player_id: '', player_name: '', number: '' }] })
  }
  const removeSubstitute = (i) => setLineup({ ...lineup, substitutes: lineup.substitutes.filter((_, idx) => idx !== i) })
  const updateSubstitute = (i, field, value) => {
    const updated = [...lineup.substitutes]
    updated[i] = { ...updated[i], [field]: value }
    if (field === 'player_id' && value) {
      const p = players.find(p => p.id === value)
      if (p) { updated[i].player_name = p.name; updated[i].number = p.number }
    }
    setLineup({ ...lineup, substitutes: updated })
  }

  const getAvailablePlayers = (currentId) => {
    const usedIds = [
      ...lineup.starters.map(s => s.player_id),
      ...lineup.substitutes.map(s => s.player_id),
    ].filter(id => id && id !== currentId)
    return players.filter(p => !usedIds.includes(p.id))
  }

  const handleVideoChange = (e) => { if (e.target.files[0]) setVideoFile(e.target.files[0]) }
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('video/')) setVideoFile(file)
  }

  const nextStep = () => {
    if (step === 1 && (!matchData.date || !matchData.opponent)) { alert('Remplissez la date et l\'adversaire'); return }
    setStep(s => Math.min(s + 1, 4))
  }
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    if (!videoFile) { alert('Ajoutez une vidéo'); return }
    setUploading(true)
    try {
      // Marquer l'analyse trial comme utilisée
      if (trialStatus?.access === 'trial') {
        await api.post('/subscription/use-trial-match')
      }
      await matchService.uploadMatch({ matchData, lineup, videoFile })
      navigate('/dashboard/matches')
    } catch (error) { console.error('Error:', error); alert('Erreur lors de l\'upload') }
    finally { setUploading(false) }
  }

  const steps = [
    { n: '01', label: 'Match' },
    { n: '02', label: 'Titulaires' },
    { n: '03', label: 'Remplaçants' },
    { n: '04', label: 'Vidéo' },
  ]


  // Bloquer si trial expiré OU trial actif sans analyse utilisée
  const canUpload = trialStatus?.access === 'full' ||
    (trialStatus?.access === 'trial' && !trialStatus?.match_used)

  if (!trialLoading && !canUpload) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: 24 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(201,162,39,0.07)', border: '1px solid rgba(201,162,39,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {trialStatus?.access === 'expired' ? <Lock size={22} color="#c9a227" /> : <CreditCard size={22} color="#c9a227" />}
          </div>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#c9a227', marginBottom: 12 }}>
              {trialStatus?.access === 'expired' ? 'Essai terminé' : 'Analyse utilisée'}
            </div>
            <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', color: '#0f0f0d', marginBottom: 12 }}>
              {trialStatus?.access === 'expired' ? 'Abonnez-vous pour analyser' : 'Analyse gratuite utilisée'}
            </h2>
            <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(15,15,13,0.45)', maxWidth: 400, lineHeight: 1.6 }}>
              {trialStatus?.access === 'expired'
                ? "Votre période d'essai est terminée. Choisissez un plan pour continuer à uploader et analyser vos matchs."
                : "Vous avez utilisé votre analyse gratuite. Abonnez-vous pour accéder à l'upload illimité."
              }
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/settings')}
            style={{ padding: '12px 28px', background: '#c9a227', color: '#0f0f0d', fontFamily: G.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Voir les plans →
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <style>{`${FONTS} * { box-sizing: border-box; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } } select option { background: #0a0a08; }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
          Nouveau match
        </div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 44, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#0f0f0d', margin: 0 }}>
          Analyser<br /><span style={{ color: G.gold }}>un match.</span>
        </h1>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${step > i ? G.gold : G.border}`,
                background: step === i + 1 ? G.goldBg : 'transparent',
              }}>
                {step > i + 1
                  ? <Check size={11} color={G.gold} />
                  : <span style={{ fontFamily: G.mono, fontSize: 9, color: step > i ? G.gold : 'rgba(245,242,235,.25)', letterSpacing: '.1em' }}>{s.n}</span>
                }
              </div>
              <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: step === i + 1 ? G.gold : 'rgba(245,242,235,.25)' }}>{s.label}</span>
            </div>
            {i < 3 && <div style={{ width: 32, height: 1, background: step > i + 1 ? G.gold : G.border, margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 680 }}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ ...S.card, animation: 'fadeIn .3s ease', borderTop: `2px solid ${G.gold}` }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 24 }}>— Informations du match</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Date *">
                <input type="date" name="date" value={matchData.date} onChange={handleMatchChange} style={S.input}
                  onFocus={e => e.target.style.borderColor = G.gold} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.09)'}/>
              </Field>
              <Field label="Adversaire *">
                <input type="text" name="opponent" value={matchData.opponent} onChange={handleMatchChange}
                  placeholder="FC Marseille" style={S.input}
                  onFocus={e => e.target.style.borderColor = G.gold} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.09)'}/>
              </Field>
              <Field label="Compétition">
                <input type="text" name="competition" value={matchData.competition} onChange={handleMatchChange}
                  placeholder="Championnat N3" style={S.input}
                  onFocus={e => e.target.style.borderColor = G.gold} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.09)'}/>
              </Field>
              <Field label="Lieu">
                <input type="text" name="location" value={matchData.location} onChange={handleMatchChange}
                  placeholder="Domicile / Extérieur" style={S.input}
                  onFocus={e => e.target.style.borderColor = G.gold} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.09)'}/>
              </Field>
              <Field label="Catégorie">
                <select name="category" value={matchData.category} onChange={handleMatchChange} style={S.select}>
                  {['N3','R1','R2','U19','U17','U15','Seniors'].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Score (optionnel)">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" name="score_home" value={matchData.score_home} onChange={handleMatchChange}
                    placeholder="0" style={{ ...S.input, textAlign: 'center', width: '40%' }} min="0" max="20"/>
                  <span style={{ fontFamily: G.mono, fontSize: 14, color: 'rgba(15,15,13,0.45)' }}>—</span>
                  <input type="number" name="score_away" value={matchData.score_away} onChange={handleMatchChange}
                    placeholder="0" style={{ ...S.input, textAlign: 'center', width: '40%' }} min="0" max="20"/>
                </div>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Météo">
                <select name="weather" value={matchData.weather} onChange={handleMatchChange} style={S.select}>
                  {['Ensoleillé','Nuageux','Pluvieux','Venteux','Neige'].map(w => <option key={w}>{w}</option>)}
                </select>
              </Field>
              <Field label="Type de terrain">
                <select name="pitch_type" value={matchData.pitch_type} onChange={handleMatchChange} style={S.select}>
                  {['Naturel','Synthétique','Dur'].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* ── STEP 2: Titulaires ── */}
        {step === 2 && (
          <div style={{ ...S.card, animation: 'fadeIn .3s ease', borderTop: `2px solid ${G.gold}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 6 }}>— Titulaires</div>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.08em' }}>{lineup.starters.length}/11</p>
              </div>
              {lineup.starters.length < 11 && (
                <button onClick={addStarter} style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', padding: '9px 18px', background: G.goldBg, color: G.gold, border: `1px solid ${G.goldBdr}`, cursor: 'pointer' }}>
                  + Ajouter
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lineup.starters.map((starter, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, animation: 'fadeIn .2s ease' }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: G.gold, width: 28, textAlign: 'center', flexShrink: 0 }}>{index + 1}</div>
                  <select value={starter.player_id} onChange={e => updateStarter(index, 'player_id', e.target.value)}
                    style={{ ...S.select, flex: 1 }}>
                    <option value="">Sélectionner joueur</option>
                    {getAvailablePlayers(starter.player_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" value={starter.number} onChange={e => updateStarter(index, 'number', e.target.value)}
                    style={{ ...S.input, width: 64, textAlign: 'center', padding: '10px 8px' }} placeholder="N°" min="1" max="99"/>
                  <select value={starter.position} onChange={e => updateStarter(index, 'position', e.target.value)}
                    style={{ ...S.select, width: 80 }}>
                    {positions.map(pos => <option key={pos}>{pos}</option>)}
                  </select>
                  <button onClick={() => removeStarter(index)} style={{ padding: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {lineup.starters.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,.2)', letterSpacing: '.06em' }}>
                  Cliquez sur "+ Ajouter" pour sélectionner vos 11 titulaires
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Remplaçants ── */}
        {step === 3 && (
          <div style={{ ...S.card, animation: 'fadeIn .3s ease', borderTop: `2px solid ${G.gold}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 6 }}>— Remplaçants</div>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.08em' }}>{lineup.substitutes.length}/5 — optionnels</p>
              </div>
              {lineup.substitutes.length < 5 && (
                <button onClick={addSubstitute} style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', padding: '9px 18px', background: 'rgba(201,162,39,0.06)', color: G.gold, border: `1px solid ${G.goldBdr}`, cursor: 'pointer' }}>
                  + Ajouter
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lineup.substitutes.map((sub, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, animation: 'fadeIn .2s ease' }}>
                  <div style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', width: 28, textAlign: 'center', flexShrink: 0, letterSpacing: '.08em' }}>R{index + 1}</div>
                  <select value={sub.player_id} onChange={e => updateSubstitute(index, 'player_id', e.target.value)} style={{ ...S.select, flex: 1 }}>
                    <option value="">Sélectionner joueur</option>
                    {getAvailablePlayers(sub.player_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" value={sub.number} onChange={e => updateSubstitute(index, 'number', e.target.value)}
                    style={{ ...S.input, width: 64, textAlign: 'center', padding: '10px 8px' }} placeholder="N°" min="1" max="99"/>
                  <button onClick={() => removeSubstitute(index)} style={{ padding: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {lineup.substitutes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,.2)', letterSpacing: '.06em' }}>
                  Les remplaçants sont optionnels (max 5)
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 4: Vidéo ── */}
        {step === 4 && (
          <div style={{ ...S.card, animation: 'fadeIn .3s ease', borderTop: `2px solid ${G.gold}` }}>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 24 }}>— Vidéo du match</div>
            <input type="file" accept="video/*" onChange={handleVideoChange} id="video-upload" style={{ display: 'none' }} />
            <label
              htmlFor="video-upload"
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: 200, cursor: 'pointer', transition: 'all .2s',
                border: dragOver ? `2px dashed ${G.gold}` : videoFile ? `2px solid rgba(34,197,94,0.4)` : `2px dashed rgba(255,255,255,0.08)`,
                background: dragOver ? G.goldBg : videoFile ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.01)',
              }}
            >
              {videoFile ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, margin: '0 auto 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={20} color="#22c55e" />
                  </div>
                  <p style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 700, color: '#0f0f0d', marginBottom: 4, letterSpacing: '.04em' }}>{videoFile.name}</p>
                  <p style={{ fontFamily: G.mono, fontSize: 10, color: '#22c55e', letterSpacing: '.08em' }}>{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(15,15,13,0.45)', marginTop: 6, letterSpacing: '.06em' }}>Cliquez pour changer</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, margin: '0 auto 14px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={20} color={G.gold} />
                  </div>
                  <p style={{ fontFamily: G.mono, fontSize: 12, fontWeight: 700, color: '#0f0f0d', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Déposez votre vidéo</p>
                  <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>ou cliquez pour sélectionner</p>
                  <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,.2)', marginTop: 6, letterSpacing: '.06em' }}>MP4, MOV, AVI — max 2GB</p>
                </div>
              )}
            </label>
            {videoFile && (
              <div style={{ marginTop: 16, padding: '14px 18px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, fontFamily: G.mono, fontSize: 10, color: G.gold, letterSpacing: '.06em', lineHeight: 1.6 }}>
                L'analyse démarrera après l'upload. Vous serez notifié(e) dès que le rapport sera prêt.
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          {step > 1 ? (
            <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'transparent', border: `1px solid rgba(15,15,13,0.09)`, color: 'rgba(15,15,13,0.45)', cursor: 'pointer', fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              <ChevronLeft size={16} /> Précédent
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard/matches')} style={{ padding: '12px 22px', background: 'transparent', border: 'none', color: 'rgba(245,242,235,.2)', cursor: 'pointer', fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>Annuler</button>
          )}

          {step < 4 ? (
            <button onClick={nextStep} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: G.gold, color: G.ink, fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Suivant <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: uploading ? 'rgba(201,162,39,0.4)' : G.gold, color: G.ink, fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(15,15,13,0.3)', borderTopColor: G.ink, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Upload...</> : <><Check size={16} /> Lancer l'analyse</>}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default UploadMatch
