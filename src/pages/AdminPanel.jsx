/**
 * AdminPanel.jsx
 * Accès via /admin — route cachée, aucun lien dans l'UI
 */
import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/x-admin` : 'https://backend-pued.onrender.com/api/x-admin'

const G = {
  bg: '#f5f2eb', bg2: '#ede8df', bg3: '#faf8f4',
  gold: '#c9a227', goldD: '#a8861f', goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.3)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(15,15,13,0.09)', muted: 'rgba(15,15,13,0.45)',
  text: '#0f0f0d',
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
  return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: active ? G.green : G.red, border: `1px solid ${active ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>{active ? 'Actif' : 'Inactif'}</span>
}

function PlanBadge({ plan }) {
  const color = plan?.toLowerCase() === 'club' ? G.blue : G.orange
  return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: color + '18', color, border: `1px solid ${color}30` }}>{plan}</span>
}

const thStyle = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid rgba(15,15,13,0.09)', whiteSpace: 'nowrap', background: 'rgba(15,15,13,0.03)' }
const tdStyle = { fontFamily: G.mono, fontSize: 11, color: '#0f0f0d', padding: '12px 14px', letterSpacing: '.03em', borderBottom: '1px solid rgba(15,15,13,0.07)' }

const inputStyle = {
  width: '100%', background: '#ffffff', border: '1px solid rgba(15,15,13,0.15)',
  padding: '10px 14px', color: '#0f0f0d', fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
}
const labelStyle = { fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginBottom: 8, display: 'block' }


// ─── Modal générique ──────────────────────────────────────────────────────────

function Modal({ title, subtitle, onClose, children, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#f5f2eb', width: '100%', maxWidth: wide ? 720 : 480, border: '1px solid rgba(15,15,13,0.09)', borderTop: '2px solid #c9a227', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(15,15,13,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#f5f2eb', zIndex: 1 }}>
          <div>
            {subtitle && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: '#c9a227', marginBottom: 4 }}>{subtitle}</div>}
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, textTransform: 'uppercase', color: '#0f0f0d', letterSpacing: '.02em' }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(15,15,13,0.45)', fontSize: 24, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}


// ─── Modal détail utilisateur ─────────────────────────────────────────────────

