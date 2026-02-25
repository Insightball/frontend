/**
 * ClubMembers.jsx — dark theme cohérent avec le reste du dashboard
 */
import { useState, useEffect } from 'react'
import { UserPlus, Trash2, Edit2, X, Mail } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

const API = 'https://backend-pued.onrender.com/api/club/members'

const G = {
  bg: '#0a0908', bg2: '#0f0e0c',
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.07)', muted: 'rgba(245,242,235,0.35)',
  text: '#f5f2eb', green: '#22c55e', red: '#ef4444', blue: '#3b82f6', orange: '#f59e0b',
}

const ROLES = ['admin', 'coach', 'analyst']
const ROLE_LABELS = { admin: 'Administrateur', coach: 'Coach', analyst: 'Analyste' }
const ROLE_COLORS = { admin: G.gold, coach: G.blue, analyst: '#8b5cf6' }
const STATUS_COLORS = { accepted: G.green, pending: G.orange, declined: G.red }
const STATUS_LABELS = { accepted: 'Actif', pending: 'En attente', declined: 'Refusé' }
const CATEGORIES = ['N3', 'N2', 'N1', 'U19', 'U18', 'U17', 'U16', 'U15', 'U14', 'U13', 'Séniors', 'Féminines']

function authHeaders() {
  const token = localStorage.getItem('insightball_token')
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function RoleBadge({ role }) {
  const color = ROLE_COLORS[role] || G.muted
  return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: color + '18', color, border: `1px solid ${color}30` }}>{ROLE_LABELS[role] || role}</span>
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || G.muted
  return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: color + '18', color, border: `1px solid ${color}30` }}>{STATUS_LABELS[status] || status}</span>
}

function Avatar({ name }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{ width: 36, height: 36, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 700, color: G.gold }}>{initials}</span>
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`,
  padding: '11px 14px', color: G.text, fontFamily: G.mono, fontSize: 12,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
}
const labelStyle = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 8, display: 'block' }

// ─── Modale Invitation ───────────────────────────────────────────────────────
function InviteModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ email: '', role: 'coach', category: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!form.email) return setError('Email requis')
    if (form.role === 'coach' && !form.category) return setError('Catégorie requise pour un Coach')
    setLoading(true)
    try {
      const res = await fetch(`${API}/invite`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ email: form.email, role: form.role, category: form.role === 'coach' ? form.category : null })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      onSuccess(); onClose()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: G.bg2, width: '100%', maxWidth: 440, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.gold}` }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 4 }}>Nouveau membre</div>
            <div style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: G.text }}>Inviter</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color={G.muted} /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</div>}
          <div><label style={labelStyle}>Email</label>
            <input type="email" placeholder="coach@monclub.fr" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle}
              onFocus={e => e.target.style.borderColor = G.goldBdr} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} /></div>
          <div><label style={labelStyle}>Rôle</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value, category: '' }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {ROLES.map(r => <option key={r} value={r} style={{ background: G.bg2 }}>{ROLE_LABELS[r]}</option>)}
            </select></div>
          {form.role === 'coach' && (
            <div><label style={labelStyle}>Catégorie</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="" style={{ background: G.bg2 }}>Sélectionner</option>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: G.bg2 }}>{c}</option>)}
              </select></div>
          )}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? 'rgba(201,162,39,0.4)' : G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? 'Envoi...' : <><Mail size={12} /> Envoyer l'invitation</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modale Édition ──────────────────────────────────────────────────────────
