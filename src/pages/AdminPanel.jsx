/**
 * AdminPanel.jsx
 * Accès via /admin — route cachée, aucun lien dans l'UI
 */
import { useState, useEffect } from 'react'

const API = 'https://backend-pued.onrender.com/api/x-admin'

const G = {
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.06)', muted: 'rgba(15,15,13,0.45)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', orange: '#f59e0b',
}
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

function authHeaders() {
  const token = localStorage.getItem('insightball_token')
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function useAdminFetch(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    fetch(`${API}${endpoint}`, { headers: authHeaders() })
      .then(r => { if (r.status === 403) throw new Error('403'); return r.json() })
      .then(setData).catch(setError).finally(() => setLoading(false))
  }, [endpoint])
  return { data, loading, error }
}

function Loader() {
  return <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>Chargement...</div>
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ active }) {
  return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: active ? G.green : G.red, border: `1px solid ${active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>{active ? 'Actif' : 'Inactif'}</span>
}

function PlanBadge({ plan }) {
  const color = plan === 'club' ? G.blue : G.orange
  return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: color + '15', color, border: `1px solid ${color}25` }}>{plan}</span>
}

const tableHeader = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid rgba(15,15,13,0.09)`, whiteSpace: 'nowrap' }
const tableCell = { fontFamily: G.mono, fontSize: 11, color: '#0f0f0d', padding: '12px 14px', letterSpacing: '.04em', borderBottom: `1px solid rgba(255,255,255,0.03)` }

const inputStyle = {
  width: '100%', background: 'rgba(15,15,13,0.04)', border: `1px solid rgba(15,15,13,0.09)`,
  padding: '10px 14px', color: '#0f0f0d', fontFamily: G.mono, fontSize: 12,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
}
const labelStyle = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 8, display: 'block' }


// ─── Modal générique ─────────────────────────────────────────────────────────

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#ede8df', width: '100%', maxWidth: 480, border: `1px solid rgba(15,15,13,0.09)`, borderTop: `2px solid ${G.gold}` }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid rgba(15,15,13,0.09)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {subtitle && <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 4 }}>{subtitle}</div>}
            <div style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: '#0f0f0d', letterSpacing: '.02em' }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.muted, fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}


// ─── Dashboard ───────────────────────────────────────────────────────────────

