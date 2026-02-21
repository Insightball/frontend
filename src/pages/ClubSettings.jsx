import { useState, useEffect } from 'react'
import { Upload, Save, Palette, Image as ImageIcon, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import ClubBadge from '../components/ClubBadge'
import SubscriptionManagement from '../components/SubscriptionManagement'
import clubService from '../services/clubService'
import uploadService from '../services/uploadService'

function ClubSettings() {
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    primary_color: '#5EEAD4',
    secondary_color: '#2DD4BF'
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  useEffect(() => {
    loadClub()
  }, [])

  const loadClub = async () => {
    try {
      setLoading(true)
      const data = await clubService.getMyClub()
      setClub(data)
      setFormData({
        name: data.name || '',
        logo_url: data.logo_url || '',
        primary_color: data.primary_color || '#5EEAD4',
        secondary_color: data.secondary_color || '#2DD4BF'
      })
    } catch (error) {
      console.error('Error loading club:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 2MB)')
        return
      }
      setLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }))
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      let finalLogoUrl = formData.logo_url

      // Upload logo if file selected
      if (logoFile) {
        try {
          const uploadedUrl = await uploadService.uploadFile(logoFile)
          finalLogoUrl = uploadedUrl
        } catch (error) {
          console.error('Error uploading logo:', error)
          alert('Erreur lors de l\'upload du logo, mais autres modifications sauvegardées')
        }
      }

      // Update club
      await clubService.updateClub({
        name: formData.name,
        logo_url: finalLogoUrl,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color
      })

      alert('Paramètres sauvegardés !')
      await loadClub()
      setLogoFile(null)
      setLogoPreview(null)

    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Paramètres du club</h1>
          <p className="text-gray-400">Gérez l'identité visuelle de votre club</p>
        </div>

        <div className="space-y-8">
          {/* Preview */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Aperçu</h2>
            <div className="flex items-center justify-center p-8 bg-black rounded-lg">
              <ClubBadge 
                club={{
                  ...formData,
                  logo_url: logoPreview || formData.logo_url
                }} 
                size="xl" 
                showName={true}
              />
            </div>
          </div>

          {/* Club Name */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Nom du club</h2>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
              placeholder="Nom du club"
            />
          </div>

          {/* Logo */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Logo du club</h2>
            </div>

            {/* Current logo or preview */}
            {(logoPreview || formData.logo_url) && (
              <div className="mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={logoPreview || formData.logo_url}
                    alt="Logo"
                    className="w-24 h-24 object-contain bg-black rounded-lg border border-dark-border p-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">Logo actuel</p>
                    <button
                      onClick={handleRemoveLogo}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload */}
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-dark-border hover:border-primary/50 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500 group-hover:text-primary transition-colors" />
                    <p className="text-sm text-gray-400">
                      Cliquez pour uploader un logo
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      PNG, JPG (max 2MB)
                    </p>
                  </div>
                </label>
              </div>

              <div className="text-sm text-gray-500">ou</div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ou URL du logo
                </label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Couleurs du club</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Couleur principale
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleChange}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-dark-border"
                  />
                  <input
                    type="text"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleChange}
                    className="flex-1 bg-black border border-dark-border rounded-lg px-4 py-3 text-white font-mono focus:border-primary focus:outline-none transition-colors"
                    placeholder="#5EEAD4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleChange}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-dark-border"
                  />
                  <input
                    type="text"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleChange}
                    className="flex-1 bg-black border border-dark-border rounded-lg px-4 py-3 text-white font-mono focus:border-primary focus:outline-none transition-colors"
                    placeholder="#2DD4BF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <SubscriptionManagement />

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={loadClub}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ClubSettings