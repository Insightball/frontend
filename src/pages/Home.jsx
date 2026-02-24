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

/* ─── Scroll reveal hook ─────────────────────── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' })
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

/* ─── Composant section wrapper ──────────────── */
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

/* ─── Terrain SVG ────────────────────────────── */
function PitchSVG() {
  return (
    <svg width="100%" viewBox="0 0 300 185" style={{ display: 'block', background: '#0b1a0b' }}>
      <rect width="300" height="185" fill="#0b1a0b"/>
      <rect x="7" y="7" width="286" height="171" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1"/>
      <line x1="150" y1="7" x2="150" y2="178" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
      <circle cx="150" cy="92" r="25" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
      <rect x="7" y="60" width="42" height="65" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
      <rect x="251" y="60" width="42" height="65" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
      {/* Zones chaleur */}
      <circle cx="75"  cy="92" r="28" fill="rgba(201,162,39,0.08)" style={{filter:'blur(10px)'}}/>
      <circle cx="150" cy="72" r="22" fill="rgba(201,162,39,0.12)" style={{filter:'blur(9px)'}}/>
      <circle cx="150" cy="112" r="20" fill="rgba(201,162,39,0.10)" style={{filter:'blur(9px)'}}/>
      <circle cx="210" cy="82" r="30" fill="rgba(239,68,68,0.16)" style={{filter:'blur(11px)'}}/>
      <circle cx="240" cy="63" r="22" fill="rgba(239,68,68,0.18)" style={{filter:'blur(9px)'}}/>
      <circle cx="240" cy="122" r="20" fill="rgba(239,68,68,0.15)" style={{filter:'blur(9px)'}}/>
      <circle cx="265" cy="92" r="16" fill="rgba(239,68,68,0.22)" style={{filter:'blur(7px)'}}/>
      {/* Points chauds */}
      <circle cx="210" cy="82"  r="4"   fill="#ef4444" opacity=".85"/>
      <circle cx="240" cy="63"  r="3.5" fill="#ef4444" opacity=".85"/>
      <circle cx="240" cy="122" r="3.5" fill="#ef4444" opacity=".85"/>
      <circle cx="150" cy="72"  r="3"   fill="#c9a227" opacity=".80"/>
      <circle cx="150" cy="112" r="3"   fill="#c9a227" opacity=".80"/>
    </svg>
  )
}

