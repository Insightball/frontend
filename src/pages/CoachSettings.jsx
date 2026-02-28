import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Trash2, AlertTriangle, X, User, Mail, Shield, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import SubscriptionManagement from '../components/SubscriptionManagement'
import { T, globalStyles } from '../theme'

// CoachSettings : fond CREAM (pages), modales restent dark via SubscriptionManagement
const G = {
  bg:     T.bg,       bg2:    T.surface,
  gold:   T.gold,     goldD:  T.goldD,
  goldBg: T.goldBg,   goldBdr:T.goldBdr,
  mono:   T.mono,     display:T.display,
  border: T.ruleDark,
  muted:  T.muted2,
  text:   T.ink,
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
  const location = useLocation()
  const flashMessage = location.state?.flash || ''
  const [isMobile, setIsMobile] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <DashboardLayout>
      <style>{globalStyles}</style>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Paramètres
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: isMobile ? 32 : 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: G.text, margin: 0 }}>
          Mon<br /><span style={{ color: G.gold }}>compte.</span>
        </h1>
      </div>

      {flashMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 16, background: 'rgba(201,162,39,0.07)', border: '1px solid rgba(201,162,39,0.25)', maxWidth: isMobile ? '100%' : 600 }}>
          <AlertCircle size={13} color={G.gold} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: G.mono, fontSize: 10, color: G.gold, letterSpacing: '.04em' }}>{flashMessage}</span>
        </div>
      )}

      <div style={{ maxWidth: isMobile ? '100%' : 600, display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>

        {/* Infos compte */}
        <Section title="Informations" accent={G.gold}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: User, label: 'Nom', value: user?.name || '—' },
              { icon: Mail, label: 'Email', value: user?.email || '—' },
              { icon: Shield, label: 'Plan', value: (() => { const p = (user?.plan || 'COACH').toUpperCase(); if (p === 'CLUB') return 'Club — Offre sur mesure'; const trialEnd = user?.trial_ends_at; const inTrial = trialEnd && new Date(trialEnd) > new Date(); return inTrial ? 'Coach — Essai en cours' : 'Coach — 39 €/mois · 4 matchs'; })() },
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
        <div style={{ padding: '16px 28px', display: 'flex', justifyContent: 'flex-end', background: G.bg2, border: `1px solid ${G.border}` }}>
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

      {/* Modale suppression */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: T.dark, width: '100%', maxWidth: 440, border: `1px solid rgba(239,68,68,0.3)`, borderTop: `2px solid #ef4444` }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={16} color="#ef4444" />
                <span style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: '#f5f2eb' }}>Supprimer le compte</span>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color={G.muted} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.06)', border: `1px solid rgba(239,68,68,0.15)`, marginBottom: 24 }}>
                <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(245,242,235,0.7)', lineHeight: 1.7, margin: 0 }}>
                  Votre compte sera désactivé immédiatement. Toutes vos données seront conservées pendant <strong style={{ color: '#f5f2eb' }}>30 jours</strong> et vous recevrez un email pour récupérer votre compte si vous changez d'avis.
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
                    padding: '12px 16px', color: '#f5f2eb', fontFamily: G.mono, fontSize: 13,
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
