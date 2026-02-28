// ─────────────────────────────────────────────────────────────
// INSIGHTBALL — Design System
// Source de vérité unique — importer depuis tous les composants
// ─────────────────────────────────────────────────────────────

export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

export const T = {
  // ── Fonds ──────────────────────────────────────────────────
  bg:       '#f5f2eb',   // fond général pages
  bgAlt:    '#ede9e0',   // fond alternatif légèrement plus sombre
  surface:  '#ffffff',   // cartes, panneaux
  dark:     '#0a0908',   // sidebar, hero, modales
  dark2:    '#0f0e0c',   // variante dark légèrement plus claire

  // ── Texte ──────────────────────────────────────────────────
  ink:      '#1a1916',   // texte principal
  ink2:     '#2e2d2a',   // texte secondaire
  muted:    'rgba(26,25,22,0.45)',
  muted2:   'rgba(26,25,22,0.65)',

  // ── Règles / bordures ──────────────────────────────────────
  rule:     'rgba(26,25,22,0.08)',
  ruleDark: 'rgba(26,25,22,0.14)',

  // ── Gold — accent unique ───────────────────────────────────
  gold:     '#c9a227',
  goldD:    '#a8861f',
  goldBg:   'rgba(201,162,39,0.07)',
  goldBg2:  'rgba(201,162,39,0.12)',
  goldBdr:  'rgba(201,162,39,0.22)',

  // ── Status — uniquement pour badges ───────────────────────
  green:    '#16a34a',
  greenBg:  'rgba(22,163,74,0.08)',
  greenBdr: 'rgba(22,163,74,0.2)',

  red:      '#dc2626',
  redBg:    'rgba(220,38,38,0.08)',
  redBdr:   'rgba(220,38,38,0.2)',

  blue:     '#2563eb',
  blueBg:   'rgba(37,99,235,0.08)',
  blueBdr:  'rgba(37,99,235,0.2)',

  orange:   '#d97706',
  orangeBg: 'rgba(217,119,6,0.08)',
  orangeBdr:'rgba(217,119,6,0.2)',

  // ── Typo ───────────────────────────────────────────────────
  mono:     "'JetBrains Mono', monospace",
  display:  "'Anton', sans-serif",

  // ── Layout ─────────────────────────────────────────────────
  sidebarW: 220,
  radius:   0,           // pas de border-radius — style editorial carré
}

// ── Helpers ────────────────────────────────────────────────────
export const statusConfig = {
  completed:  { label: 'Terminé',    color: T.green,  bg: T.greenBg,  bdr: T.greenBdr  },
  processing: { label: 'En cours',   color: T.blue,   bg: T.blueBg,   bdr: T.blueBdr   },
  pending:    { label: 'En attente', color: T.orange, bg: T.orangeBg, bdr: T.orangeBdr },
  error:      { label: 'Erreur',     color: T.red,    bg: T.redBg,    bdr: T.redBdr    },
}

export const globalStyles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(26,25,22,0.12); }
  select, input { -webkit-appearance: none; }
  select option { background: #ffffff; color: #1a1916; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
`
