import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Calendar, MapPin, Users, Video, ChevronRight, ChevronLeft, Check, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import matchService from '../services/matchService'
import playerService from '../services/playerService'

function UploadMatch() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [matchData, setMatchData] = useState({
    date: '',
    opponent: '',
    competition: '',
    location: '',
    score_home: '',
    score_away: '',
    category: 'N3',
    weather: 'Ensoleillé',
    pitch_type: 'Naturel'
  })

  const [lineup, setLineup] = useState({
    starters: [], // Array of {player_id, player_name, number, position}
    substitutes: [] // Array of {player_id, player_name, number}
  })

  const [videoFile, setVideoFile] = useState(null)

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    try {
      const data = await playerService.getPlayers()
      setPlayers(data.filter(p => p.status === 'actif'))
    } catch (error) {
      console.error('Error loading players:', error)
    }
  }

  const handleMatchChange = (e) => {
    setMatchData({
      ...matchData,
      [e.target.name]: e.target.value
    })
  }

  const addStarter = () => {
    if (lineup.starters.length >= 11) {
      alert('11 titulaires maximum')
      return
    }
    setLineup({
      ...lineup,
      starters: [...lineup.starters, { player_id: '', player_name: '', number: '', position: 'MIL' }]
    })
  }

  const removeStarter = (index) => {
    setLineup({
      ...lineup,
      starters: lineup.starters.filter((_, i) => i !== index)
    })
  }

  const updateStarter = (index, field, value) => {
    const newStarters = [...lineup.starters]
    newStarters[index][field] = value
    
    // If player selected, auto-fill name
    if (field === 'player_id' && value) {
      const player = players.find(p => p.id === value)
      if (player) {
        newStarters[index].player_name = player.name
      }
    }
    
    setLineup({ ...lineup, starters: newStarters })
  }

  const addSubstitute = () => {
    if (lineup.substitutes.length >= 5) {
      alert('5 remplaçants maximum')
      return
    }
    setLineup({
      ...lineup,
      substitutes: [...lineup.substitutes, { player_id: '', player_name: '', number: '' }]
    })
  }

  const removeSubstitute = (index) => {
    setLineup({
      ...lineup,
      substitutes: lineup.substitutes.filter((_, i) => i !== index)
    })
  }

  const updateSubstitute = (index, field, value) => {
    const newSubs = [...lineup.substitutes]
    newSubs[index][field] = value
    
    if (field === 'player_id' && value) {
      const player = players.find(p => p.id === value)
      if (player) {
        newSubs[index].player_name = player.name
      }
    }
    
    setLineup({ ...lineup, substitutes: newSubs })
  }

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Veuillez sélectionner une vidéo')
        return
      }
      setVideoFile(file)
    }
  }

  const validateStep = () => {
    if (step === 1) {
      if (!matchData.date || !matchData.opponent) {
        alert('Date et adversaire obligatoires')
        return false
      }
    }
    if (step === 2) {
      if (lineup.starters.length !== 11) {
        alert('Vous devez sélectionner exactement 11 titulaires')
        return false
      }
      // Check all starters have player and number
      for (let starter of lineup.starters) {
        if (!starter.player_id || !starter.number) {
          alert('Tous les titulaires doivent avoir un joueur et un numéro')
          return false
        }
      }
      // Check no duplicate numbers
      const numbers = [...lineup.starters.map(s => s.number), ...lineup.substitutes.map(s => s.number)].filter(Boolean)
      if (new Set(numbers).size !== numbers.length) {
        alert('Numéros de maillot en double détectés')
        return false
      }
    }
    if (step === 3) {
      // Substitutes optional but if filled must have player and number
      for (let sub of lineup.substitutes) {
        if ((sub.player_id && !sub.number) || (!sub.player_id && sub.number)) {
          alert('Les remplaçants doivent avoir un joueur ET un numéro')
          return false
        }
      }
    }
    if (step === 4) {
      if (!videoFile) {
        alert('Veuillez sélectionner une vidéo')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    try {
      setUploading(true)

      // Create match with composition
      const matchPayload = {
        ...matchData,
        lineup: {
          starters: lineup.starters.filter(s => s.player_id),
          substitutes: lineup.substitutes.filter(s => s.player_id)
        }
      }

      const match = await matchService.createMatch(matchPayload)

      // Upload video
      if (videoFile) {
        await matchService.uploadVideo(match.id, videoFile)
      }

      alert('Match uploadé avec succès ! L\'analyse IA démarrera sous peu.')
      navigate('/dashboard/matches')

    } catch (error) {
      console.error('Error uploading match:', error)
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const getAvailablePlayers = (currentPlayerId) => {
    const selectedIds = [
      ...lineup.starters.map(s => s.player_id),
      ...lineup.substitutes.map(s => s.player_id)
    ].filter(id => id && id !== currentPlayerId)
    
    return players.filter(p => !selectedIds.includes(p.id))
  }

  const positions = ['GK', 'DEF', 'MIL', 'ATT']

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ajouter un match</h1>
          <p className="text-gray-400">Uploadez votre vidéo et indiquez la composition</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Infos match' },
              { num: 2, label: 'Titulaires' },
              { num: 3, label: 'Remplaçants' },
              { num: 4, label: 'Vidéo' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num ? 'bg-primary text-black' : 'bg-dark-border text-gray-500'
                  }`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-sm mt-2 ${step >= s.num ? 'text-primary' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 3 && (
                  <div className={`h-0.5 flex-1 ${step > s.num ? 'bg-primary' : 'bg-dark-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Match Info */}
        {step === 1 && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date du match *
                </label>
                <input
                  type="date"
                  name="date"
                  value={matchData.date}
                  onChange={handleMatchChange}
                  className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adversaire *
                </label>
                <input
                  type="text"
                  name="opponent"
                  value={matchData.opponent}
                  onChange={handleMatchChange}
                  className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  placeholder="FC Marseille"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Compétition
                </label>
                <input
                  type="text"
                  name="competition"
                  value={matchData.competition}
                  onChange={handleMatchChange}
                  className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  placeholder="Championnat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  name="category"
                  value={matchData.category}
                  onChange={handleMatchChange}
                  className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="N3">N3</option>
                  <option value="U19">U19</option>
                  <option value="U17">U17</option>
                  <option value="U15">U15</option>
                  <option value="Seniors">Seniors</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  name="location"
                  value={matchData.location}
                  onChange={handleMatchChange}
                  className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  placeholder="Stade Municipal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Score
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="score_home"
                    value={matchData.score_home}
                    onChange={handleMatchChange}
                    className="w-20 bg-black border border-dark-border rounded-lg px-4 py-3 text-white text-center focus:border-primary focus:outline-none"
                    placeholder="0"
                    min="0"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    name="score_away"
                    value={matchData.score_away}
                    onChange={handleMatchChange}
                    className="w-20 bg-black border border-dark-border rounded-lg px-4 py-3 text-white text-center focus:border-primary focus:outline-none"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Météo
                </label>
                <select
                  name="weather"
                  value={matchData.weather}
                  onChange={handleMatchChange}
                  className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="Ensoleillé">☀️ Ensoleillé</option>
                  <option value="Nuageux">☁️ Nuageux</option>
                  <option value="Pluvieux">🌧️ Pluvieux</option>
                  <option value="Venteux">💨 Venteux</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de terrain
                </label>
                <select
                  name="pitch_type"
                  value={matchData.pitch_type}
                  onChange={handleMatchChange}
                  className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="Naturel">🌱 Naturel</option>
                  <option value="Synthétique">⚡ Synthétique</option>
                  <option value="Hybride">🔄 Hybride</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Starters */}
        {step === 2 && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">11 titulaires ({lineup.starters.length}/11)</h2>
              {lineup.starters.length < 11 && (
                <button
                  onClick={addStarter}
                  className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all"
                >
                  + Ajouter
                </button>
              )}
            </div>

            <div className="space-y-3">
              {lineup.starters.map((starter, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-black border border-dark-border rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>

                  <select
                    value={starter.player_id}
                    onChange={(e) => updateStarter(index, 'player_id', e.target.value)}
                    className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  >
                    <option value="">Sélectionner joueur</option>
                    {getAvailablePlayers(starter.player_id).map(player => (
                      <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={starter.number}
                    onChange={(e) => updateStarter(index, 'number', e.target.value)}
                    className="w-20 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white text-center focus:border-primary focus:outline-none"
                    placeholder="N°"
                    min="1"
                    max="99"
                  />

                  <select
                    value={starter.position}
                    onChange={(e) => updateStarter(index, 'position', e.target.value)}
                    className="w-24 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  >
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeStarter(index)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {lineup.starters.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Cliquez sur "+ Ajouter" pour sélectionner vos 11 titulaires
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Substitutes */}
        {step === 3 && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Remplaçants ({lineup.substitutes.length}/5)</h2>
              {lineup.substitutes.length < 5 && (
                <button
                  onClick={addSubstitute}
                  className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all"
                >
                  + Ajouter
                </button>
              )}
            </div>

            <div className="space-y-3">
              {lineup.substitutes.map((sub, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-black border border-dark-border rounded-lg">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center font-bold text-orange-500">
                    R{index + 1}
                  </div>

                  <select
                    value={sub.player_id}
                    onChange={(e) => updateSubstitute(index, 'player_id', e.target.value)}
                    className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  >
                    <option value="">Sélectionner joueur</option>
                    {getAvailablePlayers(sub.player_id).map(player => (
                      <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={sub.number}
                    onChange={(e) => updateSubstitute(index, 'number', e.target.value)}
                    className="w-20 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white text-center focus:border-primary focus:outline-none"
                    placeholder="N°"
                    min="1"
                    max="99"
                  />

                  <button
                    onClick={() => removeSubstitute(index)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {lineup.substitutes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Les remplaçants sont optionnels. Cliquez sur "+ Ajouter" pour en ajouter (max 5).
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Video Upload */}
        {step === 4 && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Vidéo du match</h2>

            <div className="mb-6">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-dark-border hover:border-primary/50 rounded-lg transition-colors cursor-pointer group"
              >
                {videoFile ? (
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-semibold text-white mb-2">{videoFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-500 mt-4">Cliquez pour changer</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-500 group-hover:text-primary transition-colors" />
                    <p className="text-lg font-semibold text-gray-300 mb-2">
                      Cliquez pour uploader la vidéo
                    </p>
                    <p className="text-sm text-gray-500">
                      MP4, MOV, AVI (max 2GB)
                    </p>
                  </div>
                )}
              </label>
            </div>

            {videoFile && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  ℹ️ L'analyse IA démarrera automatiquement après l'upload. Vous recevrez une notification quand ce sera terminé (24-48h).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-dark-border hover:bg-dark-border rounded-lg transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/matches')}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="px-8 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Terminer
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default UploadMatch
