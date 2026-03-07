/**
 * CalendrierSaison.jsx — Calendrier annuel de programmation tactique
 * Vue mensuelle, drag & drop, duplication, thèmes custom
 * Intégré dans le flux ProjetDeJeu
 */
import { useState, useMemo, useCallback, useRef } from 'react'
import { T } from '../theme'

const G = {
  bg:'#f5f2eb',surface:'#ffffff',dark:'#0a0908',
  ink:'#1a1916',ink2:'#2d2c2a',muted:'rgba(26,25,22,0.45)',
  gold:'#c9a227',goldBg:'rgba(201,162,39,0.07)',goldBdr:'rgba(201,162,39,0.22)',
  rule:'rgba(26,25,22,0.09)',
  green:'#16a34a',red:'#dc2626',blue:'#2563eb',orange:'#d97706',purple:'#8b5cf6',
  mono:"'JetBrains Mono',monospace",display:"'Anton',sans-serif",
}

const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS_COURTS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

// Thèmes prédéfinis avec couleurs
const THEMES_PREDEFINIS = [
  {id:'pressing',label:'Pressing haut',color:G.red,short:'PRESS'},
  {id:'construction',label:'Construction GK',color:G.blue,short:'CONST'},
  {id:'transition_off',label:'Transition OFF',color:G.gold,short:'TR.OFF'},
  {id:'transition_def',label:'Transition DEF',color:G.purple,short:'TR.DEF'},
  {id:'entre_lignes',label:'Entre les lignes',color:'#0ea5e9',short:'INTER'},
  {id:'cote_fort',label:'Côté fort / triangles',color:G.orange,short:'CÔTÉ'},
  {id:'finition',label:'Finition',color:'#ec4899',short:'FINI'},
  {id:'bloc',label:'Bloc défensif',color:'#64748b',short:'BLOC'},
  {id:'cpa_off',label:'CPA offensifs',color:'#14b8a6',short:'CPA'},
  {id:'physique',label:'Physique intégré',color:G.green,short:'PHYS'},
  {id:'recuperation',label:'Récupération',color:'#94a3b8',short:'RÉCUP'},
  {id:'match',label:'Match',color:'#1e293b',short:'MATCH'},
]

// ═══ Helpers dates ═══
function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function weekId(d) {
  const m = getMonday(d)
  return `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,'0')}-${String(m.getDate()).padStart(2,'0')}`
}

function formatDateShort(d) {
  return `${d.getDate()} ${MOIS_FR[d.getMonth()].slice(0,3).toLowerCase()}.`
}

// ═══ Générer les semaines de la saison ═══
function generateWeeks(startDate, totalWeeks) {
  const weeks = []
  let current = getMonday(new Date(startDate))
  for (let i = 0; i < totalWeeks; i++) {
    weeks.push({
      id: weekId(current),
      start: new Date(current),
      end: addDays(current, 6),
      weekNum: i + 1,
    })
    current = addDays(current, 7)
  }
  return weeks
}

// ═══ Grouper les semaines par mois ═══
function groupByMonth(weeks) {
  const months = {}
  weeks.forEach(w => {
    const key = `${w.start.getFullYear()}-${String(w.start.getMonth()+1).padStart(2,'0')}`
    if (!months[key]) {
      months[key] = {
        label: `${MOIS_FR[w.start.getMonth()]} ${w.start.getFullYear()}`,
        month: w.start.getMonth(),
        year: w.start.getFullYear(),
        weeks: [],
      }
    }
    months[key].weeks.push(w)
  })
  return Object.values(months)
}

