import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Film, Users, Settings, LogOut, BarChart3, Trophy, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

const G = {
  bg:      '#0a0908',
  bg2:     '#0f0e0c',
  card:    'rgba(255,255,255,0.025)',
  border:  'rgba(255,255,255,0.07)',
  text:    '#f5f2eb',
  muted:   'rgba(245,242,235,0.35)',
  muted2:  'rgba(245,242,235,0.18)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.08)',
  goldBdr: 'rgba(201,162,39,0.25)',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

function DashboardLayout({ children }) {
  const location  = useLocation()
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

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex' }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 2px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 220, background: G.bg2,
        borderRight: `1px solid ${G.border}`,
        display: 'flex', flexDirection: 'column',
        zIndex: 50, overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${G.border}` }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.svg" alt="InsightBall" style={{ width: 26, height: 26 }} />
            <span style={{ fontFamily: G.display, fontSize: 15, letterSpacing: '.08em', color: G.text }}>
              INSIGHT<span style={{ color: G.gold }}>BALL</span>
            </span>
          </Link>
        </div>

        {/* User card */}
        <div style={{ padding: '16px 16px 14px', borderBottom: `1px solid ${G.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar initiales */}
            <div style={{
              width: 34, height: 34, flexShrink: 0,
              background: G.goldBg, border: `1px solid ${G.goldBdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: G.display, fontSize: 12, color: G.gold, letterSpacing: '.06em' }}>{initials}</span>
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
          {user?.plan && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted2 }}>Plan</span>
              <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', padding: '3px 10px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold }}>
                {user.plan}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '10px 8px', flex: 1 }}>
          <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.muted2, padding: '8px 10px 6px', marginBottom: 2 }}>
            Navigation
          </div>
          {navigation.map(item => {
            const isActive = location.pathname === item.href
              || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
            return (
              <Link key={item.name} to={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', marginBottom: 1,
                background: isActive ? G.goldBg : 'transparent',
                borderLeft: `2px solid ${isActive ? G.gold : 'transparent'}`,
                color: isActive ? G.gold : G.muted,
                fontFamily: G.mono, fontSize: 10,
                letterSpacing: '.1em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'all .15s',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = G.text } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = G.muted } }}
              >
                <item.icon size={13} strokeWidth={isActive ? 2 : 1.5} />
                <span style={{ flex: 1 }}>{item.name}</span>
                {isActive && <ChevronRight size={10} />}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{ borderTop: `1px solid ${G.border}`, padding: '10px 8px' }}>
          {user?.club_name && (
            <div style={{ padding: '8px 10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ width: 5, height: 5, background: G.gold, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted2 }}>Club</span>
              </div>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.text, letterSpacing: '.04em' }}>{user.club_name}</p>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', background: 'transparent', border: 'none',
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
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{
        flex: 1, marginLeft: 220,
        minHeight: '100vh',
        background: G.bg,
        padding: '36px 40px',
      }}>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