/* ════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════ */
export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSent, setContactSent] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleContact = async (e) => {
    e.preventDefault()
    // Brancher votre endpoint ici
    setContactSent(true)
  }

  const css = `
    ${FONTS}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #fff; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${G.border2}; border-radius: 2px; }
    @keyframes heroUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
    @keyframes scroll  { to { transform: translateX(-50%); } }
    @media (max-width: 1024px) {
      .hero-grid   { grid-template-columns: 1fr !important; max-width: 640px !important; }
      .hero-right  { display: none !important; }
      .feat-grid   { grid-template-columns: 1fr !important; }
      .process-grid{ grid-template-columns: 1fr !important; }
      .process-card-sticky { display: none !important; }
      .rapport-grid{ grid-template-columns: 1fr !important; }
      .price-grid  { grid-template-columns: 1fr !important; max-width: 480px !important; }
      .testi-grid  { grid-template-columns: 1fr !important; }
      .cta-band    { flex-direction: column !important; align-items: flex-start !important; padding: 56px 32px !important; }
      .footer-grid { grid-template-columns: 1fr 1fr !important; }
      .wrap, .wrap-inner { padding: 72px 32px !important; }
      .contact-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 768px) {
      .nav-links, .nav-cta-d { display: none !important; }
      .nav-burger { display: flex !important; }
      .hero-title { font-size: clamp(40px,11vw,64px) !important; }
      .sec-h2 { font-size: clamp(30px,7vw,44px) !important; }
      .wrap, .wrap-inner { padding: 56px 20px !important; }
      .cta-band { padding: 56px 20px !important; }
      .footer-grid { gap: 24px !important; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr !important; }
    }
  `

  /* ── Styles réutilisables ── */
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

  return (
    <div style={{ background: G.white, color: G.ink, fontFamily: G.body, fontSize: 16, lineHeight: 1.6, overflowX: 'hidden' }}>
      <style>{css}</style>

      {/* ══ NAV ══════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${G.border}`, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        boxShadow: navScrolled ? '0 2px 20px rgba(0,0,0,0.07)' : 'none',
        transition: 'box-shadow .2s',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: G.ink, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke={G.gold} strokeWidth="1.2"/>
              <path d="M3 5.5L8 2.5L13 5.5V10.5L8 13.5L3 10.5Z" stroke={G.gold} strokeWidth=".8" fill="none"/>
              <circle cx="8" cy="8" r="1.8" fill={G.gold}/>
            </svg>
          </div>
          <span style={{ fontFamily: G.display, fontSize: 18, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: G.ink }}>
            INSIGHT<span style={{ color: G.gold }}>BALL</span>
          </span>
        </Link>

        <div className="nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[['#features','Fonctionnalités'],['#process','Comment ça marche'],['#pricing','Tarifs'],['#testimonials','Avis']].map(([h,l]) => (
            <a key={h} href={h} style={{ fontSize: 14, fontWeight: 500, color: G.muted, textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = G.ink}
              onMouseLeave={e => e.currentTarget.style.color = G.muted}>{l}</a>
          ))}
        </div>

        <Link to="/signup" className="nav-cta-d" style={{ ...btnPrimary, padding: '9px 20px', fontSize: 14 }}
          onMouseEnter={e => e.currentTarget.style.background = G.goldD}
          onMouseLeave={e => e.currentTarget.style.background = G.gold}>
          Analyser un match
        </Link>

        <button className="nav-burger" onClick={() => setMenuOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, padding: 4 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 22, height: 1.5, background: G.ink, display: 'block', transition: '.2s',
              transform: menuOpen && i===0 ? 'translateY(6.5px) rotate(45deg)' : menuOpen && i===2 ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
              opacity: menuOpen && i===1 ? 0 : 1,
            }}/>
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 199, background: G.white, borderBottom: `1px solid ${G.border}`, padding: '16px 24px 20px', display: 'flex', flexDirection: 'column' }}>
          {[['#features','Fonctionnalités'],['#process','Comment ça marche'],['#pricing','Tarifs'],['#testimonials','Avis']].map(([h,l]) => (
            <a key={h} href={h} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: G.ink2, textDecoration: 'none', padding: '12px 0', borderBottom: `1px solid ${G.border}` }}>{l}</a>
          ))}
          <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ ...btnPrimary, marginTop: 12, justifyContent: 'center' }}>Analyser un match →</Link>
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════ */}
      <div className="hero-grid" style={{ paddingTop: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', maxWidth: 1200, margin: '0 auto', padding: '60px 48px 0', gap: 60, minHeight: '100vh' }}>
        <div style={{ padding: '80px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: G.gold, background: G.goldL, border: `1px solid ${G.goldLx}`, padding: '5px 12px', borderRadius: 2, marginBottom: 24, opacity: 0, animation: 'heroUp .5s .1s forwards' }}>
            <span style={{ width: 6, height: 6, background: G.gold, borderRadius: '50%' }}/>
            Analyse vidéo · IA · Football
          </div>

          <h1 className="hero-title" style={{ fontFamily: G.display, fontSize: 'clamp(48px,6vw,78px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 24, opacity: 0, animation: 'heroUp .5s .2s forwards' }}>
            Analysez vos matchs<br/>
            <span style={{ color: G.gold }}>comme un staff<br/>professionnel.</span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.65, color: G.muted, maxWidth: 440, marginBottom: 36, opacity: 0, animation: 'heroUp .5s .35s forwards' }}>
            Uploadez votre vidéo. Recevez en quelques minutes un <strong style={{ color: G.ink, fontWeight: 500 }}>rapport tactique complet</strong> — heatmaps, stats individuelles, phases de jeu.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', opacity: 0, animation: 'heroUp .5s .45s forwards' }}>
            <Link to="/signup" style={btnPrimary}
              onMouseEnter={e => e.currentTarget.style.background = G.goldD}
              onMouseLeave={e => e.currentTarget.style.background = G.gold}>
              Analyser un match →
            </Link>
            <a href="#rapport" style={btnOutline}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.ink; e.currentTarget.style.color = G.ink }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border2; e.currentTarget.style.color = G.ink2 }}>
              Voir un exemple
            </a>
          </div>

          <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: `1px solid ${G.border}`, opacity: 0, animation: 'heroUp .5s .6s forwards', flexWrap: 'wrap' }}>
            {[['40+','métriques analysées'],['3 min','rapport généré'],['N3→U13','toutes catégories']].map(([n,l]) => (
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
              <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, marginLeft: 6, letterSpacing: '.06em' }}>insightball — GFCA vs FC Ajaccio · N3</span>
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
              {/* Pitch */}
              <div style={{ border: `1px solid ${G.border}`, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ background: G.off, borderBottom: `1px solid ${G.border}`, padding: '7px 12px', fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Heatmap collective</span><span style={{ color: G.gold }}>Mi-temps 2</span>
                </div>
                <PitchSVG/>
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

      {/* ══ STRIPE ═══════════════════════════════════ */}
      <div style={{ background: G.ink, overflow: 'hidden', padding: '13px 0' }}>
        <div style={{ display: 'flex', width: 'max-content', gap: 40, animation: 'scroll 28s linear infinite' }}>
          {[...Array(2)].map((_, i) => ['Heatmaps individuelles','Possession & pressing','Distance parcourue','Phases offensives','Duels gagnés','Export PDF','Comparaison joueurs','Progression saison','Zones de tir','Multi-équipes'].map(item => (
            <span key={item+i} style={{ fontFamily: G.mono, fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              {item}<span style={{ color: G.gold }}>·</span>
            </span>
          )))}
        </div>
      </div>

      {/* ══ FEATURES ══════════════════════════════════ */}
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

      {/* ══ PROCESS ═══════════════════════════════════ */}
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
                { n:'01', title:'Uploadez votre vidéo', desc:'Depuis votre téléphone, tablette ou caméra. MP4, MOV, AVI — tout format accepté. Aucun matériel spécifique requis.' },
                { n:'02', title:'Renseignez le match', desc:'Équipes, composition, score. Deux minutes pour contextualiser votre analyse et personnaliser votre rapport.' },
                { n:'03', title:"L'IA analyse", desc:'Notre moteur détecte les joueurs, les actions, les zones de jeu. Traitement complet en quelques minutes.' },
                { n:'04', title:'Recevez votre rapport', desc:'Dashboard interactif + PDF prêt à imprimer ou partager. Votre analyse pro, livrée directement.' },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 0.1}>
                  <div style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: `1px solid ${G.border}`, borderTop: i===0 ? `1px solid ${G.border}` : 'none', transition: 'padding-left .2s', cursor: 'default' }}
                    onMouseEnter={e => { e.currentTarget.style.paddingLeft = '8px'; e.currentTarget.querySelector('.sn').style.color = G.gold }}
                    onMouseLeave={e => { e.currentTarget.style.paddingLeft = '0'; e.currentTarget.querySelector('.sn').style.color = G.border2 }}>
                    <div className="sn" style={{ fontFamily: G.display, fontSize: 44, fontWeight: 800, lineHeight: 1, color: G.border2, flexShrink: 0, width: 44, transition: 'color .2s' }}>{s.n}</div>
                    <div>
                      <h4 style={{ fontFamily: G.display, fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: G.ink, marginBottom: 6 }}>{s.title}</h4>
                      <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.6 }}>{s.desc}</p>
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
                      <span style={{ fontFamily: G.display, fontSize: 22, fontWeight: 800, color: G.gold }}>2 min 14 s</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RAPPORT EXEMPLE ═══════════════════════════ */}
      <div id="rapport" style={{ background: G.off }}>
        <div className="wrap-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>Exemple de rapport
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
              Ce que vous<br/><span style={{ color: G.gold }}>recevez concrètement.</span>
            </h2>
            <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 520, marginBottom: 56 }}>
              Un vrai rapport issu d'un match analysé. Ce que vous voyez ci-dessous est exactement ce que vous obtenez.
            </p>
          </Reveal>

          <div className="rapport-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            {/* Panel gauche */}
            <Reveal>
              <div style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <div style={panelHd}><span>Heatmap collective — 2ème mi-temps</span><b style={{ color: G.gold, fontWeight: 600 }}>GFCA N3</b></div>
                <div style={{ padding: 16 }}>
                  <PitchSVG/>
                  {/* Légende */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: G.muted, margin: '10px 0 16px' }}>
                    <span>Faible</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'linear-gradient(90deg,rgba(26,122,74,0) 0%,rgba(26,122,74,0.5) 35%,rgba(201,162,39,0.8) 65%,rgba(239,68,68,1) 100%)' }}/>
                    <span>Intense</span>
                  </div>
                  {/* KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                    {[[63,'%',G.gold,'Possession'],[18,'',G.ink,'Attaques'],[12,'',G.green,'Récupérations']].map(([v,u,c,l]) => (
                      <div key={l} style={{ background: G.off, border: `1px solid ${G.border}`, borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
                        <div style={kpiN(c)}>{v}{u}</div>
                        <div style={{ fontSize: 11, color: G.muted, marginTop: 3 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Barres */}
                  {[['Précision passes','78%',G.gold,78],['Taux de cadrage','57%',G.green,57],['Ballons perdus / mi-temps','24',G.red,40]].map(([l,v,c,pct]) => (
                    <div key={l} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: G.muted, marginBottom: 5 }}>
                        <span>{l}</span><span style={{ fontWeight: 600, color: G.ink }}>{v}</span>
                      </div>
                      <AnimBar pct={`${pct}%`} color={c}/>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Panel droit */}
            <Reveal delay={0.1}>
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
                    <strong style={{ color: G.ink, fontWeight: 600 }}>Rapport PDF prêt</strong> — logo club, couleurs, pages complètes.
                  </div>
                  <Link to="/signup" style={{ ...btnPrimary, padding: '8px 18px', fontSize: 12, borderRadius: 4, flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                    onMouseLeave={e => e.currentTarget.style.background = G.gold}>
                    Générer →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ══ PRICING ═══════════════════════════════════ */}
      <div id="pricing" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="wrap-inner" style={{ padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>Tarifs
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
              Simple et<br/><span style={{ color: G.gold }}>sans surprise.</span>
            </h2>
            <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 440, marginBottom: 56 }}>
              Deux formules claires. Résiliez à tout moment, sans engagement.
            </p>
          </Reveal>
          <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 860 }}>
            {[
              { id:'coach', plan:'Pour les coachs', name:'Coach', price:'29', old:'39', featured: false, items:['3 matchs analysés / mois','1 équipe','Rapports collectifs & individuels','Suivi progression sur la saison','Export PDF complet','Support inclus'] },
              { id:'club',  plan:'Pour les clubs',  name:'Club',  price:'99', old:'139', featured: true,  items:['10 matchs analysés / mois','Multi-équipes illimité','Gestion effectif complète','Vue globale du club','Multi-utilisateurs (staff)','Dashboard club avancé','Support prioritaire dédié'] },
            ].map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <div style={{ background: G.white, border: `1.5px solid ${p.featured ? G.gold : G.border}`, borderRadius: 8, padding: '36px 32px', position: 'relative', boxShadow: p.featured ? '0 4px 24px rgba(201,162,39,0.12)' : 'none', transition: 'box-shadow .2s' }}
                  onMouseEnter={e => !p.featured && (e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.10)')}
                  onMouseLeave={e => !p.featured && (e.currentTarget.style.boxShadow = 'none')}>
                  {p.featured && <div style={{ position: 'absolute', top: -1, right: 24, background: G.gold, color: G.white, fontFamily: G.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '0 0 4px 4px' }}>⚡ Recommandé</div>}
                  <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 6 }}>{p.plan}</div>
                  <div style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', color: G.ink, marginBottom: 20 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontFamily: G.display, fontSize: 68, fontWeight: 800, lineHeight: 1, color: G.ink }}>{p.price}</span>
                    <span style={{ fontSize: 15, color: G.muted }}>€ / mois</span>
                  </div>
                  <div style={{ fontSize: 14, color: G.border2, textDecoration: 'line-through', marginBottom: 28 }}>Offre de lancement — {p.old}€/mois</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                    {p.items.map(item => (
                      <li key={item} style={{ fontSize: 14, color: G.ink2, display: 'flex', alignItems: 'flex-start', gap: 9, lineHeight: 1.5 }}>
                        <span style={{ color: G.gold, fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/signup?plan=${p.id}`} style={{ display: 'block', width: '100%', padding: 13, fontFamily: G.display, fontSize: 15, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', textAlign: 'center', textDecoration: 'none', borderRadius: 4, transition: 'all .15s', background: p.featured ? G.gold : 'transparent', color: p.featured ? G.white : G.ink2, border: p.featured ? 'none' : `1.5px solid ${G.border2}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = p.featured ? G.goldD : G.ink; e.currentTarget.style.color = G.white; e.currentTarget.style.borderColor = p.featured ? G.goldD : G.ink }}
                    onMouseLeave={e => { e.currentTarget.style.background = p.featured ? G.gold : 'transparent'; e.currentTarget.style.color = p.featured ? G.white : G.ink2; e.currentTarget.style.borderColor = p.featured ? G.gold : G.border2 }}>
                    Choisir {p.name} →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p style={{ fontSize: 13, color: G.muted, marginTop: 16 }}>Sans engagement · Résiliation en 1 clic · Paiement sécurisé</p>
        </div>
      </div>

      {/* ══ TÉMOIGNAGES ═══════════════════════════════ */}
      <div id="testimonials" style={{ background: G.off }}>
        <div className="wrap-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>Ils utilisent INSIGHTBALL
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 56 }}>
              Ce qu'ils<br/><span style={{ color: G.gold }}>en disent.</span>
            </h2>
          </Reveal>
          <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { quote: "J'ai arrêté de passer 3h à faire mes rapports vidéo manuellement. INSIGHTBALL me donne en 5 minutes ce qu'il me fallait une soirée entière pour produire.", name: 'Laurent M.', role: 'Entraîneur principal · Club R1 Occitanie' },
              { quote: "Les joueurs s'impliquent beaucoup plus quand ils voient leurs propres données. Les heatmaps individuelles ont changé mes débriefings du lundi.", name: 'Sébastien K.', role: 'Coach U19 National · Normandie' },
              { quote: "On n'a pas le budget d'un club pro pour des outils d'analyse. INSIGHTBALL nous donne accès à quelque chose qu'on pensait réservé à la Ligue 1.", name: 'Damien R.', role: 'Directeur sportif · Club N3 Corse' },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <blockquote style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: 8, padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                    {[...Array(5)].map((_,j) => <span key={j} style={{ color: G.gold, fontSize: 14 }}>★</span>)}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: G.ink2, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ width: 28, height: 2, background: G.gold, borderRadius: 1, marginBottom: 14 }}/>
                  <div style={{ fontWeight: 600, fontSize: 14, color: G.ink }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: G.muted, marginTop: 2 }}>{t.role}</div>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTACT ═══════════════════════════════════ */}
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
                  <div style={{ fontFamily: G.display, fontSize: 28, fontWeight: 800, textTransform: 'uppercase', color: G.ink, marginBottom: 12 }}>Message envoyé <span style={{ color: G.gold }}>✓</span></div>
                  <p style={{ fontSize: 15, color: G.muted }}>On vous répond sous 24h.</p>
                </div>
              ) : (
                <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[{l:'Nom',t:'text',k:'name',p:'Jean Dupont'},{l:'Email',t:'email',k:'email',p:'votre@email.com'}].map(f => (
                    <div key={f.k} style={{ borderBottom: `1px solid ${G.border}`, paddingBottom: 16, marginBottom: 16 }}>
                      <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 6 }}>{f.l}</label>
                      <input type={f.t} required value={contactForm[f.k]} onChange={e => setContactForm({...contactForm,[f.k]:e.target.value})} placeholder={f.p}
                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: G.ink, fontFamily: G.body }}/>
                    </div>
                  ))}
                  <div style={{ borderBottom: `1px solid ${G.border}`, paddingBottom: 16, marginBottom: 24 }}>
                    <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 6 }}>Message</label>
                    <textarea required rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm,message:e.target.value})} placeholder="Votre message…"
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 15, color: G.ink, fontFamily: G.body, lineHeight: 1.6 }}/>
                  </div>
                  <button type="submit" style={{ ...btnPrimary, alignSelf: 'flex-start' }}
                    onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                    onMouseLeave={e => e.currentTarget.style.background = G.gold}>
                    Envoyer →
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>

      {/* ══ CTA BAND ══════════════════════════════════ */}
      <div className="cta-band" style={{ background: G.ink, padding: '80px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
        <div>
          <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.white, marginBottom: 12 }}>
            Prêt à analyser<br/><span style={{ color: G.gold }}>votre prochain match ?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 440 }}>Premiers résultats en moins de 3 minutes. Pas de carte bancaire pour commencer.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', flexShrink: 0 }}>
          <Link to="/signup" style={{ ...btnPrimary, fontSize: 16, padding: '16px 36px' }}
            onMouseEnter={e => e.currentTarget.style.background = G.goldD}
            onMouseLeave={e => e.currentTarget.style.background = G.gold}>
            Analyser un match →
          </Link>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Sans engagement','Résiliation 1 clic','Support humain'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: G.gold }}>✓</span>{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FOOTER ════════════════════════════════════ */}
      <footer style={{ background: G.white, borderTop: `1px solid ${G.border}`, padding: '56px 48px 32px' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: G.display, fontSize: 20, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>
              INSIGHT<span style={{ color: G.gold }}>BALL</span>
            </div>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.6, maxWidth: 260 }}>L'analyse vidéo professionnelle, accessible à tous les clubs et coachs du football amateur et semi-professionnel.</p>
          </div>
          {[
            { title:'Produit', links:[['#features','Fonctionnalités'],['#pricing','Tarifs'],['#rapport','Exemple rapport'],['/signup','Créer un compte']] },
            { title:'Ressources', links:[['#','Documentation'],['#','Blog tactique'],['#','Guides d\'analyse'],['#','Support']] },
            { title:'Légal', links:[['#','Mentions légales'],['#','CGV'],['#','Confidentialité'],['#','Cookies']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: G.mono, fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, marginBottom: 14 }}>{col.title}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map(([h,l]) => (
                  <li key={l}>
                    <a href={h} style={{ fontSize: 14, color: G.ink2, textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = G.gold}
                      onMouseLeave={e => e.currentTarget.style.color = G.ink2}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 13, color: G.muted }}>
          <span>© 2026 INSIGHTBALL — Tous droits réservés</span>
          <span>Fait pour les coaches, par des passionnés de football</span>
        </div>
      </footer>
    </div>
  )
}
