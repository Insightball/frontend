import { useState, useEffect } from 'react'
import { Upload, Palette, Save, Shield } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import ClubBadge from '../components/ClubBadge'
import clubService from '../services/clubService'
import uploadService from '../services/uploadService'
import { useAuth } from '../context/AuthContext'

function ClubSettings() {
  const { user } = useAuth()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    primary_color: '#5EEAD4',
    secondary_color: '#2DD4BF'
  })

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
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop volumineuse (max 2MB)')
      return
    }

    try {
      setUploading(true)
      
      // Upload to S3
      const logoUrl = await uploadService.uploadToS3(file, (progress) => {
        console.log(`Upload: ${progress}%`)
      })
      
      // Update form
      setFormData(prev => ({ ...prev, logo_url: logoUrl }))
      
      // Save immediately
      await clubService.updateLogo(logoUrl)
      await loadClub()
      
      alert('Logo uploadé avec succès !')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await clubService.updateClub(formData)
      await loadClub()
      alert('Paramètres sauvegardés !')
    } catch (error) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!club) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Pas de club
          </h3>
          <p className="text-gray-500">
            Cette fonctionnalité est réservée aux plans CLUB
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Paramètres du club</h1>
          <p className="text-gray-400">Personnalisez l'identité de votre club</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Preview */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Aperçu</h2>
            <div className="flex items-center justify-center p-8 bg-black rounded-lg">
              <ClubBadge 
                club={{
                  name: formData.name,
                  logo_url: formData.logo_url,
                  primary_color: formData.primary_color,
                  secondary_color: formData.secondary_color
                }} 
                size="xl" 
                showName={true}
              />
            </div>
          </div>

          {/* Logo */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Logo du club</h2>
            </div>

            <div className="space-y-4">
              {/* Current logo */}
              {formData.logo_url && (
                <div className="flex items-center gap-4">
                  <img 
                    src={formData.logo_url} 
                    alt="Logo actuel"
                    className="w-20 h-20 rounded-lg object-cover border border-dark-border"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Logo actuel</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}

              {/* Upload */}
              <div>
                <label className="block">
                  <div className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-dark-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                    <div className="text-center">
                      {uploading ? (
                        <>
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-400">Upload en cours...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                          <p className="text-sm text-gray-400">Cliquez pour uploader un logo</p>
                          <p className="text-xs text-gray-600 mt-1">PNG, JPG (max 2MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* URL manuelle */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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

          {/* Couleurs */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Couleurs du club</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Couleur principale
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleChange}
                    className="w-16 h-12 rounded border border-dark-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 bg-black border border-dark-border rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="#5EEAD4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleChange}
                    className="w-16 h-12 rounded border border-dark-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="flex-1 bg-black border border-dark-border rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="#2DD4BF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={loadClub}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default ClubSettings
