/**
 * ClubDashboard.jsx
 * Vue directeur sportif — Vision club, projet de jeu configurable, signaux joueurs
 * Route : /dashboard/club
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, TrendingUp, TrendingDown, ArrowRight, Check, X, Edit2, Save, Plus, Minus, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap');`

/* ─── Palette claire — cohérente DashboardLayout ── */
const G = {
  cream:   '#faf8f4',
  white:   '#ffffff',
  paper:   '#f5f2eb',
  ink:     '#0f0f0d',
  ink2:    '#2a2a26',
  muted:   'rgba(15,15,13,0.40)',
  muted2:  'rgba(15,15,13,0.60)',
  rule:    'rgba(15,15,13,0.09)',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  goldBg:  'rgba(201,162,39,0.07)',
  goldBdr: 'rgba(201,162,39,0.25)',
  green:   '#16a34a',
  greenBg: 'rgba(22,163,74,0.08)',
  red:     '#dc2626',
  redBg:   'rgba(220,38,38,0.07)',
  orange:  '#d97706',
  orangeBg:'rgba(217,119,6,0.08)',
  blue:    '#2563eb',
  blueBg:  'rgba(37,99,235,0.07)',
  mono:    "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

/* ─── Données mockées — 3 équipes ───────────────── */
const MOCK_TEAMS = [
  {
    id: 'a',
    name: 'Équipe A',
    category: 'N3',
    color: G.gold,
    lastMatch: { opponent: 'SC Bastia', score: '2-1', result: 'win', date: '2026-02-23' },
    form: ['win','win','draw','loss','win'],
    stats: { possession: 58, passes: 87, pressing: 72, sprints: 68 },
    matchesPlayed: 18,
    players: 22,
    trend: 'up',
  },
  {
    id: 'b',
    name: 'Équipe B',
    category: 'Régional 1',
    color: G.blue,
    lastMatch: { opponent: 'AC Ajaccio B', score: '1-1', result: 'draw', date: '2026-02-22' },
    form: ['win','draw','draw','win','loss'],
    stats: { possession: 51, passes: 82, pressing: 61, sprints: 74 },
    matchesPlayed: 16,
    players: 20,
    trend: 'stable',
  },
  {
    id: 'u19',
    name: 'U19',
    category: 'U19 Régional',
    color: '#8b5cf6',
    lastMatch: { opponent: 'AS Porto-Vecchio', score: '3-0', result: 'win', date: '2026-02-22' },
    form: ['win','win','win','draw','win'],
    stats: { possession: 62, passes: 84, pressing: 78, sprints: 82 },
    matchesPlayed: 14,
    players: 18,
    trend: 'up',
  },
]

/* ─── Signaux joueurs mockés ─────────────────────── */
const MOCK_PLAYERS = [
  { id: 1, name: 'Dangoumau N.', team: 'U19',     pos: 'ATT', trend: 'up',   delta: '+1.4', rating: 8.7, reason: '5 buts en 4 matchs' },
  { id: 2, name: 'Finidori P.',  team: 'Équipe A', pos: 'MIL', trend: 'up',   delta: '+0.9', rating: 8.2, reason: 'Progression passes clés' },
  { id: 3, name: 'Kheroua N.',   team: 'Équipe A', pos: 'MIL', trend: 'down', delta: '-0.8', rating: 6.1, reason: '3 matchs sous 6.5' },
  { id: 4, name: 'Bonalair M.',  team: 'Équipe B', pos: 'DEF', trend: 'down', delta: '-1.1', rating: 5.8, reason: 'Duels perdus en hausse' },
]

/* ─── Valeurs par défaut projet de jeu ──────────── */
const DEFAULT_GAME_PLAN = [
  { id: 'possession', label: 'Possession cible',   unit: '%', value: 55, min: 30, max: 80 },
  { id: 'passes',     label: 'Passes réussies',    unit: '%', value: 82, min: 60, max: 95 },
  { id: 'pressing',   label: 'Pressing haut',      unit: '%', value: 70, min: 40, max: 90 },
  { id: 'sprints',    label: 'Intensité (sprints)', unit: '%', value: 65, min: 40, max: 90 },
]

function FormDot({ result }) {
  const c = result === 'win' ? G.green : result === 'draw' ? G.orange : G.red
  return (
    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} title={result} />
  )
}

