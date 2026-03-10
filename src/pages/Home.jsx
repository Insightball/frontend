import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import HeroAnimation from '../components/HeroAnimation'

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

/* ─── Traductions FR / EN ───────────────────── */
const LANG = {
  FR: {
    // Nav
    navFeatures: 'Fonctionnalités',
    navPricing: 'Tarifs',
    navEarlyAccess: 'Accès anticipé',
    navBlog: 'Blog',
    navCta: 'Accès anticipé',
    // Hero
    heroTitle1: 'Ta vidéo.',
    heroTitle2: 'Tes stats.',
    heroTitle3: 'Ton match.',
    heroSub: "Filme ton match. Reçois tes stats en moins d'une heure.",
    heroSubBold: '',
    heroSubEnd: '',
    heroCta1: 'Demander un accès →',
    heroCta2: 'Voir un exemple',
    // Features
    featLabel: 'Fonctionnalités',
    featTitle1: 'Ce que tu obtiens',
    featTitle2: 'après chaque match.',
    featSub: 'Tout ce dont tu as besoin pour analyser, comprendre et progresser. Prise en main immédiate, aucun matériel supplémentaire.',
    feat1Title: 'Stats Collectives',
    feat1Desc: 'Comprends comment ton équipe joue, presse et défend. Match après match.',
    feat1Items: ['Possession de balle','Nombre & % de passes réussies','Nombre & % de tirs réussis','Courbe de suivi des matchs','Distance totale parcourue','Heatmap collective'],
    feat2Title: 'Stats Individuelles',
    feat2Desc: 'Une fiche par joueur. Évalue objectivement, identifie les axes de progression.',
    feat2Items: ['Heatmap de position individuelle','Ballons touchés / perdus / gagnés','Nombre de tirs','Passes réussies / ratées','Distance totale parcourue','Heatmap individuelle'],
    feat3Title: 'Rapport Complet',
    feat3Desc: 'Un PDF pro exportable en un clic. À partager avec ton staff, tes joueurs, ta direction.',
    feat3Items: ['Tableau de bord en ligne','Export PDF à partager','Graphiques & heatmaps inclus','Comparaison entre 2 joueurs'],
    // Social proof
    stat1Value: '40+', stat1Label: 'Métriques analysées', stat1Sub: 'par match',
    stat2Value: '< 1h', stat2Label: 'Temps de traitement', stat2Sub: 'rapport livré',
    stat3Value: '0€', stat3Label: 'Matériel requis', stat3Sub: 'ton téléphone suffit',
    stat4Value: 'PDF', stat4Label: 'Export en 1 clic', stat4Sub: 'prêt à partager',
    trust1: 'Séniors → U14 : toutes catégories couvertes',
    trust2: 'Prise en main immédiate',
    trust3: 'Adapté à tous les staffs, avec ou sans analyste',
    // Process
    processLabel: 'Comment ça marche',
    processTitle1: 'Simple.',
    processTitle2: 'Rapide.',
    processTitle3: 'Précis.',
    processSub: 'Tu filmes, on s\'occupe du reste.',
    step1Title: 'Filme ton match',
    step1Desc: 'Depuis ton téléphone, tablette ou caméra. MP4, MOV, AVI — tout format accepté.',
    step2Title: 'Renseigne le match',
    step2Desc: 'Équipes, composition, score. Deux minutes pour contextualiser ton analyse.',
    step3Title: 'L\'analyse se lance',
    step3Desc: 'Détection des joueurs, des actions, des zones de jeu. Ton rapport arrive en moins d\'une heure.',
    step4Title: 'Reçois ton rapport',
    step4Desc: 'Dashboard interactif + PDF prêt à imprimer ou partager. Livré directement.',
    // Process card
    pcTitle: 'Analyse en cours…',
    pcLabel: 'Extraction des données',
    pc1: 'Détection joueurs', pc2: 'Heatmaps', pc3: 'Calcul métriques', pc4: 'Génération rapport',
    pc4Val: 'En cours…',
    pcReady: 'Rapport prêt dans',
    // Rapport
    rapportLabel: 'Exemple de rapport',
    rapportTitle1: "Vue d'ensemble",
    rapportTitle2: 'de ton équipe.',
    rapportSub: "Possession, tirs, duels, distance — tout ce qu'il faut pour analyser la performance collective et individuelle de ton équipe match après match.",
    rapportPanel: 'Performances individuelles',
    rapportPlayers: '11 titulaires',
    rapportCols: ['Joueur','Passes','Duels','Buts','Km'],
    rapportPdf: 'Rapport PDF prêt',
    rapportPdfSub: 'à être partagé.',
    rapportCta: 'Accès anticipé →',
    // Mockup rapport
    mockupTitle: 'Rapport de match',
    mockupHeatmapLabel: 'Heatmap collective',
    mockupHeatmapSub: 'Mi-temps 2',
    mockupCols: ['Joueur','Pass.','Duels','Km'],
    // Heatmap legend
    hmLeg1: 'Tir cadré', hmLeg2: 'Tir non cadré', hmLeg3: 'Récupération', hmLeg4: 'Ballon perdu',
    hmHover: 'SURVOLEZ UN POINT',
    // Pricing
    priceLabel: 'Tarifs',
    priceTitle1: 'Simple et',
    priceTitle2: 'sans surprise.',
    priceSub: 'Deux formules. Aucun matériel, aucun engagement — filme et analyse.',
    priceBannerLabel: 'Offre de lancement limitée',
    priceBanner1: '1 match analysé offert',
    priceBanner2: '7 jours gratuits',
    priceBanner3: 'Sans engagement',
    // Coach card
    coachFor: 'Pour les coachs',
    coachName: 'Coach',
    coachBadge: '1 match offert · 7 jours gratuits',
    coachDesc: 'Filme ton match. Le premier est offert, sans engagement.',
    coachAfter: "après la période d'essai",
    coachItems: ['4 matchs analysés / mois','1 équipe','Stats collectives & individuelles','Heatmaps & rapport PDF export','Suivi progression sur la saison','Support inclus'],
    coachCta: 'Commencer gratuitement →',
    // Club card
    clubFor: 'Pour les clubs',
    clubName: 'Club',
    clubDesc: 'Toutes tes équipes, un seul projet club.',
    clubFrom: 'À partir de',
    clubAdapted: 'Offre adaptée à la taille de ton club',
    clubVis: 'Visibilité',
    clubVisDesc: "Une vue sur l'ensemble de tes équipes. Un seul écran, toutes les données.",
    clubItems: ['Nombre de matchs adapté à tes besoins','Multi-équipes & multi-utilisateurs','Vue consolidée du club','Comparaison inter-équipes','Suivi joueurs cross-équipes','Rapport direction mensuel PDF','Support prioritaire dédié'],
    clubDemo: 'Démo gratuite · Sans engagement · Sur mesure',
    clubCta: 'Demander un devis →',
    priceFooter: '🔒 Paiement sécurisé Stripe · Résiliable à tout moment · Sans engagement · Offre de lancement limitée',
    // Waitlist
    wlLabel: 'Accès anticipé',
    wlTitle1: 'Demande ton',
    wlTitle2: 'accès en avant-première.',
    wlSub1: 'Lancement prévu en ',
    wlSub1Bold: 'mars 2026',
    wlSub2: ". Inscris-toi maintenant pour en bénéficier en priorité.",
    wlPerk1: 'Accès avant ouverture publique',
    wlPerk2: 'Onboarding personnalisé',
    wlPerk3: 'Tarif early adopter',
    wlSentTitle: 'Demande reçue',
    wlSentSub: "Ta demande a bien été enregistrée. On te contacte en priorité dès l'ouverture.",
    wlFormTitle: 'Remplissez le formulaire',
    wlFirstName: 'Prénom *',
    wlLastName: 'Nom *',
    wlEmail: 'Email *',
    wlClub: 'Nom du club *',
    wlRole: 'Poste *',
    wlRoleChoose: 'Choisir...',
    wlRoleOptions: ['Éducateur','Entraîneur','Directeur Sportif'],
    wlCategory: 'Catégorie entraînée *',
    wlCatChoose: 'Choisir...',
    wlSubmit: '→ Demander mon accès anticipé',
    wlSubmitting: 'Envoi...',
    // Contact
    contactLabel: 'Contact',
    contactTitle1: 'Une question ?',
    contactTitle2: 'On répond.',
    contactSub: 'Une démo, une question sur nos offres, un retour terrain — on est là. Réponse sous 24h.',
    contactSentTitle: 'Message envoyé',
    contactSentSub: 'On te répond sous 24h.',
    contactName: 'Nom',
    contactEmail: 'Email',
    contactMessage: 'Message',
    contactPlaceholder: 'Votre message…',
    contactSubmit: 'Envoyer →',
    contactSubmitting: 'Envoi...',
    // Crédibilité
    cred1: 'Conçu et hébergé en France',
    cred2: 'Paiement sécurisé Stripe',
    cred3: 'Pensé par des passionnés de football',
    cred4: 'Données livrées en moins d\'1h',
    // CTA band
    ctaTitle1: 'Prêt à analyser',
    ctaTitle2: 'ton prochain match ?',
    ctaCta: "Demander l'accès →",
    // Footer
    footProduit: 'Produit',
    footEntreprise: 'Entreprise',
    footLegal: 'Légal',
    footFeatures: 'Fonctionnalités',
    footPricing: 'Tarifs',
    footRapport: 'Exemple rapport',
    footEarly: 'Accès anticipé',
    footContact: 'Contact',
    footSupport: 'Support',
    footBlog: 'Blog',
    footMentions: 'Mentions légales',
    footCGV: 'CGV',
    footConf: 'Confidentialité',
    footCookies: 'Cookies',
    footCopy: '© 2026 Insightball — Tous droits réservés',
    // Heatmap events
    hmEvents: [
      { type: 'Tir cadré', detail: 'Dangoumau - 74min' },
      { type: 'Tir cadré', detail: 'Randazzo - 61min' },
      { type: 'Tir non cadré', detail: 'Finidori - 55min' },
      { type: 'Tir non cadré', detail: 'Kheroua - 38min' },
      { type: 'Ballon récupéré', detail: 'Fogacci - 67min' },
      { type: 'Ballon récupéré', detail: 'Kheroua - 42min' },
      { type: 'Ballon perdu', detail: 'Finidori - 51min' },
      { type: 'Ballon récupéré', detail: 'Bonalair - 29min' },
      { type: 'Ballon perdu', detail: 'Dangoumau - 44min' },
      { type: 'Tir cadré', detail: 'Randazzo - 82min' },
    ],
    // Mockup KPIs
    kpi1Val: '63%', kpi1Label: 'Possession',
    kpi2Val: '18',  kpi2Label: 'Attaques',
    kpi3Val: '8/14', kpi3Label: 'Cadrés',
  },
  EN: {
    // Nav
    navFeatures: 'Features',
    navPricing: 'Pricing',
    navEarlyAccess: 'Early Access',
    navBlog: 'Blog',
    navCta: 'Early Access',
    // Hero
    heroTitle1: 'Your video.',
    heroTitle2: 'Your stats.',
    heroTitle3: 'Your match.',
    heroSub: "Film your match. Get your stats in under one hour.",
    heroSubBold: '',
    heroSubEnd: '',
    heroCta1: 'Request access →',
    heroCta2: 'See an example',
    // Features
    featLabel: 'Features',
    featTitle1: 'What you get',
    featTitle2: 'after every match.',
    featSub: 'Everything you need to analyze, understand and improve. Instant setup, no extra equipment.',
    feat1Title: 'Team Stats',
    feat1Desc: 'Understand how your team plays, presses and defends. Match after match.',
    feat1Items: ['Ball possession','Number & % of successful passes','Number & % of shots on target','Match-by-match tracking curve','Total distance covered','Team heatmap'],
    feat2Title: 'Player Stats',
    feat2Desc: 'A profile for every player. Evaluate objectively, identify areas for improvement.',
    feat2Items: ['Individual position heatmap','Touches / lost / won balls','Number of shots','Successful / missed passes','Total distance covered','Individual heatmap'],
    feat3Title: 'Full Report',
    feat3Desc: 'A professional PDF exportable in one click. Share with your staff, players, or board.',
    feat3Items: ['Online dashboard','Shareable PDF export','Charts & heatmaps included','Head-to-head player comparison'],
    // Social proof
    stat1Value: '40+', stat1Label: 'Metrics analyzed', stat1Sub: 'per match',
    stat2Value: '< 1h', stat2Label: 'Processing time', stat2Sub: 'report delivered',
    stat3Value: '€0', stat3Label: 'Equipment needed', stat3Sub: 'your phone is enough',
    stat4Value: 'PDF', stat4Label: 'One-click export', stat4Sub: 'ready to share',
    trust1: 'Senior → U14: all age groups covered',
    trust2: 'Instant setup',
    trust3: 'Built for every staff, with or without an analyst',
    // Process
    processLabel: 'How it works',
    processTitle1: 'Simple.',
    processTitle2: 'Fast.',
    processTitle3: 'Precise.',
    processSub: 'You film, we handle the rest.',
    step1Title: 'Film your match',
    step1Desc: 'From your phone, tablet or camera. MP4, MOV, AVI — any format accepted.',
    step2Title: 'Enter match details',
    step2Desc: 'Teams, lineup, score. Two minutes to set up your analysis.',
    step3Title: 'Analysis kicks off',
    step3Desc: 'Player detection, actions, zones of play. Your report arrives in under one hour.',
    step4Title: 'Get your report',
    step4Desc: 'Interactive dashboard + PDF ready to print or share. Delivered directly.',
    // Process card
    pcTitle: 'Analysis in progress…',
    pcLabel: 'Data extraction',
    pc1: 'Player detection', pc2: 'Heatmaps', pc3: 'Metrics calculation', pc4: 'Report generation',
    pc4Val: 'In progress…',
    pcReady: 'Report ready in',
    // Rapport
    rapportLabel: 'Report example',
    rapportTitle1: 'Full overview',
    rapportTitle2: 'of your team.',
    rapportSub: 'Possession, shots, duels, distance — everything you need to analyze collective and individual performance match after match.',
    rapportPanel: 'Individual performances',
    rapportPlayers: '11 starters',
    rapportCols: ['Player','Passes','Duels','Goals','Km'],
    rapportPdf: 'PDF report ready',
    rapportPdfSub: 'to share.',
    rapportCta: 'Early access →',
    // Mockup rapport
    mockupTitle: 'Match report',
    mockupHeatmapLabel: 'Team heatmap',
    mockupHeatmapSub: '2nd half',
    mockupCols: ['Player','Pass.','Duels','Km'],
    // Heatmap legend
    hmLeg1: 'Shot on target', hmLeg2: 'Shot off target', hmLeg3: 'Recovery', hmLeg4: 'Ball lost',
    hmHover: 'HOVER A POINT',
    // Pricing
    priceLabel: 'Pricing',
    priceTitle1: 'Simple and',
    priceTitle2: 'no surprises.',
    priceSub: 'Two plans. No hardware, no commitment — film and analyze.',
    priceBannerLabel: 'Limited launch offer',
    priceBanner1: '1 free match analysis',
    priceBanner2: '7-day free trial',
    priceBanner3: 'No commitment',
    // Coach card
    coachFor: 'For coaches',
    coachName: 'Coach',
    coachBadge: '1 free match · 7 days free',
    coachDesc: 'Film your match. The first one is free, no commitment.',
    coachAfter: 'after the trial period',
    coachItems: ['4 matches analyzed / month','1 team','Team & individual stats','Heatmaps & PDF report export','Season-long progress tracking','Support included'],
    coachCta: 'Start for free →',
    // Club card
    clubFor: 'For clubs',
    clubName: 'Club',
    clubDesc: 'All your teams, one club project.',
    clubFrom: 'Starting at',
    clubAdapted: 'Offer tailored to your club size',
    clubVis: 'Visibility',
    clubVisDesc: 'A view across all your teams. One screen, all the data.',
    clubItems: ['Match volume tailored to your needs','Multi-team & multi-user','Consolidated club view','Cross-team comparison','Cross-team player tracking','Monthly board report PDF','Dedicated priority support'],
    clubDemo: 'Free demo · No commitment · Custom plan',
    clubCta: 'Request a quote →',
    priceFooter: '🔒 Secure Stripe payment · Cancel anytime · No commitment · Limited launch offer',
    // Waitlist
    wlLabel: 'Early Access',
    wlTitle1: 'Request your',
    wlTitle2: 'early access.',
    wlSub1: 'Launch planned for ',
    wlSub1Bold: 'March 2026',
    wlSub2: '. Sign up now for priority access.',
    wlPerk1: 'Access before public launch',
    wlPerk2: 'Personalized onboarding',
    wlPerk3: 'Early adopter pricing',
    wlSentTitle: 'Request received',
    wlSentSub: "Your request has been recorded. We'll contact you as a priority when we launch.",
    wlFormTitle: 'Fill in the form',
    wlFirstName: 'First name *',
    wlLastName: 'Last name *',
    wlEmail: 'Email *',
    wlClub: 'Club name *',
    wlRole: 'Role *',
    wlRoleChoose: 'Choose...',
    wlRoleOptions: ['Educator','Head Coach','Sporting Director'],
    wlCategory: 'Age group coached *',
    wlCatChoose: 'Choose...',
    wlSubmit: '→ Request my early access',
    wlSubmitting: 'Sending...',
    // Contact
    contactLabel: 'Contact',
    contactTitle1: 'Got a question?',
    contactTitle2: "We'll answer.",
    contactSub: "A demo, a question about our plans, feedback from the pitch — we're here. Response within 24h.",
    contactSentTitle: 'Message sent',
    contactSentSub: "We'll get back to you within 24h.",
    contactName: 'Name',
    contactEmail: 'Email',
    contactMessage: 'Message',
    contactPlaceholder: 'Your message…',
    contactSubmit: 'Send →',
    contactSubmitting: 'Sending...',
    // Crédibilité
    cred1: 'Designed and hosted in France',
    cred2: 'Secure payment via Stripe',
    cred3: 'Built by football enthusiasts',
    cred4: 'Data delivered in under 1h',
    // CTA band
    ctaTitle1: 'Ready to analyze',
    ctaTitle2: 'your next match?',
    ctaCta: 'Request access →',
    // Footer
    footProduit: 'Product',
    footEntreprise: 'Company',
    footLegal: 'Legal',
    footFeatures: 'Features',
    footPricing: 'Pricing',
    footRapport: 'Report example',
    footEarly: 'Early Access',
    footContact: 'Contact',
    footSupport: 'Support',
    footBlog: 'Blog',
    footMentions: 'Legal notice',
    footCGV: 'Terms',
    footConf: 'Privacy',
    footCookies: 'Cookies',
    footCopy: '© 2026 Insightball — All rights reserved',
    // Heatmap events
    hmEvents: [
      { type: 'Shot on target', detail: 'Dangoumau - 74min' },
      { type: 'Shot on target', detail: 'Randazzo - 61min' },
      { type: 'Shot off target', detail: 'Finidori - 55min' },
      { type: 'Shot off target', detail: 'Kheroua - 38min' },
      { type: 'Recovery', detail: 'Fogacci - 67min' },
      { type: 'Recovery', detail: 'Kheroua - 42min' },
      { type: 'Ball lost', detail: 'Finidori - 51min' },
      { type: 'Recovery', detail: 'Bonalair - 29min' },
      { type: 'Ball lost', detail: 'Dangoumau - 44min' },
      { type: 'Shot on target', detail: 'Randazzo - 82min' },
    ],
    // Mockup KPIs
    kpi1Val: '63%', kpi1Label: 'Possession',
    kpi2Val: '18',  kpi2Label: 'Attacks',
    kpi3Val: '8/14', kpi3Label: 'On target',
  },
}

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
  { cx: 274, cy: 84,  r: 6,   color: '#ef4444', type: 'Tir cadré',       detail: 'Dangoumau - 74min',  icon: '⚽' },
  { cx: 258, cy: 113, r: 5,   color: '#ef4444', type: 'Tir cadré',       detail: 'Randazzo - 61min',   icon: '⚽' },
  { cx: 282, cy: 122, r: 4.5, color: '#f97316', type: 'Tir non cadré',   detail: 'Finidori - 55min',   icon: '🎯' },
  { cx: 217, cy: 76,  r: 5,   color: '#f97316', type: 'Tir non cadré',   detail: 'Kheroua - 38min',    icon: '🎯' },
  { cx: 232, cy: 132, r: 4,   color: '#eab308', type: 'Ballon récupéré', detail: 'Fogacci - 67min',    icon: '✅' },
  { cx: 165, cy: 70,  r: 4.5, color: '#c9a227', type: 'Ballon récupéré', detail: 'Kheroua - 42min',    icon: '✅' },
  { cx: 155, cy: 126, r: 3.5, color: '#c9a227', type: 'Ballon perdu',    detail: 'Finidori - 51min',   icon: '❌' },
  { cx: 84,  cy: 96,  r: 4,   color: '#22c55e', type: 'Ballon récupéré', detail: 'Bonalair - 29min',   icon: '✅' },
  { cx: 195, cy: 88,  r: 3.5, color: '#a855f7', type: 'Ballon perdu',    detail: 'Dangoumau - 44min',  icon: '❌' },
  { cx: 240, cy: 98,  r: 5,   color: '#ef4444', type: 'Tir cadré',       detail: 'Randazzo - 82min',   icon: '⚽' },
]

