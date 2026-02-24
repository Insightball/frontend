import { useState, useEffect } from 'react'
import { Upload, Save, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import ClubBadge from '../components/ClubBadge'
import SubscriptionManagement from '../components/SubscriptionManagement'
import clubService from '../services/clubService'
import uploadService from '../services/uploadService'

const G = {
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(15,15,13,0.09)', muted: 'rgba(15,15,13,0.42)',
}

const inputStyle = {
  width: '100%', background: '#ffffff',
  border: '1px solid rgba(255,255,255,0.07)',
  padding: '12px 16px', color: '#0f0f0d',
  fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
}

function Section({ title, children, accent }) {
  return (
    <div style={{ background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, borderTop: `2px solid ${accent || G.border}`, padding: '28px' }}>
      <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ width: 12, height: 1, background: G.gold, display: 'inline-block' }} />{title}
      </div>
      {children}
    </div>
  )
}

function ClubSettings() {
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '', logo_url: '', primary_color: '#c9a227', secondary_color: '#0f0f0d'
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  useEffect(() => { loadClub() }, [])

  const loadClub = async () => {
    try {
      setLoading(true); const data = await clubService.getMyClub(); setClub(data)
      setFormData({ name: data.name || '', logo_url: data.logo_url || '', primary_color: data.primary_color || '#c9a227', secondary_color: data.secondary_color || '#0f0f0d' })
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { alert('Sélectionnez une image'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Fichier trop volumineux (max 2MB)'); return }
    setLogoFile(file)
    const reader = new FileReader(); reader.onloadend = () => setLogoPreview(reader.result); reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => { setFormData(prev => ({ ...prev, logo_url: '' })); setLogoFile(null); setLogoPreview(null) }

  const handleSave = async () => {
    try {
      setSaving(true)
      let finalLogo = formData.logo_url
      if (logoFile) { try { finalLogo = await uploadService.uploadFile(logoFile) } catch { alert('Erreur logo, autres modifs sauvegardées') } }
      await clubService.updateClub({ name: formData.name, logo_url: finalLogo, primary_color: formData.primary_color, secondary_color: formData.secondary_color })
      alert('Paramètres sauvegardés !')
      await loadClub(); setLogoFile(null); setLogoPreview(null)
    } catch (e) { console.error(e); alert('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)' }}>
        Chargement...
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Paramètres du club
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: 44, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: '#0f0f0d', margin: 0 }}>
          Identité<br /><span style={{ color: G.gold }}>du club.</span>
        </h1>
      </div>

      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>

        {/* Aperçu */}
        <Section title="Aperçu" accent={G.gold}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px', background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)` }}>
            <ClubBadge club={{ ...formData, logo_url: logoPreview || formData.logo_url }} size="xl" showName />
          </div>
        </Section>

        {/* Nom */}
        <Section title="Nom du club">
          <input type="text" name="name" value={formData.name} onChange={handleChange}
            placeholder="Mon Club FC" style={inputStyle}
            onFocus={e => e.target.style.borderColor = G.gold}
            onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.09)'}
          />
        </Section>

        {/* Logo */}
        <Section title="Logo">
          {(logoPreview || formData.logo_url) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '14px 16px', background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)` }}>
              <img src={logoPreview || formData.logo_url} alt="Logo" style={{ width: 56, height: 56, objectFit: 'contain', background: 'transparent' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 6 }}>Logo actuel</div>
                <button onClick={handleRemoveLogo} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <X size={11} /> Supprimer
                </button>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleLogoFile} id="logo-upload" style={{ display: 'none' }} />
          <label htmlFor="logo-upload" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '28px', border: `1px dashed rgba(201,162,39,0.2)`, cursor: 'pointer', transition: 'all .15s', marginBottom: 16,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = G.gold; e.currentTarget.style.background = G.goldBg }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)'; e.currentTarget.style.background = 'transparent' }}>
            <div style={{ width: 36, height: 36, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Upload size={16} color={G.gold} />
            </div>
            <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0f0f0d', marginBottom: 4 }}>Uploader un logo</p>
            <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(15,15,13,0.45)', letterSpacing: '.06em' }}>PNG, JPG — max 2MB</p>
          </label>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 8 }}>ou URL</div>
          <input type="url" name="logo_url" value={formData.logo_url} onChange={handleChange}
            placeholder="https://example.com/logo.png" style={inputStyle}
            onFocus={e => e.target.style.borderColor = G.gold}
            onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.09)'}
          />
        </Section>

        {/* Couleurs */}
        <Section title="Couleurs du club">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { label: 'Couleur principale',  name: 'primary_color' },
              { label: 'Couleur secondaire',  name: 'secondary_color' },
            ].map(({ label, name }) => (
              <div key={name}>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 10 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" name={name} value={formData[name]} onChange={handleChange}
                    style={{ width: 44, height: 44, border: `1px solid rgba(15,15,13,0.09)`, background: 'transparent', cursor: 'pointer', padding: 2 }} />
                  <input type="text" name={name} value={formData[name]} onChange={handleChange}
                    style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", flex: 1 }}
                    onFocus={e => e.target.style.borderColor = G.gold}
                    onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.09)'}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Subscription */}
        <div style={{ background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, padding: '28px' }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ width: 12, height: 1, background: G.gold }} />Abonnement
          </div>
          <SubscriptionManagement />
        </div>

        {/* Save */}
        <div style={{ background: '#ffffff', border: `1px solid rgba(15,15,13,0.09)`, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={loadClub} disabled={saving}
            style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f5f2eb'}
            onMouseLeave={e => e.currentTarget.style.color = G.muted}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              background: saving ? 'rgba(201,162,39,0.4)' : G.gold,
              color: '#0f0f0d', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background .15s',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = G.goldD }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = G.gold }}>
            {saving ? (
              <><div style={{ width: 12, height: 12, border: '2px solid rgba(15,15,13,0.3)', borderTopColor: '#0f0f0d', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Sauvegarde...</>
            ) : (
              <><Save size={13} /> Sauvegarder</>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  )
}

export default ClubSettings