function ResultBadge({ result, score }) {
  const cfg = {
    win:  { label: 'V', bg: G.greenBg,  color: G.green  },
    draw: { label: 'N', bg: G.orangeBg, color: G.orange },
    loss: { label: 'D', bg: G.redBg,    color: G.red    },
  }[result] || { label: '?', bg: G.paper, color: G.muted }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 700, letterSpacing: '.08em', padding: '3px 8px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>{cfg.label}</span>
      <span style={{ fontFamily: G.mono, fontSize: 11, fontWeight: 700, color: G.ink }}>{score}</span>
    </div>
  )
}

function ProgressBar({ value, target, color }) {
  const pct    = Math.min(value, 100)
  const ok     = value >= target
  const barClr = ok ? G.green : value >= target - 8 ? G.orange : G.red
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: 6, background: G.rule, borderRadius: 99, overflow: 'visible', position: 'relative' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barClr, borderRadius: 99, transition: 'width .8s ease' }} />
        {/* Marqueur cible */}
        <div style={{ position: 'absolute', top: -3, left: `${target}%`, width: 2, height: 12, background: G.ink2, borderRadius: 1, transform: 'translateX(-50%)' }} />
      </div>
    </div>
  )
}

export default function ClubDashboard() {
  const { user }       = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [editingPlan, setEditingPlan] = useState(false)
  const [gamePlan, setGamePlan]       = useState(() => {
    try {
      const saved = localStorage.getItem('insightball_gameplan')
      return saved ? JSON.parse(saved) : DEFAULT_GAME_PLAN
    } catch { return DEFAULT_GAME_PLAN }
  })
  const [draftPlan, setDraftPlan] = useState(gamePlan)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const saveGamePlan = () => {
    setGamePlan(draftPlan)
    localStorage.setItem('insightball_gameplan', JSON.stringify(draftPlan))
    setEditingPlan(false)
  }

  const cancelEdit = () => {
    setDraftPlan(gamePlan)
    setEditingPlan(false)
  }

  const adjustValue = (id, delta) => {
    setDraftPlan(prev => prev.map(p =>
      p.id === id ? { ...p, value: Math.min(p.max, Math.max(p.min, p.value + delta)) } : p
    ))
  }

  const rising  = MOCK_PLAYERS.filter(p => p.trend === 'up')
  const falling = MOCK_PLAYERS.filter(p => p.trend === 'down')

  return (
    <DashboardLayout>
      <style>{`${FONTS} * { box-sizing: border-box; }`}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 28, paddingBottom: 22, borderBottom: `1px solid ${G.rule}` }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />Vue Club
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: G.display, fontSize: 'clamp(28px,3vw,44px)', textTransform: 'uppercase', lineHeight: .9, color: G.ink, margin: 0 }}>
              Vision<br /><span style={{ color: G.gold }}>Directeur Sportif.</span>
            </h1>
            <p style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.1em', marginTop: 8 }}>
              Saison 2025/26 · Semaine du 23 fév
            </p>
          </div>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, background: G.paper, border: `1px solid ${G.rule}`, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: G.green }} />
            {MOCK_TEAMS.length} équipes actives
          </div>
        </div>
      </div>

      {/* ══ SECTION 1 — SANTÉ DU CLUB ══════════════════ */}
      <div style={{ marginBottom: 2 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 1, background: G.muted, display: 'inline-block' }} />Santé du club cette semaine
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 1, background: G.rule }}>
          {MOCK_TEAMS.map(team => (
            <div key={team.id} style={{ background: G.white, padding: '22px 20px', borderTop: `3px solid ${team.color}` }}>

              {/* Header équipe */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: G.display, fontSize: 20, textTransform: 'uppercase', color: G.ink, lineHeight: 1, marginBottom: 3 }}>{team.name}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>{team.category}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {team.trend === 'up'
                    ? <TrendingUp size={14} color={G.green} />
                    : team.trend === 'down'
                      ? <TrendingDown size={14} color={G.red} />
                      : <span style={{ fontFamily: G.mono, fontSize: 10, color: G.muted }}>→</span>
                  }
                </div>
              </div>

              {/* Dernier match */}
              <div style={{ padding: '10px 12px', background: G.paper, border: `1px solid ${G.rule}`, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, marginBottom: 4 }}>Dernier match</div>
                  <div style={{ fontFamily: G.mono, fontSize: 11, color: G.ink, fontWeight: 600 }}>vs {team.lastMatch.opponent}</div>
                </div>
                <ResultBadge result={team.lastMatch.result} score={team.lastMatch.score} />
              </div>

              {/* Forme 5 matchs */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, marginBottom: 8 }}>Forme (5 derniers)</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {team.form.map((r, i) => <FormDot key={i} result={r} />)}
                </div>
              </div>

              {/* Stats clés */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Possession', value: `${team.stats.possession}%` },
                  { label: 'Passes',     value: `${team.stats.passes}%`     },
                  { label: 'Pressing',   value: `${team.stats.pressing}%`   },
                  { label: 'Intensité',  value: `${team.stats.sprints}%`    },
                ].map(s => (
                  <div key={s.label} style={{ padding: '8px 10px', background: G.cream, border: `1px solid ${G.rule}` }}>
                    <div style={{ fontFamily: G.mono, fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontFamily: G.display, fontSize: 18, color: team.color, lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Lien analyse */}
              <Link to="/dashboard/matches" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted, textDecoration: 'none', transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = team.color}
                onMouseLeave={e => e.currentTarget.style.color = G.muted}
              >
                Voir les matchs <ArrowRight size={10} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 2 — PROJET DE JEU ══════════════════ */}
      <div style={{ marginTop: 24, marginBottom: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 14, height: 1, background: G.muted, display: 'inline-block' }} />Projet de jeu
          </div>
          {!editingPlan ? (
            <button onClick={() => { setDraftPlan(gamePlan); setEditingPlan(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, background: 'none', border: `1px solid ${G.rule}`, padding: '5px 12px', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = G.gold; e.currentTarget.style.borderColor = G.goldBdr }}
              onMouseLeave={e => { e.currentTarget.style.color = G.muted; e.currentTarget.style.borderColor = G.rule }}
            >
              <Edit2 size={10} /> Modifier les cibles
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveGamePlan} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', background: G.gold, color: G.ink, border: 'none', padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}>
                <Save size={10} /> Enregistrer
              </button>
              <button onClick={cancelEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', background: 'none', color: G.muted, border: `1px solid ${G.rule}`, padding: '6px 12px', cursor: 'pointer' }}>
                <X size={10} /> Annuler
              </button>
            </div>
          )}
        </div>

        <div style={{ background: G.white, border: `1px solid ${G.rule}`, borderTop: `3px solid ${G.gold}`, padding: '20px 22px' }}>

          {/* Description */}
          <p style={{ fontFamily: G.mono, fontSize: 10, color: G.muted2, lineHeight: 1.7, marginBottom: 20, maxWidth: 600 }}>
            Définissez vos indicateurs cibles. InsightBall compare chaque match à ces objectifs et vous dit si vos équipes jouent bien selon votre projet.
          </p>

          {/* Indicateurs */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 1, background: G.rule, marginBottom: 20 }}>
            {(editingPlan ? draftPlan : gamePlan).map(kpi => {
              // Moyenne toutes équipes pour cet indicateur
              const key = kpi.id === 'passes' ? 'passes' : kpi.id === 'pressing' ? 'pressing' : kpi.id === 'sprints' ? 'sprints' : 'possession'
              const avg = Math.round(MOCK_TEAMS.reduce((s, t) => s + (t.stats[key] || 0), 0) / MOCK_TEAMS.length)
              const ok  = avg >= kpi.value

              return (
                <div key={kpi.id} style={{ background: G.white, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, marginBottom: 4 }}>{kpi.label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontFamily: G.display, fontSize: 28, lineHeight: 1, color: ok ? G.green : G.red }}>{avg}{kpi.unit}</span>
                        <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted }}>/ cible {kpi.value}{kpi.unit}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ok
                        ? <div style={{ width: 28, height: 28, background: G.greenBg, border: `1px solid ${G.green}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} color={G.green} /></div>
                        : <div style={{ width: 28, height: 28, background: G.redBg, border: `1px solid ${G.red}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} color={G.red} /></div>
                      }
                      {editingPlan && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <button onClick={() => adjustValue(kpi.id, 1)} style={{ width: 22, height: 22, background: G.paper, border: `1px solid ${G.rule}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronUp size={11} color={G.ink2} />
                          </button>
                          <button onClick={() => adjustValue(kpi.id, -1)} style={{ width: 22, height: 22, background: G.paper, border: `1px solid ${G.rule}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronDown size={11} color={G.ink2} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <ProgressBar value={avg} target={kpi.value} />

                  {/* Par équipe */}
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {MOCK_TEAMS.map(team => {
                      const v  = team.stats[key] || 0
                      const ok = v >= kpi.value
                      return (
                        <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: team.color, flexShrink: 0 }} />
                          <div style={{ fontFamily: G.mono, fontSize: 8, color: G.muted, width: 70, letterSpacing: '.06em' }}>{team.name}</div>
                          <div style={{ flex: 1, height: 4, background: G.rule, borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${v}%`, background: ok ? team.color : G.red, borderRadius: 99 }} />
                          </div>
                          <div style={{ fontFamily: G.mono, fontSize: 9, color: ok ? G.green : G.red, width: 32, textAlign: 'right', fontWeight: 700 }}>{v}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Score global projet de jeu */}
          {(() => {
            const total = gamePlan.length
            const passed = gamePlan.filter(kpi => {
              const key = kpi.id === 'passes' ? 'passes' : kpi.id === 'pressing' ? 'pressing' : kpi.id === 'sprints' ? 'sprints' : 'possession'
              const avg = Math.round(MOCK_TEAMS.reduce((s, t) => s + (t.stats[key] || 0), 0) / MOCK_TEAMS.length)
              return avg >= kpi.value
            }).length
            const score = Math.round((passed/total)*100)
            const color = score >= 75 ? G.green : score >= 50 ? G.orange : G.red
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 18px', background: G.paper, border: `1px solid ${G.rule}` }}>
                <div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted, marginBottom: 4 }}>Score projet de jeu</div>
                  <div style={{ fontFamily: G.display, fontSize: 36, lineHeight: 1, color }}>{score}%</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, background: G.rule, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, marginTop: 6 }}>
                    {passed}/{total} indicateurs atteints cette semaine
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ══ SECTION 3 — SIGNAUX JOUEURS ════════════════ */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 1, background: G.muted, display: 'inline-block' }} />Signaux joueurs ce mois
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 1, background: G.rule }}>

          {/* En progression */}
          <div style={{ background: G.white, borderTop: `3px solid ${G.green}` }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${G.rule}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={13} color={G.green} />
              <span style={{ fontFamily: G.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: G.ink }}>En progression</span>
            </div>
            {rising.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < rising.length-1 ? `1px solid ${G.rule}` : 'none' }}>
                <div style={{ width: 34, height: 34, background: G.greenBg, border: `1px solid ${G.green}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: G.display, fontSize: 12, color: G.green }}>{p.name[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 11, color: G.ink, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', color: G.muted, marginTop: 2 }}>
                    {p.team} · {p.pos} · {p.reason}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: G.display, fontSize: 22, color: G.green, lineHeight: 1 }}>{p.rating}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: G.green }}>{p.delta}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Signaux d'alerte */}
          <div style={{ background: G.white, borderTop: `3px solid ${G.red}` }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${G.rule}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={13} color={G.red} />
              <span style={{ fontFamily: G.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: G.ink }}>Signaux d'alerte</span>
            </div>
            {falling.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < falling.length-1 ? `1px solid ${G.rule}` : 'none' }}>
                <div style={{ width: 34, height: 34, background: G.redBg, border: `1px solid ${G.red}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: G.display, fontSize: 12, color: G.red }}>{p.name[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 11, color: G.ink, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', color: G.muted, marginTop: 2 }}>
                    {p.team} · {p.pos} · {p.reason}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: G.display, fontSize: 22, color: G.red, lineHeight: 1 }}>{p.rating}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 9, color: G.red }}>{p.delta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, padding: '14px 18px', background: G.paper, border: `1px solid ${G.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: G.mono, fontSize: 9, color: G.muted, letterSpacing: '.08em' }}>
          Données basées sur les matchs analysés · Mise à jour après chaque analyse
        </span>
        <Link to="/dashboard/matches" style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
          onMouseEnter={e => e.currentTarget.style.color = G.goldD}
          onMouseLeave={e => e.currentTarget.style.color = G.gold}
        >
          Uploader un match <ArrowRight size={10} />
        </Link>
      </div>

    </DashboardLayout>
  )
}
