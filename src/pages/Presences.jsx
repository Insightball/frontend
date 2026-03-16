import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import { T } from '../theme'

/* ─── Config API ─────────────────────────────── */
const _base = import.meta.env.VITE_API_URL || ''
const API = _base.endsWith('/api') ? _base : `${_base}/api`

/* ─── Helpers ────────────────────────────────── */
const safeJson = async (res) => {
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

const STATUTS = [
  { value: 'present',  label: 'Présent',  color: T.green,  bg: T.greenBg },
  { value: 'absent',   label: 'Absent',   color: T.red,    bg: T.redBg },
  { value: 'excused',  label: 'Excusé',   color: T.gold,   bg: T.goldBg },
  { value: 'injured',  label: 'Blessé',   color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
]

const MOTIFS = [
  { value: 'non_justifiee', label: 'Non justifiée' },
  { value: 'scolaire',      label: 'Scolaire' },
  { value: 'blessure',      label: 'Blessure' },
  { value: 'familiale',     label: 'Familiale' },
  { value: 'selection',     label: 'Sélection' },
  { value: 'autre',         label: 'Autre' },
]

const THEMES_SEANCE = [
  'pressing', 'construction', 'transition_off', 'transition_def',
  'entre_lignes', 'cote_fort', 'finition', 'bloc', 'cpa_off', 'physique',
]

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const today = () => {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

/* ═══════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════ */
export default function Presences() {
  const { user, token } = useAuth()
  const [view, setView] = useState('pointage') // pointage | calendrier | classement
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pointage
  const [players, setPlayers] = useState([])
  const [sessionDate, setSessionDate] = useState(today())
  const [sessionTheme, setSessionTheme] = useState('')
  const [sessionType, setSessionType] = useState('entrainement')
  const [attendance, setAttendance] = useState({}) // { player_id: { status, absence_reason } }
  const [currentSession, setCurrentSession] = useState(null)
  const [saved, setSaved] = useState(false)

  // Calendrier
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calDays, setCalDays] = useState([])

  // Classement
  const [ranking, setRanking] = useState([])

  // Sessions existantes
  const [sessions, setSessions] = useState([])

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  /* ── Charger les joueurs ── */
  const loadPlayers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/players/`, { headers })
      const data = await safeJson(res)
      if (Array.isArray(data)) {
        setPlayers(data.sort((a, b) => (a.number || 99) - (b.number || 99)))
      }
    } catch (e) {
      console.error('Erreur chargement joueurs:', e)
    }
  }, [token])

  /* ── Charger les séances du mois ── */
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/training-sessions/?month=${calMonth}&year=${calYear}`, { headers })
      const data = await safeJson(res)
      if (Array.isArray(data)) setSessions(data)
    } catch (e) {
      console.error('Erreur chargement séances:', e)
    }
  }, [token, calMonth, calYear])

  /* ── Charger le calendrier ── */
  const loadCalendar = useCallback(async () => {
    try {
      const res = await fetch(`${API}/training-sessions/calendar?month=${calMonth}&year=${calYear}`, { headers })
      const data = await safeJson(res)
      if (Array.isArray(data)) setCalDays(data)
    } catch (e) {
      console.error('Erreur chargement calendrier:', e)
    }
  }, [token, calMonth, calYear])

  /* ── Charger le classement ── */
  const loadRanking = useCallback(async () => {
    if (!players.length) return
    const stats = []
    for (const p of players) {
      try {
        const res = await fetch(`${API}/training-sessions/player/${p.id}/stats`, { headers })
        const data = await safeJson(res)
        if (data) stats.push({ ...p, ...data })
      } catch {}
    }
    stats.sort((a, b) => (b.attendance_rate || 0) - (a.attendance_rate || 0))
    setRanking(stats)
  }, [token, players])

  useEffect(() => { loadPlayers() }, [loadPlayers])
  useEffect(() => { if (view === 'calendrier') { loadCalendar(); loadSessions() } }, [view, loadCalendar, loadSessions])
  useEffect(() => { if (view === 'classement') loadRanking() }, [view, loadRanking])

  /* ── Créer une séance + pointer ── */
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      // 1. Créer la séance
      const sessionRes = await fetch(`${API}/training-sessions/`, {
        method: 'POST', headers,
        body: JSON.stringify({
          date: sessionDate,
          session_type: sessionType,
          theme: sessionTheme || null,
          category: user?.managed_category || 'Seniors',
        })
      })
      const session = await safeJson(sessionRes)
      if (!session || !session.id) {
        setError('Erreur lors de la création de la séance')
        setLoading(false)
        return
      }
      setCurrentSession(session)

      // 2. Pointer
      const entries = Object.entries(attendance).map(([player_id, data]) => ({
        player_id,
        status: data.status,
        absence_reason: data.status !== 'present' ? data.absence_reason : null,
      }))

      if (entries.length > 0) {
        await fetch(`${API}/training-sessions/${session.id}/attendance`, {
          method: 'PUT', headers,
          body: JSON.stringify({ entries })
        })
      }

      setSaved(true)
    } catch (e) {
      const detail = typeof e === 'string' ? e : 'Erreur réseau'
      setError(detail)
    }
    setLoading(false)
  }

  /* ── Toggle présence d'un joueur ── */
  const toggleStatus = (playerId, status) => {
    setAttendance(prev => {
      const current = prev[playerId]?.status
      if (current === status) {
        // Décocher
        const next = { ...prev }
        delete next[playerId]
        return next
      }
      return { ...prev, [playerId]: { status, absence_reason: null } }
    })
    setSaved(false)
  }

  const setMotif = (playerId, reason) => {
    setAttendance(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], absence_reason: reason }
    }))
  }

  /* ── Tout cocher présent ── */
  const markAllPresent = () => {
    const all = {}
    players.forEach(p => { all[p.id] = { status: 'present', absence_reason: null } })
    setAttendance(all)
    setSaved(false)
  }

  /* ─── Styles ─────────────────────────────── */
  const cardS = {
    background: T.surface, border: `1px solid ${T.rule}`,
    borderRadius: 10, overflow: 'hidden',
  }
  const headerS = {
    fontFamily: T.mono, fontSize: 10, fontWeight: 600,
    letterSpacing: '.12em', textTransform: 'uppercase',
    color: T.muted2, padding: '12px 16px',
    borderBottom: `1px solid ${T.rule}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }
  const tabS = (active) => ({
    fontFamily: T.mono, fontSize: 11, fontWeight: 600,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: active ? T.gold : T.muted,
    background: active ? T.goldBg : 'transparent',
    border: active ? `1px solid ${T.goldBdr}` : `1px solid ${T.rule}`,
    borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
    transition: 'all .15s',
  })
  const btnGold = {
    fontFamily: T.display, fontSize: 14, fontWeight: 700,
    letterSpacing: '.04em', textTransform: 'uppercase',
    background: T.gold, color: '#fff', border: 'none',
    borderRadius: 6, padding: '10px 24px', cursor: 'pointer',
    transition: 'background .15s',
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>

        {/* Titre + onglets */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: T.display, fontSize: 28, fontWeight: 800, color: T.ink, letterSpacing: '.02em', textTransform: 'uppercase', margin: 0 }}>
            Présences
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'pointage', label: 'Pointage' },
              { key: 'calendrier', label: 'Calendrier' },
              { key: 'classement', label: 'Classement' },
            ].map(t => (
              <button key={t.key} style={tabS(view === t.key)} onClick={() => setView(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ VUE POINTAGE ══ */}
        {view === 'pointage' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Config séance */}
            <div style={cardS}>
              <div style={headerS}>Nouvelle séance</div>
              <div style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, display: 'block', marginBottom: 4 }}>Date</label>
                  <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: `1px solid ${T.rule}`, borderRadius: 6, fontSize: 14, fontFamily: T.body, color: T.ink, background: T.bg }} />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, display: 'block', marginBottom: 4 }}>Type</label>
                  <select value={sessionType} onChange={e => setSessionType(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: `1px solid ${T.rule}`, borderRadius: 6, fontSize: 14, fontFamily: T.body, color: T.ink, background: T.bg }}>
                    <option value="entrainement">Entraînement</option>
                    <option value="physique">Physique</option>
                    <option value="video">Vidéo</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, display: 'block', marginBottom: 4 }}>Thème (optionnel)</label>
                  <select value={sessionTheme} onChange={e => setSessionTheme(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: `1px solid ${T.rule}`, borderRadius: 6, fontSize: 14, fontFamily: T.body, color: T.ink, background: T.bg }}>
                    <option value="">—</option>
                    {THEMES_SEANCE.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Liste joueurs */}
            <div style={cardS}>
              <div style={headerS}>
                <span>Effectif · {players.length} joueurs</span>
                <button onClick={markAllPresent} style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: T.gold, background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>
                  Tous présents
                </button>
              </div>
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {players.map(p => {
                  const att = attendance[p.id]
                  const currentStatus = att?.status || null

                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px',
                      borderBottom: `1px solid ${T.rule}`,
                      background: currentStatus === 'present' ? T.greenBg : currentStatus === 'absent' ? T.redBg : 'transparent',
                      transition: 'background .15s',
                    }}>
                      {/* Numéro + nom */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 4,
                          background: T.goldBg, border: `1px solid ${T.goldBdr}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: T.display, fontSize: 13, fontWeight: 700, color: T.gold, flexShrink: 0,
                        }}>
                          {p.number || '—'}
                        </div>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: T.ink }}>{p.name}</span>
                          {p.position && (
                            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.06em', color: T.muted, marginLeft: 6, padding: '1px 5px', background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 3 }}>
                              {p.position}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Boutons statut */}
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {STATUTS.map(s => (
                          <button key={s.value} onClick={() => toggleStatus(p.id, s.value)}
                            style={{
                              fontFamily: T.mono, fontSize: 8, fontWeight: 600,
                              letterSpacing: '.06em', textTransform: 'uppercase',
                              color: currentStatus === s.value ? '#fff' : s.color,
                              background: currentStatus === s.value ? s.color : s.bg,
                              border: `1px solid ${currentStatus === s.value ? s.color : 'transparent'}`,
                              borderRadius: 4, padding: '5px 8px', cursor: 'pointer',
                              transition: 'all .12s', minWidth: 52, textAlign: 'center',
                            }}>
                            {s.label}
                          </button>
                        ))}
                      </div>

                      {/* Motif d'absence si absent */}
                      {currentStatus === 'absent' && (
                        <select value={att?.absence_reason || ''} onChange={e => setMotif(p.id, e.target.value)}
                          style={{ fontFamily: T.mono, fontSize: 9, padding: '4px 6px', border: `1px solid ${T.rule}`, borderRadius: 4, color: T.ink, background: T.bg, flexShrink: 0 }}>
                          <option value="">Motif...</option>
                          {MOTIFS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Résumé + bouton enregistrer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                {Object.values(attendance).filter(a => a.status === 'present').length} présent(s)
                {' · '}
                {Object.values(attendance).filter(a => a.status === 'absent').length} absent(s)
                {' · '}
                {Object.values(attendance).filter(a => a.status === 'excused').length} excusé(s)
                {' · '}
                {Object.values(attendance).filter(a => a.status === 'injured').length} blessé(s)
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {saved && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.green }}>Enregistré</span>}
                {error && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.red }}>{error}</span>}
                <button onClick={handleSave} disabled={loading || Object.keys(attendance).length === 0}
                  style={{ ...btnGold, opacity: loading || Object.keys(attendance).length === 0 ? 0.5 : 1 }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.goldD }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.gold }}>
                  {loading ? 'Enregistrement...' : 'Enregistrer la séance'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ VUE CALENDRIER ══ */}
        {view === 'calendrier' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={cardS}>
              <div style={{ ...headerS, justifyContent: 'center', gap: 24 }}>
                <button onClick={() => { calMonth === 1 ? (setCalMonth(12), setCalYear(calYear - 1)) : setCalMonth(calMonth - 1) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: T.gold }}>←</button>
                <span style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: T.ink, textTransform: 'uppercase', letterSpacing: '.02em' }}>
                  {MOIS_LABELS[calMonth - 1]} {calYear}
                </span>
                <button onClick={() => { calMonth === 12 ? (setCalMonth(1), setCalYear(calYear + 1)) : setCalMonth(calMonth + 1) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: T.gold }}>→</button>
              </div>

              <div style={{ padding: 16 }}>
                {/* En-tête jours */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
                  {JOURS.map(j => (
                    <div key={j} style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: T.muted, textAlign: 'center', padding: '4px 0' }}>
                      {j}
                    </div>
                  ))}
                </div>

                {/* Grille jours */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                  {/* Cases vides avant le 1er jour */}
                  {Array.from({ length: new Date(calYear, calMonth - 1, 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {calDays.map(day => {
                    const d = new Date(day.date)
                    const isToday = day.date === today()
                    const hasSession = day.has_session

                    return (
                      <div key={day.date} style={{
                        padding: '8px 4px', borderRadius: 6, textAlign: 'center',
                        background: hasSession ? T.greenBg : isToday ? T.goldBg : 'transparent',
                        border: isToday ? `1px solid ${T.goldBdr}` : hasSession ? `1px solid ${T.greenBdr}` : `1px solid transparent`,
                        cursor: hasSession ? 'pointer' : 'default',
                        transition: 'all .12s',
                      }}>
                        <div style={{ fontFamily: T.display, fontSize: 16, fontWeight: 700, color: hasSession ? T.green : isToday ? T.gold : T.ink }}>
                          {d.getDate()}
                        </div>
                        {hasSession && (
                          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.green, marginTop: 2 }}>
                            {day.present_count}/{day.total_count}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Liste des séances du mois */}
            {sessions.length > 0 && (
              <div style={cardS}>
                <div style={headerS}>Séances du mois · {sessions.length}</div>
                {sessions.map(s => (
                  <div key={s.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 16px', borderBottom: `1px solid ${T.rule}`,
                  }}>
                    <div>
                      <span style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink }}>
                        {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {s.theme && (
                        <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.06em', color: T.gold, marginLeft: 8, padding: '2px 6px', background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 3 }}>
                          {s.theme}
                        </span>
                      )}
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8 }}>
                        {s.session_type}
                      </span>
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.green }}>
                      {s.present_count}/{s.player_count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ VUE CLASSEMENT ══ */}
        {view === 'classement' && (
          <div style={cardS}>
            <div style={headerS}>
              <span>Classement assiduité · {ranking.length} joueurs</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: T.bg }}>
                  {['#', 'Joueur', 'Séances', 'Présent', 'Taux', 'Série', 'Non just.'].map(h => (
                    <th key={h} style={{
                      fontFamily: T.mono, fontSize: 9, fontWeight: 600,
                      letterSpacing: '.08em', textTransform: 'uppercase',
                      color: T.muted, padding: '8px 12px',
                      textAlign: h === 'Joueur' ? 'left' : 'center',
                      borderBottom: `1px solid ${T.rule}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.player_id || r.id} style={{ transition: 'background .12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.goldBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ fontFamily: T.display, fontSize: 16, fontWeight: 800, color: i < 3 ? T.gold : T.muted, padding: '8px 12px', textAlign: 'center', borderBottom: `1px solid ${T.rule}` }}>
                      {i + 1}
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500, color: T.ink, padding: '8px 12px', borderBottom: `1px solid ${T.rule}` }}>
                      {r.number && <span style={{ fontFamily: T.display, fontSize: 12, fontWeight: 700, color: T.gold, marginRight: 6 }}>{r.number}</span>}
                      {r.name}
                    </td>
                    <td style={{ fontFamily: T.mono, fontSize: 12, color: T.ink, textAlign: 'center', padding: '8px 12px', borderBottom: `1px solid ${T.rule}` }}>
                      {r.total_sessions || 0}
                    </td>
                    <td style={{ fontFamily: T.mono, fontSize: 12, color: T.green, textAlign: 'center', padding: '8px 12px', borderBottom: `1px solid ${T.rule}` }}>
                      {r.present || 0}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px 12px', borderBottom: `1px solid ${T.rule}` }}>
                      <span style={{
                        fontFamily: T.mono, fontSize: 11, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 4,
                        color: (r.attendance_rate || 0) >= 0.8 ? T.green : (r.attendance_rate || 0) >= 0.5 ? T.gold : T.red,
                        background: (r.attendance_rate || 0) >= 0.8 ? T.greenBg : (r.attendance_rate || 0) >= 0.5 ? T.goldBg : T.redBg,
                      }}>
                        {Math.round((r.attendance_rate || 0) * 100)}%
                      </span>
                    </td>
                    <td style={{ fontFamily: T.mono, fontSize: 12, color: T.ink, textAlign: 'center', padding: '8px 12px', borderBottom: `1px solid ${T.rule}` }}>
                      {r.current_streak || 0}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px 12px', borderBottom: `1px solid ${T.rule}` }}>
                      {(r.absences_non_justifiees || 0) > 0 ? (
                        <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: T.red }}>
                          {r.absences_non_justifiees}
                        </span>
                      ) : (
                        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>0</span>
                      )}
                    </td>
                  </tr>
                ))}
                {ranking.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', fontFamily: T.mono, fontSize: 12, color: T.muted }}>
                      Aucune séance enregistrée. Commence par pointer une séance.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
