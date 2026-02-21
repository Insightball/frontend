import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Calendar, Users, Video, ChevronRight, ChevronLeft, Check, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

const S = {
  card: {
    background: '#0d0f18',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '28px',
  },
  label: {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#94a3b8', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  input: {
    width: '100%', background: '#080a10',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '12px 16px',
    color: '#f1f5f9', fontSize: 15, outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', background: '#080a10',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '12px 16px',
    color: '#f1f5f9', fontSize: 15, outline: 'none',
    transition: 'border-color 0.2s', cursor: 'pointer',
    boxSizing: 'border-box',
  },
}

function Field({ label, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  )
}

function UploadMatch() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [players, setPlayers] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const [matchData, setMatchData] = useState({
    date: '', opponent: '', competition: '', location: '',
    score_home: '', score_away: '', category: 'N3',
    weather: 'Ensoleillé', pitch_type: 'Naturel'
  })

  const [lineup, setLineup] = useState({ starters: [], substitutes: [] })
  const [videoFile, setVideoFile] = useState(null)

  useEffect(() => { loadPlayers() }, [])

  const loadPlayers = async () => {
    try {
      const data = await playerService.getPlayers()
      setPlayers(data.filter(p => p.status === 'actif'))
    } catch (error) { console.error('Error loading players:', error) }
  }

  const handleMatchChange = (e) => setMatchData({ ...matchData, [e.target.name]: e.target.value })

  const addStarter = () => {
    if (lineup.starters.length >= 11) return
    setLineup({ ...lineup, starters: [...lineup.starters, { player_id: '', player_name: '', number: '', position: 'MIL' }] })
  }

  const removeStarter = (index) => setLineup({ ...lineup, starters: lineup.starters.filter((_, i) => i !== index) })

  const updateStarter = (index, field, value) => {
    const newStarters = [...lineup.starters]
    newStarters[index][field] = value
    if (field === 'player_id' && value) {
      const player = players.find(p => p.id === value)
      if (player) newStarters[index].player_name = player.name
    }
    setLineup({ ...lineup, starters: newStarters })
  }

  const addSubstitute = () => {
    if (lineup.substitutes.length >= 5) return
    setLineup({ ...lineup, substitutes: [...lineup.substitutes, { player_id: '', player_name: '', number: '' }] })
  }

  const removeSubstitute = (index) => setLineup({ ...lineup, substitutes: lineup.substitutes.filter((_, i) => i !== index) })

  const updateSubstitute = (index, field, value) => {
    const newSubs = [...lineup.substitutes]
    newSubs[index][field] = value
    if (field === 'player_id' && value) {
      const player = players.find(p => p.id === value)
      if (player) newSubs[index].player_name = player.name
    }
    setLineup({ ...lineup, substitutes: newSubs })
  }

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) setVideoFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('video/')) setVideoFile(file)
  }

  const validateStep = () => {
    if (step === 1 && (!matchData.date || !matchData.opponent)) { alert('Date et adversaire obligatoires'); return false }
    if (step === 2) {
      if (lineup.starters.length !== 11) { alert('11 titulaires requis'); return false }
      for (let s of lineup.starters) if (!s.player_id || !s.number) { alert('Tous les titulaires doivent avoir joueur + numéro'); return false }
      const numbers = [...lineup.starters.map(s => s.number), ...lineup.substitutes.map(s => s.number)].filter(Boolean)
      if (new Set(numbers).size !== numbers.length) { alert('Numéros en double'); return false }
    }
    if (step === 3) for (let sub of lineup.substitutes) if ((sub.player_id && !sub.number) || (!sub.player_id && sub.number)) { alert('Remplaçant incomplet'); return false }
    if (step === 4 && !videoFile) { alert('Sélectionnez une vidéo'); return false }
    return true
  }

  const nextStep = () => { if (validateStep()) setStep(step + 1) }
  const prevStep = () => setStep(step - 1)

  const handleSubmit = async () => {
    if (!validateStep()) return
    try {
      setUploading(true)
      const match = await matchService.createMatch({
        ...matchData,
        lineup: { starters: lineup.starters.filter(s => s.player_id), substitutes: lineup.substitutes.filter(s => s.player_id) }
      })
      if (videoFile) await matchService.uploadVideo(match.id, videoFile)
      alert('Match uploadé ! L\'analyse IA démarrera sous peu.')
      navigate('/dashboard/matches')
    } catch (error) {
      console.error(error)
      alert('Erreur lors de l\'upload')
    } finally { setUploading(false) }
  }

  const getAvailablePlayers = (currentPlayerId) => {
    const selectedIds = [...lineup.starters.map(s => s.player_id), ...lineup.substitutes.map(s => s.player_id)].filter(id => id && id !== currentPlayerId)
    return players.filter(p => !selectedIds.includes(p.id))
  }

  const positions = ['GK', 'DEF', 'MIL', 'ATT']

  const steps = [
    { num: 1, label: 'Infos match', icon: Calendar },
    { num: 2, label: 'Titulaires', icon: Users },
    { num: 3, label: 'Remplaçants', icon: Users },
    { num: 4, label: 'Vidéo', icon: Video },
  ]

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Ajouter un match</h1>
          <p style={{ color: '#6b7280', fontSize: 15 }}>Uploadez votre vidéo et indiquez la composition</p>
        </div>

        {/* Progress Steps */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {steps.map((s, i) => {
              const done = step > s.num
              const active = step === s.num
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 15, transition: 'all 0.3s',
                      background: done ? '#10b981' : active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                      color: done || active ? '#fff' : '#4b5563',
                      border: active ? 'none' : done ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: active ? '0 0 20px rgba(99,102,241,0.4)' : done ? '0 0 12px rgba(16,185,129,0.3)' : 'none',
                    }}>
                      {done ? <Check size={16} /> : s.num}
                    </div>
                    <span style={{
                      fontSize: 12, marginTop: 8, fontWeight: 600,
                      color: active ? '#818cf8' : done ? '#10b981' : '#4b5563',
                    }}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div style={{
                      height: 2, flex: 1, maxWidth: 80, margin: '0 4px',
                      background: step > s.num ? 'linear-gradient(90deg, #10b981, #6366f1)' : 'rgba(255,255,255,0.06)',
                      borderRadius: 2, transition: 'background 0.4s',
                      marginBottom: 22,
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1: Match Info */}
        {step === 1 && (
          <div style={{ ...S.card, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Date du match *">
                <input type="date" name="date" value={matchData.date} onChange={handleMatchChange}
                  style={S.input} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </Field>
              <Field label="Adversaire *">
                <input type="text" name="opponent" value={matchData.opponent} onChange={handleMatchChange}
                  style={S.input} placeholder="FC Marseille"
                  onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </Field>
              <Field label="Compétition">
                <input type="text" name="competition" value={matchData.competition} onChange={handleMatchChange}
                  style={S.input} placeholder="Championnat"
                  onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </Field>
              <Field label="Catégorie">
                <select name="category" value={matchData.category} onChange={handleMatchChange} style={S.select}>
                  {['N3','U19','U17','U15','Seniors'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Lieu">
                <input type="text" name="location" value={matchData.location} onChange={handleMatchChange}
                  style={S.input} placeholder="Stade Municipal"
                  onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </Field>
              <Field label="Score">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="number" name="score_home" value={matchData.score_home} onChange={handleMatchChange}
                    style={{ ...S.input, width: 80, textAlign: 'center', padding: '12px 8px' }} placeholder="0" min="0"
                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  <span style={{ color: '#374151', fontWeight: 700, fontSize: 18 }}>—</span>
                  <input type="number" name="score_away" value={matchData.score_away} onChange={handleMatchChange}
                    style={{ ...S.input, width: 80, textAlign: 'center', padding: '12px 8px' }} placeholder="0" min="0"
                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              </Field>
              <Field label="Météo">
                <select name="weather" value={matchData.weather} onChange={handleMatchChange} style={S.select}>
                  <option value="Ensoleillé">☀️ Ensoleillé</option>
                  <option value="Nuageux">☁️ Nuageux</option>
                  <option value="Pluvieux">🌧️ Pluvieux</option>
                  <option value="Venteux">💨 Venteux</option>
                </select>
              </Field>
              <Field label="Type de terrain">
                <select name="pitch_type" value={matchData.pitch_type} onChange={handleMatchChange} style={S.select}>
                  <option value="Naturel">🌱 Naturel</option>
                  <option value="Synthétique">⚡ Synthétique</option>
                  <option value="Hybride">🔄 Hybride</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Step 2: Starters */}
        {step === 2 && (
          <div style={{ ...S.card, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Titulaires</h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{lineup.starters.length}/11 joueurs sélectionnés</p>
              </div>
              {lineup.starters.length < 11 && (
                <button onClick={addStarter} style={{
                  padding: '8px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14,
                  boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                }}>+ Ajouter</button>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, transition: 'width 0.3s',
                width: `${(lineup.starters.length / 11) * 100}%`,
                background: lineup.starters.length === 11 ? 'linear-gradient(90deg, #10b981, #22c55e)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lineup.starters.map((starter, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', background: '#080a10',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#818cf8',
                  }}>{index + 1}</div>
                  <select value={starter.player_id} onChange={e => updateStarter(index, 'player_id', e.target.value)}
                    style={{ ...S.select, flex: 1 }}>
                    <option value="">Sélectionner joueur</option>
                    {getAvailablePlayers(starter.player_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" value={starter.number} onChange={e => updateStarter(index, 'number', e.target.value)}
                    style={{ ...S.input, width: 70, textAlign: 'center', padding: '10px 8px' }} placeholder="N°" min="1" max="99" />
                  <select value={starter.position} onChange={e => updateStarter(index, 'position', e.target.value)}
                    style={{ ...S.select, width: 90 }}>
                    {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                  <button onClick={() => removeStarter(index)} style={{
                    padding: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, cursor: 'pointer', color: '#ef4444', display: 'flex',
                  }}><X size={15} /></button>
                </div>
              ))}
              {lineup.starters.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#4b5563', fontSize: 14 }}>
                  Cliquez sur "+ Ajouter" pour sélectionner vos 11 titulaires
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Substitutes */}
        {step === 3 && (
          <div style={{ ...S.card, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Remplaçants</h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{lineup.substitutes.length}/5 — optionnels</p>
              </div>
              {lineup.substitutes.length < 5 && (
                <button onClick={addSubstitute} style={{
                  padding: '8px 18px', background: 'rgba(249,115,22,0.15)',
                  color: '#f97316', fontWeight: 600, borderRadius: 10,
                  border: '1px solid rgba(249,115,22,0.3)', cursor: 'pointer', fontSize: 14,
                }}>+ Ajouter</button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lineup.substitutes.map((sub, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', background: '#080a10',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#f97316',
                  }}>R{index + 1}</div>
                  <select value={sub.player_id} onChange={e => updateSubstitute(index, 'player_id', e.target.value)}
                    style={{ ...S.select, flex: 1 }}>
                    <option value="">Sélectionner joueur</option>
                    {getAvailablePlayers(sub.player_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" value={sub.number} onChange={e => updateSubstitute(index, 'number', e.target.value)}
                    style={{ ...S.input, width: 70, textAlign: 'center', padding: '10px 8px' }} placeholder="N°" min="1" max="99" />
                  <button onClick={() => removeSubstitute(index)} style={{
                    padding: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, cursor: 'pointer', color: '#ef4444', display: 'flex',
                  }}><X size={15} /></button>
                </div>
              ))}
              {lineup.substitutes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#4b5563', fontSize: 14 }}>
                  Les remplaçants sont optionnels (max 5)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Video */}
        {step === 4 && (
          <div style={{ ...S.card, animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Vidéo du match</h2>
            <input type="file" accept="video/*" onChange={handleVideoChange} id="video-upload" style={{ display: 'none' }} />
            <label
              htmlFor="video-upload"
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: 220, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                border: dragOver ? '2px solid #6366f1' : videoFile ? '2px solid rgba(16,185,129,0.4)' : '2px dashed rgba(255,255,255,0.08)',
                background: dragOver ? 'rgba(99,102,241,0.05)' : videoFile ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
              }}
            >
              {videoFile ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={24} color="#10b981" />
                  </div>
                  <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{videoFile.name}</p>
                  <p style={{ fontSize: 13, color: '#10b981' }}>{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p style={{ fontSize: 12, color: '#4b5563', marginTop: 8 }}>Cliquez pour changer</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Upload size={22} color="#6366f1" />
                  </div>
                  <p style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Glissez votre vidéo ici</p>
                  <p style={{ fontSize: 13, color: '#4b5563' }}>ou cliquez pour sélectionner</p>
                  <p style={{ fontSize: 12, color: '#374151', marginTop: 8 }}>MP4, MOV, AVI — max 2GB</p>
                </div>
              )}
            </label>

            {videoFile && (
              <div style={{
                marginTop: 16, padding: '14px 18px',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 10, fontSize: 13, color: '#818cf8',
              }}>
                ℹ️ L'analyse IA démarrera automatiquement après l'upload. Vous recevrez une notification quand ce sera terminé (24-48h).
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          {step > 1 ? (
            <button onClick={prevStep} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
              color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: 15,
            }}>
              <ChevronLeft size={18} /> Précédent
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard/matches')} style={{
              padding: '12px 22px', background: 'transparent', border: 'none',
              color: '#4b5563', cursor: 'pointer', fontWeight: 600, fontSize: 15,
            }}>Annuler</button>
          )}

          {step < 4 ? (
            <button onClick={nextStep} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, borderRadius: 10, border: 'none',
              cursor: 'pointer', fontSize: 15, boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
            }}>
              Suivant <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={uploading} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: uploading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, borderRadius: 10, border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 15,
              boxShadow: uploading ? 'none' : '0 6px 20px rgba(99,102,241,0.35)',
            }}>
              {uploading ? (
                <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Upload en cours...</>
              ) : (
                <><Check size={18} /> Terminer</>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #0d0f18; color: #f1f5f9; }
      `}</style>
    </DashboardLayout>
  )
}

export default UploadMatch
