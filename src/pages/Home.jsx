import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* ─── Palette ────────────────────────────────── */
const G = {
  white:   '#ffffff',
  off:     '#f7f7f5',
  border:  '#e8e6e1',
  border2: '#d4d0c8',
  ink:     '#111110',
  ink2:    '#2d2c2a',
  muted:   '#6b6960',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldL:   'rgba(201,162,39,0.10)',
  goldLx:  'rgba(201,162,39,0.20)',
  green:   '#1a7a4a',
  red:     '#dc2626',
  mono:    "'JetBrains Mono', monospace",
  display: "'Barlow Condensed', sans-serif",
  body:    "'Barlow', sans-serif",
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');`

/* ─── Google Sheets webhook URL ─────────────── */
/* Remplace par ton URL Apps Script une fois deployé */
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzVmVTmvlRMv27XsGYTtkjSK6-KV3cm3bLlI17Coe1e7HRUqamGaYBzbfPVePLnaqqROg/exec'

/* ─── Scroll reveal hook ─────────────────────── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ─── Bar animée ─────────────────────────────── */
function AnimBar({ pct, color }) {
  const [ref, vis] = useReveal()
  return (
    <div ref={ref} style={{ height: 5, background: G.border, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: vis ? pct : '0%', background: color || G.gold, borderRadius: 99, transition: 'width 1.2s ease' }} />
    </div>
  )
}

/* ─── Reveal wrapper ─────────────────────────── */
function Reveal({ children, delay = 0, style }) {
  const [ref, vis] = useReveal()
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(20px)', transition: `opacity .6s ${delay}s, transform .6s ${delay}s`, ...style }}>
      {children}
    </div>
  )
}

/* ─── Données joueurs GFCA ───────────────────── */
const PLAYERS = [
  { num: 9,  name: 'Randazzo N.',  pos: 'ATT', passes: 43, duels: 10, buts: 4, km: 9.8 },
  { num: 10, name: 'Finidori P.',  pos: 'MIL', passes: 60, duels: 12, buts: 2, km: 11.1 },
  { num: 11, name: 'Dangoumau N.', pos: 'ATT', passes: 39, duels: 9,  buts: 5, km: 9.5 },
  { num: 8,  name: 'Kheroua N.',   pos: 'MIL', passes: 61, duels: 13, buts: 3, km: 10.8 },
  { num: 4,  name: 'Bonalair M.',  pos: 'DEF', passes: 41, duels: 14, buts: 1, km: 9.4 },
  { num: 6,  name: 'Fogacci L.',   pos: 'MIL', passes: 54, duels: 11, buts: 2, km: 10.3 },
]

