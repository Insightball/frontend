import { useState } from 'react'
import { X, User, Hash, Upload } from 'lucide-react'

function PlayerForm({ isOpen, onClose, onSubmit, player = null, category }) {
  const [formData, setFormData] = useState({
    name: player?.name || '',
    number: player?.number || '',
    position: player?.position || 'Milieu',
    category: player?.category || category || 'N3',
    photo_url: player?.photo_url || '',
    birth_date: player?.birth_date || '',
    height: player?.height || '',
    weight: player?.weight || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (!formData.name || !formData.number || !formData.position) {
        setError('Nom, numéro et poste sont obligatoires')
        setLoading(false)
        return
      }

      // Convert types
      const submitData = {
        ...formData,
        number: parseInt(formData.number),
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        birth_date: formData.birth_date || null,
      }

      await onSubmit(submitData)
      onClose()
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-2xl font-bold">
            {player ? 'Modifier le joueur' : 'Ajouter un joueur'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-border rounded-lg transition-colors"
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

          {/* Row 1: Name + Number */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                  placeholder="Kylian Mbappé"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Numéro *
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                  placeholder="10"
                  min="1"
                  max="99"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2: Position + Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poste *
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                required
              >
                <option value="Gardien">Gardien</option>
                <option value="Défenseur">Défenseur</option>
                <option value="Milieu">Milieu</option>
                <option value="Attaquant">Attaquant</option>
              </select>
            </div>

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
              >
                <option value="N3">N3</option>
                <option value="U19">U19 Nationaux</option>
                <option value="U17">U17 Nationaux</option>
                <option value="U15">U15</option>
                <option value="Seniors">Seniors</option>
              </select>
            </div>
          </div>

          {/* Row 3: Birth date + Height + Weight */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Taille (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                placeholder="180"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poids (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                placeholder="75"
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Photo (URL)
            </label>
            <div className="relative">
              <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleChange}
                className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Collez l'URL d'une photo (optionnel)
            </p>
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
              disabled={loading}
              className="px-8 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : (player ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlayerForm
