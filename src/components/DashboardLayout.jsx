import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Film, Users, Settings, LogOut, BarChart3, User, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  paper:   '#f5f2eb',
  cream:   '#faf8f4',
  ink:     '#0f0f0d',
  ink2:    '#2a2a26',
  muted:   'rgba(15,15,13,0.42)',
  rule:    'rgba(15,15,13,0.09)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.25)',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Accueil',      href: '/dashboard',          icon: Home },
    { name: 'Matchs',       href: '/dashboard/matches',  icon: Film },
    { name: 'Effectif',     href: '/dashboard/players',  icon: Users },
    { name: 'Statistiques', href: '/dashboard/stats',    icon: BarChart3 },
  ]

  if (user?.plan === 'club') {
    navigation.push({ name: 'Équipe', href: '/dashboard/team', icon: Trophy })
  }

  navigation.push({ name: 'Paramètres', href: '/dashboard/settings', icon: Settings })

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: G.cream, display: 'flex' }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(15,15,13,0.1); }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 220,
        background: G.ink, display: 'flex', flexDirection: 'column',
        borderRight: `1px solid rgba(255,255,255,0.06)`, zIndex: 50, overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: 'rgba(255,255,255,0.06) 1px solid' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.svg" alt="InsightBall" style={{ width: 28, height: 28 }} />
            <span style={{ fontFamily: G.display, fontSize: 16, letterSpacing: '.06em', color: '#fff' }}>
              INSIGHT<span style={{ color: G.gold }}>BALL</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={14} color={G.gold} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: '#f5f2eb', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
              <p style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '.04em' }}>
                {user?.email}
              </p>
            </div>
          </div>
          {user?.plan && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(245,242,235,0.3)', letterSpacing: '.12em', textTransform: 'uppercase' }}>Plan</span>
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', padding: '3px 10px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold }}>
                {user.plan}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {navigation.map(item => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.name} to={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', marginBottom: 2,
                background: isActive ? G.goldBg : 'transparent',
                borderLeft: `2px solid ${isActive ? G.gold : 'transparent'}`,
                color: isActive ? G.gold : 'rgba(245,242,235,0.45)',
                fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'all .15s',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f5f2eb' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(245,242,235,0.45)' } }}
              >
                <item.icon size={14} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Club info + logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 10px' }}>
          {user?.club_name && (
            <div style={{ padding: '10px 12px', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ width: 6, height: 6, background: G.gold, borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.3)' }}>Club</span>
              </div>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: '#f5f2eb', margin: 0, letterSpacing: '.04em' }}>{user.club_name}</p>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', background: 'transparent', border: 'none',
            color: 'rgba(245,242,235,0.35)', fontFamily: G.mono, fontSize: 10,
            letterSpacing: '.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,242,235,0.35)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, padding: '36px 40px', minHeight: '100vh', background: G.cream }}>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
