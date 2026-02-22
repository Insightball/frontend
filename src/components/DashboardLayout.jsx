import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Film, Users, Settings, LogOut, BarChart3, User, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  ink: '#0f0f0d', gold: '#c9a227',
  goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.25)',
  muted: 'rgba(245,242,235,0.28)',
  mono: "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Accueil',      href: '/dashboard',         icon: Home },
    { name: 'Matchs',       href: '/dashboard/matches', icon: Film },
    { name: 'Effectif',     href: '/dashboard/players', icon: Users },
    { name: 'Statistiques', href: '/dashboard/stats',   icon: BarChart3 },
  ]

  if (user?.plan === 'club') {
    navigation.push({ name: 'Équipe', href: '/dashboard/team', icon: Trophy })
  }
  navigation.push({ name: 'Paramètres', href: '/dashboard/settings', icon: Settings })

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', color: '#f5f2eb', display: 'flex' }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(201,162,39,0.2); }
        select option { background: #0f0f0d; color: #f5f2eb; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 220,
        background: G.ink, borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width: 28, height: 28 }} />
          <span style={{ fontFamily: G.display, fontSize: 16, letterSpacing: '.06em', color: '#fff' }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </Link>

        {/* User card */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: G.goldBg, border: `1px solid ${G.goldBdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <User size={14} color={G.gold} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: '#f5f2eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {user?.email}
              </div>
            </div>
          </div>
          {user?.plan && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>Plan</span>
              <span style={{
                fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase',
                padding: '3px 10px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold,
              }}>{user.plan}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
                  color: isActive ? G.gold : G.muted,
                  background: isActive ? G.goldBg : 'transparent',
                  borderLeft: `2px solid ${isActive ? G.gold : 'transparent'}`,
                  textDecoration: 'none',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#f5f2eb'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = G.muted; e.currentTarget.style.background = 'transparent' } }}
              >
                <item.icon size={14} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Club + Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '10px 10px', flexShrink: 0 }}>
          {user?.club_name && (
            <div style={{ padding: '8px 12px', marginBottom: 4 }}>
              <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, marginBottom: 4 }}>Club</div>
              <div style={{ fontFamily: G.mono, fontSize: 10, color: '#f5f2eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: G.gold, display: 'inline-block', flexShrink: 0 }} />
                {user.club_name}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: 'transparent', border: 'none',
              fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
              color: G.muted, cursor: 'pointer', transition: 'color .15s', borderRadius: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = G.muted}
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: '32px 36px' }}>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