function UserDetailModal({ user, onClose, onToggleActive, onEditPlan }) {
  const [tab, setTab] = useState('info')
  const [activity, setActivity] = useState(null)
  const [loadingActivity, setLoadingActivity] = useState(false)

  const loadActivity = () => {
    if (activity) { setTab('activity'); return }
    setLoadingActivity(true)
    setTab('activity')
    fetch(`${API}/users/${user.id}/activity`, { headers: authHeaders() })
      .then(r => r.json()).then(setActivity)
      .catch(() => setActivity(null))
      .finally(() => setLoadingActivity(false))
  }

  const Row = ({ label, value, highlight }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(15,15,13,0.07)' }}>
      <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, width: 140, flexShrink: 0, paddingTop: 2 }}>{label}</div>
      <div style={{ fontFamily: G.mono, fontSize: 12, color: highlight ? G.gold : G.text, flex: 1 }}>{value || '—'}</div>
    </div>
  )

  const tabBtn = (id, label) => (
    <button onClick={() => id === 'activity' ? loadActivity() : setTab(id)} style={{
      padding: '8px 16px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
      background: tab === id ? G.goldBg : 'transparent', border: 'none',
      borderBottom: tab === id ? `2px solid ${G.gold}` : '2px solid transparent',
      color: tab === id ? G.gold : G.muted, cursor: 'pointer',
    }}>{label}</button>
  )

  return (
    <Modal title={user.name} subtitle="Fiche utilisateur" onClose={onClose} wide>
      {/* Onglets */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${G.border}`, marginBottom: 20 }}>
        {tabBtn('info', 'Infos')}
        {tabBtn('activity', 'Activité')}
      </div>

      {tab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>— Compte</div>
            <Row label="Email" value={user.email} />
            <Row label="Plan" value={<PlanBadge plan={user.plan} />} />
            <Row label="Club" value={user.club_name} />
            <Row label="Rôle système" value={user.role} />
            <Row label="Statut" value={<StatusBadge active={user.is_active} />} />
            <Row label="Superadmin" value={user.is_superadmin ? '✓ Oui' : 'Non'} highlight={user.is_superadmin} />
            <Row label="Inscrit le" value={formatDate(user.created_at)} />
            <Row label="Dernière co." value={formatDate(user.last_login)} />
            <Row label="Trial utilisé" value={user.trial_match_used ? '✓ Oui' : 'Non'} />
            <Row label="Stripe customer" value={user.stripe_customer_id ? user.stripe_customer_id.substring(0, 20) + '…' : null} />
          </div>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>— Profil</div>
            <Row label="Poste" value={user.profile_role} highlight={!!user.profile_role} />
            <Row label="Niveau équipe" value={user.profile_level} />
            <Row label="Catégorie" value={user.team_category} />
            <Row label="Téléphone" value={user.profile_phone} />
            <Row label="Ville" value={user.profile_city} />
            <Row label="Diplôme" value={user.profile_diploma} />
            <Row label="Nb équipes" value={user.nb_teams} />
            <Row label="Setup tournage" value={user.filming_setup} />
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => { onEditPlan(user); onClose() }} style={{ padding: '11px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, cursor: 'pointer' }}>
                Modifier le plan →
              </button>
              <button onClick={() => { onToggleActive(user.id, user.is_active); onClose() }} style={{ padding: '11px', background: user.is_active ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)', border: `1px solid ${user.is_active ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: user.is_active ? G.red : G.green, cursor: 'pointer' }}>
                {user.is_active ? 'Désactiver le compte' : 'Activer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div>
          {loadingActivity ? <Loader /> : activity ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {/* Matchs */}
              <div>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>— Matchs</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: G.border, marginBottom: 16 }}>
                  {[
                    { label: 'Total', value: activity.matches.total, color: G.gold },
                    { label: 'Analysés', value: activity.matches.completed, color: G.green },
                    { label: 'En attente', value: activity.matches.pending, color: G.orange },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#faf8f4', padding: '14px 12px', textAlign: 'center' }}>
                      <div style={{ fontFamily: G.display, fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Liste matchs récents */}
                {activity.matches.recent?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
                    {activity.matches.recent.map(m => (
                      <div key={m.id} style={{ background: '#faf8f4', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontFamily: G.mono, fontSize: 11, color: G.text }}>vs {m.opponent}</span>
                          <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, marginLeft: 8 }}>{m.date?.split('T')[0]}</span>
                        </div>
                        <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 8px', background: m.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: m.status === 'completed' ? G.green : G.orange, border: `1px solid ${m.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, padding: '20px 0', textAlign: 'center' }}>Aucun match</div>
                )}
              </div>

              {/* Projet de jeu + joueurs */}
              <div>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>— Projet de jeu</div>
                {activity.game_plan.exists ? (
                  <div style={{ background: '#faf8f4', border: `1px solid ${G.border}`, borderTop: `2px solid ${G.gold}`, padding: '16px' }}>
                    <Row label="Formation" value={activity.game_plan.formation} highlight />
                    <Row label="Catégorie" value={activity.game_plan.category} />
                    <Row label="Thèmes planifiés" value={activity.game_plan.themes_count} highlight />
                    <Row label="Dernière modif." value={activity.game_plan.updated_at?.split('T')[0]} />
                  </div>
                ) : (
                  <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, padding: '20px', textAlign: 'center', background: '#faf8f4', border: `1px solid ${G.border}` }}>Aucun projet de jeu créé</div>
                )}

                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12, marginTop: 24 }}>— Effectif club</div>
                <div style={{ background: '#faf8f4', border: `1px solid ${G.border}`, borderTop: `2px solid ${G.blue}`, padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: G.display, fontSize: 36, color: G.blue, lineHeight: 1 }}>{activity.players_in_club}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginTop: 6 }}>Joueurs enregistrés</div>
                </div>

                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 12, marginTop: 24 }}>— Notifications</div>
                <div style={{ background: '#faf8f4', border: `1px solid ${G.border}`, padding: '12px 16px' }}>
                  <Row label="Non lues" value={activity.notifications_unread} highlight={activity.notifications_unread > 0} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: G.mono, fontSize: 10, color: G.red, padding: '20px', textAlign: 'center' }}>Erreur de chargement</div>
          )}
        </div>
      )}
    </Modal>
  )
}


