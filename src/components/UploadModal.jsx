import { useState } from 'react'
import { X, Upload, Film, Calendar, Tag } from 'lucide-react'

function UploadModal({ isOpen, onClose, onUpload }) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({
    opponent: '',
    date: '',
    category: 'N3',
    type: 'championnat'
  })
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(file.type)) {
      alert('Format vidéo non supporté. Utilisez MP4, MOV ou AVI.')
      return
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB in bytes
    if (file.size > maxSize) {
      alert('Fichier trop volumineux. Maximum 2GB.')
      return
    }

    setFile(file)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      alert('Veuillez sélectionner une vidéo')
      return
    }

    setUploading(true)

    // TODO: Replace with real API upload
    // Simulate upload
    setTimeout(() => {
      const matchData = {
        id: Date.now().toString(),
        opponent: formData.opponent,
        date: formData.date,
        category: formData.category,
        type: formData.type,
        videoFile: file.name,
        status: 'processing',
        uploadedAt: new Date().toISOString()
      }

      onUpload(matchData)
      setUploading(false)
      resetForm()
      onClose()
    }, 2000)
  }

  const resetForm = () => {
    setFile(null)
    setFormData({
      opponent: '',
      date: '',
      category: 'N3',
      type: 'championnat'
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-2xl font-bold">Uploader un match</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-border rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vidéo du match *
            </label>
            
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-dark-border hover:border-primary/50'
                }`}
              >
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium mb-2">
                  Glissez votre vidéo ici
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  ou cliquez pour parcourir
                </p>
                <p className="text-xs text-gray-500">
                  Max 2GB • MP4, MOV, AVI
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-black border border-primary/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Film className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-dark-border rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Match Info */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Opponent */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Équipe adverse *
              </label>
              <input
                type="text"
                name="opponent"
                value={formData.opponent}
                onChange={handleInputChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                placeholder="FC Lyon"
                required
              />
            </div>

            {/* Date */}
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
                  onChange={handleInputChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Catégorie
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                >
                  <option value="N3">N3</option>
                  <option value="U19">U19 Nationaux</option>
                  <option value="U17">U17 Nationaux</option>
                  <option value="U15">U15</option>
                  <option value="Seniors">Seniors</option>
                </select>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de match
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              >
                <option value="championnat">Championnat</option>
                <option value="coupe">Coupe</option>
                <option value="amical">Amical</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-8 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Upload en cours...' : 'Uploader'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal
