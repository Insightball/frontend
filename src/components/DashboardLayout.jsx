import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Film, Users, Settings, LogOut, BarChart3, Trophy, ChevronRight, Menu, X, UserCog } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  bg:      '#0a0908',
  bg2:     '#0f0e0c',
  card:    'rgba(255,255,255,0.025)',
  border:  'rgba(255,255,255,0.07)',
  text:    '#f5f2eb',
  muted:   'rgba(245,242,235,0.60)',
  muted2:  'rgba(245,242,235,0.55)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.08)',
  goldBdr: 'rgba(201,162,39,0.25)',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

const SIDEBAR_W = 220

function DashboardLayout({ children }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile]     = useState(false)

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

  // Entrées réservées plan Club
  if (user?.plan === 'CLUB') {
    navigation.push({ name: 'Équipe', href: '/dashboard/team', icon: Trophy })
    // Membres uniquement visible pour les admins du club
    if (user?.role === 'ADMIN') {
      navigation.push({ name: 'Membres', href: '/dashboard/members', icon: UserCog })
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="InsightBall" style={{ width: 26, height: 26 }} />
          <span style={{ fontFamily: G.display, fontSize: 15, letterSpacing: '.08em', color: G.text }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </Link>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.muted, padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* User card */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${G.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, flexShrink: 0, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: G.display, fontSize: 12, color: G.gold }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: G.mono, fontSize: 11, color: G.text, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '.02em' }}>
              {user?.name}
            </p>
            <p style={{ fontFamily: G.mono, fontSize: 9, color: G.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '.04em', marginTop: 1 }}>
              {user?.email}
            </p>
          </div>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {user?.plan && (
            <>
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted2 }}>Plan</span>
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', padding: '3px 10px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold }}>
                {user.plan}
              </span>
            </>
          )}
        </div>
        {/* Badge rôle pour plan club */}
        {user?.plan === 'CLUB' && user?.role && (
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted2 }}>Rôle</span>
            <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, color: G.muted }}>
              {user.role}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.muted2, padding: '8px 10px 6px', marginBottom: 2 }}>
          Navigation
        </div>
        {navigation.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.name} to={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 10px', marginBottom: 2,
              background: active ? G.goldBg : 'transparent',
              borderLeft: `2px solid ${active ? G.gold : 'transparent'}`,
              color: active ? G.gold : G.muted,
              fontFamily: G.mono, fontSize: 10,
              letterSpacing: '.1em', textTransform: 'uppercase',
              textDecoration: 'none', transition: 'all .15s',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = G.text } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = G.muted } }}
            >
              <item.icon size={13} strokeWidth={active ? 2 : 1.5} />
              <span style={{ flex: 1 }}>{item.name}</span>
              {active && <ChevronRight size={10} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${G.border}`, padding: '10px 8px' }}>
        {user?.club_name && (
          <div style={{ padding: '6px 10px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user?.club_logo
                ? <img src={user.club_logo} alt={user.club_name} style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                : <span style={{ width: 5, height: 5, background: G.gold, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
              }
              <div>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.55)' }}>Club</div>
                <p style={{ fontFamily: G.mono, fontSize: 12, color: G.text, letterSpacing: '.04em', fontWeight: 600 }}>{user.club_name}</p>
              </div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 10px', background: 'transparent', border: 'none',
          color: G.muted2, fontFamily: G.mono, fontSize: 10,
          letterSpacing: '.1em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = G.muted2; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={13} strokeWidth={1.5} />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex' }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 2px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: SIDEBAR_W,
          background: G.bg2,
          borderRight: `1px solid ${G.border}`,
          zIndex: 50,
          overflowY: 'auto',
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile overlay + drawer */}
      {isMobile && (
        <>
          {mobileOpen && (
            <div
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90 }}
            />
          )}
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 280,
            background: G.bg2,
            borderRight: `1px solid ${G.border}`,
            zIndex: 100,
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
            overflowY: 'auto',
          }}>
            <SidebarContent />
          </aside>

          <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 56,
            background: G.bg2,
            borderBottom: `1px solid ${G.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 80,
          }}>
            <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.text, padding: 6, display: 'flex', alignItems: 'center' }}>
              <Menu size={20} />
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/logo.svg" alt="InsightBall" style={{ width: 22, height: 22 }} />
              <span style={{ fontFamily: G.display, fontSize: 14, letterSpacing: '.08em', color: G.text }}>
                INSIGHT<span style={{ color: G.gold }}>BALL</span>
              </span>
            </Link>
            <div style={{ width: 32, height: 32, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: G.display, fontSize: 11, color: G.gold }}>{initials}</span>
            </div>
          </header>

          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: G.bg2,
            borderTop: `1px solid ${G.border}`,
            display: 'flex',
            zIndex: 80,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            {navigation.slice(0, 4).map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.name} to={item.href} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 4px 8px',
                  color: active ? G.gold : 'rgba(245,242,235,0.65)',
                  textDecoration: 'none',
                  borderTop: `2px solid ${active ? G.gold : 'transparent'}`,
                  transition: 'all .15s',
                  gap: 4,
                }}>
                  <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
                  <span style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        </>
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : SIDEBAR_W,
        minHeight: '100vh',
        background: G.bg,
        padding: isMobile ? '72px 16px 80px' : '36px 40px',
      }}>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
