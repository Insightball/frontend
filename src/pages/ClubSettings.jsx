import { useState, useEffect } from 'react'
import { Save, X, Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import ClubBadge from '../components/ClubBadge'
import SubscriptionManagement from '../components/SubscriptionManagement'
import clubService from '../services/clubService'

const G = {
  bg: '#0a0908', bg2: '#0f0e0c',
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.62)',
  text: '#f5f2eb',
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '12px 16px', color: '#f5f2eb',
  fontFamily: G.mono, fontSize: 13,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
}

function Section({ title, children, accent }) {
  return (
    <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderTop: `2px solid ${accent || G.border}`, padding: '28px' }}>
      <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ width: 12, height: 1, background: G.gold, display: 'inline-block' }} />{title}
      </div>
      {children}
    </div>
  )
}

export default function ClubSettings() {
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [formData, setFormData] = useState({ name: '', logo_url: '', primary_color: '#c9a227', secondary_color: '#0f0f0d' })
  const [toast, setToast] = useState(null)

  useEffect(() => { loadClub() }, [])

  const loadClub = async () => {
    try {
      setLoading(true)
      const data = await clubService.getMyClub()
      setClub(data)
      setFormData({ name: data.name || '', logo_url: data.logo_url || '', primary_color: data.primary_color || '#c9a227', secondary_color: data.secondary_color || '#0f0f0d' })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500) }

  const handleRemoveLogo = () => setFormData(prev => ({ ...prev, logo_url: '' }))

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') return
    setDeleteLoading(true)
    try {
      const token = localStorage.getItem('insightball_token')
      const res = await fetch('https://backend-pued.onrender.com/api/account/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error()
      localStorage.removeItem('insightball_token')
      window.location.href = '/'
    } catch {
      showToast('error', 'Erreur lors de la suppression')
      setDeleteLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await clubService.updateClub({
        name: formData.name,
        logo_url: formData.logo_url,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
      })
      showToast('success', 'Paramètres sauvegardés ✓')
      await loadClub()
    } catch (e) {
      console.error(e)
      showToast('error', 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>Chargement...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px',
          background: toast.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={15} color="#22c55e" />
            : <AlertCircle size={15} color="#ef4444" />}
          <span style={{ fontFamily: G.mono, fontSize: 11, letterSpacing: '.06em', color: toast.type === 'success' ? '#22c55e' : '#ef4444' }}>
            {toast.msg}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Paramètres du club
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: G.text, margin: 0 }}>
          Identité<br /><span style={{ color: G.gold }}>du club.</span>
        </h1>
      </div>

      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>

        {/* Aperçu */}
        <Section title="Aperçu" accent={G.gold}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}` }}>
            <ClubBadge club={{ ...formData, logo_url: formData.logo_url }} size="xl" showName />
          </div>
        </Section>

        {/* Nom */}
        <Section title="Nom du club">
          <input type="text" name="name" value={formData.name} onChange={handleChange}
            placeholder="Mon Club FC" style={inputStyle}
            onFocus={e => e.target.style.borderColor = G.goldBdr}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
        </Section>

        {/* Logo */}
        <Section title="Logo">
          {formData.logo_url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}` }}>
              <img src={formData.logo_url} alt="Logo" style={{ width: 56, height: 56, objectFit: 'contain' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginBottom: 4 }}>Aperçu</div>
                <div style={{ fontFamily: G.mono, fontSize: 10, color: G.text, wordBreak: 'break-all' }}>{formData.logo_url}</div>
              </div>
              <button onClick={handleRemoveLogo} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={14} color={G.muted} />
              </button>
            </div>
          )}
          <input type="url" name="logo_url" value={formData.logo_url} onChange={handleChange}
            placeholder="https://monclub.fr/logo.png"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = G.goldBdr}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          <div style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.45)', marginTop: 8 }}>
            Colle l'URL de ton logo — PNG, SVG ou JPG recommandé
          </div>
        </Section>

        {/* Couleurs */}
        <Section title="Couleurs du club">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[{ label: 'Couleur principale', name: 'primary_color' }, { label: 'Couleur secondaire', name: 'secondary_color' }].map(({ label, name }) => (
              <div key={name}>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.65)', marginBottom: 10 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" name={name} value={formData[name]} onChange={handleChange}
                    style={{ width: 44, height: 44, border: `1px solid ${G.border}`, background: 'transparent', cursor: 'pointer', padding: 2 }} />
                  <input type="text" name={name} value={formData[name]} onChange={handleChange} style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => e.target.style.borderColor = G.goldBdr}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Abonnement */}
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, padding: '28px' }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ width: 12, height: 1, background: G.gold }} />Abonnement
          </div>
          <SubscriptionManagement />
        </div>

        {/* Save */}
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={loadClub} disabled={saving} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
            background: saving ? 'rgba(201,162,39,0.4)' : G.gold,
            color: '#0f0f0d', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700,
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = G.goldD }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = G.gold }}>
            {saving ? 'Sauvegarde...' : <><Save size={13} /> Sauvegarder</>}
          </button>
        </div>

        {/* Supprimer compte — discret */}
        <div style={{ padding: '16px 28px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowDeleteModal(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
            color: 'rgba(239,68,68,0.45)', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'color .15s', padding: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(239,68,68,0.80)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.45)'}>
            <Trash2 size={10} /> Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modale suppression */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: G.bg2, width: '100%', maxWidth: 440, border: `1px solid rgba(239,68,68,0.3)`, borderTop: `2px solid #ef4444` }}>

            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={16} color="#ef4444" />
                <span style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: G.text }}>Supprimer le compte</span>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color={G.muted} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.06)', border: `1px solid rgba(239,68,68,0.15)`, marginBottom: 24 }}>
                <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.7)', lineHeight: 1.7, margin: 0 }}>
                  Votre compte sera désactivé immédiatement. Toutes vos données seront conservées pendant <strong style={{ color: G.text }}>30 jours</strong> et vous recevrez un email pour récupérer votre compte si vous changez d'avis.
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 10 }}>
                  Tapez <strong style={{ color: '#ef4444' }}>SUPPRIMER</strong> pour confirmer
                </div>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  style={{
                    width: '100%', background: 'rgba(239,68,68,0.04)',
                    border: `1px solid ${deleteConfirm === 'SUPPRIMER' ? '#ef4444' : 'rgba(239,68,68,0.15)'}`,
                    padding: '12px 16px', color: G.text,
                    fontFamily: G.mono, fontSize: 13,
                    outline: 'none', boxSizing: 'border-box', letterSpacing: '.06em',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9,
                  letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer',
                }}>Annuler</button>
                <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'SUPPRIMER' || deleteLoading} style={{
                  flex: 2, padding: '11px', background: deleteConfirm === 'SUPPRIMER' ? '#ef4444' : 'rgba(239,68,68,0.2)',
                  border: 'none', fontFamily: G.mono, fontSize: 9,
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  color: deleteConfirm === 'SUPPRIMER' ? '#fff' : 'rgba(239,68,68,0.4)',
                  cursor: deleteConfirm === 'SUPPRIMER' ? 'pointer' : 'not-allowed',
                  fontWeight: 700, transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {deleteLoading ? 'Suppression...' : <><Trash2 size={11} /> Supprimer définitivement</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  )
}
