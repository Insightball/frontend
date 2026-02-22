import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Film, Users, Settings, LogOut, BarChart3, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
    navigation.push({ name: 'Équipe', href: '/dashboard/team', icon: Users })
  }

  navigation.push({ name: 'Paramètres', href: '/dashboard/settings', icon: Settings })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen" style={{ background: '#faf8f4', color: '#0f0f0d' }}>

      {/* ── HEADER ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
        style={{
          height: 56,
          background: '#0f0f0d',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="InsightBall" className="w-8 h-8" />
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 18,
              letterSpacing: '.06em',
              color: '#fff',
            }}
          >
            INSIGHT<span style={{ color: '#c9a227' }}>BALL</span>
          </span>
        </Link>

        {/* Pill plan */}
        {user?.plan && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: '#c9a227',
              border: '1px solid rgba(201,162,39,0.3)',
              padding: '4px 12px',
              borderRadius: 2,
              background: 'rgba(201,162,39,0.06)',
            }}
          >
            Plan {user.plan}
          </span>
        )}
      </header>

      <div className="flex" style={{ paddingTop: 56 }}>

        {/* ── SIDEBAR ── */}
        <aside
          className="fixed left-0 bottom-0 overflow-y-auto flex flex-col"
          style={{
            top: 56,
            width: 220,
            background: '#0f0f0d',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* User block */}
          <div style={{ padding: '24px 20px 0' }}>
            <div
              style={{
                padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 24,
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36, height: 36,
                    background: 'rgba(201,162,39,0.1)',
                    border: '1px solid rgba(201,162,39,0.2)',
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                >
                  <User style={{ width: 16, height: 16, color: '#c9a227' }} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-white font-medium" style={{ fontSize: 13 }}>
                    {user?.name}
                  </p>
                  <p className="truncate" style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => {
                const active = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-3 transition-all"
                    style={{
                      padding: '10px 14px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: active ? '#c9a227' : 'rgba(255,255,255,.38)',
                      background: active ? 'rgba(201,162,39,0.08)' : 'transparent',
                      borderLeft: active ? '2px solid #c9a227' : '2px solid transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <item.icon style={{ width: 14, height: 14, flexShrink: 0 }} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom: club + logout */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,.06)' }}>
            {user?.club_name && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <div
                    style={{
                      width: 6, height: 6,
                      background: '#c9a227',
                      borderRadius: '50%',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '.16em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,.25)',
                    }}
                  >
                    Club
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
                  {user.club_name}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 transition-all"
              style={{
                padding: '14px 20px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.25)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.25)'}
            >
              <LogOut style={{ width: 14, height: 14 }} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main
          className="flex-1"
          style={{
            marginLeft: 220,
            minHeight: 'calc(100vh - 56px)',
            background: '#f5f2eb',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