function EditModal({ member, onClose, onSuccess }) {
  const [form, setForm] = useState({ role: member.role, category: member.category || '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/${member.id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ role: form.role, category: form.role === 'coach' ? form.category : null })
      })
      if (!res.ok) throw new Error()
      onSuccess(); onClose()
    } catch { alert('Erreur lors de la mise à jour') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: G.bg2, width: '100%', maxWidth: 380, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.gold}` }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: G.display, fontSize: 20, textTransform: 'uppercase', color: G.text }}>Modifier</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} color={G.muted} /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: G.mono, fontSize: 11, color: G.text }}>{member.user_name || member.email}</div>
          <div><label style={labelStyle}>Rôle</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {ROLES.map(r => <option key={r} value={r} style={{ background: G.bg2 }}>{ROLE_LABELS[r]}</option>)}
            </select></div>
          {form.role === 'coach' && (
            <div><label style={labelStyle}>Catégorie</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="" style={{ background: G.bg2 }}>Sélectionner</option>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: G.bg2 }}>{c}</option>)}
              </select></div>
          )}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${G.border}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '10px', background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Sauvegarde...' : 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function ClubMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadMembers() }, [])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch(API, { headers: authHeaders() })
      const data = await res.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleRemove = async (member) => {
    if (!window.confirm(`Retirer ${member.user_name || member.email} du club ?`)) return
    try {
      const res = await fetch(`${API}/${member.id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error()
      setMembers(prev => prev.filter(m => m.id !== member.id))
    } catch { alert('Erreur lors de la suppression') }
  }

  const filtered = members.filter(m => filter === 'all' || m.status === filter)
  const counts = { all: members.length, accepted: members.filter(m => m.status === 'accepted').length, pending: members.filter(m => m.status === 'pending').length }

  const thStyle = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, padding: '10px 16px', textAlign: 'left', borderBottom: `1px solid ${G.border}`, whiteSpace: 'nowrap' }
  const tdStyle = { fontFamily: G.mono, fontSize: 11, color: G.text, padding: '14px 16px', borderBottom: `1px solid rgba(255,255,255,0.03)`, verticalAlign: 'middle' }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Gestion accès
        </div>
        <h1 style={{ fontFamily: G.display, fontSize: 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: G.text, margin: 0 }}>
          Membres<br /><span style={{ color: G.gold }}>du club.</span>
        </h1>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 1, background: G.border }}>
          {[{ key: 'all', label: 'Tous' }, { key: 'accepted', label: 'Actifs' }, { key: 'pending', label: 'En attente' }].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '9px 18px', background: filter === key ? G.gold : G.bg2,
              border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em',
              textTransform: 'uppercase', color: filter === key ? '#0f0f0d' : G.muted,
              cursor: 'pointer', fontWeight: filter === key ? 700 : 400, transition: 'all .15s',
            }}>
              {label} <span style={{ opacity: .6 }}>({counts[key]})</span>
            </button>
          ))}
        </div>
        <button onClick={() => setShowInvite(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 9,
          letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.background = G.goldD}
          onMouseLeave={e => e.currentTarget.style.background = G.gold}>
          <UserPlus size={13} /> Inviter un membre
        </button>
      </div>

      {/* Table */}
      <div style={{ background: G.bg2, border: `1px solid ${G.border}`, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ fontFamily: G.display, fontSize: 28, textTransform: 'uppercase', color: 'rgba(245,242,235,0.08)', marginBottom: 12 }}>Aucun membre</div>
            <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.08em', marginBottom: 20 }}>
              {filter === 'pending' ? 'Aucune invitation en attente' : 'Invitez votre premier membre'}
            </div>
            {filter === 'all' && (
              <button onClick={() => setShowInvite(true)} style={{ padding: '10px 20px', background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: 'pointer' }}>
                + Inviter un membre
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Membre', 'Rôle', 'Catégorie', 'Statut', 'Invité le', 'Actions'].map(h => <th key={h} style={h === 'Actions' ? { ...thStyle, textAlign: 'right' } : thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background .1s' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={member.user_name || member.email} />
                      <div>
                        <div style={{ fontFamily: G.mono, fontSize: 12, color: G.text }}>{member.user_name || '—'}</div>
                        <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, marginTop: 2 }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}><RoleBadge role={member.role} /></td>
                  <td style={tdStyle}><span style={{ fontFamily: G.mono, fontSize: 11, color: member.category ? G.text : G.muted }}>{member.category || '—'}</span></td>
                  <td style={tdStyle}><StatusBadge status={member.status} /></td>
                  <td style={tdStyle}><span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted }}>{new Date(member.invited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => setEditMember(member)} style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${G.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = G.goldBdr; e.currentTarget.style.color = G.gold }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted }}>
                        <Edit2 size={10} /> Modifier
                      </button>
                      <button onClick={() => handleRemove(member)} style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.06)', border: `1px solid rgba(239,68,68,0.15)`, cursor: 'pointer', transition: 'all .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}>
                        <Trash2 size={12} color={G.red} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSuccess={loadMembers} />}
      {editMember && <EditModal member={editMember} onClose={() => setEditMember(null)} onSuccess={loadMembers} />}
    </DashboardLayout>
  )
}
