import { useState } from 'react'
import { Trash2, AlertTriangle, X, User, Mail, Shield, Lock, Eye, EyeOff } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import SubscriptionManagement from '../components/SubscriptionManagement'

const G = {
  bg: '#0a0908', bg2: '#0f0e0c',
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.62)',
  text: '#f5f2eb',
}

function Section({ title, accent, children }) {
  return (
    <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderTop: `2px solid ${accent || G.border}`, padding: '28px' }}>
      <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ width: 12, height: 1, background: G.gold, display: 'inline-block' }} />{title}
      </div>
      {children}
    </div>
  )
}

export default function CoachSettings() {
  const { user } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleChangePassword = async () => {
    setPwError('')
    if (!pwForm.current || !pwForm.next) return setPwError('Tous les champs sont requis')
    if (pwForm.next.length < 8) return setPwError('8 caractères minimum')
    if (pwForm.next !== pwForm.confirm) return setPwError('Les mots de passe ne correspondent pas')
    setPwLoading(true)
    try {
      const token = localStorage.getItem('insightball_token')
      const res = await fetch('https://backend-pued.onrender.com/api/account/change-password', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.next })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      setPwSuccess(true)
      setTimeout(() => { setShowPasswordModal(false); setPwSuccess(false); setPwForm({ current: '', next: '', confirm: '' }) }, 1500)
    } catch (e) { setPwError(e.message) }
    finally { setPwLoading(false) }
  }
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      alert('Erreur lors de la suppression')
      setDeleteLoading(false)
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Paramètres
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: G.text, margin: 0 }}>
          Mon<br /><span style={{ color: G.gold }}>compte.</span>
        </h1>
      </div>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>

        {/* Infos compte */}
        <Section title="Informations" accent={G.gold}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: User, label: 'Nom', value: user?.name || '—' },
              { icon: Mail, label: 'Email', value: user?.email || '—' },
              { icon: Shield, label: 'Plan', value: user?.plan || 'Coach' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}` }}>
                <div style={{ width: 32, height: 32, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} color={G.gold} />
                </div>
                <div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 13, color: G.text }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Abonnement */}
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.border}`, padding: '28px' }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ width: 12, height: 1, background: G.gold, display: 'inline-block' }} />Abonnement
          </div>
          <SubscriptionManagement />
        </div>

        {/* Supprimer compte — discret */}
        <div style={{ padding: '16px 28px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 24, background: G.bg2, border: `1px solid ${G.border}` }}>
          <button onClick={() => setShowPasswordModal(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
            color: 'rgba(201,162,39,0.6)', display: 'flex', alignItems: 'center', gap: 6, padding: 0,
            transition: 'color .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = G.gold}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(201,162,39,0.6)'}>
            <Lock size={10} /> Changer le mot de passe
          </button>
          <button onClick={() => setShowDeleteModal(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
            color: 'rgba(239,68,68,0.45)', display: 'flex', alignItems: 'center', gap: 6, padding: 0,
            transition: 'color .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.45)'}>
            <Trash2 size={10} /> Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modale mot de passe */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: G.bg2, width: '100%', maxWidth: 420, border: `1px solid ${G.goldBdr}`, borderTop: `2px solid ${G.gold}` }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={14} color={G.gold} />
                <span style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: G.text }}>Mot de passe</span>
              </div>
              <button onClick={() => { setShowPasswordModal(false); setPwError(''); setPwForm({ current: '', next: '', confirm: '' }) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color={G.muted} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pwError && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontFamily: G.mono, fontSize: 11, color: '#ef4444' }}>{pwError}</div>}
              {pwSuccess && <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontFamily: G.mono, fontSize: 11, color: '#22c55e' }}>Mot de passe modifié ✓</div>}
              {[
                { key: 'current', label: 'Mot de passe actuel' },
                { key: 'next', label: 'Nouveau mot de passe' },
                { key: 'confirm', label: 'Confirmer le nouveau' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 8 }}>{label}</div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={pwForm[key]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, padding: '11px 40px 11px 14px', color: G.text, fontFamily: G.mono, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = G.goldBdr}
                      onBlur={e => e.target.style.borderColor = G.border}
                    />
                    {key === 'current' && (
                      <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: G.muted, padding: 0 }}>
                        {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={() => { setShowPasswordModal(false); setPwError(''); setPwForm({ current: '', next: '', confirm: '' }) }} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleChangePassword} disabled={pwLoading} style={{ flex: 2, padding: '11px', background: pwLoading ? 'rgba(201,162,39,0.4)' : G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.bg, fontWeight: 700, cursor: pwLoading ? 'not-allowed' : 'pointer' }}>
                  {pwLoading ? 'Modification...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  style={{
                    width: '100%', background: 'rgba(239,68,68,0.04)',
                    border: `1px solid ${deleteConfirm === 'SUPPRIMER' ? '#ef4444' : 'rgba(239,68,68,0.15)'}`,
                    padding: '12px 16px', color: G.text, fontFamily: G.mono, fontSize: 13,
                    outline: 'none', boxSizing: 'border-box', letterSpacing: '.06em',
                  }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9,
                  letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer',
                }}>Annuler</button>
                <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'SUPPRIMER' || deleteLoading} style={{
                  flex: 2, padding: '11px',
                  background: deleteConfirm === 'SUPPRIMER' ? '#ef4444' : 'rgba(239,68,68,0.2)',
                  border: 'none', fontFamily: G.mono, fontSize: 9,
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  color: deleteConfirm === 'SUPPRIMER' ? '#fff' : 'rgba(239,68,68,0.4)',
                  cursor: deleteConfirm === 'SUPPRIMER' ? 'pointer' : 'not-allowed',
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {deleteLoading ? 'Suppression...' : <><Trash2 size={11} /> Supprimer définitivement</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
