/**
 * AdminPanel.jsx
 * Accès via /admin — route cachée, aucun lien dans l'UI
 * 
 * Dans ton App.jsx / router, ajoute :
 * <Route path="/admin" element={<AdminPanel />} />
 * 
 * Ne pas mettre de lien vers /admin nulle part dans l'app.
 */

import { useState, useEffect } from "react";

const API = "/api/x-admin";

// ─── Hook pour les appels API admin ────────────────────────────────────────
function useAdminFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("insightball_token"); // adapte selon ton auth
    fetch(`${API}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 403) throw new Error("403");
        return r.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
}

// ─── Composants sections ────────────────────────────────────────────────────

function Dashboard() {
  const { data, loading } = useAdminFetch("/dashboard");

  if (loading) return <Loader />;
  if (!data) return null;

  const stats = [
    { label: "Total utilisateurs", value: data.total_users, color: "#6366f1" },
    { label: "Comptes actifs", value: data.active_users, color: "#22c55e" },
    { label: "Plan Coach", value: data.coach_plan_count, color: "#f59e0b" },
    { label: "Plan Club", value: data.club_plan_count, color: "#3b82f6" },
    { label: "Inscrits (7j)", value: data.users_last_7_days, color: "#8b5cf6" },
    { label: "Inscrits (30j)", value: data.users_last_30_days, color: "#ec4899" },
    { label: "Abonnés payants", value: data.paying_users, color: "#10b981" },
  ];

  return (
    <div>
      <h2 style={styles.sectionTitle}>Dashboard</h2>
      <div style={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
            <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersList() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("insightball_token");
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (plan) params.append("plan", plan);

    setLoading(true);
    fetch(`${API}/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [search, plan]);

  const toggleActive = async (userId, currentState) => {
    const token = localStorage.getItem("insightball_token");
    await fetch(`${API}/users/${userId}/toggle-active`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !currentState } : u))
    );
  };

  return (
    <div>
      <h2 style={styles.sectionTitle}>Comptes utilisateurs</h2>
      <div style={styles.filters}>
        <input
          style={styles.input}
          placeholder="Rechercher par email ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={styles.select} value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">Tous les plans</option>
          <option value="coach">Coach</option>
          <option value="club">Club</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Plan</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Inscrit le</th>
              <th style={styles.th}>Dernière connexion</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} style={styles.tableRow}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: u.plan === "club" ? "#3b82f620" : "#f59e0b20", color: u.plan === "club" ? "#3b82f6" : "#f59e0b" }}>
                    {u.plan}
                  </span>
                </td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>{formatDate(u.created_at)}</td>
                <td style={styles.td}>{u.last_login ? formatDate(u.last_login) : "—"}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: u.is_active ? "#22c55e20" : "#ef444420", color: u.is_active ? "#22c55e" : "#ef4444" }}>
                    {u.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    style={{ ...styles.btn, background: u.is_active ? "#ef444420" : "#22c55e20", color: u.is_active ? "#ef4444" : "#22c55e" }}
                    onClick={() => toggleActive(u.id, u.is_active)}
                  >
                    {u.is_active ? "Désactiver" : "Activer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Payments() {
  const { data, loading } = useAdminFetch("/payments");

  if (loading) return <Loader />;

  return (
    <div>
      <h2 style={styles.sectionTitle}>Paiements & Abonnements</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>Nom</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Plan</th>
            <th style={styles.th}>Stripe Customer</th>
            <th style={styles.th}>Subscription ID</th>
            <th style={styles.th}>Depuis</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((u) => (
            <tr key={u.id} style={styles.tableRow}>
              <td style={styles.td}>{u.name}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}>
                <span style={{ ...styles.badge, background: "#6366f120", color: "#6366f1" }}>{u.plan}</span>
              </td>
              <td style={styles.td}><code style={styles.code}>{u.stripe_customer_id || "—"}</code></td>
              <td style={styles.td}><code style={styles.code}>{u.stripe_subscription_id || "—"}</code></td>
              <td style={styles.td}>{formatDate(u.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data?.length === 0 && <p style={styles.empty}>Aucun abonnement actif</p>}
    </div>
  );
}

function Logins() {
  const [days, setDays] = useState(30);
  const { data, loading } = useAdminFetch(`/logins?days=${days}`);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Historique connexions</h2>
        <select style={styles.select} value={days} onChange={(e) => setDays(e.target.value)}>
          <option value={7}>7 derniers jours</option>
          <option value={30}>30 derniers jours</option>
          <option value={90}>90 derniers jours</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Plan</th>
              <th style={styles.th}>Dernière connexion</th>
              <th style={styles.th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u) => (
              <tr key={u.id} style={styles.tableRow}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.plan}</td>
                <td style={styles.td}>{u.last_login ? formatDate(u.last_login) : "—"}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: u.is_active ? "#22c55e20" : "#ef444420", color: u.is_active ? "#22c55e" : "#ef4444" }}>
                    {u.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data?.length === 0 && <p style={styles.empty}>Aucune connexion sur cette période</p>}
    </div>
  );
}