function DashboardSection() {
  const { data, loading } = useAdminFetch('/dashboard')
  if (loading) return <Loader />
  if (!data) return null
  const stats = [
    { label: 'Total utilisateurs', value: data.total_users,        color: G.gold },
    { label: 'Comptes actifs',      value: data.active_users,       color: G.green },
    { label: 'Plan Coach',          value: data.coach_plan_count,   color: G.orange },
    { label: 'Plan Club',           value: data.club_plan_count,    color: G.blue },
    { label: 'Inscrits 7j',         value: data.users_last_7_days,  color: '#8b5cf6' },
    { label: 'Inscrits 30j',        value: data.users_last_30_days, color: '#ec4899' },
    { label: 'Abonnés payants',     value: data.paying_users,       color: G.green },
  ]
  return (
    <div>
      <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 1, background: G.border }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#f5f2eb', padding: '20px 18px', borderTop: `2px solid ${s.color}` }}>
            <div style={{ fontFamily: G.display, fontSize: 44, lineHeight: 1, color: s.color, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ─── Créer un utilisateur ────────────────────────────────────────────────────

function CreateUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'coach', role: 'admin', club_name: '', is_superadmin: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!form.name || !form.email || !form.password) return setError('Nom, email et mot de passe requis')
    if (form.plan === 'club' && !form.club_name) return setError('Nom du club requis pour le plan Club')
    setLoading(true)
    try {
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          plan: form.plan,
          role: form.role,
          club_name: form.plan === 'club' ? form.club_name : undefined,
          is_superadmin: form.is_superadmin,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      onSuccess()
      onClose()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Créer un compte" subtitle="Nouvel utilisateur" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</div>}

        <div><label style={labelStyle}>Nom complet</label>
          <input style={inputStyle} placeholder="Jean Dupont" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            onFocus={e => e.target.style.borderColor = G.goldBdr} onBlur={e => e.target.style.borderColor = G.border} /></div>

        <div><label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" placeholder="jean@club.fr" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            onFocus={e => e.target.style.borderColor = G.goldBdr} onBlur={e => e.target.style.borderColor = G.border} /></div>

        <div><label style={labelStyle}>Mot de passe</label>
          <input style={inputStyle} type="password" placeholder="8 caractères minimum" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            onFocus={e => e.target.style.borderColor = G.goldBdr} onBlur={e => e.target.style.borderColor = G.border} /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Plan</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
              <option value="coach">Coach</option>
              <option value="club">Club</option>
            </select></div>
          <div><label style={labelStyle}>Rôle</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="analyst">Analyste</option>
            </select></div>
        </div>

        {form.plan === 'club' && (
          <div><label style={labelStyle}>Nom du club</label>
            <input style={inputStyle} placeholder="FC Challans" value={form.club_name} onChange={e => setForm(p => ({ ...p, club_name: e.target.value }))}
              onFocus={e => e.target.style.borderColor = G.goldBdr} onBlur={e => e.target.style.borderColor = G.border} /></div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>
          <input type="checkbox" checked={form.is_superadmin} onChange={e => setForm(p => ({ ...p, is_superadmin: e.target.checked }))} />
          Superadmin
        </label>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid rgba(15,15,13,0.09)`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? 'rgba(201,162,39,0.4)' : G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </div>
      </div>
    </Modal>
  )
}


// ─── Modifier le plan ────────────────────────────────────────────────────────

function EditPlanModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({ plan: user.plan, role: user.role, club_name: user.club_name || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (form.plan === 'club' && !form.club_name && !user.club_id) return setError('Nom du club requis')
    setLoading(true)
    try {
      const res = await fetch(`${API}/users/${user.id}/plan`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          plan: form.plan,
          role: form.role,
          club_name: form.plan === 'club' && !user.club_id ? form.club_name : undefined,
          club_id: form.plan === 'club' && user.club_id ? user.club_id : undefined,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      onSuccess()
      onClose()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Modifier le plan" subtitle={user.name} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, fontFamily: G.mono, fontSize: 11, color: G.red }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Plan</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
              <option value="coach">Coach</option>
              <option value="club">Club</option>
            </select></div>
          <div><label style={labelStyle}>Rôle</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="analyst">Analyste</option>
            </select></div>
        </div>

        {form.plan === 'club' && !user.club_id && (
          <div><label style={labelStyle}>Nom du club</label>
            <input style={inputStyle} placeholder="FC Challans" value={form.club_name} onChange={e => setForm(p => ({ ...p, club_name: e.target.value }))}
              onFocus={e => e.target.style.borderColor = G.goldBdr} onBlur={e => e.target.style.borderColor = G.border} /></div>
        )}

        {form.plan === 'club' && user.club_name && (
          <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, padding: '8px 12px', background: G.goldBg, border: `1px solid ${G.goldBdr}` }}>
            Club existant : <span style={{ color: G.gold }}>{user.club_name}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid rgba(15,15,13,0.09)`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? 'rgba(201,162,39,0.4)' : G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Sauvegarde...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </Modal>
  )
}


// ─── Utilisateurs ────────────────────────────────────────────────────────────

function UsersSection() {
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('')
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const loadUsers = () => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (plan) params.append('plan', plan)
    setLoading(true)
    fetch(`${API}/users?${params}`, { headers: authHeaders() })
      .then(r => r.json()).then(setUsers).finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [search, plan])

  const toggleActive = async (userId, current) => {
    await fetch(`${API}/users/${userId}/toggle-active`, { method: 'PATCH', headers: authHeaders() })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u))
  }

  const deleteUser = async (user) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${user.name} (${user.email}) ?`)) return
    const res = await fetch(`${API}/users/${user.id}`, { method: 'DELETE', headers: authHeaders() })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== user.id))
    else alert('Erreur lors de la suppression')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', margin: 0 }}>Utilisateurs</h2>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: 'pointer' }}>
          + Créer un compte
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input placeholder="Email ou nom..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, ...inputStyle }}
          onFocus={e => e.target.style.borderColor = G.goldBdr} onBlur={e => e.target.style.borderColor = G.border} />
        <select value={plan} onChange={e => setPlan(e.target.value)} style={{ ...inputStyle, width: 160, cursor: 'pointer' }}>
          <option value="">Tous les plans</option>
          <option value="coach">Coach</option>
          <option value="club">Club</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#faf8f4', border: `1px solid rgba(15,15,13,0.09)` }}>
            <thead>
              <tr style={{ background: 'rgba(15,15,13,0.03)' }}>
                {['Nom', 'Email', 'Plan', 'Club', 'Rôle', 'Poste', 'Niveau', 'Ville', 'Inscrit', 'Dernière co.', 'Statut', 'Actions'].map(h => <th key={h} style={tableHeader}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background .1s' }}>
                  <td style={tableCell}>{u.name}{u.is_superadmin && <span style={{ marginLeft: 6, fontFamily: G.mono, fontSize: 8, color: G.gold, border: `1px solid ${G.goldBdr}`, padding: '1px 5px' }}>SA</span>}</td>
                  <td style={tableCell}>{u.email}</td>
                  <td style={tableCell}><PlanBadge plan={u.plan} /></td>
                  <td style={{ ...tableCell, color: G.muted, fontSize: 10 }}>{u.club_name || '—'}</td>
                  <td style={tableCell}>{u.role}</td>
                  <td style={{ ...tableCell, color: 'rgba(15,15,13,0.6)', fontSize: 10 }}>{u.profile_role || '—'}</td>
                  <td style={{ ...tableCell, color: 'rgba(15,15,13,0.6)', fontSize: 10 }}>{u.profile_level || '—'}</td>
                  <td style={{ ...tableCell, color: 'rgba(15,15,13,0.6)', fontSize: 10 }}>{u.profile_city || '—'}</td>
                  <td style={tableCell}>{formatDate(u.created_at)}</td>
                  <td style={tableCell}>{u.last_login ? formatDate(u.last_login) : '—'}</td>
                  <td style={tableCell}><StatusBadge active={u.is_active} /></td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {/* Modifier plan */}
                      <button onClick={() => setEditUser(u)} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', background: G.goldBg, color: G.gold, border: `1px solid ${G.goldBdr}`, cursor: 'pointer' }}>
                        Plan
                      </button>
                      {/* Activer/Désactiver */}
                      <button onClick={() => toggleActive(u.id, u.is_active)} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', background: u.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: u.is_active ? G.red : G.green, border: `1px solid ${u.is_active ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, cursor: 'pointer' }}>
                        {u.is_active ? 'Désact.' : 'Activer'}
                      </button>
                      {/* Supprimer */}
                      <button onClick={() => deleteUser(u)} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.06)', border: `1px solid rgba(239,68,68,0.15)`, cursor: 'pointer', color: G.red, fontSize: 13, lineHeight: 1 }}>
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onSuccess={loadUsers} />}
      {editUser && <EditPlanModal user={editUser} onClose={() => setEditUser(null)} onSuccess={loadUsers} />}
    </div>
  )
}