// ═══ COMPOSANT PRINCIPAL ═══
export default function CalendrierSaison({ startDate, totalWeeks = 41, weekThemes, onUpdateThemes, onSelectWeek }) {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0)
  const [dragItem, setDragItem] = useState(null)
  const [showAddModal, setShowAddModal] = useState(null) // weekId ou null
  const [showDuplicateModal, setShowDuplicateModal] = useState(null) // {weekId, theme}
  const [customThemeInput, setCustomThemeInput] = useState('')
  const [contextMenu, setContextMenu] = useState(null) // {weekId, x, y}

  const weeks = useMemo(() => generateWeeks(startDate, totalWeeks), [startDate, totalWeeks])
  const months = useMemo(() => groupByMonth(weeks), [weeks])

  // Naviguer entre les mois
  const prevMonth = () => setCurrentMonthIdx(i => Math.max(0, i - 1))
  const nextMonth = () => setCurrentMonthIdx(i => Math.min(months.length - 1, i + 1))
  const currentMonth = months[currentMonthIdx] || months[0]

  // Thème d'une semaine
  const getTheme = (wId) => {
    const t = weekThemes?.[wId]
    if (!t) return null
    const predef = THEMES_PREDEFINIS.find(p => p.id === t.id)
    if (predef) return { ...predef, ...t }
    return { id: 'custom', label: t.label || t.id, color: t.color || G.gold, short: (t.label || '').slice(0, 5).toUpperCase(), ...t }
  }

  // Drag & drop
  const handleDragStart = (weekId, theme) => {
    setDragItem({ weekId, theme })
  }
  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.style.background = G.goldBg
  }
  const handleDragLeave = (e) => {
    e.currentTarget.style.background = ''
  }
  const handleDrop = (targetWeekId) => {
    if (dragItem && dragItem.weekId !== targetWeekId) {
      const newThemes = { ...weekThemes }
      // Déplacer : supprimer de l'ancienne semaine, ajouter à la nouvelle
      const theme = newThemes[dragItem.weekId]
      delete newThemes[dragItem.weekId]
      newThemes[targetWeekId] = theme
      onUpdateThemes(newThemes)
    }
    setDragItem(null)
  }

  // Ajouter un thème
  const addTheme = (weekId, themeId) => {
    const predef = THEMES_PREDEFINIS.find(p => p.id === themeId)
    const newThemes = { ...weekThemes }
    if (predef) {
      newThemes[weekId] = { id: predef.id, label: predef.label, color: predef.color }
    }
    onUpdateThemes(newThemes)
    setShowAddModal(null)
  }

  // Ajouter thème custom
  const addCustomTheme = (weekId) => {
    if (!customThemeInput.trim()) return
    const newThemes = { ...weekThemes }
    newThemes[weekId] = { id: 'custom', label: customThemeInput.trim(), color: G.gold }
    onUpdateThemes(newThemes)
    setCustomThemeInput('')
    setShowAddModal(null)
  }

  // Supprimer un thème
  const removeTheme = (weekId) => {
    const newThemes = { ...weekThemes }
    delete newThemes[weekId]
    onUpdateThemes(newThemes)
    setContextMenu(null)
  }

  // Dupliquer sur X semaines
  const duplicateTheme = (fromWeekId, numWeeks) => {
    const fromIdx = weeks.findIndex(w => w.id === fromWeekId)
    if (fromIdx === -1) return
    const theme = weekThemes[fromWeekId]
    if (!theme) return
    const newThemes = { ...weekThemes }
    for (let i = 1; i <= numWeeks; i++) {
      if (fromIdx + i < weeks.length) {
        newThemes[weeks[fromIdx + i].id] = { ...theme }
      }
    }
    onUpdateThemes(newThemes)
    setShowDuplicateModal(null)
    setContextMenu(null)
  }

  // Trouver le numéro de semaine dans la saison
  const getSeasonWeekNum = (wId) => {
    const idx = weeks.findIndex(w => w.id === wId)
    return idx >= 0 ? idx + 1 : '?'
  }

  // Aujourd'hui
  const today = new Date()
  const todayWeekId = weekId(today)

  return (
    <div>
      <style>{`
        @keyframes fadeScale { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        .cal-cell:hover { background: ${G.goldBg} !important; }
        .theme-pill { cursor: grab; transition: transform 0.1s, box-shadow 0.1s; }
        .theme-pill:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .theme-pill:active { cursor: grabbing; }
      `}</style>

      {/* ── Header navigation mois ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevMonth} disabled={currentMonthIdx === 0}
          style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${currentMonthIdx === 0 ? G.rule : G.goldBdr}`, fontFamily: G.mono, fontSize: 10, color: currentMonthIdx === 0 ? G.muted : G.gold, cursor: currentMonthIdx === 0 ? 'not-allowed' : 'pointer' }}>
          ← Précédent
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: G.ink }}>
            {currentMonth?.label}
          </div>
          <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted, letterSpacing: '.1em' }}>
            {currentMonth?.weeks.length} semaines · S{getSeasonWeekNum(currentMonth?.weeks[0]?.id)} à S{getSeasonWeekNum(currentMonth?.weeks[currentMonth?.weeks.length - 1]?.id)}
          </div>
        </div>
        <button onClick={nextMonth} disabled={currentMonthIdx === months.length - 1}
          style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${currentMonthIdx === months.length - 1 ? G.rule : G.goldBdr}`, fontFamily: G.mono, fontSize: 10, color: currentMonthIdx === months.length - 1 ? G.muted : G.gold, cursor: currentMonthIdx === months.length - 1 ? 'not-allowed' : 'pointer' }}>
          Suivant →
        </button>
      </div>

      {/* ── Mini-nav mois (dots) ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
        {months.map((m, i) => (
          <button key={i} onClick={() => setCurrentMonthIdx(i)}
            style={{
              width: i === currentMonthIdx ? 20 : 8, height: 8, borderRadius: 4,
              background: i === currentMonthIdx ? G.gold : G.rule,
              border: 'none', cursor: 'pointer', transition: 'all .15s',
              padding: 0,
            }}
            title={m.label}
          />
        ))}
      </div>

      {/* ── Grille calendrier ── */}
      <div style={{ background: G.surface, border: `1px solid ${G.rule}`, borderTop: `2px solid ${G.gold}` }}>
        {/* Header jours */}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', borderBottom: `1px solid ${G.rule}` }}>
          <div style={{ padding: '8px 6px', fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, textAlign: 'center' }}>SEM.</div>
          <div style={{ padding: '8px 6px', fontFamily: G.mono, fontSize: 8, color: G.muted, letterSpacing: '.06em' }}>THÈME DE LA SEMAINE</div>
        </div>

        {/* Semaines */}
        {currentMonth?.weeks.map(week => {
          const theme = getTheme(week.id)
          const isToday = week.id === todayWeekId
          const seasonWeek = getSeasonWeekNum(week.id)

          return (
            <div key={week.id}
              className="cal-cell"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(week.id)}
              style={{
                display: 'grid', gridTemplateColumns: '50px 1fr',
                borderBottom: `1px solid ${G.rule}`,
                background: isToday ? 'rgba(201,162,39,0.04)' : 'transparent',
                borderLeft: isToday ? `3px solid ${G.gold}` : '3px solid transparent',
                minHeight: 52,
                transition: 'background .1s',
              }}>
              {/* Numéro semaine */}
              <div style={{
                padding: '8px 4px', textAlign: 'center',
                borderRight: `1px solid ${G.rule}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontFamily: G.display, fontSize: 16, color: isToday ? G.gold : G.ink }}>S{seasonWeek}</div>
                <div style={{ fontFamily: G.mono, fontSize: 7, color: G.muted, marginTop: 1 }}>
                  {formatDateShort(week.start)}
                </div>
              </div>

              {/* Contenu semaine */}
              <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {theme ? (
                  <>
                    {/* Pill thème — draggable */}
                    <div
                      className="theme-pill"
                      draggable
                      onDragStart={() => handleDragStart(week.id, theme)}
                      onClick={() => onSelectWeek && onSelectWeek(week.id, theme.id)}
                      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ weekId: week.id, x: e.clientX, y: e.clientY }) }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 10px',
                        background: theme.color + '15',
                        border: `1px solid ${theme.color}35`,
                        borderLeft: `3px solid ${theme.color}`,
                      }}>
                      <span style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.08em', textTransform: 'uppercase', color: theme.color, fontWeight: 700 }}>
                        {theme.short || theme.label?.slice(0, 5).toUpperCase()}
                      </span>
                      <span style={{ fontFamily: G.mono, fontSize: 9, color: G.ink2 }}>{theme.label}</span>
                    </div>

                    {/* Boutons actions */}
                    <div style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
                      <button onClick={() => onSelectWeek && onSelectWeek(week.id, theme.id)}
                        title="Générer la séance"
                        style={{ padding: '3px 7px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, fontFamily: G.mono, fontSize: 7, color: G.gold, cursor: 'pointer' }}>
                        ▶ Séance
                      </button>
                      <button onClick={() => setShowDuplicateModal({ weekId: week.id, theme })}
                        title="Dupliquer"
                        style={{ padding: '3px 6px', background: 'transparent', border: `1px solid ${G.rule}`, fontFamily: G.mono, fontSize: 8, color: G.muted, cursor: 'pointer' }}>
                        ⊕
                      </button>
                      <button onClick={() => removeTheme(week.id)}
                        title="Supprimer"
                        style={{ padding: '3px 6px', background: 'transparent', border: `1px solid ${G.rule}`, fontFamily: G.mono, fontSize: 8, color: G.muted, cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </>
                ) : (
                  /* Semaine vide — ajouter */
                  <button onClick={() => setShowAddModal(week.id)}
                    style={{
                      padding: '6px 12px', background: 'transparent',
                      border: `1px dashed ${G.rule}`, fontFamily: G.mono,
                      fontSize: 8, color: G.muted, cursor: 'pointer',
                      letterSpacing: '.06em', transition: 'all .12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = G.goldBdr; e.currentTarget.style.color = G.gold }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = G.rule; e.currentTarget.style.color = G.muted }}>
                    + Ajouter un thème
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Légende thèmes ── */}
      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {THEMES_PREDEFINIS.map(t => (
          <span key={t.id} style={{
            fontFamily: G.mono, fontSize: 7, letterSpacing: '.06em',
            padding: '2px 6px', background: t.color + '12', color: t.color,
            border: `1px solid ${t.color}25`,
          }}>{t.label}</span>
        ))}
      </div>

      {/* ── Modal ajouter thème ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setShowAddModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: G.surface, border: `1px solid ${G.rule}`, borderTop: `2px solid ${G.gold}`, width: '100%', maxWidth: 400, maxHeight: '80vh', overflow: 'auto', animation: 'fadeScale .2s ease' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${G.rule}` }}>
              <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 3 }}>Semaine S{getSeasonWeekNum(showAddModal)}</div>
              <div style={{ fontFamily: G.display, fontSize: 18, textTransform: 'uppercase', color: G.ink }}>Choisir un thème</div>
            </div>
            <div style={{ padding: '10px 12px' }}>
              {/* Thèmes prédéfinis */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {THEMES_PREDEFINIS.map(t => (
                  <button key={t.id} onClick={() => addTheme(showAddModal, t.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 10px',
                      background: 'transparent', border: `1px solid ${G.rule}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'all .1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = t.color + '10'; e.currentTarget.style.borderColor = t.color + '40' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = G.rule }}>
                    <span style={{ width: 10, height: 10, background: t.color, borderRadius: 2, flexShrink: 0 }} />
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.ink }}>{t.label}</span>
                  </button>
                ))}
              </div>
              {/* Thème custom */}
              <div style={{ marginTop: 10, borderTop: `1px solid ${G.rule}`, paddingTop: 10 }}>
                <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, marginBottom: 5 }}>Thème personnalisé</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="text" value={customThemeInput} onChange={e => setCustomThemeInput(e.target.value)}
                    placeholder="Ex: Jeu aérien, Gestion score..."
                    style={{ flex: 1, padding: '7px 10px', fontFamily: G.mono, fontSize: 10, border: `1px solid ${G.rule}`, background: G.bg, color: G.ink, outline: 'none', boxSizing: 'border-box' }}
                    onKeyDown={e => e.key === 'Enter' && addCustomTheme(showAddModal)} />
                  <button onClick={() => addCustomTheme(showAddModal)}
                    style={{ padding: '7px 12px', background: G.gold, border: 'none', fontFamily: G.mono, fontSize: 8, color: '#0f0f0d', fontWeight: 700, cursor: 'pointer' }}>
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal dupliquer ── */}
      {showDuplicateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setShowDuplicateModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: G.surface, border: `1px solid ${G.rule}`, borderTop: `2px solid ${G.gold}`, width: '100%', maxWidth: 320, animation: 'fadeScale .2s ease' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${G.rule}` }}>
              <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: G.gold, marginBottom: 3 }}>Dupliquer</div>
              <div style={{ fontFamily: G.display, fontSize: 16, textTransform: 'uppercase', color: G.ink }}>{showDuplicateModal.theme?.label}</div>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, marginBottom: 4 }}>Reproduire ce thème sur les semaines suivantes :</p>
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => duplicateTheme(showDuplicateModal.weekId, n)}
                  style={{
                    width: '100%', padding: '8px 12px', background: 'transparent',
                    border: `1px solid ${G.rule}`, fontFamily: G.mono, fontSize: 10,
                    color: G.ink, cursor: 'pointer', textAlign: 'left',
                    transition: 'all .1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = G.goldBg; e.currentTarget.style.borderColor = G.goldBdr }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = G.rule }}>
                  + {n} semaine{n > 1 ? 's' : ''} → S{getSeasonWeekNum(showDuplicateModal.weekId)} à S{getSeasonWeekNum(showDuplicateModal.weekId) + n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
