import { useState } from "react"
import DashboardLayout from '../components/DashboardLayout'
import { T, globalStyles } from '../theme'

const G = {
  bg: '#f5f2eb', surface: '#ffffff', dark: '#0a0908', dark2: '#0f0e0c',
  ink: '#1a1916', ink2: '#2d2c2a', muted: 'rgba(26,25,22,0.45)',
  gold: '#c9a227', goldD: '#a8861f', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.22)',
  rule: 'rgba(26,25,22,0.09)',
  green: '#16a34a', red: '#dc2626', blue: '#2563eb', orange: '#d97706',
  mono: "'JetBrains Mono', monospace",
  display: "'Barlow Condensed', sans-serif",
  body: "'Barlow', sans-serif",
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');`

/* ── Principes de jeu prédéfinis ── */
const PRINCIPES_CATALOGUE = {
  'Phase offensive': [
    { id: 'po1', label: 'Construction courte depuis le gardien', desc: 'Relance au sol, circuits courts, patience' },
    { id: 'po2', label: 'Jeu en triangles côté fort', desc: 'Combinaisons courtes latéral-milieu-ailier' },
    { id: 'po3', label: 'Appels en profondeur', desc: 'Courses derrière la ligne défensive, jeu long' },
    { id: 'po4', label: 'Jeu entre les lignes', desc: 'Occupation des intervalles, décrochages milieux' },
    { id: 'po5', label: 'Centres et occupation de la surface', desc: 'Débordements + 3 joueurs dans la zone de finition' },
    { id: 'po6', label: 'Jeu de position', desc: 'Supériorité numérique par zone, rotations positionnelles' },
  ],
  'Phase défensive': [
    { id: 'pd1', label: 'Pressing haut à la perte', desc: 'Contre-pressing immédiat dans les 5 secondes' },
    { id: 'pd2', label: 'Bloc médian compact', desc: 'Lignes resserrées, 30m entre défense et attaque' },
    { id: 'pd3', label: 'Bloc bas organisé', desc: 'Défense profonde, protection de la surface' },
    { id: 'pd4', label: 'Pressing orienté côté', desc: 'Fermer le centre, pousser vers la touche' },
    { id: 'pd5', label: 'Couverture et permutations', desc: 'Compensation automatique des espaces laissés' },
  ],
  'Transitions': [
    { id: 'tr1', label: 'Transition offensive rapide', desc: 'Verticalité immédiate à la récupération' },
    { id: 'tr2', label: 'Transition offensive patiente', desc: 'Sécuriser le ballon puis accélérer' },
    { id: 'tr3', label: 'Repli défensif immédiat', desc: 'Course vers son but à la perte, replacements' },
    { id: 'tr4', label: 'Contre-pressing (Gegenpressing)', desc: 'Récupération dans les 6 secondes après la perte' },
  ],
  'Coups de pied arrêtés': [
    { id: 'cpa1', label: 'Corners offensifs travaillés', desc: 'Schémas prédéfinis, mouvements coordonnés' },
    { id: 'cpa2', label: 'Coups francs indirects', desc: 'Combinaisons courtes sur CF latéraux' },
    { id: 'cpa3', label: 'Défense de zone sur CPA', desc: 'Placement zonal, responsabilités claires' },
  ],
}