function HeatmapSVG({ t }) {
  const [tooltip, setTooltip] = useState(null)
  const [hovered, setHovered] = useState(null)
  const hmEvents = t.hmEvents

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
                  type: hmEvents[i].type,
                  detail: hmEvents[i].detail,
                  icon: ev.icon,
                })
              }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
            />
          </g>
        ))}

      </svg>

      {/* Légende sous le terrain */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 20px',
        padding: '10px 14px',
        background: 'rgba(0,0,0,0.45)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        {[['#ef4444',t.hmLeg1],['#f97316',t.hmLeg2],['#22c55e',t.hmLeg3],['#a855f7',t.hmLeg4]].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0, display: 'inline-block', boxShadow: `0 0 5px ${c}` }}/>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{l}</span>
          </div>
        ))}
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.28)', marginLeft: 'auto', alignSelf: 'center', letterSpacing: '.08em' }}>{t.hmHover}</span>
      </div>
    </div>
  )
}

/* ─── Mockup rapport responsive ─────────────── */
function MockupRapport({ mobile, t }) {
  const pad   = mobile ? 12 : 16
  const kpiFs = mobile ? 20 : 26
  const rowFs = mobile ? 11 : 12
  const nbRows = mobile ? 2 : 3

  return (
    <div style={{ width: '100%', maxWidth: mobile ? '100%' : 520, background: G.white, border: `1px solid ${G.border}`, borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
      {/* Barre titre */}
      <div style={{ background: G.off, borderBottom: `1px solid ${G.border}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
        {['#f87171','#fbbf24','#4ade80'].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }}/>)}
        <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, marginLeft: 6, letterSpacing: '.06em' }}>{t.mockupTitle}</span>
      </div>

      <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: mobile ? 8 : 10 }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: mobile ? 6 : 8 }}>
          {[[t.kpi1Val,G.gold,t.kpi1Label],[t.kpi2Val,G.ink,t.kpi2Label],[t.kpi3Val,'#1a7a4a',t.kpi3Label]].map(([v,c,l]) => (
            <div key={l} style={{ background: G.off, border: `1px solid ${G.border}`, borderRadius: 4, padding: mobile ? '10px 6px' : '12px 10px', textAlign: 'center' }}>
              <div style={{ fontFamily: G.display, fontSize: kpiFs, fontWeight: 800, lineHeight: 1, color: c }}>{v}</div>
              <div style={{ fontSize: mobile ? 9 : 10, color: G.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div style={{ border: `1px solid ${G.border}`, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ background: G.off, borderBottom: `1px solid ${G.border}`, padding: '7px 12px', fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t.mockupHeatmapLabel}</span><span style={{ color: G.gold }}>{t.mockupHeatmapSub}</span>
          </div>
          <HeatmapSVG t={t}/>
        </div>

        {/* Table joueurs */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: G.off }}>
              {t.mockupCols.map(h => (
                <th key={h} style={{ fontFamily: G.mono, fontSize: mobile ? 8 : 9, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: G.muted, padding: mobile ? '6px 8px' : '7px 10px', textAlign: h===t.mockupCols[0]?'left':'center', borderBottom: `1px solid ${G.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAYERS.slice(0, nbRows).map(p => (
              <tr key={p.num}>
                <td style={{ fontSize: rowFs, color: G.ink2, padding: mobile ? '6px 8px' : '7px 10px', borderBottom: `1px solid ${G.border}` }}>
                  <span style={{ fontFamily: G.display, fontSize: mobile ? 13 : 14, fontWeight: 700, color: G.gold, marginRight: 3 }}>{p.num}</span>
                  {mobile ? p.name.split(' ')[0] : p.name}
                  <span style={{ fontFamily: G.mono, fontSize: 8, background: G.off, border: `1px solid ${G.border}`, padding: '1px 4px', borderRadius: 2, marginLeft: 3, color: G.muted }}>{p.pos}</span>
                </td>
                {[p.passes, p.duels, p.km].map((v,i) => (
                  <td key={i} style={{ fontSize: rowFs, fontWeight: 600, color: G.ink2, padding: mobile ? '6px 8px' : '7px 10px', textAlign: 'center', borderBottom: `1px solid ${G.border}` }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════ */
export default function LandingPage() {
  const [lang, setLang]                   = useState(() => {
    try { const saved = sessionStorage.getItem('ib_lang'); if (saved) return saved } catch {}
    const browserLang = (navigator.language || '').toLowerCase()
    return browserLang.startsWith('fr') ? 'FR' : 'EN'
  })
  const t = LANG[lang]
  const toggleLang = () => {
    const next = lang === 'FR' ? 'EN' : 'FR'
    setLang(next)
    try { sessionStorage.setItem('ib_lang', next) } catch {}
  }
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
    } catch {
      // no-cors → opaque response, peut throw sur redirect Google — données passent quand même
    }
    setWlSent(true)
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
      .hero-grid    { grid-template-columns: 1fr !important; max-width: 640px !important; margin: 0 auto !important; }
      .hero-right   { display: none !important; }
      .feat-grid    { grid-template-columns: 1fr !important; }
      .process-grid { grid-template-columns: 1fr !important; }
      .process-card-sticky { display: none !important; }
      .rapport-grid { grid-template-columns: 1fr !important; }
      .price-grid   { grid-template-columns: 1fr !important; max-width: 480px !important; margin: 0 auto !important; }
      .cta-band     { flex-direction: column !important; align-items: flex-start !important; padding: 56px 32px !important; }
      .footer-grid  { grid-template-columns: 1fr 1fr !important; }
      .wrap, .wrap-inner { padding: 72px 32px !important; }
      .contact-grid { grid-template-columns: 1fr !important; }
      .wl-grid      { grid-template-columns: 1fr !important; }
      .stat-grid    { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .nav-links, .nav-cta-d, .nav-lang { display: none !important; }
      .nav-burger   { display: flex !important; }
      .hero-grid    { padding: 20px 20px 24px !important; min-height: unset !important; }
      .hero-title   { font-size: clamp(36px,10vw,58px) !important; }
      .sec-h2       { font-size: clamp(28px,7vw,42px) !important; }
      .wrap, .wrap-inner { padding: 56px 20px !important; }
      .cta-band     { padding: 56px 20px !important; }
      .footer-grid  { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
      .feat-grid    { grid-template-columns: 1fr !important; }
      .price-grid   { grid-template-columns: 1fr !important; max-width: 100% !important; }
      .wl-grid      { grid-template-columns: 1fr !important; }
      .contact-grid { grid-template-columns: 1fr !important; }
      .trial-banner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
      .trial-banner-sep { display: none !important; }
      .trial-banner-items { flex-direction: column !important; gap: 8px !important; }
      .cred-bar     { flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
      .trust-checks { flex-direction: column !important; gap: 10px !important; align-items: flex-start !important; }
    }
    @media (max-width: 1024px) {
      .hero-mobile-mockup { display: block !important; }
    }
    select option { background: #1a1917; color: #ffffff; }
    select:focus { outline: none; }
    .select-wrapper { position: relative; }
    .select-wrapper::after { content: '▾'; position: absolute; right: 0; top: 50%; transform: translateY(-50%); color: rgba(201,162,39,0.8); pointer-events: none; font-size: 14px; }
    @media (max-width: 480px) {
      .footer-grid  { grid-template-columns: 1fr !important; }
      .wl-grid      { grid-template-columns: 1fr !important; }
      .hero-grid    { padding: 80px 16px 32px !important; min-height: unset !important; }
      .wrap, .wrap-inner { padding: 48px 16px !important; }
      .cta-band     { padding: 48px 16px !important; }
      nav           { padding: 0 16px !important; }
      .price-grid   { max-width: 100% !important; }
      footer        { padding: 40px 16px 24px !important; }
      .hero-mobile-mockup { padding: 0 12px 40px !important; }
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
  const labelStDark = { fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', display: 'block', marginBottom: 6 }
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
        boxSizing: 'border-box',
        boxShadow: navScrolled ? '0 2px 20px rgba(0,0,0,0.40)' : 'none',
        transition: 'box-shadow .2s',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Insightball" style={{ height: 36, width: 'auto', display: 'block', mixBlendMode: 'screen' }} />
          <span style={{ fontFamily: G.display, fontSize: 18, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: G.white }}>
            INSIGHT<span style={{ color: G.gold }}>ball</span>
          </span>
        </Link>

        <div className="nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[['#features',t.navFeatures],['/tarifs',t.navPricing],['#waitlist',t.navEarlyAccess],['/blog/',t.navBlog]].map(([h,l]) => (
            <a key={h} href={h} style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = G.gold}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}>{l}</a>
          ))}
        </div>

        {/* Language toggle */}
        <button className="nav-lang" onClick={toggleLang} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 4, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'background .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
          <span style={{ fontSize: 13 }}>{lang === 'FR' ? '🇫🇷' : '🇬🇧'}</span>
          <span style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'rgba(255,255,255,0.75)' }}>{lang}</span>
        </button>

        <a href="#waitlist" className="nav-cta-d" style={{ ...btnPrimary, padding: '9px 20px', fontSize: 14, textDecoration:'none' }}
          onMouseEnter={e => e.currentTarget.style.background = G.goldD}
          onMouseLeave={e => e.currentTarget.style.background = G.gold}>
          {t.navCta}
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
          {[['#features',t.navFeatures],['/tarifs',t.navPricing],['#waitlist',t.navEarlyAccess],['/blog/',t.navBlog]].map(([h,l]) => (
            <a key={h} href={h} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{l}</a>
          ))}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={toggleLang} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 4, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 13 }}>{lang === 'FR' ? '🇫🇷' : '🇬🇧'}</span>
              <span style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'rgba(255,255,255,0.75)' }}>{lang}</span>
            </button>
          </div>
          <a href="#waitlist" onClick={() => setMenuOpen(false)} style={{ ...btnPrimary, marginTop: 12, justifyContent: 'center', textDecoration:'none' }}>{t.navCta} →</a>
        </div>
      )}

      {/* ══ HERO ═══════════════════════════════════════ */}
      {/* ══ HERO ══ */}
      <div style={{ paddingTop: 60 }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', maxWidth: 1200, margin: '0 auto', padding: '100px 48px 60px', gap: 60, minHeight: '100vh' }}>
          <div style={{ padding: '80px 0' }}>
            <h1 className="hero-title" style={{ fontFamily: G.display, fontSize: 'clamp(48px,6vw,78px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 24, opacity: 0, animation: 'heroUp .5s .2s forwards' }}>
              {t.heroTitle1}<br/>
              {t.heroTitle2}<br/>
              <span style={{ color: G.gold }}>{t.heroTitle3}</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: G.muted, maxWidth: 440, marginBottom: 36, opacity: 0, animation: 'heroUp .5s .35s forwards' }}>
              {t.heroSub}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', opacity: 0, animation: 'heroUp .5s .45s forwards' }}>
              <a href="#waitlist" style={{ ...btnPrimary, textDecoration:'none' }}
                onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                onMouseLeave={e => e.currentTarget.style.background = G.gold}>
                {t.heroCta1}
              </a>
              <a href="#rapport" style={btnOutline}
                onMouseEnter={e => { e.currentTarget.style.borderColor = G.ink; e.currentTarget.style.color = G.ink }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = G.border2; e.currentTarget.style.color = G.ink2 }}>
                {t.heroCta2}
              </a>
            </div>
          </div>
          <div className="hero-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, animation: 'heroUp .6s .3s forwards' }}>
            <HeroAnimation />
          </div>
        </div>
        <div className="hero-mobile-mockup" style={{ display: 'none', padding: '0 16px 40px' }}>
          <HeroAnimation />
        </div>
      </div>

      {/* ══ FEATURES ═══════════════════════════════════ */}
      <div style={{ background: G.off }} id="features">
        <div className="wrap-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>{t.featLabel}
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
              {t.featTitle1}<br/><span style={{ color: G.gold }}>{t.featTitle2}</span>
            </h2>
            <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 520, marginBottom: 56 }}>
              {t.featSub}
            </p>
          </Reveal>

          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: G.border, border: `1px solid ${G.border}` }}>
            {[
              { n:'01', title:t.feat1Title, desc:t.feat1Desc, items:t.feat1Items },
              { n:'02', title:t.feat2Title, desc:t.feat2Desc, items:t.feat2Items },
              { n:'03', title:t.feat3Title, desc:t.feat3Desc, items:t.feat3Items },
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

      {/* ══ SOCIAL PROOF — CHIFFRES PRODUIT ═══════ */}
      <div style={{ background: G.ink }}>
        <div className="wrap-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px' }}>
          <Reveal>
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.06)' }}>
              {[
                { value: t.stat1Value, label: t.stat1Label, sub: t.stat1Sub },
                { value: t.stat2Value, label: t.stat2Label, sub: t.stat2Sub },
                { value: t.stat3Value, label: t.stat3Label, sub: t.stat3Sub },
                { value: t.stat4Value, label: t.stat4Label, sub: t.stat4Sub },
              ].map((stat, i) => (
                <div key={i} style={{ background: G.ink, padding: '36px 28px', textAlign: 'center' }}>
                  <div style={{ fontFamily: G.display, fontSize: 42, fontWeight: 800, color: G.gold, lineHeight: 1, marginBottom: 8 }}>{stat.value}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: G.white, marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="trust-checks" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
              {[
                t.trust1,
                t.trust2,
                t.trust3,
              ].map((txt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: G.gold, fontSize: 13 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{txt}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══ PROCESS ════════════════════════════════════ */}
      <div id="process" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="wrap-inner" style={{ padding: '96px 48px' }}>
          <div className="process-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <Reveal>
                <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 18, height: 1.5, background: G.gold }}/>{t.processLabel}
                </div>
                <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
                  {t.processTitle1}<br/><span style={{ color: G.gold }}>{t.processTitle2}</span><br/>{t.processTitle3}
                </h2>
                <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 440, marginBottom: 36 }}>
                  {t.processSub}
                </p>
              </Reveal>
              {[
                { n:'01', title:t.step1Title, desc:t.step1Desc, dark: false },
                { n:'02', title:t.step2Title, desc:t.step2Desc, dark: true },
                { n:'03', title:t.step3Title, desc:t.step3Desc, dark: false },
                { n:'04', title:t.step4Title, desc:t.step4Desc, dark: true },
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
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, marginLeft: 8, letterSpacing: '.06em' }}>{t.pcTitle}</span>
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, marginBottom: 10 }}>{t.pcLabel}</div>
                    {[[t.pc1,'100%',G.gold,100],[t.pc2,'87%',G.green,87],[t.pc3,'72%',G.border2,72],[t.pc4,t.pc4Val,G.gold,45]].map(([l,v,c,pct]) => (
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
                      <span style={{ fontSize: 12, color: G.muted }}>{t.pcReady}</span>
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
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>{t.rapportLabel}
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 16 }}>
              {t.rapportTitle1}<br/><span style={{ color: G.gold }}>{t.rapportTitle2}</span>
            </h2>
            <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.65, maxWidth: 520, marginBottom: 56 }}>
              {t.rapportSub}
            </p>
          </Reveal>

          {/* Stats individuelles uniquement — heatmap supprimée */}
          <Reveal>
            <div style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={panelHd}><span>{t.rapportPanel}</span><b style={{ color: G.gold, fontWeight: 600 }}>{t.rapportPlayers}</b></div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: G.off }}>
                    {t.rapportCols.map(h => (
                      <th key={h} style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, padding: '8px 10px', textAlign: h===t.rapportCols[0]?'left':'center', borderBottom: `1px solid ${G.border}` }}>{h}</th>
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
                  <strong style={{ color: G.ink, fontWeight: 600 }}>{t.rapportPdf}</strong> {t.rapportPdfSub}
                </div>
                <a href="#waitlist" style={{ ...btnPrimary, padding: '8px 18px', fontSize: 12, borderRadius: 4, flexShrink: 0, textDecoration:'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                  onMouseLeave={e => e.currentTarget.style.background = G.gold}>
                  {t.rapportCta}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══ PRICING → /tarifs ══════════════════════════ */}
      {/* Section retirée de la landing — page dédiée /tarifs */}

      {/* ══ WAITLIST ═══════════════════════════════════ */}
      <div id="waitlist" style={{ background: G.ink }}>
        <div className="wrap-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
          <Reveal>
            <div style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 1.5, background: G.gold }}/>{t.wlLabel}
            </div>
            <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.white, marginBottom: 16 }}>
              {t.wlTitle1}<br/><span style={{ color: G.gold }}>{t.wlTitle2}</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 560, marginBottom: 16 }}>
              {t.wlSub1}<strong style={{ color: G.gold }}>{t.wlSub1Bold}</strong>{t.wlSub2}
            </p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 48, flexWrap: 'wrap' }}>
              {[['⚡',t.wlPerk1],['🤝',t.wlPerk2],['🏷️',t.wlPerk3]].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {wlSent ? (
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '48px 32px', textAlign: 'center', maxWidth: 520 }}>
              <div style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', color: G.white, marginBottom: 12 }}>
                {t.wlSentTitle} <span style={{ color: G.gold }}>✓</span>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                {t.wlSentSub}
              </p>
            </div>
          ) : (
            <Reveal delay={0.1}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderTop: `3px solid ${G.gold}`, borderRadius: 8, padding: '40px 40px', maxWidth: 760, boxShadow: '0 8px 40px rgba(0,0,0,0.30)' }}>
                <div style={{ fontFamily: G.display, fontSize: 20, fontWeight: 800, textTransform: 'uppercase', color: G.white, marginBottom: 28 }}>
                  {t.wlFormTitle}
                </div>

                {wlError && (
                  <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 4 }}>
                    <p style={{ fontFamily: G.mono, fontSize: 11, color: G.red, margin: 0 }}>{wlError}</p>
                  </div>
                )}

                <form onSubmit={handleWaitlist}>
                  <div className="wl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0 32px' }}>
                    <div style={inputLineDark(wlFocused==='firstName')}>
                      <label style={labelStDark}>{t.wlFirstName}</label>
                      <input type="text" required value={wlForm.firstName} onChange={e => setWlForm({...wlForm, firstName: e.target.value})}
                        placeholder="" style={inputStDark}
                        onFocus={() => setWlFocused('firstName')} onBlur={() => setWlFocused(null)} />
                    </div>
                    <div style={inputLineDark(wlFocused==='lastName')}>
                      <label style={labelStDark}>{t.wlLastName}</label>
                      <input type="text" required value={wlForm.lastName} onChange={e => setWlForm({...wlForm, lastName: e.target.value})}
                        placeholder="" style={inputStDark}
                        onFocus={() => setWlFocused('lastName')} onBlur={() => setWlFocused(null)} />
                    </div>
                    <div style={{ ...inputLine(wlFocused==='email'), gridColumn: '1 / 3' }}>
                      <label style={labelStDark}>{t.wlEmail}</label>
                      <input type="email" required value={wlForm.email} onChange={e => setWlForm({...wlForm, email: e.target.value})}
                        placeholder="" style={inputStDark}
                        onFocus={() => setWlFocused('email')} onBlur={() => setWlFocused(null)} />
                    </div>
                    <div style={{ ...inputLine(wlFocused==='club'), gridColumn: '1 / 3' }}>
                      <label style={labelStDark}>{t.wlClub}</label>
                      <input type="text" required value={wlForm.club} onChange={e => setWlForm({...wlForm, club: e.target.value})}
                        placeholder="" style={inputStDark}
                        onFocus={() => setWlFocused('club')} onBlur={() => setWlFocused(null)} />
                    </div>
                    <div style={{ ...inputLineDark(wlFocused==='role'), marginBottom: 32 }}>
                      <label style={labelStDark}>{t.wlRole}</label>
                      <div className="select-wrapper">
                        <select required value={wlForm.role} onChange={e => setWlForm({...wlForm, role: e.target.value})}
                          style={{ ...inputStDark, color: wlForm.role ? G.white : 'rgba(255,255,255,0.55)', cursor:'pointer', appearance:'none', WebkitAppearance:'none', paddingRight: 20 }}
                          onFocus={() => setWlFocused('role')} onBlur={() => setWlFocused(null)}>
                          <option value="" disabled style={{ color: '#888', background: '#1a1917' }}>{t.wlRoleChoose}</option>
                          {t.wlRoleOptions.map(r => (
                            <option key={r} style={{ background: '#1a1917', color: '#fff' }}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ ...inputLineDark(wlFocused==='category'), marginBottom: 32 }}>
                      <label style={labelStDark}>{t.wlCategory}</label>
                      <div className="select-wrapper">
                        <select required value={wlForm.category} onChange={e => setWlForm({...wlForm, category: e.target.value})}
                          style={{ ...inputStDark, color: wlForm.category ? G.white : 'rgba(255,255,255,0.55)', cursor:'pointer', appearance:'none', WebkitAppearance:'none', paddingRight: 20 }}
                          onFocus={() => setWlFocused('category')} onBlur={() => setWlFocused(null)}>
                          <option value="" disabled style={{ color: '#888', background: '#1a1917' }}>{t.wlCatChoose}</option>
                          {['U14','U15','U16','U17','U18','U19','Séniors'].map(c => (
                            <option key={c} style={{ background: '#1a1917', color: '#fff' }}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={wlLoading} style={{
                    ...btnPrimary, fontSize: 15, padding: '14px 32px',
                    opacity: wlLoading ? .6 : 1, cursor: wlLoading ? 'not-allowed' : 'pointer',
                  }}
                    onMouseEnter={e => { if(!wlLoading) e.currentTarget.style.background = G.goldD }}
                    onMouseLeave={e => { if(!wlLoading) e.currentTarget.style.background = G.gold }}>
                    {wlLoading ? t.wlSubmitting : t.wlSubmit}
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
                <span style={{ width: 18, height: 1.5, background: G.gold }}/>{t.contactLabel}
              </div>
              <h2 className="sec-h2" style={{ fontFamily: G.display, fontSize: 'clamp(34px,4vw,54px)', fontWeight: 800, lineHeight: .95, letterSpacing: '-.01em', textTransform: 'uppercase', color: G.ink, marginBottom: 20 }}>
                {t.contactTitle1}<br/><span style={{ color: G.gold }}>{t.contactTitle2}</span>
              </h2>
              <p style={{ fontSize: 16, color: G.muted, lineHeight: 1.7, maxWidth: 380, marginBottom: 32 }}>
                {t.contactSub}
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
                    {t.contactSentTitle} <span style={{ color: G.gold }}>✓</span>
                  </div>
                  <p style={{ fontSize: 15, color: G.muted }}>{t.contactSentSub}</p>
                </div>
              ) : (
                <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[{l:t.contactName,t:'text',k:'name',p:''},{l:t.contactEmail,t:'email',k:'email',p:''}].map(f => (
                    <div key={f.k} style={{ borderBottom: `1px solid ${G.border}`, paddingBottom: 16, marginBottom: 16 }}>
                      <label style={labelSt}>{f.l}</label>
                      <input type={f.t} required value={contactForm[f.k]} onChange={e => setContactForm({...contactForm,[f.k]:e.target.value})} placeholder={f.p}
                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: G.ink, fontFamily: G.body }}/>
                    </div>
                  ))}
                  <div style={{ borderBottom: `1px solid ${G.border}`, paddingBottom: 16, marginBottom: 24 }}>
                    <label style={labelSt}>{t.contactMessage}</label>
                    <textarea required rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm,message:e.target.value})} placeholder={t.contactPlaceholder}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 15, color: G.ink, fontFamily: G.body, lineHeight: 1.6 }}/>
                  </div>
                  <button type="submit" disabled={contactLoad} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: contactLoad ? .6 : 1 }}
                    onMouseEnter={e => { if(!contactLoad) e.currentTarget.style.background = G.goldD }}
                    onMouseLeave={e => { if(!contactLoad) e.currentTarget.style.background = G.gold }}>
                    {contactLoad ? t.contactSubmitting : t.contactSubmit}
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
            {t.ctaTitle1}<br/><span style={{ color: G.gold }}>{t.ctaTitle2}</span>
          </h2>

        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', flexShrink: 0 }}>
          <a href="#waitlist" style={{ ...btnPrimary, fontSize: 16, padding: '16px 36px', textDecoration:'none' }}
            onMouseEnter={e => e.currentTarget.style.background = G.goldD}
            onMouseLeave={e => e.currentTarget.style.background = G.gold}>
            {t.ctaCta}
          </a>
        </div>
      </div>

      {/* ══ FOOTER ═════════════════════════════════════ */}
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
              La data football pour tous
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {[
                { href: 'https://www.linkedin.com/company/insightball/', label: 'LinkedIn', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                { href: 'https://www.instagram.com/insightball_', label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { href: 'https://x.com/insightball_', label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { href: 'https://www.facebook.com/Insightball', label: 'Facebook', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              ].map(s => (
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
            { title:t.footProduit, links:[['#features',t.footFeatures],['/tarifs',t.footPricing],['#rapport',t.footRapport],['#waitlist',t.footEarly]] },
            { title:t.footEntreprise, links:[['#contact',t.footContact],['mailto:contact@insightball.com',t.footSupport],['/a-propos','À propos'],['/blog/',t.footBlog]] },
            { title:t.footLegal, links:[['/mentions-legales',t.footMentions],['/cgv',t.footCGV],['/confidentialite',t.footConf],['/cookies',t.footCookies]] },
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
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{t.footCopy}</span>
        </div>
      </footer>
    </div>
  )
}