// ─── Créer un utilisateur ─────────────────────────────────────────────────────

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
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, plan: form.plan, role: form.role, club_name: form.plan === 'club' ? form.club_name : undefined, is_superadmin: form.is_superadmin })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      onSuccess(); onClose()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Créer un compte" subtitle="Nouvel utilisateur" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#ef4444' }}>{error}</div>}
        <div><label style={labelStyle}>Nom complet</label>
          <input style={inputStyle} placeholder="Jean Dupont" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
        <div><label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" placeholder="jean@club.fr" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
        <div><label style={labelStyle}>Mot de passe</label>
          <input style={inputStyle} type="password" placeholder="8 caractères minimum" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Plan</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
              <option value="coach">Coach</option><option value="club">Club</option>
            </select></div>
          <div><label style={labelStyle}>Rôle</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="admin">Admin</option><option value="coach">Coach</option><option value="analyst">Analyste</option>
            </select></div>
        </div>
        {form.plan === 'club' && (
          <div><label style={labelStyle}>Nom du club</label>
            <input style={inputStyle} placeholder="FC Challans" value={form.club_name} onChange={e => setForm(p => ({ ...p, club_name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)' }}>
          <input type="checkbox" checked={form.is_superadmin} onChange={e => setForm(p => ({ ...p, is_superadmin: e.target.checked }))} />
          Superadmin
        </label>
        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(15,15,13,0.15)', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? 'rgba(201,162,39,0.4)' : '#c9a227', border: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </div>
      </div>
    </Modal>
  )
}


// ─── Modifier le plan ─────────────────────────────────────────────────────────

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
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ plan: form.plan, role: form.role, club_name: form.plan === 'club' && !user.club_id ? form.club_name : undefined, club_id: form.plan === 'club' && user.club_id ? user.club_id : undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur')
      onSuccess(); onClose()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Modifier le plan" subtitle={user.name} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#ef4444' }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Plan</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
              <option value="coach">Coach</option><option value="club">Club</option>
            </select></div>
          <div><label style={labelStyle}>Rôle</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="admin">Admin</option><option value="coach">Coach</option><option value="analyst">Analyste</option>
            </select></div>
        </div>
        {form.plan === 'club' && !user.club_id && (
          <div><label style={labelStyle}>Nom du club</label>
            <input style={inputStyle} placeholder="FC Challans" value={form.club_name} onChange={e => setForm(p => ({ ...p, club_name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
        )}
        {form.plan === 'club' && user.club_name && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(15,15,13,0.45)', padding: '8px 12px', background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.3)' }}>
            Club existant : <span style={{ color: '#c9a227' }}>{user.club_name}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(15,15,13,0.15)', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? 'rgba(201,162,39,0.4)' : '#c9a227', border: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Sauvegarde...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </Modal>
  )
}


// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardSection() {
  const { data, loading } = useAdminFetch('/dashboard')
  if (loading) return <Loader />
  if (!data) return null
  const stats = [
    { label: 'Total utilisateurs', value: data.total_users,        color: '#c9a227' },
    { label: 'Comptes actifs',      value: data.active_users,       color: '#22c55e' },
    { label: 'Plan Coach',          value: data.coach_plan_count,   color: '#f59e0b' },
    { label: 'Plan Club',           value: data.club_plan_count,    color: '#3b82f6' },
    { label: 'Inscrits 7j',         value: data.users_last_7_days,  color: '#8b5cf6' },
    { label: 'Inscrits 30j',        value: data.users_last_30_days, color: '#ec4899' },
    { label: 'Abonnés payants',     value: data.paying_users,       color: '#22c55e' },
  ]
  return (
    <div>
      <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 1, background: 'rgba(15,15,13,0.09)' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#faf8f4', padding: '20px 18px', borderTop: `2px solid ${s.color}` }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 44, lineHeight: 1, color: s.color, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ─── Utilisateurs ─────────────────────────────────────────────────────────────

function UsersSection() {
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [detailUser, setDetailUser] = useState(null)

  const loadUsers = () => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (plan) params.append('plan', plan)
    if (userStatus) params.append('user_status', userStatus)
    setLoading(true)
    fetch(`${API}/users?${params}`, { headers: authHeaders() })
      .then(r => r.json()).then(setUsers).finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [search, plan, userStatus])

  const toggleActive = async (userId, current) => {
    await fetch(`${API}/users/${userId}/toggle-active`, { method: 'PATCH', headers: authHeaders() })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u))
  }

  const deleteUser = async (user) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${user.name} (${user.email}) ?`)) return
    const res = await fetch(`${API}/users/${user.id}`, { method: 'DELETE', headers: authHeaders() })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== user.id))
    else console.error('Erreur suppression', res.status)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', margin: 0 }}>Utilisateurs</h2>
        <button onClick={() => setShowCreate(true)} style={{ padding: '10px 20px', background: '#c9a227', border: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: 'pointer' }}>
          + Créer un compte
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input placeholder="Email ou nom..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, ...inputStyle }}
          onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} />
        <select value={plan} onChange={e => setPlan(e.target.value)} style={{ ...inputStyle, width: 160, cursor: 'pointer' }}>
          <option value="">Tous les plans</option>
          <option value="coach">Coach</option>
          <option value="club">Club</option>
        </select>
        <select value={userStatus} onChange={e => setUserStatus(e.target.value)} style={{ ...inputStyle, width: 160, cursor: 'pointer' }}>
          <option value="">Actifs</option>
          <option value="rejected">Rejetés</option>
          <option value="all">Tous</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#faf8f4', border: '1px solid rgba(15,15,13,0.09)' }}>
            <thead>
              <tr>{['Nom', 'Email', 'Plan', 'Club', 'Poste', 'Niveau', 'Ville', 'Inscrit', 'Dernière co.', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id}
                  onClick={() => setDetailUser(u)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background .1s', cursor: 'pointer' }}>
                  <td style={tdStyle}>{u.name}{u.is_superadmin && <span style={{ marginLeft: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)', padding: '1px 5px' }}>SA</span>}</td>
                  <td style={{ ...tdStyle, color: 'rgba(15,15,13,0.5)', fontSize: 10 }}>{u.email}</td>
                  <td style={tdStyle}><PlanBadge plan={u.plan} /></td>
                  <td style={{ ...tdStyle, color: 'rgba(15,15,13,0.5)', fontSize: 10 }}>{u.club_name || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: 10 }}>{u.profile_role || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: 10 }}>{u.profile_level || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: 10 }}>{u.profile_city || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: 10 }}>{formatDate(u.created_at)}</td>
                  <td style={{ ...tdStyle, fontSize: 10 }}>{u.last_login ? formatDate(u.last_login) : '—'}</td>
                  <td style={tdStyle}><StatusBadge active={u.is_active} /></td>
                  <td style={tdStyle} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={() => setEditUser(u)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', background: 'rgba(201,162,39,0.08)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)', cursor: 'pointer' }}>Plan</button>
                      <button onClick={() => toggleActive(u.id, u.is_active)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', background: u.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: u.is_active ? '#ef4444' : '#22c55e', border: `1px solid ${u.is_active ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, cursor: 'pointer' }}>
                        {u.is_active ? 'Désact.' : 'Activer'}
                      </button>
                      <button onClick={() => deleteUser(u)} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', color: '#ef4444', fontSize: 13, lineHeight: 1 }}>×</button>
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
      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} onToggleActive={toggleActive} onEditPlan={setEditUser} />}
    </div>
  )
}


