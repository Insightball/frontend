import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* ─── Palette (identique à Home.jsx) ─── */
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
  mono:    "'JetBrains Mono', monospace",
  display: "'Barlow Condensed', sans-serif",
  body:    "'Barlow', sans-serif",
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');`

/* ─── Reveal animation ─── */
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

function Reveal({ children, delay = 0, style }) {
  const [ref, vis] = useReveal()
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(20px)', transition: `opacity .6s ${delay}s, transform .6s ${delay}s`, ...style }}>
      {children}
    </div>
  )
}

/* ─── Réseaux sociaux ─── */
const SOCIALS = [
  { href: 'https://www.linkedin.com/company/insightball/', label: 'LinkedIn', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { href: 'https://www.instagram.com/insightball_', label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { href: 'https://x.com/insightball_', label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://www.facebook.com/Insightball', label: 'Facebook', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
]

export default function APropos() {
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    document.title = 'À propos — Insightball'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', 'Insightball rend les stats de match accessibles à tous les entraîneurs et éducateurs du football amateur et semi-pro. Une vidéo, des stats, une équipe qui progresse.')
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
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
    @media (max-width: 768px) {
      .about-hero { padding: 100px 20px 60px !important; }
      .about-section { padding: 56px 20px !important; }
      .about-values { grid-template-columns: 1fr !important; }
      .about-cta-band { padding: 56px 20px !important; flex-direction: column !important; align-items: flex-start !important; }
      .about-h1 { font-size: clamp(36px,10vw,58px) !important; }
      .about-h2 { font-size: clamp(28px,7vw,42px) !important; }
      footer { padding: 40px 20px 24px !important; }
      .footer-grid { grid-template-columns: 1fr 1fr !important; }
    }
    @media (max-width: 480px) {
      .about-hero { padding: 90px 16px 48px !important; }
      .about-section { padding: 48px 16px !important; }
      .about-cta-band { padding: 48px 16px !important; }
      nav { padding: 0 16px !important; }
      footer { padding: 40px 16px 24px !important; }
      .footer-grid { grid-template-columns: 1fr !important; }
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

  const label = {
    fontFamily: G.mono, fontSize: 11, fontWeight: 600,
    letterSpacing: '.16em', textTransform: 'uppercase',
    color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
  }

  return (
    <div style={{ background: G.white, color: G.ink, fontFamily: G.body, fontSize: 16, lineHeight: 1.6, overflowX: 'hidden' }}>
      <style>{css}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: G.ink, backdropFilter: 'none',
        borderBottom: 'none', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', boxSizing: 'border-box',
        boxShadow: navScrolled ? '0 2px 20px rgba(0,0,0,0.40)' : 'none',
        transition: 'box-shadow .2s',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Insightball" style={{ height: 36, width: 'auto', display: 'block', mixBlendMode: 'screen' }} />
          <span style={{ fontFamily: G.display, fontSize: 18, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: G.white }}>
            INSIGHT<span style={{ color: G.gold }}>ball</span>
          </span>
        </Link>
        <Link to="/" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}>
          ← Retour au site
        </Link>
      </nav>

      {/* ══ HERO ══ */}
      <div className="about-hero" style={{ paddingTop: 60, background: G.ink }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px 48px 80px' }}>
          <div style={{ opacity: 0, animation: 'fadeUp .5s .2s forwards' }}>
            <div style={{ ...label, color: G.gold }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }} />À propos
            </div>
            <h1 className="about-h1" style={{
              fontFamily: G.display, fontSize: 'clamp(48px,6vw,72px)', fontWeight: 800,
              lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase',
              color: G.white, marginBottom: 24,
            }}>
              Tes stats.<br /><span style={{ color: G.gold }}>Ton terrain.</span>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.7, color: 'rgba(255,255,255,0.60)', maxWidth: 560 }}>
              Insightball existe parce que chaque match raconte quelque chose. Et que les entraîneurs et éducateurs méritent d'avoir les stats pour le comprendre.
            </p>
          </div>
        </div>
      </div>

      {/* ══ LE CONSTAT ══ */}
      <div className="about-section" style={{ maxWidth: 800, margin: '0 auto', padding: '80px 48px' }}>
        <Reveal>
          <div style={label}>
            <span style={{ width: 18, height: 1.5, background: G.gold }} />Le constat
          </div>
          <h2 className="about-h2" style={{
            fontFamily: G.display, fontSize: 'clamp(34px,4vw,48px)', fontWeight: 800,
            lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase',
            color: G.ink, marginBottom: 24,
          }}>
            Des matchs filmés.<br /><span style={{ color: G.gold }}>Aucune stat exploitée.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: G.muted, marginBottom: 20 }}>
            Des milliers d'entraîneurs filment leurs matchs chaque week-end. Les vidéos s'accumulent sur les téléphones, les disques durs, les groupes WhatsApp. Mais entre la vidéo brute et un vrai retour chiffré sur le match, il n'existait rien d'accessible.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: G.muted, marginBottom: 20 }}>
            Les feedbacks aux joueurs reposaient sur le ressenti. La progression de l'équipe se mesurait au classement, jamais aux stats. Et quand un joueur ou un parent demande "comment s'est passé le match ?", la réponse restait vague.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: G.ink2 }}>
            Insightball est né de ce constat, vécu de l'intérieur.
          </p>
        </Reveal>
      </div>

      {/* ══ SÉPARATEUR ══ */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ height: 1, background: G.border }} />
      </div>

      {/* ══ LA MISSION ══ */}
      <div className="about-section" style={{ maxWidth: 800, margin: '0 auto', padding: '80px 48px' }}>
        <Reveal>
          <div style={label}>
            <span style={{ width: 18, height: 1.5, background: G.gold }} />La mission
          </div>
          <h2 className="about-h2" style={{
            fontFamily: G.display, fontSize: 'clamp(34px,4vw,48px)', fontWeight: 800,
            lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase',
            color: G.ink, marginBottom: 24,
          }}>
            Transformer chaque vidéo<br /><span style={{ color: G.gold }}>en stats concrètes.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: G.muted, marginBottom: 20 }}>
            Insightball transforme une simple vidéo de match en statistiques claires : possession, heatmaps, performances individuelles, tendances tactiques, progression des joueurs.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: G.muted, marginBottom: 20 }}>
            Pas besoin de matériel. Pas besoin de budget. Un téléphone au bord du terrain suffit. Chaque match analysé aide à préparer le suivant, à faire progresser les joueurs, et à prendre des décisions basées sur du concret.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: G.muted }}>
            Suivi de saison, gestion d'effectif, planification des entraînements, rapports PDF exportables. Tout est pensé pour le terrain, pas pour le bureau.
          </p>
        </Reveal>
      </div>

      {/* ══ VALEURS ══ */}
      <div style={{ background: G.off, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div className="about-section" style={{ maxWidth: 800, margin: '0 auto', padding: '80px 48px' }}>
          <Reveal>
            <div style={label}>
              <span style={{ width: 18, height: 1.5, background: G.gold }} />Ce qui nous guide
            </div>
          </Reveal>
          <div className="about-values" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 8 }}>
            {[
              { title: 'Le terrain d\'abord', text: 'Chaque fonctionnalité est pensée depuis la réalité du bord de touche. Si ça ne sert pas l\'entraîneur le dimanche, ça n\'existe pas.' },
              { title: 'Accessible à tous', text: 'Aucun matériel requis, aucune expertise technique. Si tu sais filmer une vidéo, tu sais utiliser Insightball.' },
              { title: 'Complémentaire, jamais substitut', text: 'Insightball est un assistant. L\'entraîneur reste le décideur, l\'analyste reste l\'expert. On complète, on ne remplace personne.' },
              { title: 'Les stats au service du jeu', text: 'Les chiffres ne sont pas une fin en soi. Ils servent à mieux préparer, mieux comprendre, mieux faire progresser ton équipe.' },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <div style={{ padding: '28px 24px', background: G.white, border: `1px solid ${G.border}`, borderRadius: 6, height: '100%' }}>
                  <div style={{ fontFamily: G.display, fontSize: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', color: G.ink, marginBottom: 10, lineHeight: 1.1 }}>
                    {v.title}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: G.muted, margin: 0 }}>{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CTA BAND ══ */}
      <div className="about-cta-band" style={{
        background: G.ink, padding: '80px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap',
      }}>
        <div>
          <h2 className="about-h2" style={{
            fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800,
            lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase',
            color: G.white, marginBottom: 12,
          }}>
            Les stats de match<br /><span style={{ color: G.gold }}>accessibles à chaque entraîneur.</span>
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', flexShrink: 0 }}>
          <a href="/#waitlist" style={{ ...btnPrimary, fontSize: 16, padding: '16px 36px', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = G.goldD}
            onMouseLeave={e => e.currentTarget.style.background = G.gold}>
            Essai gratuit 7 jours →
          </a>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: G.ink, borderTop: `1px solid rgba(255,255,255,0.08)`, padding: '56px 48px 32px' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <img src="/logo.svg" alt="Insightball" style={{ height: 36, width: 'auto', display: 'block', mixBlendMode: 'screen' }} />
              <span style={{ fontFamily: G.display, fontSize: 18, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: G.white }}>
                INSIGHT<span style={{ color: G.gold }}>ball</span>
              </span>
            </div>
            <p style={{ fontFamily: G.mono, fontSize: 11, color: G.gold, marginBottom: 14, letterSpacing: '.04em' }}>
              Tes stats. Ton terrain.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.06)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Produit', links: [['/#features', 'Fonctionnalités'], ['/tarifs', 'Tarifs'], ['/#rapport', 'Exemple rapport'], ['/#waitlist', 'Essai gratuit']] },
            { title: 'Entreprise', links: [['/#contact', 'Contact'], ['mailto:contact@insightball.com', 'Support'], ['/a-propos', 'À propos']] },
            { title: 'Légal', links: [['/mentions-legales', 'Mentions légales'], ['/cgv', 'CGV'], ['/confidentialite', 'Confidentialité'], ['/cookies', 'Cookies']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: G.mono, fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>{col.title}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map(([h, l]) => (
                  <li key={l}>
                    {h.startsWith('/') && !h.startsWith('/#') ? (
                      <Link to={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', textDecoration: 'none', transition: 'color .15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = G.gold}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.60)'}>{l}</Link>
                    ) : (
                      <a href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', textDecoration: 'none', transition: 'color .15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = G.gold}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.60)'}>{l}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>© 2026 Insightball — Tous droits réservés</span>
        </div>
      </footer>
    </div>
  )
}