/* ── Programmation annuelle générée ── */
const PROGRAMMATION = [
  { period: 'Préparation', dates: 'Juil. — Août', weeks: 6, color: G.green,
    themes: ['Remise en route physique', 'Mise en place du bloc défensif', 'Circuits de jeu préférentiels', 'Automatismes offensifs', 'Matchs de prépa — intégration', 'Montée en charge + répétitions'],
    focus: 'Poser les bases du projet de jeu. Physique et cohésion.' },
  { period: 'Phase aller — Début', dates: 'Sept. — Oct.', weeks: 8, color: G.gold,
    themes: ['Pressing haut — déclencheurs', 'Construction basse sous pression', 'Jeu entre les lignes', 'Transitions OFF/DEF', 'Animation offensive côté fort', 'Gestion des temps faibles', 'CPA offensifs', 'Semaine de récupération'],
    focus: 'Installer les principes en situation de compétition.' },
  { period: 'Phase aller — Fin', dates: 'Nov. — Déc.', weeks: 8, color: G.orange,
    themes: ['Adaptation tactique vs bloc bas', 'Défense en infériorité', 'Finition et efficacité', 'Gestion du score', 'Permutations et rotations', 'Ressort mental', 'Bilan mi-saison', 'Trêve — récupération'],
    focus: 'Consolider et corriger. Préparer la trêve.' },
  { period: 'Trêve hivernale', dates: 'Déc. — Janv.', weeks: 3, color: G.blue,
    themes: ['Reprise physique', 'Rappels projet de jeu', 'Intégration nouveaux joueurs'],
    focus: 'Recharger les batteries. Réajuster si besoin.' },
  { period: 'Phase retour — Début', dates: 'Janv. — Mars', weeks: 10, color: G.gold,
    themes: ['Réactivation pressing', 'Variante tactique (plan B)', 'Supériorité numérique au milieu', 'Jeu long comme alternative', 'Pressing orienté + piège', 'CPA défensifs', 'Gestion de fatigue', 'Intensité compétition', 'Travail mental collectif', 'Préparation matchs décisifs'],
    focus: 'Monter en puissance. Apporter de la variété tactique.' },
  { period: 'Phase retour — Sprint final', dates: 'Avr. — Mai', weeks: 6, color: G.red,
    themes: ['Automatismes sous pression', 'Gestion émotionnelle', 'Plans de jeu spécifiques adversaire', 'Répétitions scénarios (mener, être mené)', 'Maintien physique', 'Bilan de saison'],
    focus: 'Tout donner. Exécuter, pas expérimenter.' },
]

/* ── Séances exemple ── */
const SEANCES_EXEMPLE = [
  {
    jour: 'Mardi', objectif: 'Pressing haut — déclencheurs',
    principe: 'Pressing haut à la perte',
    duree: '1h30',
    blocs: [
      { nom: 'Échauffement', duree: '15min', desc: 'Rondo 4v2 — transition à la perte, réactivité' },
      { nom: 'Exercice analytique', duree: '20min', desc: 'Pressing 3v2 sur relance GK — déclenchement sur passe courte du gardien' },
      { nom: 'Jeu réduit', duree: '25min', desc: '6v6 + GK sur demi-terrain — point si récupération haute + tir dans les 8 sec' },
      { nom: 'Jeu à thème', duree: '25min', desc: '10v10 sur grand terrain — GK adverse doit jouer court, équipe en pressing' },
      { nom: 'Retour au calme', duree: '5min', desc: 'Étirements + débrief collectif (ce qui a marché, ce qu\'on garde)' },
    ]
  },
  {
    jour: 'Jeudi', objectif: 'Construction courte + jeu entre les lignes',
    principe: 'Construction courte depuis le gardien',
    duree: '1h30',
    blocs: [
      { nom: 'Échauffement', duree: '15min', desc: 'Conservation 5v3 — 2 touches, jouer vers l\'avant obligatoire' },
      { nom: 'Exercice analytique', duree: '20min', desc: 'Sortie de balle GK → DC → milieu relayeur — 3 circuits, opposition progressive' },
      { nom: 'Jeu réduit', duree: '20min', desc: '4v4+2 jokers — bonus si passe entre les lignes vers le joker' },
      { nom: 'Jeu à thème', duree: '25min', desc: '9v9 — point bonus si le but vient d\'une construction de 5+ passes depuis le GK' },
      { nom: 'Retour au calme', duree: '10min', desc: 'Vidéo rapide (2 clips du dernier match) + discussion : qu\'est-ce qu\'on aurait pu faire ?' },
    ]
  },
]

/* ════════════════════════════════════════
   COMPOSANTS
════════════════════════════════════════ */