/* ─── Heatmap SVG pro ────────────────────────── */
/* ─── Heatmap interactive avec tooltip ──────── */
const EVENTS = [
  { cx: 274, cy: 84,  r: 6,   color: '#ef4444', type: 'Tir cadré',          detail: 'Dangoumau — 74'',  icon: '⚽' },
  { cx: 258, cy: 113, r: 5,   color: '#ef4444', type: 'Tir cadré',          detail: 'Randazzo — 61'',   icon: '⚽' },
  { cx: 282, cy: 122, r: 4.5, color: '#f97316', type: 'Tir non cadré',      detail: 'Finidori — 55'',   icon: '🎯' },
  { cx: 217, cy: 76,  r: 5,   color: '#f97316', type: 'Tir non cadré',      detail: 'Kheroua — 38'',    icon: '🎯' },
  { cx: 232, cy: 132, r: 4,   color: '#eab308', type: 'Ballon récupéré',    detail: 'Fogacci — 67'',    icon: '✅' },
  { cx: 165, cy: 70,  r: 4.5, color: '#c9a227', type: 'Ballon récupéré',    detail: 'Kheroua — 42'',    icon: '✅' },
  { cx: 155, cy: 126, r: 3.5, color: '#c9a227', type: 'Ballon perdu',       detail: 'Finidori — 51'',   icon: '❌' },
  { cx: 84,  cy: 96,  r: 4,   color: '#22c55e', type: 'Ballon récupéré',    detail: 'Bonalair — 29'',   icon: '✅' },
  { cx: 195, cy: 88,  r: 3.5, color: '#a855f7', type: 'Ballon perdu',       detail: 'Dangoumau — 44'',  icon: '❌' },
  { cx: 240, cy: 98,  r: 5,   color: '#ef4444', type: 'Tir cadré',          detail: 'Randazzo — 82'',   icon: '⚽' },
]

function HeatmapSVG() {
  const [tooltip, setTooltip] = useState(null)
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x, top: tooltip.y,
          transform: 'translate(-50%, -110%)',
          background: 'rgba(17,17,16,0.95)',
          border: `1px solid ${tooltip.color}`,
          borderRadius: 6, padding: '7px 12px',
          pointerEvents: 'none', zIndex: 99,
          minWidth: 140, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: tooltip.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.06em', marginBottom: 2 }}>
            {tooltip.icon} {tooltip.type}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Barlow', sans-serif" }}>
            {tooltip.detail}
          </div>
        </div>
      )}

      <svg width="100%" viewBox="0 0 320 200" style={{ display: 'block', background: '#0c1f0c', cursor: 'crosshair' }}>
        <defs>
          <pattern id="stripes" x="0" y="0" width="22" height="200" patternUnits="userSpaceOnUse">
            <rect width="11" height="200" fill="#0c1f0c"/>
            <rect x="11" width="11" height="200" fill="#0e230e"/>
          </pattern>
          <radialGradient id="hRed" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ef4444" stopOpacity="0.88"/>
            <stop offset="40%"  stopColor="#f97316" stopOpacity="0.50"/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="hOrange" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="0.78"/>
            <stop offset="55%"  stopColor="#eab308" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="hGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#c9a227" stopOpacity="0.72"/>
            <stop offset="60%"  stopColor="#c9a227" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="#c9a227" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="hGreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.52"/>
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Fond */}
        <rect width="320" height="200" fill="url(#stripes)"/>

        {/* Zones chaleur */}
        <ellipse cx="272" cy="88"  rx="52" ry="44" fill="url(#hRed)"    style={{filter:'blur(16px)'}}/>
        <ellipse cx="255" cy="118" rx="40" ry="32" fill="url(#hRed)"    style={{filter:'blur(13px)'}}/>
        <ellipse cx="215" cy="78"  rx="42" ry="34" fill="url(#hOrange)" style={{filter:'blur(12px)'}}/>
        <ellipse cx="230" cy="130" rx="34" ry="26" fill="url(#hOrange)" style={{filter:'blur(11px)'}}/>
        <ellipse cx="165" cy="72"  rx="35" ry="28" fill="url(#hGold)"   style={{filter:'blur(11px)'}}/>
        <ellipse cx="158" cy="125" rx="30" ry="24" fill="url(#hGold)"   style={{filter:'blur(10px)'}}/>
        <ellipse cx="82"  cy="98"  rx="36" ry="30" fill="url(#hGreen)"  style={{filter:'blur(13px)'}}/>

        {/* Lignes terrain */}
        <g stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none">
          <rect x="6" y="6" width="308" height="188"/>
          <line x1="160" y1="6" x2="160" y2="194"/>
          <circle cx="160" cy="100" r="28"/>
          <circle cx="160" cy="100" r="2" fill="rgba(255,255,255,0.22)" stroke="none"/>
          <rect x="6" y="56" width="48" height="88"/>
          <rect x="6" y="74" width="18" height="52"/>
          <rect x="266" y="56" width="48" height="88"/>
          <rect x="296" y="74" width="18" height="52"/>
          <path d="M54 74 A28 28 0 0 1 54 126" strokeDasharray="4 3"/>
          <path d="M266 74 A28 28 0 0 0 266 126" strokeDasharray="4 3"/>
          <path d="M6 18 A12 12 0 0 1 18 6"/>
          <path d="M302 6 A12 12 0 0 1 314 18"/>
          <path d="M314 182 A12 12 0 0 1 302 194"/>
          <path d="M18 194 A12 12 0 0 1 6 182"/>
        </g>
        <rect x="1" y="80" width="5" height="40" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/>
        <rect x="314" y="80" width="5" height="40" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/>

        {/* Points interactifs */}
        {EVENTS.map((ev, i) => (
          <g key={i}>
            {/* Halo au survol */}
            {hovered === i && (
              <circle cx={ev.cx} cy={ev.cy} r={ev.r + 5} fill={ev.color} opacity=".20"/>
            )}
            {/* Point principal */}
            <circle
              cx={ev.cx} cy={ev.cy} r={hovered === i ? ev.r + 1.5 : ev.r}
              fill={ev.color}
              opacity={hovered === i ? 1 : 0.88}
              stroke={hovered === i ? '#fff' : 'none'}
              strokeWidth="1.5"
              style={{ transition: 'all .15s', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                setHovered(i)
                const rect = e.currentTarget.closest('svg').getBoundingClientRect()
                const svgEl = e.currentTarget.closest('svg')
                const viewW = 320, viewH = 200
                const scaleX = rect.width / viewW
                const scaleY = rect.height / viewH
                setTooltip({
                  x: ev.cx * scaleX,
                  y: ev.cy * scaleY,
                  color: ev.color,
                  type: ev.type,
                  detail: ev.detail,
                  icon: ev.icon,
                })
              }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
            />
          </g>
        ))}

        {/* Légende compacte en bas à droite */}
        <g transform="translate(168,186)">
          {[['#ef4444','Tir cadré'],['#f97316','Tir non cadré'],['#22c55e','Récupération'],['#a855f7','Ballon perdu']].map(([c,l],i) => (
            <g key={l} transform={`translate(${i * 37},0)`}>
              <circle cx="4" cy="-3" r="3.5" fill={c}/>
              <text x="10" y="0" fill="rgba(255,255,255,0.55)" fontSize="6" fontFamily="monospace">{l}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

/* ════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════ */
export default function LandingPage() {
  const [navScrolled, setNavScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [contactForm, setContactForm]   = useState({ name: '', email: '', message: '' })
  const [contactSent, setContactSent]   = useState(false)
  const [contactLoad, setContactLoad]   = useState(false)
  const [wlForm, setWlForm]             = useState({ firstName:'', lastName:'', email:'', club:'', role:'', category:'' })
  const [wlSent, setWlSent]             = useState(false)
  const [wlLoading, setWlLoading]       = useState(false)
  const [wlError, setWlError]           = useState('')
  const [wlFocused, setWlFocused]       = useState(null)

  /* ── Envoi waitlist → Google Sheets ── */
  const handleWaitlist = async (e) => {
    e.preventDefault()
    setWlLoading(true); setWlError('')
    const payload = {
      sheet: 'Waitlist',
      firstName: wlForm.firstName,
      lastName:  wlForm.lastName,
      email:     wlForm.email,
      club:      wlForm.club,
      role:      wlForm.role,
      category:  wlForm.category,
      date:      new Date().toISOString(),
    }
    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setWlSent(true)
    } catch {
      setWlError('Une erreur est survenue. Écrivez-nous : contact@insightball.com')
    }
    setWlLoading(false)
  }

  /* ── Envoi contact → Google Sheets ── */
  const handleContact = async (e) => {
    e.preventDefault()
    setContactLoad(true)
    const payload = {
      sheet:   'Contact',
      name:    contactForm.name,
      email:   contactForm.email,
      message: contactForm.message,
      date:    new Date().toISOString(),
    }
    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {}
    setContactSent(true)
    setContactLoad(false)
  }

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const css = `
    ${FONTS}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #fff; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${G.border2}; border-radius: 2px; }
    @keyframes heroUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
    @media (max-width: 1024px) {
      .hero-grid    { grid-template-columns: 1fr !important; max-width: 640px !important; }
      .hero-right   { display: none !important; }
      .feat-grid    { grid-template-columns: 1fr !important; }
      .process-grid { grid-template-columns: 1fr !important; }
      .process-card-sticky { display: none !important; }
      .rapport-grid { grid-template-columns: 1fr !important; }
      .price-grid   { grid-template-columns: 1fr !important; max-width: 480px !important; }
      .cta-band     { flex-direction: column !important; align-items: flex-start !important; padding: 56px 32px !important; }
      .footer-grid  { grid-template-columns: 1fr 1fr !important; }
      .wrap, .wrap-inner { padding: 72px 32px !important; }
      .contact-grid { grid-template-columns: 1fr !important; }
      .wl-grid      { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 768px) {
      .nav-links, .nav-cta-d { display: none !important; }
      .nav-burger  { display: flex !important; }
      .hero-title  { font-size: clamp(40px,11vw,64px) !important; }
      .sec-h2      { font-size: clamp(30px,7vw,44px) !important; }
      .wrap, .wrap-inner { padding: 56px 20px !important; }
      .cta-band    { padding: 56px 20px !important; }
      .footer-grid { gap: 24px !important; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr !important; }
      .wl-grid     { grid-template-columns: 1fr !important; }
    }
  `

  const btnPrimary = {
    padding: '14px 28px', background: G.gold, color: G.white,
    fontFamily: G.display, fontSize: 15, fontWeight: 700,
    letterSpacing: '.05em', textTransform: 'uppercase',
    border: 'none', cursor: 'pointer', borderRadius: 4,
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'background .15s',
  }
  const btnOutline = {
    ...btnPrimary, background: 'transparent', color: G.ink2,
    border: `1.5px solid ${G.border2}`,
  }
  const panelHd = {
    background: G.off, borderBottom: `1px solid ${G.border}`,
    padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.08em', textTransform: 'uppercase',
  }
  const kpiN = (color) => ({
    fontFamily: G.display, fontSize: 28, fontWeight: 800, lineHeight: 1, color: color || G.ink,
  })

  const inputLine = (focused) => ({
    borderBottom: `2px solid ${focused ? G.gold : G.border}`,
    marginBottom: 24, paddingBottom: 10, transition: 'border-color .15s',
  })
  const inputLineDark = (focused) => ({
    borderBottom: `2px solid ${focused ? G.gold : 'rgba(255,255,255,0.15)'}`,
    marginBottom: 24, paddingBottom: 10, transition: 'border-color .15s',
  })
  const labelSt = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 6 }
  const labelStDark = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)', display: 'block', marginBottom: 6 }
  const inputSt = { width:'100%', background:'transparent', border:'none', outline:'none', fontSize:15, color:G.ink, fontFamily:G.body }
  const inputStDark = { width:'100%', background:'transparent', border:'none', outline:'none', fontSize:15, color:G.white, fontFamily:G.body }

  return (
    <div style={{ background: G.white, color: G.ink, fontFamily: G.body, fontSize: 16, lineHeight: 1.6, overflowX: 'hidden' }}>
      <style>{css}</style>

      {/* ══ NAV ════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: G.ink, backdropFilter: 'none',
        borderBottom: 'none', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        boxShadow: navScrolled ? '0 2px 20px rgba(0,0,0,0.40)' : 'none',
        transition: 'box-shadow .2s',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="INSIGHTBALL" style={{ height: 36, width: 'auto', display: 'block', mixBlendMode: 'screen' }} />
          <span style={{ fontFamily: G.display, fontSize: 18, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: G.white }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </Link>

        <div className="nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[['#features','Fonctionnalités'],['#pricing','Tarifs'],['#waitlist','Accès anticipé']].map(([h,l]) => (
            <a key={h} href={h} style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = G.gold}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}>{l}</a>
          ))}
        </div>

        <a href="#waitlist" className="nav-cta-d" style={{ ...btnPrimary, padding: '9px 20px', fontSize: 14, textDecoration:'none' }}
          onMouseEnter={e => e.currentTarget.style.background = G.goldD}
          onMouseLeave={e => e.currentTarget.style.background = G.gold}>
          Accès anticipé
        </a>

        <button className="nav-burger" onClick={() => setMenuOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, padding: 4 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 22, height: 1.5, background: G.white, display: 'block', transition: '.2s',
              transform: menuOpen && i===0 ? 'translateY(6.5px) rotate(45deg)' : menuOpen && i===2 ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
              opacity: menuOpen && i===1 ? 0 : 1,
            }}/>
          ))}
        </button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 199, background: G.ink, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px 20px', display: 'flex', flexDirection: 'column' }}>
          {[['#features','Fonctionnalités'],['#pricing','Tarifs'],['#waitlist','Accès anticipé']].map(([h,l]) => (
            <a key={h} href={h} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{l}</a>
          ))}
          <a href="#waitlist" onClick={() => setMenuOpen(false)} style={{ ...btnPrimary, marginTop: 12, justifyContent: 'center', textDecoration:'none' }}>Accès anticipé →</a>
        </div>
      )}

      {/* ══ HERO ═══════════════════════════════════════ */}
      <div className="hero-grid" style={{ paddingTop: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', maxWidth: 1200, margin: '0 auto', padding: '60px 48px 0', gap: 60, minHeight: '100vh' }}>
        <div style={{ padding: '80px 0' }}>
          <h1 className="hero-title" style={{ fontFamily: G.display, fontSize: 'clamp(48px,6vw,78px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 24, opacity: 0, animation: 'heroUp .5s .2s forwards' }}>
            Transformez vos vidéos<br/>
            <span style={{ color: G.gold }}>en données<br/>exploitables.</span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.65, color: G.muted, maxWidth: 440, marginBottom: 36, opacity: 0, animation: 'heroUp .5s .35s forwards' }}>
            Uploadez votre vidéo. Recevez un <strong style={{ color: G.ink, fontWeight: 500 }}>rapport tactique complet</strong> — heatmaps, stats individuelles, phases de jeu.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', opacity: 0, animation: 'heroUp .5s .45s forwards' }}>
            <a href="#waitlist" style={{ ...btnPrimary, textDecoration:'none' }}
              onMouseEnter={e => e.currentTarget.style.background = G.goldD}
              onMouseLeave={e => e.currentTarget.style.background = G.gold}>
              Demander un accès →
            </a>
            <a href="#rapport" style={btnOutline}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.ink; e.currentTarget.style.color = G.ink }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border2; e.currentTarget.style.color = G.ink2 }}>
              Voir un exemple
            </a>
          </div>

          <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: `1px solid ${G.border}`, opacity: 0, animation: 'heroUp .5s .6s forwards', flexWrap: 'wrap' }}>
            {[['40+','métriques analysées'],['< 1h','rapport généré'],['Séniors→U14','toutes catégories']].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily: G.display, fontSize: 32, fontWeight: 800, color: G.ink, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 13, color: G.muted, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="hero-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, animation: 'heroUp .6s .3s forwards' }}>
          <div style={{ width: '100%', maxWidth: 520, background: G.white, border: `1px solid ${G.border}`, borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
            <div style={{ background: G.off, borderBottom: `1px solid ${G.border}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {['#f87171','#fbbf24','#4ade80'].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }}/>)}
              <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, marginLeft: 6, letterSpacing: '.06em' }}>Rapport de match</span>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[['63%',G.gold,'Possession'],['18',G.ink,'Attaques'],['8/14',G.green,'Cadrés']].map(([v,c,l]) => (
                  <div key={l} style={{ background: G.off, border: `1px solid ${G.border}`, borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: G.display, fontSize: 26, fontWeight: 800, lineHeight: 1, color: c }}>{v}</div>
                    <div style={{ fontSize: 10, color: G.muted, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Heatmap pro */}
              <div style={{ border: `1px solid ${G.border}`, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ background: G.off, borderBottom: `1px solid ${G.border}`, padding: '7px 12px', fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Heatmap collective</span><span style={{ color: G.gold }}>Mi-temps 2</span>
                </div>
                <HeatmapSVG/>
              </div>
              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: G.off }}>
                    {['Joueur','Passes','Duels','Km'].map(h => (
                      <th key={h} style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, padding: '7px 10px', textAlign: h==='Joueur'?'left':'center', borderBottom: `1px solid ${G.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLAYERS.slice(0,3).map(p => (
                    <tr key={p.num} onMouseEnter={e => e.currentTarget.style.background=G.goldL} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ fontSize: 12, color: G.ink2, padding: '7px 10px', borderBottom: `1px solid ${G.border}` }}>
                        <span style={{ fontFamily: G.display, fontSize: 14, fontWeight: 700, color: G.gold, marginRight: 4 }}>{p.num}</span>
                        {p.name}
                        <span style={{ fontFamily: G.mono, fontSize: 9, background: G.off, border: `1px solid ${G.border}`, padding: '1px 5px', borderRadius: 2, marginLeft: 4, color: G.muted }}>{p.pos}</span>
                      </td>
                      {[p.passes, p.duels, p.km].map((v,i) => <td key={i} style={{ fontSize: 12, fontWeight: 600, color: G.ink2, padding: '7px 10px', textAlign: 'center', borderBottom: `1px solid ${G.border}` }}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FEATURES ═══════════════════════════════════ */}
      <div style={{ background: G.off }} id="features">
        <div className="wrap-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>Fonctionnalités
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
              Ce que vous obtenez<br/><span style={{ color: G.gold }}>après chaque match.</span>
            </h2>
            <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 520, marginBottom: 56 }}>
              Tout ce dont un coach a besoin pour analyser, comprendre et progresser. Sans formation, sans setup complexe.
            </p>
          </Reveal>

          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: G.border, border: `1px solid ${G.border}` }}>
            {[
              { n:'01', title:'Stats Collectives', desc:'Vue complète de votre équipe sur chaque match. Comprenez comment vous jouez, pressez, défendez.', items:['Possession & zones de pressing','Heatmap collective','Phases offensives / défensives','Précision des passes','Distance totale & sprints'] },
              { n:'02', title:'Stats Individuelles', desc:'Une fiche pour chaque joueur. Évaluez objectivement, identifiez les axes de progression.', items:['Heatmap de position individuelle','Ballons touchés / perdus / gagnés','Duels aériens & terrestres','Distance & intensité de course','Comparaison match-à-match'] },
              { n:'03', title:'Rapport Complet', desc:'Un PDF professionnel exportable en un clic. À partager avec votre staff, vos joueurs, votre direction.', items:['Export PDF mis en page','Résumé tactique narratif IA','Top performers du match','Graphiques & heatmaps inclus','Logo et couleurs de votre club'] },
            ].map((f, i) => (
              <Reveal key={f.n} delay={i * 0.1}>
                <div style={{ background: G.white, padding: '36px 32px', height: '100%', transition: 'background .18s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = G.off}
                  onMouseLeave={e => e.currentTarget.style.background = G.white}>
                  <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 8 }}>{f.n}</div>
                  <div style={{ width: 40, height: 40, borderRadius: 4, background: G.goldL, border: `1px solid ${G.goldLx}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      {f.n==='01' && <><rect x="2" y="2" width="16" height="16" stroke={G.gold} strokeWidth="1.2"/><circle cx="10" cy="10" r="4" fill="none" stroke={G.gold} strokeWidth=".8"/><circle cx="10" cy="10" r="1.5" fill={G.gold}/></>}
                      {f.n==='02' && <><circle cx="10" cy="6" r="3" stroke={G.gold} strokeWidth="1.2"/><path d="M3.5 17c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke={G.gold} strokeWidth="1.2" strokeLinecap="square"/><circle cx="16" cy="9" r="1.5" fill={G.gold} opacity=".7"/></>}
                      {f.n==='03' && <><path d="M3 15L6.5 10L10 12.5L14 6L17 8.5" stroke={G.gold} strokeWidth="1.2" strokeLinecap="square"/><rect x="3" y="3" width="14" height="12" stroke={G.gold} strokeWidth=".7" fill="none" opacity=".4"/></>}
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: G.display, fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', color: G.ink, marginBottom: 10, lineHeight: 1.1 }}>{f.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: G.muted, marginBottom: 16 }}>{f.desc}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {f.items.map(item => (
                      <li key={item} style={{ fontSize: 14, color: G.ink2, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ color: G.gold, fontSize: 12, flexShrink: 0 }}>→</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══ PROCESS ════════════════════════════════════ */}
      <div id="process" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="wrap-inner" style={{ padding: '96px 48px' }}>
          <div className="process-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <Reveal>
                <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 18, height: 1.5, background: G.gold }}/>Comment ça marche
                </div>
                <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
                  Simple.<br/><span style={{ color: G.gold }}>Rapide.</span><br/>Précis.
                </h2>
                <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 440, marginBottom: 36 }}>
                  Pas de formation, pas de setup. Vous uploadez, l'IA s'occupe du reste.
                </p>
              </Reveal>
              {[
                { n:'01', title:'Uploadez votre vidéo', desc:'Depuis votre téléphone, tablette ou caméra. MP4, MOV, AVI — tout format accepté.', dark: false },
                { n:'02', title:'Renseignez le match', desc:'Équipes, composition, score. Deux minutes pour contextualiser votre analyse.', dark: true },
                { n:'03', title:"L'IA analyse", desc:"Notre moteur détecte les joueurs, les actions, les zones de jeu. Traitement en moins d'une heure.", dark: false },
                { n:'04', title:'Recevez votre rapport', desc:'Dashboard interactif + PDF prêt à imprimer ou partager. Livré directement.', dark: true },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 0.1}>
                  <div style={{
                    display: 'flex', gap: 20, padding: '28px 24px',
                    background: s.dark ? G.ink : G.white,
                    borderBottom: `1px solid ${s.dark ? 'rgba(255,255,255,0.08)' : G.border}`,
                    borderTop: i===0 ? `1px solid ${G.border}` : 'none',
                    transition: 'transform .15s', cursor: 'default',
                    borderRadius: i===0 ? '4px 4px 0 0' : i===3 ? '0 0 4px 4px' : 0,
                  }}>
                    <div style={{
                      fontFamily: G.display, fontSize: 48, fontWeight: 800, lineHeight: 1,
                      color: s.dark ? G.gold : G.border2,
                      flexShrink: 0, width: 52,
                    }}>{s.n}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ fontFamily: G.display, fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: s.dark ? G.gold : G.ink, marginBottom: 6 }}>{s.title}</h4>
                      <p style={{ fontSize: 14, color: s.dark ? 'rgba(255,255,255,0.55)' : G.muted, lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Sticky card */}
            <div className="process-card-sticky" style={{ position: 'sticky', top: 80 }}>
              <Reveal>
                <div style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                  <div style={{ background: G.off, borderBottom: `1px solid ${G.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {['#f87171','#fbbf24','#4ade80'].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>)}
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, marginLeft: 8, letterSpacing: '.06em' }}>Analyse en cours…</span>
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, marginBottom: 10 }}>Extraction des données</div>
                    {[['Détection joueurs','100%',G.gold,100],['Heatmaps','87%',G.green,87],['Calcul métriques','72%',G.border2,72],['Génération rapport','En cours…',G.gold,45]].map(([l,v,c,pct]) => (
                      <div key={l} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: G.muted, marginBottom: 5 }}>
                          <span>{l}</span><span style={{ fontWeight: 600, color: G.ink }}>{v}</span>
                        </div>
                        <div style={{ height: 5, background: G.border, borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 99 }}/>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: G.goldL, border: `1px solid ${G.goldLx}`, borderRadius: 4, padding: '12px 14px', marginTop: 12 }}>
                      <span style={{ fontSize: 12, color: G.muted }}>Rapport prêt dans</span>
                      <span style={{ fontFamily: G.display, fontSize: 22, fontWeight: 800, color: G.gold }}>42 min</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RAPPORT EXEMPLE ════════════════════════════ */}
      <div id="rapport" style={{ background: G.off }}>
        <div className="wrap-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>Exemple de rapport
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
              Vue d'ensemble<br/><span style={{ color: G.gold }}>de votre équipe.</span>
            </h2>
            <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 520, marginBottom: 56 }}>
              Possession, tirs, duels, distance — tout ce qu'il faut pour analyser la performance collective et individuelle de votre équipe match après match.
            </p>
          </Reveal>

          {/* Stats individuelles uniquement — heatmap supprimée */}
          <Reveal>
            <div style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={panelHd}><span>Performances individuelles</span><b style={{ color: G.gold, fontWeight: 600 }}>11 titulaires</b></div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: G.off }}>
                    {['Joueur','Passes','Duels','Buts','Km'].map(h => (
                      <th key={h} style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, padding: '8px 10px', textAlign: h==='Joueur'?'left':'center', borderBottom: `1px solid ${G.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLAYERS.map(p => (
                    <tr key={p.num} onMouseEnter={e => e.currentTarget.style.background=G.goldL} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ fontSize: 13, color: G.ink2, padding: '8px 10px', borderBottom: `1px solid ${G.border}`, verticalAlign: 'middle' }}>
                        <span style={{ fontFamily: G.display, fontSize: 15, fontWeight: 700, color: G.gold, marginRight: 4 }}>{p.num}</span>
                        {p.name}
                        <span style={{ fontFamily: G.mono, fontSize: 9, background: G.off, border: `1px solid ${G.border}`, padding: '1px 5px', borderRadius: 2, marginLeft: 3, color: G.muted }}>{p.pos}</span>
                      </td>
                      {[p.passes, p.duels, p.buts, p.km].map((v,i) => (
                        <td key={i} style={{ fontSize: 13, fontWeight: 600, color: G.ink2, padding: '8px 10px', textAlign: 'center', borderBottom: `1px solid ${G.border}` }}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ background: G.goldL, borderTop: `1px solid ${G.goldLx}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 14, color: G.muted }}>
                  <strong style={{ color: G.ink, fontWeight: 600 }}>Rapport PDF prêt</strong> à être partagé.
                </div>
                <a href="#waitlist" style={{ ...btnPrimary, padding: '8px 18px', fontSize: 12, borderRadius: 4, flexShrink: 0, textDecoration:'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                  onMouseLeave={e => e.currentTarget.style.background = G.gold}>
                  Accès anticipé →
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══ PRICING ════════════════════════════════════ */}
      <div id="pricing" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="wrap-inner" style={{ padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>Tarifs
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
              Simple et<br/><span style={{ color: G.gold }}>sans surprise.</span>
            </h2>
            {/* Badge Offre limitée */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.goldL, border: `1px solid ${G.goldLx}`, borderRadius: 4, padding: '6px 14px', marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, background: G.gold, borderRadius: '50%', flexShrink: 0, boxShadow: `0 0 0 3px ${G.goldL}` }}/>
              <span style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: G.gold }}>Offre limitée</span>
            </div>
            <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 440, marginBottom: 56 }}>
              Deux formules claires.
            </p>
          </Reveal>

          <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 860 }}>
            {[
              { id:'coach', plan:'Pour les coachs', name:'Coach', price:'29', featured: false,
                items:["Jusqu'à 3 matchs analysés / mois",'1 équipe','Rapports collectifs & individuels','Suivi progression sur la saison','Export PDF complet','Support inclus'] },
              { id:'club',  plan:'Pour les clubs',  name:'Club',  price:'99', featured: true,
                items:["Jusqu'à 10 matchs analysés / mois",'Multi-équipes illimité','Gestion effectif complète','Vue globale du club','Multi-utilisateurs (staff)','Dashboard club avancé','Support prioritaire dédié'] },
            ].map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <div style={{ background: G.white, border: `1.5px solid ${p.featured ? G.gold : G.border}`, borderRadius: 8, padding: '36px 32px', position: 'relative', boxShadow: p.featured ? '0 4px 24px rgba(201,162,39,0.12)' : 'none', transition: 'box-shadow .2s', height: '100%' }}
                  onMouseEnter={e => !p.featured && (e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.10)')}
                  onMouseLeave={e => !p.featured && (e.currentTarget.style.boxShadow = 'none')}>
                  {p.featured && (
                    <div style={{ position: 'absolute', top: -1, right: 24, background: G.gold, color: G.white, fontFamily: G.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '0 0 4px 4px' }}>⚡ Recommandé</div>
                  )}
                  <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 6 }}>{p.plan}</div>
                  <div style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', color: G.ink, marginBottom: 20 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                    <span style={{ fontFamily: G.display, fontSize: 68, fontWeight: 800, lineHeight: 1, color: G.ink }}>{p.price}</span>
                    <span style={{ fontSize: 15, color: G.muted }}>€ / mois</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                    {p.items.map(item => (
                      <li key={item} style={{ fontSize: 14, color: G.ink2, display: 'flex', alignItems: 'flex-start', gap: 9, lineHeight: 1.5 }}>
                        <span style={{ color: G.gold, fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                      </li>
                    ))}
                  </ul>
                  <a href="#waitlist" style={{ display: 'block', width: '100%', padding: 13, fontFamily: G.display, fontSize: 15, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', textAlign: 'center', textDecoration: 'none', borderRadius: 4, transition: 'all .15s', background: p.featured ? G.gold : 'transparent', color: p.featured ? G.white : G.ink2, border: p.featured ? 'none' : `1.5px solid ${G.border2}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = p.featured ? G.goldD : G.ink; e.currentTarget.style.color = G.white; e.currentTarget.style.borderColor = p.featured ? G.goldD : G.ink }}
                    onMouseLeave={e => { e.currentTarget.style.background = p.featured ? G.gold : 'transparent'; e.currentTarget.style.color = p.featured ? G.white : G.ink2; e.currentTarget.style.borderColor = p.featured ? G.gold : G.border2 }}>
                    Demander l'accès →
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </div>

      {/* ══ WAITLIST ═══════════════════════════════════ */}
      <div id="waitlist" style={{ background: G.ink }}>
        <div className="wrap-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>Accès anticipé
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.white, marginBottom: 16 }}>
              Demandez votre<br/><span style={{ color: G.gold }}>accès en avant-première.</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 560, marginBottom: 16 }}>
              La plateforme arrive bientôt. Inscrivez-vous maintenant pour bénéficier d'un accès en avant-première.
            </p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 48, flexWrap: 'wrap' }}>
              {[['⚡','Accès avant ouverture publique'],['🤝','Onboarding personnalisé']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {wlSent ? (
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '48px 32px', textAlign: 'center', maxWidth: 520 }}>
              <div style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', color: G.white, marginBottom: 12 }}>
                Demande reçue <span style={{ color: G.gold }}>✓</span>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                Votre demande a bien été enregistrée. On vous contacte en priorité dès l'ouverture.
              </p>
            </div>
          ) : (
            <Reveal delay={0.1}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderTop: `3px solid ${G.gold}`, borderRadius: 8, padding: '40px 40px', maxWidth: 760, boxShadow: '0 8px 40px rgba(0,0,0,0.30)' }}>
                <div style={{ fontFamily: G.display, fontSize: 20, fontWeight: 800, textTransform: 'uppercase', color: G.white, marginBottom: 28 }}>
                  Remplissez le formulaire
                </div>

                {wlError && (
                  <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 4 }}>
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: G.red, margin: 0 }}>{wlError}</p>
                  </div>
                )}

                <form onSubmit={handleWaitlist}>
                  <div className="wl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0 32px' }}>
                    <div style={inputLineDark(wlFocused==='firstName')}>
                      <label style={labelStDark}>Prénom *</label>
                      <input type="text" required value={wlForm.firstName} onChange={e => setWlForm({...wlForm, firstName: e.target.value})}
                        placeholder="Jean" style={inputStDark}
                        onFocus={() => setWlFocused('firstName')} onBlur={() => setWlFocused(null)} />
                    </div>
                    <div style={inputLineDark(wlFocused==='lastName')}>
                      <label style={labelStDark}>Nom *</label>
                      <input type="text" required value={wlForm.lastName} onChange={e => setWlForm({...wlForm, lastName: e.target.value})}
                        placeholder="Dupont" style={inputStDark}
                        onFocus={() => setWlFocused('lastName')} onBlur={() => setWlFocused(null)} />
                    </div>
                    <div style={{ ...inputLine(wlFocused==='email'), gridColumn: '1 / 3' }}>
                      <label style={labelStDark}>Email *</label>
                      <input type="email" required value={wlForm.email} onChange={e => setWlForm({...wlForm, email: e.target.value})}
                        placeholder="jean.dupont@monclub.fr" style={inputStDark}
                        onFocus={() => setWlFocused('email')} onBlur={() => setWlFocused(null)} />
                    </div>
                    <div style={{ ...inputLine(wlFocused==='club'), gridColumn: '1 / 3' }}>
                      <label style={labelStDark}>Nom du club *</label>
                      <input type="text" required value={wlForm.club} onChange={e => setWlForm({...wlForm, club: e.target.value})}
                        placeholder="AS Cugnaux, FC Toulouse..." style={inputStDark}
                        onFocus={() => setWlFocused('club')} onBlur={() => setWlFocused(null)} />
                    </div>
                    <div style={{ ...inputLine(wlFocused==='role'), marginBottom: 32 }}>
                      <label style={labelStDark}>Poste *</label>
                      <select required value={wlForm.role} onChange={e => setWlForm({...wlForm, role: e.target.value})}
                        style={{ ...inputStDark, color: wlForm.role ? G.white : 'rgba(255,255,255,0.35)', cursor:'pointer', appearance:'none' }}
                        onFocus={() => setWlFocused('role')} onBlur={() => setWlFocused(null)}>
                        <option value="" disabled>Choisir...</option>
                        <option>Éducateur</option>
                        <option>Entraîneur</option>
                        <option>Directeur Sportif</option>
                      </select>
                    </div>
                    <div style={{ ...inputLine(wlFocused==='category'), marginBottom: 32 }}>
                      <label style={labelStDark}>Catégorie entraînée *</label>
                      <select required value={wlForm.category} onChange={e => setWlForm({...wlForm, category: e.target.value})}
                        style={{ ...inputStDark, color: wlForm.category ? G.white : 'rgba(255,255,255,0.35)', cursor:'pointer', appearance:'none' }}
                        onFocus={() => setWlFocused('category')} onBlur={() => setWlFocused(null)}>
                        <option value="" disabled>Choisir...</option>
                        {['U14','U15','U16','U17','U18','U19','Séniors'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={wlLoading} style={{
                    ...btnPrimary, fontSize: 15, padding: '14px 32px',
                    opacity: wlLoading ? .6 : 1, cursor: wlLoading ? 'not-allowed' : 'pointer',
                  }}
                    onMouseEnter={e => { if(!wlLoading) e.currentTarget.style.background = G.goldD }}
                    onMouseLeave={e => { if(!wlLoading) e.currentTarget.style.background = G.gold }}>
                    {wlLoading ? 'Envoi...' : '→ Demander mon accès anticipé'}
                  </button>
                </form>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* ══ CONTACT ════════════════════════════════════ */}
      <div id="contact" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="wrap-inner" style={{ padding: '96px 48px' }}>
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            <Reveal>
              <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 18, height: 1.5, background: G.gold }}/>Contact
              </div>
              <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 20 }}>
                Une question ?<br/><span style={{ color: G.gold }}>On répond.</span>
              </h2>
              <p style={{ fontSize: 16, color: G.muted, lineHeight: 1.7, maxWidth: 380, marginBottom: 32 }}>
                Une démo, une question sur nos offres, un retour terrain — on est là. Réponse sous 24h.
              </p>
              <a href="mailto:contact@insightball.com" style={{ fontFamily: G.mono, fontSize: 14, color: G.gold, textDecoration: 'none', borderBottom: `1px solid rgba(201,162,39,0.3)`, paddingBottom: 2, transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderBottomColor = G.gold}
                onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'rgba(201,162,39,0.3)'}>
                contact@insightball.com
              </a>
            </Reveal>
            <Reveal delay={0.1}>
              {contactSent ? (
                <div style={{ background: G.off, border: `1px solid ${G.border}`, borderRadius: 8, padding: '48px 32px', textAlign: 'center' }}>
                  <div style={{ fontFamily: G.display, fontSize: 28, fontWeight: 800, textTransform: 'uppercase', color: G.ink, marginBottom: 12 }}>
                    Message envoyé <span style={{ color: G.gold }}>✓</span>
                  </div>
                  <p style={{ fontSize: 15, color: G.muted }}>On vous répond sous 24h.</p>
                </div>
              ) : (
                <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[{l:'Nom',t:'text',k:'name',p:'Jean Dupont'},{l:'Email',t:'email',k:'email',p:'votre@email.com'}].map(f => (
                    <div key={f.k} style={{ borderBottom: `1px solid ${G.border}`, paddingBottom: 16, marginBottom: 16 }}>
                      <label style={labelSt}>{f.l}</label>
                      <input type={f.t} required value={contactForm[f.k]} onChange={e => setContactForm({...contactForm,[f.k]:e.target.value})} placeholder={f.p}
                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: G.ink, fontFamily: G.body }}/>
                    </div>
                  ))}
                  <div style={{ borderBottom: `1px solid ${G.border}`, paddingBottom: 16, marginBottom: 24 }}>
                    <label style={labelSt}>Message</label>
                    <textarea required rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm,message:e.target.value})} placeholder="Votre message…"
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 15, color: G.ink, fontFamily: G.body, lineHeight: 1.6 }}/>
                  </div>
                  <button type="submit" disabled={contactLoad} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: contactLoad ? .6 : 1 }}
                    onMouseEnter={e => { if(!contactLoad) e.currentTarget.style.background = G.goldD }}
                    onMouseLeave={e => { if(!contactLoad) e.currentTarget.style.background = G.gold }}>
                    {contactLoad ? 'Envoi...' : 'Envoyer →'}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>

      {/* ══ CTA BAND ═══════════════════════════════════ */}
      <div className="cta-band" style={{ background: G.ink, padding: '80px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
        <div>
          <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.white, marginBottom: 12 }}>
            Prêt à analyser<br/><span style={{ color: G.gold }}>votre prochain match ?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 440 }}>Faites analyser votre match.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', flexShrink: 0 }}>
          <a href="#waitlist" style={{ ...btnPrimary, fontSize: 16, padding: '16px 36px', textDecoration:'none' }}
            onMouseEnter={e => e.currentTarget.style.background = G.goldD}
            onMouseLeave={e => e.currentTarget.style.background = G.gold}>
            Demander l'accès →
          </a>

        </div>
      </div>

      {/* ══ FOOTER ═════════════════════════════════════ */}
      <footer style={{ background: G.ink, borderTop: `1px solid rgba(255,255,255,0.08)`, padding: '56px 48px 32px' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <img src="/logo.svg" alt="INSIGHTBALL" style={{ height: 36, width: 'auto', display: 'block', mixBlendMode: 'screen' }} />
              <span style={{ fontFamily: G.display, fontSize: 18, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: G.white }}>
                INSIGHT<span style={{ color: G.gold }}>BALL</span>
              </span>
            </div>
            <p style={{ fontFamily: G.mono, fontSize: 11, color: G.gold, marginBottom: 14, letterSpacing: '.04em' }}>
              Football Analytics 🚀
            </p>
          </div>
          {[
            { title:'Produit', links:[['#features','Fonctionnalités'],['#pricing','Tarifs'],['#rapport','Exemple rapport'],['#waitlist','Accès anticipé']] },
            { title:'Ressources', links:[['#','Documentation'],['#','Blog tactique'],['#',"Guides d'analyse"],['#','Support']] },
            { title:'Légal', links:[['#','Mentions légales'],['#','CGV'],['#','Confidentialité'],['#','Cookies']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: G.mono, fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>{col.title}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map(([h,l]) => (
                  <li key={l}>
                    <a href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = G.gold}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.60)'}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.70)' }}>
          <span>© 2026 INSIGHTBALL — Tous droits réservés</span>
          <span>Made in 🇫🇷 with ❤️</span>
        </div>
      </footer>
    </div>
  )
}
