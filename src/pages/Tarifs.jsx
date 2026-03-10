import { useEffect } from 'react'
import { Link } from 'react-router-dom'

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
  mono:    "'JetBrains Mono', monospace",
  display: "'Barlow Condensed', sans-serif",
  body:    "'Barlow', sans-serif",
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');`

const btnPrimary = {
  padding: '14px 28px', background: G.gold, color: G.ink,
  fontFamily: G.display, fontSize: 15, fontWeight: 700,
  letterSpacing: '.05em', textTransform: 'uppercase',
  border: 'none', cursor: 'pointer', borderRadius: 4,
  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
  transition: 'background .15s', boxSizing: 'border-box',
}

const COACH_ITEMS = [
  '4 matchs analysés / mois',
  '1 équipe',
  'Stats collectives & individuelles',
  'Heatmaps & rapport PDF export',
  'Suivi progression sur la saison',
  'Support inclus',
]

const CLUB_ITEMS = [
  'Jusqu\'à 15 matchs / mois selon formule',
  'Toutes tes équipes (Séniors, U19, U17…)',
  'Dashboard directeur sportif',
  'Stats collectives & individuelles',
  'Heatmaps & rapports PDF',
  'Suivi progression saison',
  'Support dédié',
]

export default function Tarifs() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Insightball · Tarifs'
  }, [])

  const css = `
    ${FONTS}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #fff; }
    @media (max-width: 768px) {
      .price-grid { grid-template-columns: 1fr !important; max-width: 100% !important; }
      .tarifs-hero { padding: 100px 20px 48px !important; }
      .tarifs-wrap { padding: 56px 20px !important; }
      .trial-banner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
      .trial-sep { display: none !important; }
    }
  `

  return (
    <div style={{ background: G.white, color: G.ink, fontFamily: G.body, fontSize: 16, lineHeight: 1.6 }}>
      <style>{css}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: G.ink, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', boxSizing: 'border-box',
        boxShadow: '0 2px 20px rgba(0,0,0,0.30)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Insightball" style={{ height: 36, width: 'auto', mixBlendMode: 'screen' }}/>
          <span style={{ fontFamily: G.display, fontSize: 18, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: G.white }}>
            INSIGHT<span style={{ color: G.gold }}>ball</span>
          </span>
        </Link>
        <Link to="/" style={{ fontFamily: G.mono, fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', letterSpacing: '.06em' }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
          ← Retour
        </Link>
      </nav>

      {/* ── HERO ── */}
      <div className="tarifs-hero" style={{ paddingTop: 60, background: G.ink }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 48px 64px', textAlign: 'center' }}>
          <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ width: 18, height: 1.5, background: G.gold }}/>
            Tarifs
            <span style={{ width: 18, height: 1.5, background: G.gold }}/>
          </div>
          <h1 style={{ fontFamily: G.display, fontSize: 'clamp(42px,6vw,72px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.white, marginBottom: 20 }}>
            Simple et<br/><span style={{ color: G.gold }}>sans surprise.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65 }}>
            Deux formules. Aucun matériel, aucun engagement — filme et analyse.
          </p>

          {/* Bandeau trial */}
          <div className="trial-banner" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: 'rgba(201,162,39,0.08)', border: `1.5px solid ${G.gold}`, borderRadius: 6, padding: '14px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, background: G.gold, borderRadius: '50%', flexShrink: 0, boxShadow: `0 0 0 3px rgba(201,162,39,0.25)` }}/>
              <span style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: G.gold }}>Offre de lancement</span>
            </div>
            <div className="trial-sep" style={{ width: 1, height: 20, background: 'rgba(201,162,39,0.3)' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {['1 match analysé offert', '7 jours gratuits', 'Sans engagement'].map((txt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: G.gold, fontSize: 13 }}>✓</span>
                  <span style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: '.04em' }}>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARDS ── */}
      <div className="tarifs-wrap" style={{ maxWidth: 1000, margin: '0 auto', padding: '72px 48px' }}>
        <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 940, margin: '0 auto', alignItems: 'start' }}>

          {/* ── COACH ── */}
          <div style={{ background: G.white, border: `1.5px solid ${G.border}`, borderRadius: 10, padding: '40px 36px', transition: 'box-shadow .2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, marginBottom: 6 }}>Pour les coachs</div>
            <div style={{ fontFamily: G.display, fontSize: 34, fontWeight: 800, textTransform: 'uppercase', color: G.ink, marginBottom: 8 }}>Coach</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: G.goldL, border: `1px solid ${G.goldLx}`, borderRadius: 4, padding: '5px 12px', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, background: G.gold, borderRadius: '50%' }}/>
              <span style={{ fontFamily: G.mono, fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold }}>1 match offert · 7 jours gratuits</span>
            </div>
            <div style={{ fontSize: 14, color: G.muted, marginBottom: 24, lineHeight: 1.6 }}>
              Filme ton match. Le premier est offert, sans engagement.
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontFamily: G.display, fontSize: 72, fontWeight: 800, lineHeight: 1, color: G.ink }}>39</span>
              <span style={{ fontSize: 16, color: G.muted }}>€ / mois</span>
            </div>
            <p style={{ fontSize: 12, color: G.muted, marginBottom: 28, fontFamily: G.mono, letterSpacing: '.04em' }}>après la période d'essai</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 36 }}>
              {COACH_ITEMS.map(item => (
                <li key={item} style={{ fontSize: 14, color: G.ink2, display: 'flex', alignItems: 'flex-start', gap: 9, lineHeight: 1.5 }}>
                  <span style={{ color: G.gold, fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Link to="/signup" style={{ ...btnPrimary, display: 'block', textAlign: 'center', width: '100%' }}
              onMouseEnter={e => e.currentTarget.style.background = G.goldD}
              onMouseLeave={e => e.currentTarget.style.background = G.gold}>
              Commencer gratuitement →
            </Link>
          </div>

          {/* ── CLUB ── */}
          <div style={{ background: G.ink, border: `1.5px solid ${G.gold}`, borderRadius: 10, padding: '40px 36px', boxShadow: '0 8px 48px rgba(201,162,39,0.15)', boxSizing: 'border-box' }}>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 6 }}>Pour les clubs</div>
            <div style={{ fontFamily: G.display, fontSize: 34, fontWeight: 800, textTransform: 'uppercase', color: G.white, marginBottom: 8 }}>Club</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 24, lineHeight: 1.6 }}>
              Toutes tes équipes, un seul projet club.
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '.1em', textTransform: 'uppercase' }}>À partir de</span>
                <span style={{ fontFamily: G.display, fontSize: 56, fontWeight: 800, lineHeight: 1, color: G.white }}>99</span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.40)' }}>€ / mois</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '.06em', marginTop: 6 }}>
                Multi-équipes · Sur mesure selon ta structure
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 36 }}>
              {CLUB_ITEMS.map(item => (
                <li key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'flex-start', gap: 9, lineHeight: 1.5 }}>
                  <span style={{ color: G.gold, fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: G.mono, letterSpacing: '.04em', marginBottom: 16, textAlign: 'center' }}>
              Sur invitation · Démo disponible
            </div>
            <a href="/#contact" style={{ ...btnPrimary, display: 'block', textAlign: 'center', width: '100%', color: G.ink }}
              onMouseEnter={e => e.currentTarget.style.background = G.goldD}
              onMouseLeave={e => e.currentTarget.style.background = G.gold}>
              Demander une démo →
            </a>
          </div>

        </div>

        {/* FAQ rapide */}
        <div style={{ maxWidth: 640, margin: '64px auto 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontFamily: G.mono, fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 8, textAlign: 'center' }}>Questions fréquentes</div>
          {[
            ['Est-ce que je peux annuler à tout moment ?', 'Oui, sans frais. L\'abonnement est mensuel, tu peux annuler depuis ton espace à tout moment.'],
            ['Quel matériel faut-il pour filmer ?', 'Ton téléphone suffit. On accepte tous les formats vidéo courants (MP4, MOV, AVI). Caméra tribune ou vue balcon idéale.'],
            ['Combien de temps pour recevoir le rapport ?', 'Moins d\'une heure après l\'upload de ta vidéo.'],
            ['Le plan Club inclut-il toutes les équipes ?', 'Oui, tu peux inviter autant de coachs que tu veux. Chaque coach voit uniquement ses propres équipes.'],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: `1px solid ${G.border}`, paddingBottom: 20 }}>
              <div style={{ fontFamily: G.display, fontSize: 17, fontWeight: 700, color: G.ink, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.02em' }}>{q}</div>
              <div style={{ fontSize: 15, color: G.muted, lineHeight: 1.65 }}>{a}</div>
            </div>
          ))}
        </div>

        {/* CTA bas de page */}
        <div style={{ textAlign: 'center', marginTop: 72 }}>
          <p style={{ fontSize: 15, color: G.muted, marginBottom: 20 }}>Une question ? On répond vite.</p>
          <a href="mailto:contact@insightball.com" style={{ fontFamily: G.mono, fontSize: 13, color: G.gold, textDecoration: 'none', letterSpacing: '.06em', borderBottom: `1px solid ${G.goldLx}`, paddingBottom: 2 }}>
            contact@insightball.com
          </a>
        </div>
      </div>

      {/* Footer minimaliste */}
      <div style={{ background: G.ink, borderTop: `1px solid rgba(255,255,255,0.08)`, padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '.06em' }}>© 2026 Insightball</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['/mentions-legales','Mentions légales'],['/cgv','CGV'],['/confidentialite','Confidentialité']].map(([h,l]) => (
            <Link key={l} to={h} style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '.04em' }}
              onMouseEnter={e => e.currentTarget.style.color = G.gold}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
              {l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