// ─── Paiements ───────────────────────────────────────────────────────────────

function PaymentsSection() {
  const { data, loading } = useAdminFetch('/payments')
  if (loading) return <Loader />
  return (
    <div>
      <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', marginBottom: 20 }}>Paiements</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#faf8f4', border: `1px solid rgba(15,15,13,0.09)` }}>
          <thead>
            <tr style={{ background: 'rgba(15,15,13,0.03)' }}>
              {['Nom', 'Email', 'Plan', 'Stripe Customer', 'Subscription ID', 'Depuis'].map(h => <th key={h} style={tableHeader}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data?.map(u => (
              <tr key={u.id}>
                <td style={tableCell}>{u.name}</td>
                <td style={tableCell}>{u.email}</td>
                <td style={tableCell}><PlanBadge plan={u.plan} /></td>
                <td style={tableCell}><code style={{ fontFamily: G.mono, fontSize: 10, color: G.muted }}>{u.stripe_customer_id || '—'}</code></td>
                <td style={tableCell}><code style={{ fontFamily: G.mono, fontSize: 10, color: G.muted }}>{u.stripe_subscription_id || '—'}</code></td>
                <td style={tableCell}>{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.1em' }}>Aucun abonnement actif</div>}
    </div>
  )
}


// ─── Connexions ───────────────────────────────────────────────────────────────

function LoginsSection() {
  const [days, setDays] = useState(30)
  const { data, loading } = useAdminFetch(`/logins?days=${days}`)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', margin: 0 }}>Connexions</h2>
        <select value={days} onChange={e => setDays(e.target.value)} style={{ ...inputStyle, width: 140, cursor: 'pointer' }}>
          <option value={7}>7 jours</option>
          <option value={30}>30 jours</option>
          <option value={90}>90 jours</option>
        </select>
      </div>
      {loading ? <Loader /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#faf8f4', border: `1px solid rgba(15,15,13,0.09)` }}>
          <thead>
            <tr style={{ background: 'rgba(15,15,13,0.03)' }}>
              {['Nom', 'Email', 'Plan', 'Dernière connexion', 'Statut'].map(h => <th key={h} style={tableHeader}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data?.map(u => (
              <tr key={u.id}>
                <td style={tableCell}>{u.name}</td>
                <td style={tableCell}>{u.email}</td>
                <td style={tableCell}>{u.plan}</td>
                <td style={tableCell}>{u.last_login ? formatDate(u.last_login) : '—'}</td>
                <td style={tableCell}><StatusBadge active={u.is_active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.1em' }}>Aucune connexion sur cette période</div>}
    </div>
  )
}


// ─── App principale ──────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'users',     label: '👥 Utilisateurs' },
  { id: 'payments',  label: '💳 Paiements' },
  { id: 'logins',    label: '🔐 Connexions' },
]

export default function AdminPanel() {
  const [active, setActive] = useState('dashboard')
  const [authorized, setAuthorized] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('insightball_token')
    if (!token) { setAuthorized(false); return }
    fetch(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setAuthorized(r.status !== 403))
      .catch(() => setAuthorized(false))
  }, [])

  if (authorized === null) return <div style={{ minHeight: '100vh', background: '#f5f2eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /></div>
  if (authorized === false) { window.location.href = '/'; return null }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2eb', color: '#0f0f0d', display: 'flex', fontFamily: G.mono }}>
      <style>{`${FONTS} * { box-sizing: border-box; } select option { background: #0a0a08; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: rgba(201,162,39,0.2); }`}</style>

      {/* Sidebar */}
      <aside style={{ width: 200, background: '#ede8df', borderRight: `1px solid rgba(15,15,13,0.12)`, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <div style={{ padding: '0 12px 20px', borderBottom: `1px solid rgba(15,15,13,0.09)`, marginBottom: 8 }}>
          <div style={{ fontFamily: G.display, fontSize: 16, letterSpacing: '.06em', color: '#0f0f0d' }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </div>
          <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginTop: 4 }}>Admin</div>
        </div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} style={{
            width: '100%', textAlign: 'left', padding: '10px 12px',
            background: active === s.id ? G.goldBg : 'transparent',
            borderLeft: `2px solid ${active === s.id ? G.gold : 'transparent'}`,
            border: 'none', color: active === s.id ? G.gold : 'rgba(15,15,13,0.5)',
            fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all .15s',
          }}>
            {s.label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: 32, overflowX: 'auto' }}>
        {active === 'dashboard' && <DashboardSection />}
        {active === 'users'     && <UsersSection />}
        {active === 'payments'  && <PaymentsSection />}
        {active === 'logins'    && <LoginsSection />}
      </main>
    </div>
  )
}
