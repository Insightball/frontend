import { useState } from 'react'
import { X, Upload, Calendar, Tag, Trophy, Cloud, Leaf } from 'lucide-react'

function UploadModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    opponent: '',
    date: '',
    category: 'N3',
    type: 'championnat',
    video: null,
    score_home: '',
    score_away: '',
    is_home: true,
    weather: '',
    pitch_type: '',
    coach_notes: '',
    tags: ''
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Veuillez sélectionner une vidéo')
        return
      }
      setFormData(prev => ({ ...prev, video: file }))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.opponent || !formData.date || !formData.video) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Call parent submit
      await onSubmit(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset and close
      setTimeout(() => {
        setFormData({
          opponent: '',
          date: '',
          category: 'N3',
          type: 'championnat',
          video: null,
          score_home: '',
          score_away: '',
          is_home: true,
          weather: '',
          pitch_type: '',
          coach_notes: '',
          tags: ''
        })
        setUploading(false)
        setUploadProgress(0)
        onClose()
      }, 1000)

    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-dark-card border border-dark-border rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-dark-border bg-dark-card">
          <h2 className="text-2xl font-bold">Uploader un match</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-border rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Row 1: Opponent + Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adversaire *
              </label>
              <input
                type="text"
                name="opponent"
                value={formData.opponent}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                placeholder="FC Lyon"
                required
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date du match *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                  required
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Category + Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Catégorie *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                required
                disabled={uploading}
              >
                <option value="N3">N3</option>
                <option value="U19">U19 Nationaux</option>
                <option value="U17">U17 Nationaux</option>
                <option value="U15">U15</option>
                <option value="Seniors">Seniors</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de match *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                required
                disabled={uploading}
              >
                <option value="championnat">Championnat</option>
                <option value="coupe">Coupe</option>
                <option value="amical">Amical</option>
              </select>
            </div>
          </div>

          {/* Row 3: Score + Domicile/Extérieur */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Score domicile
              </label>
              <div className="relative">
                <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  name="score_home"
                  value={formData.score_home}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                  placeholder="3"
                  min="0"
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Score extérieur
              </label>
              <div className="relative">
                <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  name="score_away"
                  value={formData.score_away}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                  placeholder="1"
                  min="0"
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nous sommes
              </label>
              <select
                name="is_home"
                value={formData.is_home}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                disabled={uploading}
              >
                <option value={true}>Domicile</option>
                <option value={false}>Extérieur</option>
              </select>
            </div>
          </div>

          {/* Row 4: Météo + Type terrain */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Météo
              </label>
              <div className="relative">
                <Cloud className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  name="weather"
                  value={formData.weather}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                  disabled={uploading}
                >
                  <option value="">Sélectionner...</option>
                  <option value="ensoleillé">☀️ Ensoleillé</option>
                  <option value="nuageux">☁️ Nuageux</option>
                  <option value="pluie">🌧️ Pluie</option>
                  <option value="vent">💨 Vent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de terrain
              </label>
              <div className="relative">
              <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  name="pitch_type"
                  value={formData.pitch_type}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                  disabled={uploading}
                >
                  <option value="">Sélectionner...</option>
                  <option value="herbe">🌱 Herbe naturelle</option>
                  <option value="synthetique">⚙️ Synthétique</option>
                </select>
              </div>
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vidéo du match *
            </label>
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
                disabled={uploading}
              />
              <label
                htmlFor="video-upload"
                className={`flex items-center justify-center w-full px-6 py-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                  formData.video
                    ? 'border-primary bg-primary/5'
                    : 'border-dark-border hover:border-primary/50'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  {formData.video ? (
                    <>
                      <p className="text-white font-medium mb-1">{formData.video.name}</p>
                      <p className="text-sm text-gray-400">
                        {(formData.video.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-medium mb-1">
                        Cliquez pour sélectionner une vidéo
                      </p>
                      <p className="text-sm text-gray-400">MP4, MOV, AVI (max 2GB)</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Notes coach */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes du coach
            </label>
            <textarea
              name="coach_notes"
              value={formData.coach_notes}
              onChange={handleChange}
              rows={4}
              className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Points clés du match, observations tactiques..."
              disabled={uploading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                placeholder="#victoire #match-clé #derby"
                disabled={uploading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Séparez les tags par des espaces
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Upload en cours...</span>
                <span className="text-sm font-mono text-primary">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading || !formData.video}
              className="px-8 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Uploader
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal
