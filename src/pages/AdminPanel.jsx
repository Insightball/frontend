/**
 * AdminPanel.jsx
 * Accès via /admin — route cachée, aucun lien dans l'UI
 */
import { useState, useEffect } from 'react'

const API = 'https://backend-pued.onrender.com/api/x-admin'

const G = {
  gold: '#c9a227', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  mono: "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.06)', muted: 'rgba(245,242,235,0.35)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', orange: '#f59e0b',
}
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

function useAdminFetch(endpoint) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(null)
  useEffect(() => {
    const token = localStorage.getItem('insightball_token')
    fetch(`${API}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
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

const tableHeader = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid ${G.border}`, whiteSpace: 'nowrap' }
const tableCell = { fontFamily: G.mono, fontSize: 11, color: '#f5f2eb', padding: '12px 14px', letterSpacing: '.04em', borderBottom: `1px solid rgba(255,255,255,0.03)` }

function DashboardSection() {
  const { data, loading } = useAdminFetch('/dashboard')
  if (loading) return <Loader />
  if (!data) return null

  const stats = [
    { label: 'Total utilisateurs', value: data.total_users,       color: G.gold },
    { label: 'Comptes actifs',      value: data.active_users,      color: G.green },
    { label: 'Plan Coach',          value: data.coach_plan_count,  color: G.orange },
    { label: 'Plan Club',           value: data.club_plan_count,   color: G.blue },
    { label: 'Inscrits 7j',         value: data.users_last_7_days, color: '#8b5cf6' },
    { label: 'Inscrits 30j',        value: data.users_last_30_days,color: '#ec4899' },
    { label: 'Abonnés payants',     value: data.paying_users,      color: G.green },
  ]

  return (
    <div>
      <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#f5f2eb', marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 1, background: G.border }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#0a0a08', padding: '20px 18px', borderTop: `2px solid ${s.color}` }}>
            <div style={{ fontFamily: G.display, fontSize: 44, lineHeight: 1, color: s.color, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersSection() {
  const [search, setSearch] = useState(''); const [plan, setPlan] = useState(''); const [users, setUsers] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('insightball_token')
    const params = new URLSearchParams()
    if (search) params.append('search', search); if (plan) params.append('plan', plan)
    setLoading(true)
    fetch(`${API}/users?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setUsers).finally(() => setLoading(false))
  }, [search, plan])

  const toggleActive = async (userId, current) => {
    const token = localStorage.getItem('insightball_token')
    await fetch(`${API}/users/${userId}/toggle-active`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u))
  }

  return (
    <div>
      <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#f5f2eb', marginBottom: 20 }}>Utilisateurs</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input placeholder="Email ou nom..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}`, padding: '10px 14px', color: '#f5f2eb', fontFamily: G.mono, fontSize: 12, outline: 'none', letterSpacing: '.04em' }}
          onFocus={e => e.target.style.borderColor = G.goldBdr} onBlur={e => e.target.style.borderColor = G.border} />
        <select value={plan} onChange={e => setPlan(e.target.value)} style={{ background: '#0a0a08', border: `1px solid ${G.border}`, padding: '10px 14px', color: '#f5f2eb', fontFamily: G.mono, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les plans</option>
          <option value="coach">Coach</option>
          <option value="club">Club</option>
        </select>
      </div>
      {loading ? <Loader /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.01)', border: `1px solid ${G.border}` }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Nom','Email','Plan','Rôle','Inscrit','Dernière connexion','Statut','Action'].map(h => <th key={h} style={tableHeader}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id} style={{ transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tableCell}>{u.name}</td>
                  <td style={tableCell}>{u.email}</td>
                  <td style={tableCell}><PlanBadge plan={u.plan} /></td>
                  <td style={tableCell}>{u.role}</td>
                  <td style={tableCell}>{formatDate(u.created_at)}</td>
                  <td style={tableCell}>{u.last_login ? formatDate(u.last_login) : '—'}</td>
                  <td style={tableCell}><StatusBadge active={u.is_active} /></td>
                  <td style={tableCell}>
                    <button onClick={() => toggleActive(u.id, u.is_active)} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', background: u.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: u.is_active ? G.red : G.green, border: `1px solid ${u.is_active ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, cursor: 'pointer', transition: 'all .15s' }}>
                      {u.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PaymentsSection() {
  const { data, loading } = useAdminFetch('/payments')
  if (loading) return <Loader />
  return (
    <div>
      <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#f5f2eb', marginBottom: 20 }}>Paiements</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.01)', border: `1px solid ${G.border}` }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['Nom','Email','Plan','Stripe Customer','Subscription ID','Depuis'].map(h => <th key={h} style={tableHeader}>{h}</th>)}
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

function LoginsSection() {
  const [days, setDays] = useState(30)
  const { data, loading } = useAdminFetch(`/logins?days=${days}`)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <h2 style={{ fontFamily: G.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: '.03em', color: '#f5f2eb', margin: 0 }}>Connexions</h2>
        <select value={days} onChange={e => setDays(e.target.value)} style={{ background: '#0a0a08', border: `1px solid ${G.border}`, padding: '8px 12px', color: '#f5f2eb', fontFamily: G.mono, fontSize: 11, outline: 'none', cursor: 'pointer' }}>
          <option value={7}>7 jours</option>
          <option value={30}>30 jours</option>
          <option value={90}>90 jours</option>
        </select>
      </div>
      {loading ? <Loader /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.01)', border: `1px solid ${G.border}` }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['Nom','Email','Plan','Dernière connexion','Statut'].map(h => <th key={h} style={tableHeader}>{h}</th>)}
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

  if (authorized === null) return <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /></div>
  if (authorized === false) { window.location.href = '/'; return null }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', color: '#f5f2eb', display: 'flex', fontFamily: G.mono }}>
      <style>{`${FONTS} * { box-sizing: border-box; } select option { background: #0a0a08; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: rgba(201,162,39,0.2); }`}</style>

      {/* Sidebar */}
      <aside style={{ width: 200, background: '#0f0f0d', borderRight: `1px solid ${G.border}`, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <div style={{ padding: '0 12px 20px', borderBottom: `1px solid ${G.border}`, marginBottom: 8 }}>
          <div style={{ fontFamily: G.display, fontSize: 16, letterSpacing: '.06em', color: '#fff' }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </div>
          <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginTop: 4 }}>Admin</div>
        </div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} style={{
            width: '100%', textAlign: 'left', padding: '10px 12px',
            background: active === s.id ? G.goldBg : 'transparent',
            borderLeft: `2px solid ${active === s.id ? G.gold : 'transparent'}`,
            border: 'none', color: active === s.id ? G.gold : G.muted,
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
