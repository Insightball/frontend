import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Film, Users, Settings, LogOut, BarChart3, Trophy, ChevronRight, Menu, X, UserCog } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import TrialBanner from '../components/TrialBanner'
import { T, globalStyles } from '../theme'

const W = T.sidebarW

function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile,   setIsMobile]   = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const navigation = [
    { name: 'Accueil',      href: '/dashboard',         icon: Home },
    { name: 'Matchs',       href: '/dashboard/matches', icon: Film },
    { name: 'Effectif',     href: '/dashboard/players', icon: Users },
    { name: 'Statistiques', href: '/dashboard/stats',   icon: BarChart3 },
  ]
  if (user?.plan === 'CLUB') {
    navigation.push({ name: 'Vue Club', href: '/dashboard/club', icon: Trophy })
    if (user?.role === 'ADMIN')
      navigation.push({ name: 'Membres', href: '/dashboard/members', icon: UserCog })
  }
  navigation.push({ name: 'Paramètres', href: '/dashboard/settings', icon: Settings })

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const isActive = (href) =>
    href === '/dashboard'
      ? location.pathname === href
      : location.pathname.startsWith(href)

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.dark }}>

      {/* Logo */}
      <div style={{
        padding: '18px 16px',
        borderBottom: `1px solid rgba(201,162,39,0.12)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width: 24, height: 24 }} />
          <span style={{ fontFamily: T.display, fontSize: 14, letterSpacing: '.08em', color: '#f5f2eb' }}>
            INSIGHT<span style={{ color: T.gold }}>BALL</span>
          </span>
        </Link>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,235,0.4)', padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* User card */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, flexShrink: 0,
            background: T.goldBg2, border: `1px solid ${T.goldBdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: T.display, fontSize: 11, color: T.gold }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: T.mono, fontSize: 11, color: '#f5f2eb', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '.02em' }}>
              {user?.name}
            </p>
            <p style={{ fontFamily: T.mono, fontSize: 9, color: 'rgba(245,242,235,0.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '.03em', marginTop: 1 }}>
              {user?.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {user?.plan && (
            <span style={{
              fontFamily: T.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase',
              padding: '3px 9px', background: T.goldBg2, border: `1px solid ${T.goldBdr}`, color: T.gold,
            }}>
              {user.plan}
            </span>
          )}
          {user?.plan === 'CLUB' && user?.role && (
            <span style={{
              fontFamily: T.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase',
              padding: '3px 9px', background: 'rgba(245,242,235,0.06)', border: `1px solid rgba(245,242,235,0.1)`, color: 'rgba(245,242,235,0.4)',
            }}>
              {user.role}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px 8px', flex: 1, overflowY: 'auto' }}>
        <p style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.22)', padding: '10px 10px 6px' }}>
          Navigation
        </p>
        {navigation.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.name} to={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', marginBottom: 1,
              background: active ? 'rgba(201,162,39,0.10)' : 'transparent',
              borderLeft: `2px solid ${active ? T.gold : 'transparent'}`,
              color: active ? T.gold : 'rgba(245,242,235,0.45)',
              fontFamily: T.mono, fontSize: 9,
              letterSpacing: '.1em', textTransform: 'uppercase',
              textDecoration: 'none', transition: 'all .12s',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(245,242,235,0.04)'; e.currentTarget.style.color = 'rgba(245,242,235,0.75)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(245,242,235,0.45)' } }}
            >
              <item.icon size={12} strokeWidth={active ? 2 : 1.5} />
              <span style={{ flex: 1 }}>{item.name}</span>
              {active && <ChevronRight size={9} style={{ opacity: 0.6 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer sidebar */}
      <div style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, padding: '8px 8px' }}>
        {user?.club_name && (
          <div style={{ padding: '8px 10px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {user?.club_logo
              ? <img src={user.club_logo} alt={user.club_name} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
              : <span style={{ width: 4, height: 4, background: T.gold, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
            }
            <p style={{ fontFamily: T.mono, fontSize: 10, color: 'rgba(245,242,235,0.55)', letterSpacing: '.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.club_name}
            </p>
          </div>
        )}
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 10px', background: 'transparent', border: 'none',
          color: 'rgba(245,242,235,0.35)', fontFamily: T.mono, fontSize: 9,
          letterSpacing: '.1em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all .12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,242,235,0.35)'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={12} strokeWidth={1.5} />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex' }}>
      <style>{globalStyles}</style>

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: W, zIndex: 50, overflowY: 'auto',
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <>
          {mobileOpen && (
            <div onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.6)', zIndex: 90 }} />
          )}
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
            zIndex: 100,
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform .22s cubic-bezier(.4,0,.2,1)',
            overflowY: 'auto',
          }}>
            <SidebarContent />
          </aside>

          {/* Mobile top bar */}
          <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 52,
            background: T.dark, borderBottom: `1px solid rgba(201,162,39,0.12)`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', zIndex: 80,
          }}>
            <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,235,0.6)', padding: 6 }}>
              <Menu size={18} />
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/logo.svg" alt="" style={{ width: 20, height: 20 }} />
              <span style={{ fontFamily: T.display, fontSize: 13, letterSpacing: '.08em', color: '#f5f2eb' }}>
                INSIGHT<span style={{ color: T.gold }}>BALL</span>
              </span>
            </Link>
            <div style={{
              width: 30, height: 30, background: T.goldBg2, border: `1px solid ${T.goldBdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: T.display, fontSize: 10, color: T.gold }}>{initials}</span>
            </div>
          </header>

          {/* Mobile bottom nav */}
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: T.dark, borderTop: `1px solid rgba(201,162,39,0.10)`,
            display: 'flex', zIndex: 80,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            {navigation.slice(0, 4).map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.name} to={item.href} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 4px 8px', gap: 4,
                  color: active ? T.gold : 'rgba(245,242,235,0.35)',
                  textDecoration: 'none',
                  borderTop: `2px solid ${active ? T.gold : 'transparent'}`,
                  background: active ? 'rgba(201,162,39,0.06)' : 'transparent',
                  transition: 'all .12s',
                }}>
                  <item.icon size={16} strokeWidth={active ? 2 : 1.5} />
                  <span style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        </>
      )}

      {/* Main */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : W,
        minHeight: '100vh',
        background: T.bg,
        padding: isMobile ? '64px 16px 88px' : '32px 36px 48px',
      }}>
        <TrialBanner />
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