// ─── Composants utilitaires ─────────────────────────────────────────────────

function Loader() {
  return <div style={styles.loader}>Chargement...</div>;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Panel principal ────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "users", label: "👥 Utilisateurs" },
  { id: "payments", label: "💳 Paiements" },
  { id: "logins", label: "🔐 Connexions" },
];

export default function AdminPanel() {
  const [active, setActive] = useState("dashboard");
  const [authorized, setAuthorized] = useState(null);

  // Vérifie que l'utilisateur est bien superadmin
  useEffect(() => {
    const token = localStorage.getItem("insightball_token");
    if (!token) { setAuthorized(false); return; }

    fetch(`${API}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => {
      setAuthorized(r.status !== 403);
    }).catch(() => setAuthorized(false));
  }, []);

  if (authorized === null) return <div style={styles.fullPage}><Loader /></div>;
  if (authorized === false) {
    // Redirection discrète — pas de message d'erreur visible
    window.location.href = "/";
    return null;
  }

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>⚽ INSIGHTBALL<br /><span style={{ fontSize: 11, opacity: 0.5 }}>Admin</span></div>
        <nav>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              style={{ ...styles.navItem, ...(active === s.id ? styles.navItemActive : {}) }}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Contenu */}
      <main style={styles.main}>
        {active === "dashboard" && <Dashboard />}
        {active === "users" && <UsersList />}
        {active === "payments" && <Payments />}
        {active === "logins" && <Logins />}
      </main>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: "Inter, sans-serif" },
  sidebar: { width: 220, background: "#1a1d27", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8, borderRight: "1px solid #2d3148" },
  logo: { color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 24, lineHeight: 1.4 },
  navItem: { width: "100%", textAlign: "left", padding: "10px 12px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", borderRadius: 8, fontSize: 14, transition: "all 0.15s" },
  navItemActive: { background: "#6366f120", color: "#818cf8" },
  main: { flex: 1, padding: 32, overflowX: "auto" },
  sectionTitle: { fontSize: 20, fontWeight: 700, marginBottom: 24, color: "#f1f5f9" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 },
  statCard: { background: "#1a1d27", borderRadius: 12, padding: "20px 16px", border: "1px solid #2d3148" },
  statValue: { fontSize: 32, fontWeight: 700 },
  statLabel: { fontSize: 13, color: "#64748b", marginTop: 4 },
  filters: { display: "flex", gap: 12, marginBottom: 20 },
  input: { padding: "8px 12px", background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 8, color: "#e2e8f0", fontSize: 14, width: 280 },
  select: { padding: "8px 12px", background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 8, color: "#e2e8f0", fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", background: "#1a1d27", borderRadius: 12, overflow: "hidden" },
  tableHeader: { background: "#2d3148" },
  tableRow: { borderBottom: "1px solid #2d3148", transition: "background 0.1s" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" },
  td: { padding: "12px 16px", fontSize: 14 },
  badge: { padding: "3px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  code: { background: "#2d3148", padding: "2px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" },
  btn: { padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 },
  loader: { padding: 40, textAlign: "center", color: "#64748b" },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 },
  fullPage: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f1117" },
};