// ─── Invitations CLUB ─────────────────────────────────────────────────────────

const INVITE_API = API

function InviteStatusBadge({ status }) {
  const s = (status || '').toLowerCase()
  const map = {
    pending:  { bg: 'rgba(245,158,11,0.1)', color: G.orange, bdr: 'rgba(245,158,11,0.25)', label: 'En attente' },
    accepted: { bg: 'rgba(34,197,94,0.1)',  color: G.green,  bdr: 'rgba(34,197,94,0.25)',  label: 'Acceptée' },
    expired:  { bg: 'rgba(239,68,68,0.1)',  color: G.red,    bdr: 'rgba(239,68,68,0.25)',  label: 'Expirée' },
  }
  const st = map[s] || map.pending
  return <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: st.bg, color: st.color, border: `1px solid ${st.bdr}` }}>{st.label}</span>
}

function CreateInviteModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '',
    club_name: '', city: '',
    plan_tier: 'CLUB', plan_price: 99, quota_matches: 10,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tierPresets = {
    CLUB:     { plan_price: 99,  quota_matches: 10 },
    CLUB_PRO: { plan_price: 139, quota_matches: 15 },
  }

  const handleTierChange = (tier) => {
    const preset = tierPresets[tier] || tierPresets.CLUB
    setForm(p => ({ ...p, plan_tier: tier, plan_price: preset.plan_price, quota_matches: preset.quota_matches }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.club_name) return setError('Email et nom du club requis')
    if (!form.first_name) return setError('Prénom du DS requis')
    setLoading(true)
    try {
      const res = await fetch(`${INVITE_API}/create-club-invite`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Erreur')
      onSuccess()
      onClose()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Nouvelle invitation" subtitle="Invitation club" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontFamily: G.mono, fontSize: 11, color: '#ef4444' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Prénom</label>
            <input style={inputStyle} placeholder="Jean" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
          <div><label style={labelStyle}>Nom</label>
            <input style={inputStyle} placeholder="Dupont" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
        </div>

        <div><label style={labelStyle}>Email du DS</label>
          <input style={inputStyle} type="email" placeholder="directeur@club.fr" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Nom du club</label>
            <input style={inputStyle} placeholder="FC Toulouse" value={form.club_name} onChange={e => setForm(p => ({ ...p, club_name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
          <div><label style={labelStyle}>Ville</label>
            <input style={inputStyle} placeholder="Toulouse" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(15,15,13,0.15)'} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Palier</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.plan_tier} onChange={e => handleTierChange(e.target.value)}>
              <option value="CLUB">Club — 99€</option>
              <option value="CLUB_PRO">Club Pro — 139€</option>
            </select></div>
          <div><label style={labelStyle}>Prix (€/mois)</label>
            <input style={inputStyle} type="number" value={form.plan_price} onChange={e => setForm(p => ({ ...p, plan_price: parseInt(e.target.value) || 0 }))} /></div>
          <div><label style={labelStyle}>Quota matchs</label>
            <input style={inputStyle} type="number" value={form.quota_matches} onChange={e => setForm(p => ({ ...p, quota_matches: parseInt(e.target.value) || 0 }))} /></div>
        </div>

        <div style={{ padding: '12px 14px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, fontFamily: G.mono, fontSize: 10, color: 'rgba(15,15,13,0.55)', lineHeight: 1.7 }}>
          Un lien unique sera généré. Le DS pourra créer son compte et payer directement via Stripe (CB ou SEPA).
          <br />Le prix et le quota sont modifiables pour des offres négociées.
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(15,15,13,0.15)', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? 'rgba(201,162,39,0.4)' : '#c9a227', border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Création...' : 'Créer l\'invitation'}
          </button>
        </div>
      </div>
    </Modal>
  )
}


function InvitationsSection() {
  const [invites, setInvites] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [copied, setCopied] = useState(null)

  const loadInvites = () => {
    setLoading(true)
    fetch(`${INVITE_API}/club-invites`, { headers: authHeaders() })
      .then(r => r.json()).then(d => setInvites(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }

  useEffect(() => { loadInvites() }, [])

  const deleteInvite = async (id, status) => {
    const isAccepted = (status || '').toLowerCase() === 'accepted'
    const msg = isAccepted
      ? 'Cette invitation est déjà acceptée (client actif). Forcer la suppression ?'
      : 'Supprimer cette invitation ?'
    if (!window.confirm(msg)) return
    const url = isAccepted
      ? `${INVITE_API}/club-invites/${id}?force=true`
      : `${INVITE_API}/club-invites/${id}`
    const res = await fetch(url, { method: 'DELETE', headers: authHeaders() })
    if (res.ok) setInvites(prev => prev.filter(i => i.id !== id))
    else console.error('Erreur suppression', res.status)
  }

  const copyLink = (token) => {
    const url = `https://insightball.com/club-invite/${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(token)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: G.text, margin: 0 }}>Invitations Club</h2>
        <button onClick={() => setShowCreate(true)} style={{ padding: '10px 20px', background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f0f0d', fontWeight: 700, cursor: 'pointer' }}>
          + Nouvelle invitation
        </button>
      </div>

      {loading ? <Loader /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: G.bg3, border: `1px solid ${G.border}` }}>
            <thead>
              <tr>{['Club', 'DS', 'Email', 'Palier', 'Prix', 'Quota', 'Statut', 'Créée le', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {invites?.map(inv => (
                <tr key={inv.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background .1s' }}>
                  <td style={tdStyle}><strong>{inv.club_name}</strong>{inv.city ? <span style={{ color: G.muted, fontSize: 10 }}> · {inv.city}</span> : null}</td>
                  <td style={tdStyle}>{inv.first_name} {inv.last_name}</td>
                  <td style={{ ...tdStyle, color: G.muted, fontSize: 10 }}>{inv.email}</td>
                  <td style={tdStyle}><PlanBadge plan={inv.plan_tier} /></td>
                  <td style={tdStyle}>{inv.plan_price}€</td>
                  <td style={tdStyle}>{inv.quota_matches}</td>
                  <td style={tdStyle}><InviteStatusBadge status={inv.status} /></td>
                  <td style={{ ...tdStyle, fontSize: 10 }}>{formatDate(inv.created_at)}</td>
                  <td style={tdStyle} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {(inv.status || '').toLowerCase() === 'pending' && (
                        <button onClick={() => copyLink(inv.token)} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', background: copied === inv.token ? 'rgba(34,197,94,0.08)' : G.goldBg, color: copied === inv.token ? G.green : G.gold, border: `1px solid ${copied === inv.token ? 'rgba(34,197,94,0.25)' : G.goldBdr}`, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                          {copied === inv.token ? '✓ Copié' : 'Copier lien'}
                        </button>
                      )}
                      <button onClick={() => deleteInvite(inv.id, inv.status)} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', color: '#ef4444', fontSize: 13, lineHeight: 1 }}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invites?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.1em' }}>Aucune invitation créée</div>}

      {showCreate && <CreateInviteModal onClose={() => setShowCreate(false)} onSuccess={loadInvites} />}
    </div>
  )
}


// ─── Paiements ────────────────────────────────────────────────────────────────

function PaymentsSection() {
  const { data, loading } = useAdminFetch('/payments')
  if (loading) return <Loader />
  return (
    <div>
      <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', marginBottom: 20 }}>Paiements</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#faf8f4', border: '1px solid rgba(15,15,13,0.09)' }}>
          <thead><tr>{['Nom', 'Email', 'Plan', 'Stripe Customer', 'Subscription ID', 'Depuis'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {data?.map(u => (
              <tr key={u.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}><PlanBadge plan={u.plan} /></td>
                <td style={tdStyle}><code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(15,15,13,0.45)' }}>{u.stripe_customer_id || '—'}</code></td>
                <td style={tdStyle}><code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(15,15,13,0.45)' }}>{u.stripe_subscription_id || '—'}</code></td>
                <td style={tdStyle}>{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.1em' }}>Aucun abonnement actif</div>}
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
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', margin: 0 }}>Connexions</h2>
        <select value={days} onChange={e => setDays(e.target.value)} style={{ ...inputStyle, width: 140, cursor: 'pointer' }}>
          <option value={7}>7 jours</option>
          <option value={30}>30 jours</option>
          <option value={90}>90 jours</option>
        </select>
      </div>
      {loading ? <Loader /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#faf8f4', border: '1px solid rgba(15,15,13,0.09)' }}>
          <thead><tr>{['Nom', 'Email', 'Plan', 'Dernière connexion', 'Statut'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {data?.map(u => (
              <tr key={u.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ transition: 'background .1s' }}>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}><PlanBadge plan={u.plan} /></td>
                <td style={tdStyle}>{u.last_login ? formatDate(u.last_login) : '—'}</td>
                <td style={tdStyle}><StatusBadge active={u.is_active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(15,15,13,0.45)', letterSpacing: '.1em' }}>Aucune connexion sur cette période</div>}
    </div>
  )
}


// ─── Validations (comptes en attente) ────────────────────────────────────────

function ValidationsSection() {
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const AUTH_API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/auth` : 'https://backend-pued.onrender.com/api/auth'

  const loadPending = () => {
    setLoading(true)
    fetch(`${AUTH_API}/pending-users`, { headers: authHeaders() })
      .then(r => r.json()).then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPending() }, [])

  const handleApprove = async (userId, userName) => {
    if (!window.confirm(`Approuver le compte de ${userName} ? Le trial 7 jours sera activé et un email sera envoyé.`)) return
    setActionLoading(userId)
    try {
      const res = await fetch(`${AUTH_API}/approve/${userId}`, { method: 'POST', headers: authHeaders() })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId))
      } else {
        const data = await res.json()
        alert(data.detail || 'Erreur')
      }
    } catch { alert('Erreur réseau') }
    finally { setActionLoading(null) }
  }

  const handleReject = async (userId, userName) => {
    if (!window.confirm(`Rejeter le compte de ${userName} ? Le compte sera supprimé.`)) return
    setActionLoading(userId)
    try {
      const res = await fetch(`${AUTH_API}/reject/${userId}`, { method: 'POST', headers: authHeaders() })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId))
      } else {
        const data = await res.json()
        alert(data.detail || 'Erreur')
      }
    } catch { alert('Erreur réseau') }
    finally { setActionLoading(null) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#0f0f0d', margin: 0 }}>Validations</h2>
        <button onClick={loadPending} style={{ padding: '8px 16px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, cursor: 'pointer' }}>
          Rafraîchir
        </button>
      </div>

      {loading ? <Loader /> : !users || users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#faf8f4', border: `1px solid ${G.border}` }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
          <div style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: '#0f0f0d', marginBottom: 8 }}>Aucun compte en attente</div>
          <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.06em' }}>Tous les comptes ont été traités.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: G.border }}>
          {users.map(u => (
            <div key={u.id} style={{ background: '#faf8f4', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {/* Infos principales */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: G.display, fontSize: 18, color: '#0f0f0d' }}>{u.name}</span>
                  <PlanBadge plan={u.plan} />
                </div>
                <div style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginBottom: 4 }}>{u.email}</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                  {u.profile_role && (
                    <span style={{ fontFamily: G.mono, fontSize: 9, color: '#0f0f0d', letterSpacing: '.04em' }}>
                      <span style={{ color: G.gold, marginRight: 4 }}>Poste</span> {u.profile_role}
                    </span>
                  )}
                  {u.profile_level && (
                    <span style={{ fontFamily: G.mono, fontSize: 9, color: '#0f0f0d', letterSpacing: '.04em' }}>
                      <span style={{ color: G.gold, marginRight: 4 }}>Niveau</span> {u.profile_level}
                    </span>
                  )}
                  {u.profile_city && (
                    <span style={{ fontFamily: G.mono, fontSize: 9, color: '#0f0f0d', letterSpacing: '.04em' }}>
                      <span style={{ color: G.gold, marginRight: 4 }}>Ville</span> {u.profile_city}
                    </span>
                  )}
                  {u.profile_diploma && (
                    <span style={{ fontFamily: G.mono, fontSize: 9, color: '#0f0f0d', letterSpacing: '.04em' }}>
                      <span style={{ color: G.gold, marginRight: 4 }}>Diplôme</span> {u.profile_diploma}
                    </span>
                  )}
                  {u.club_name && (
                    <span style={{ fontFamily: G.mono, fontSize: 9, color: '#0f0f0d', letterSpacing: '.04em' }}>
                      <span style={{ color: G.gold, marginRight: 4 }}>Club</span> {u.club_name}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted, marginTop: 8, letterSpacing: '.06em' }}>
                  Inscrit le {formatDate(u.created_at)}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleApprove(u.id, u.name)}
                  disabled={actionLoading === u.id}
                  style={{
                    padding: '10px 20px', background: actionLoading === u.id ? 'rgba(34,197,94,0.3)' : G.green,
                    border: 'none', fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em',
                    textTransform: 'uppercase', color: '#fff', fontWeight: 700,
                    cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => { if (actionLoading !== u.id) e.currentTarget.style.background = '#16a34a' }}
                  onMouseLeave={e => { if (actionLoading !== u.id) e.currentTarget.style.background = G.green }}
                >
                  {actionLoading === u.id ? '...' : 'Approuver'}
                </button>
                <button
                  onClick={() => handleReject(u.id, u.name)}
                  disabled={actionLoading === u.id}
                  style={{
                    padding: '10px 16px', background: 'rgba(239,68,68,0.08)',
                    border: `1px solid rgba(239,68,68,0.25)`,
                    fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em',
                    textTransform: 'uppercase', color: G.red,
                    cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


// ─── App principale ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'dashboard',    label: '📊 Dashboard' },
  { id: 'validations',  label: '✅ Validations' },
  { id: 'users',        label: '👥 Utilisateurs' },
  { id: 'invitations',  label: '📩 Invitations' },
  { id: 'payments',     label: '💳 Paiements' },
  { id: 'logins',       label: '🔐 Connexions' },
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
    <div style={{ minHeight: '100vh', background: '#f5f2eb', color: '#0f0f0d', display: 'flex', fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{`${FONTS} * { box-sizing: border-box; } select option { background: #f5f2eb; color: #0f0f0d; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: rgba(201,162,39,0.3); }`}</style>

      <aside style={{ width: 200, background: '#ede8df', borderRight: '1px solid rgba(15,15,13,0.09)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <div style={{ padding: '0 12px 20px', borderBottom: '1px solid rgba(15,15,13,0.09)', marginBottom: 8 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, letterSpacing: '.06em', color: '#0f0f0d' }}>
            INSIGHT<span style={{ color: '#c9a227' }}>BALL</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(15,15,13,0.45)', marginTop: 4 }}>Admin</div>
        </div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} style={{
            width: '100%', textAlign: 'left', padding: '10px 12px',
            background: active === s.id ? 'rgba(201,162,39,0.1)' : 'transparent',
            borderLeft: `2px solid ${active === s.id ? '#c9a227' : 'transparent'}`,
            border: 'none', borderLeft: `2px solid ${active === s.id ? '#c9a227' : 'transparent'}`,
            color: active === s.id ? '#c9a227' : 'rgba(15,15,13,0.5)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all .15s',
          }}>
            {s.label}
          </button>
        ))}
      </aside>

      <main style={{ flex: 1, padding: 32, overflowX: 'auto' }}>
        {active === 'dashboard' && <DashboardSection />}
        {active === 'validations' && <ValidationsSection />}
        {active === 'users'     && <UsersSection />}
        {active === 'invitations' && <InvitationsSection />}
        {active === 'payments'  && <PaymentsSection />}
        {active === 'logins'    && <LoginsSection />}
      </main>
    </div>
  )
}