function StepIndicator({ step, total = 3, labels }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
      {labels.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: i <= step ? G.gold : 'transparent',
              border: `2px solid ${i <= step ? G.gold : G.rule}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: G.mono, fontSize: 11, fontWeight: 700,
              color: i <= step ? '#0f0f0d' : G.muted,
              transition: 'all .3s',
            }}>
              {i < step ? '✓' : `0${i + 1}`}
            </div>
            <span style={{
              fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
              color: i <= step ? G.ink : G.muted,
              fontWeight: i === step ? 700 : 400,
            }}>{label}</span>
          </div>
          {i < total - 1 && (
            <div style={{ width: 48, height: 2, background: i < step ? G.gold : G.rule, margin: '0 12px', transition: 'background .3s' }} />
          )}
        </div>
      ))}
    </div>
  )
}

function PrincipeCard({ p, selected, onToggle }) {
  const active = selected
  return (
    <button onClick={onToggle} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      padding: '14px 16px',
      background: active ? G.goldBg : G.surface,
      border: `1.5px solid ${active ? G.gold : G.rule}`,
      transition: 'all .15s',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{
        width: 20, height: 20, flexShrink: 0, marginTop: 1,
        border: `2px solid ${active ? G.gold : G.rule}`,
        borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? G.gold : 'transparent',
        transition: 'all .15s',
      }}>
        {active && <span style={{ color: '#0f0f0d', fontSize: 12, fontWeight: 900 }}>✓</span>}
      </div>
      <div>
        <div style={{ fontFamily: G.display, fontSize: 15, fontWeight: 700, color: active ? G.ink : G.ink2, letterSpacing: '.02em', textTransform: 'uppercase', marginBottom: 3 }}>{p.label}</div>
        <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.03em', lineHeight: 1.5 }}>{p.desc}</div>
      </div>
    </button>
  )
}

function PeriodCard({ period, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div style={{ background: G.surface, border: `1px solid ${G.rule}`, borderLeft: `3px solid ${period.color}`, marginBottom: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, background: period.color + '15', border: `1px solid ${period.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: G.display, fontSize: 16, fontWeight: 800, color: period.color,
          }}>{period.weeks}</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: G.display, fontSize: 18, fontWeight: 700, textTransform: 'uppercase', color: G.ink, letterSpacing: '.02em' }}>{period.period}</div>
            <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.06em' }}>{period.dates} · {period.weeks} semaines</div>
          </div>
        </div>
        <span style={{ fontFamily: G.mono, fontSize: 14, color: G.muted, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>›</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${G.rule}` }}>
          <p style={{ fontFamily: G.body, fontSize: 14, color: G.muted, lineHeight: 1.6, margin: '14px 0 16px', fontStyle: 'italic' }}>{period.focus}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {period.themes.map((theme, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: i % 2 === 0 ? G.goldBg : 'transparent', borderRadius: 2 }}>
                <span style={{ fontFamily: G.mono, fontSize: 9, color: period.color, fontWeight: 700, width: 20, flexShrink: 0 }}>S{i + 1}</span>
                <span style={{ fontFamily: G.body, fontSize: 13, color: G.ink2 }}>{theme}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SeanceCard({ seance }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: G.surface, border: `1px solid ${G.rule}`, borderTop: `2px solid ${G.gold}` }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 4 }}>{seance.jour} · {seance.duree}</div>
          <div style={{ fontFamily: G.display, fontSize: 20, fontWeight: 700, textTransform: 'uppercase', color: G.ink, letterSpacing: '.02em' }}>{seance.objectif}</div>
          <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, marginTop: 4 }}>Principe : {seance.principe}</div>
        </div>
        <span style={{ fontFamily: G.mono, fontSize: 14, color: G.muted, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>›</span>
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${G.rule}` }}>
          {seance.blocs.map((bloc, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: i < seance.blocs.length - 1 ? `1px solid ${G.rule}` : 'none', background: i % 2 === 0 ? 'transparent' : G.goldBg }}>
              <div style={{ width: 48, flexShrink: 0 }}>
                <div style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 700, color: G.gold, letterSpacing: '.06em' }}>{bloc.duree}</div>
              </div>
              <div>
                <div style={{ fontFamily: G.display, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: G.ink, letterSpacing: '.02em', marginBottom: 3 }}>{bloc.nom}</div>
                <div style={{ fontFamily: G.body, fontSize: 13, color: G.muted, lineHeight: 1.55 }}>{bloc.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   APP PRINCIPALE
════════════════════════════════════════ */

export default function ProjetDeJeu() {
  const [step, setStep] = useState(0)
  const [selectedPrincipes, setSelectedPrincipes] = useState([])
  const [formation, setFormation] = useState('4-3-3')
  const [niveau, setNiveau] = useState('R2')
  const [categorie, setCategorie] = useState('Seniors')
  const [seancesParSemaine, setSeancesParSemaine] = useState(2)

  const togglePrincipe = (id) => {
    setSelectedPrincipes(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length >= 5 ? prev : [...prev, id]
    )
  }

  const allPrincipes = Object.values(PRINCIPES_CATALOGUE).flat()
  const selectedLabels = selectedPrincipes.map(id => allPrincipes.find(p => p.id === id)?.label).filter(Boolean)

  return (
    <DashboardLayout>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @media (max-width: 768px) {
          .proto-grid { grid-template-columns: 1fr !important; }
          .proto-header h1 { font-size: 36px !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${G.rule}` }}>
        <p style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 14, height: 1, background: T.gold, display: 'inline-block' }} />Planification
        </p>
        <h1 className="proto-header" style={{ fontFamily: T.display, fontSize: 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em' }}>
          <span style={{ color: T.ink }}>Projet</span><br />
          <span style={{ color: T.gold }}>de jeu.</span>
        </h1>
        <p style={{ fontFamily: G.mono, fontSize: 11, color: G.muted, marginTop: 12, letterSpacing: '.04em', lineHeight: 1.6 }}>
          Définissez votre identité tactique. Générez votre programmation annuelle et vos séances.
        </p>
      </div>

      {/* ── CONTENU ── */}
      <div style={{ maxWidth: 860 }}>
        <StepIndicator step={step} labels={['Identité', 'Programmation', 'Séances']} />

        {/* ═══ ÉTAPE 1 : IDENTITÉ ═══ */}
        {step === 0 && (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            {/* Config */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }} className="proto-grid">
              <div>
                <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 6 }}>Formation</label>
                <select value={formation} onChange={e => setFormation(e.target.value)} style={{ width: '100%', padding: '10px 12px', fontFamily: G.mono, fontSize: 12, border: `1px solid ${G.rule}`, background: G.surface, color: G.ink, outline: 'none', cursor: 'pointer' }}>
                  {['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '3-4-3', '4-1-4-1'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 6 }}>Niveau</label>
                <select value={niveau} onChange={e => setNiveau(e.target.value)} style={{ width: '100%', padding: '10px 12px', fontFamily: G.mono, fontSize: 12, border: `1px solid ${G.rule}`, background: G.surface, color: G.ink, outline: 'none', cursor: 'pointer' }}>
                  {['District', 'R3', 'R2', 'R1', 'N3', 'N2'].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 6 }}>Catégorie</label>
                <select value={categorie} onChange={e => setCategorie(e.target.value)} style={{ width: '100%', padding: '10px 12px', fontFamily: G.mono, fontSize: 12, border: `1px solid ${G.rule}`, background: G.surface, color: G.ink, outline: 'none', cursor: 'pointer' }}>
                  {['U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'Seniors'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted, display: 'block', marginBottom: 6 }}>Séances / semaine</label>
                <select value={seancesParSemaine} onChange={e => setSeancesParSemaine(+e.target.value)} style={{ width: '100%', padding: '10px 12px', fontFamily: G.mono, fontSize: 12, border: `1px solid ${G.rule}`, background: G.surface, color: G.ink, outline: 'none', cursor: 'pointer' }}>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Principes */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontFamily: G.display, fontSize: 28, fontWeight: 800, textTransform: 'uppercase', color: G.ink, letterSpacing: '.02em' }}>
                  Vos principes <span style={{ color: G.gold }}>de jeu</span>
                </h2>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, marginTop: 4, letterSpacing: '.04em' }}>Sélectionnez 3 à 5 principes fondamentaux</p>
              </div>
              <div style={{ fontFamily: G.display, fontSize: 28, color: selectedPrincipes.length >= 3 ? G.gold : G.muted }}>
                {selectedPrincipes.length}<span style={{ fontSize: 16, color: G.muted }}>/5</span>
              </div>
            </div>

            {Object.entries(PRINCIPES_CATALOGUE).map(([phase, principes]) => (
              <div key={phase} style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 1.5, background: G.gold }} />{phase}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {principes.map(p => (
                    <PrincipeCard key={p.id} p={p} selected={selectedPrincipes.includes(p.id)} onToggle={() => togglePrincipe(p.id)} />
                  ))}
                </div>
              </div>
            ))}

            {/* CTA */}
            <div style={{ position: 'sticky', bottom: 0, background: G.bg, borderTop: `1px solid ${G.rule}`, padding: '16px 0', marginTop: 20 }}>
              <button onClick={() => setStep(1)} disabled={selectedPrincipes.length < 3}
                style={{
                  width: '100%', padding: '16px', background: selectedPrincipes.length >= 3 ? G.gold : G.rule,
                  border: 'none', fontFamily: G.display, fontSize: 16, fontWeight: 700,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  color: selectedPrincipes.length >= 3 ? '#0f0f0d' : G.muted,
                  cursor: selectedPrincipes.length >= 3 ? 'pointer' : 'not-allowed',
                  transition: 'all .15s',
                }}>
                Générer ma programmation →
              </button>
              {selectedPrincipes.length < 3 && (
                <p style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, textAlign: 'center', marginTop: 8 }}>
                  Sélectionnez encore {3 - selectedPrincipes.length} principe{3 - selectedPrincipes.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ═══ ÉTAPE 2 : PROGRAMMATION ═══ */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            {/* Résumé identité */}
            <div style={{ background: G.dark, padding: '20px 24px', marginBottom: 28, borderLeft: `3px solid ${G.gold}` }}>
              <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 10 }}>Votre identité</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontFamily: G.mono, fontSize: 10, padding: '4px 10px', background: G.gold + '20', border: `1px solid ${G.gold}40`, color: G.gold }}>{formation}</span>
                <span style={{ fontFamily: G.mono, fontSize: 10, padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,242,235,0.6)' }}>{categorie} · {niveau}</span>
                <span style={{ fontFamily: G.mono, fontSize: 10, padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,242,235,0.6)' }}>{seancesParSemaine}x / sem</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedLabels.map(l => (
                  <span key={l} style={{ fontFamily: G.mono, fontSize: 9, padding: '3px 8px', background: 'rgba(245,242,235,0.06)', color: 'rgba(245,242,235,0.55)', letterSpacing: '.04em' }}>{l}</span>
                ))}
              </div>
            </div>

            <h2 style={{ fontFamily: G.display, fontSize: 28, fontWeight: 800, textTransform: 'uppercase', color: G.ink, letterSpacing: '.02em', marginBottom: 6 }}>
              Programmation <span style={{ color: G.gold }}>annuelle</span>
            </h2>
            <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.04em', marginBottom: 24 }}>
              41 semaines · 6 périodes · générée selon vos principes
            </p>

            {PROGRAMMATION.map((p, i) => <PeriodCard key={i} period={p} index={i} />)}

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${G.rule}`, fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>
                ← Modifier mes principes
              </button>
              <button onClick={() => setStep(2)} style={{ flex: 2, padding: '14px', background: G.gold, border: 'none', fontFamily: G.display, fontSize: 15, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#0f0f0d', cursor: 'pointer' }}>
                Voir les séances →
              </button>
            </div>
          </div>
        )}

        {/* ═══ ÉTAPE 3 : SÉANCES ═══ */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            <div style={{ background: G.goldBg, border: `1px solid ${G.goldBdr}`, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <p style={{ fontFamily: G.mono, fontSize: 10, color: G.ink2, letterSpacing: '.03em', lineHeight: 1.6 }}>
                Exemple de semaine type pour la période <strong>"Phase aller — Début"</strong>, thème <strong>"Pressing haut"</strong>. Chaque séance est liée à vos principes de jeu.
              </p>
            </div>

            <h2 style={{ fontFamily: G.display, fontSize: 28, fontWeight: 800, textTransform: 'uppercase', color: G.ink, letterSpacing: '.02em', marginBottom: 6 }}>
              Semaine <span style={{ color: G.gold }}>type</span>
            </h2>
            <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: '.04em', marginBottom: 24 }}>
              {seancesParSemaine} séance{seancesParSemaine > 1 ? 's' : ''} / semaine · adaptées {categorie} · niveau {niveau}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {SEANCES_EXEMPLE.slice(0, seancesParSemaine).map((s, i) => <SeanceCard key={i} seance={s} />)}
            </div>

            {/* Lien avec l'analyse (teaser) */}
            <div style={{ background: G.dark, padding: '28px 24px', marginTop: 32, borderLeft: `3px solid ${G.gold}`, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 8 }}>Bientôt</div>
                <h3 style={{ fontFamily: G.display, fontSize: 22, fontWeight: 700, textTransform: 'uppercase', color: '#f5f2eb', marginBottom: 8 }}>
                  Analyse vidéo <span style={{ color: G.gold }}>→</span> Séances
                </h3>
                <p style={{ fontFamily: G.mono, fontSize: 10, color: 'rgba(245,242,235,0.4)', lineHeight: 1.6, letterSpacing: '.03em' }}>
                  Après chaque match analysé, l'IA identifiera les axes de progression et ajustera automatiquement vos séances de la semaine.
                </p>
              </div>
              <div style={{ width: 80, height: 80, background: G.gold + '15', border: `1px solid ${G.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: G.display, fontSize: 32, color: G.gold }}>IA</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${G.rule}`, fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, cursor: 'pointer' }}>
                ← Programmation
              </button>
              <button onClick={() => { setStep(0); setSelectedPrincipes([]) }} style={{ flex: 2, padding: '14px', background: G.gold, border: 'none', fontFamily: G.display, fontSize: 15, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#0f0f0d', cursor: 'pointer' }}>
                Recommencer
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
