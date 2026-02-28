import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Share2, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PlayerStatsCard from '../components/PlayerStatsCard'
import HeatmapPlayer from '../components/HeatmapPlayer'
import MatchTimeline from '../components/MatchTimeline'
import { T, globalStyles } from '../theme'

const API = 'https://backend-pued.onrender.com/api'

const G = {
  bg:     T.bg,       bg2:    T.surface,  bg3: T.bgAlt,
  gold:   T.gold,     goldD:  T.goldD,
  goldBg: T.goldBg,   goldBdr:T.goldBdr,
  mono:   T.mono,     display:T.display,
  border: T.ruleDark,
  muted:  T.muted,
  text:   T.ink,
  green:  T.green,    red: T.red,
}

function authHeaders() {
  const token = localStorage.getItem('insightball_token')
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function StatusBadge({ status, progress }) {
  const map = {
    pending:    { label: 'En attente',  color: G.gold,  icon: Clock },
    processing: { label: `Analyse ${progress || 0}%`, color: '#3b82f6', icon: Loader },
    completed:  { label: 'Terminé',     color: G.green, icon: CheckCircle },
    error:      { label: 'Erreur',      color: G.red,   icon: AlertCircle },
  }
  const s = map[status] || map.pending
  const Icon = s.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', background: s.color + '18', color: s.color, border: `1px solid ${s.color}30` }}>
      <Icon size={10} /> {s.label}
    </span>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: '18px 14px', borderTop: `2px solid ${G.goldBdr}` }}>
      <div style={{ fontFamily: T.display, fontSize: 36, color: T.ink, lineHeight: 1, marginBottom: 6 }}>{value ?? '—'}</div>
      <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: T.muted }}>{label}</div>
    </div>
  )
}

function EmptyTab({ label }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: '64px 24px', textAlign: 'center' }}>
      <div style={{ width: 44, height: 44, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <span style={{ fontFamily: G.mono, fontSize: 14, color: G.gold }}>⏳</span>
      </div>
      <h3 style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', letterSpacing: '.04em', color: T.ink, marginBottom: 8 }}>{label}</h3>
      <p style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '.08em', color: T.muted }}>Disponible prochainement</p>
    </div>
  )
}

function MatchDetail() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetch(`${API}/matches/${matchId}`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error('Match introuvable'); return r.json() })
      .then(data => { setMatch(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [matchId])

  // Auto-refresh si en cours d'analyse
  useEffect(() => {
    if (!match || match.status !== 'processing') return
    const interval = setInterval(() => {
      fetch(`${API}/matches/${matchId}`, { headers: authHeaders() })
        .then(r => r.json())
        .then(data => {
          setMatch(data)
          if (data.status !== 'processing') clearInterval(interval)
        })
    }, 5000)
    return () => clearInterval(interval)
  }, [match?.status])

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: T.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted }}>Chargement...</div>
    </DashboardLayout>
  )

  if (error || !match) return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
        <AlertCircle size={32} color={G.red} />
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>{error || 'Match introuvable'}</div>
        <button onClick={() => navigate(-1)} style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, background: 'none', border: 'none', cursor: 'pointer' }}>← Retour</button>
      </div>
    </DashboardLayout>
  )

  const isHome = match.is_home !== false
  const scoreHome = match.score_home
  const scoreAway = match.score_away
  const hasScore = scoreHome !== null && scoreAway !== null
  const won = hasScore && scoreHome > scoreAway
  const lost = hasScore && scoreHome < scoreAway
  const resultColor = !hasScore ? G.gold : won ? G.green : lost ? G.red : G.gold
  const resultLabel = !hasScore ? '—' : won ? 'Victoire' : lost ? 'Défaite' : 'Nul'

  const tabs = [
    { id: 'overview',    label: 'Vue d\'ensemble',  show: true },
    { id: 'players',     label: 'Joueurs',           show: !!match.player_stats },
    { id: 'insights',    label: 'Analyse IA',        show: !!match.ai_insights },
    { id: 'phases',      label: 'Phases de jeu',     show: false },
    { id: 'report',      label: 'Rapport PDF',       show: !!match.pdf_url },
  ].filter(t => t.show !== false)

  const handleDownloadPDF = async () => {
    if (!match.pdf_url) return
    try {
      const res = await fetch(`${API}/upload/download-url/${encodeURIComponent(match.pdf_url)}`, { headers: authHeaders() })
      const data = await res.json()
      window.open(data.download_url, '_blank')
    } catch { alert('Erreur téléchargement PDF') }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => alert('Lien copié'))
      .catch(() => {})
  }

  return (
    <DashboardLayout>
      <style>{globalStyles}</style>
      {/* Header */
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 20, padding: 0, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = T.muted}>
          <ArrowLeft size={14} /> Retour aux matchs
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
              {match.category} · {match.type} · {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <h1 style={{ fontFamily: T.display, fontSize: 44, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em', color: T.ink, margin: '0 0 12px' }}>
              vs {match.opponent}
            </h1>
            <StatusBadge status={match.status} progress={match.progress} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'transparent', border: `1px solid ${T.rule}`, color: T.muted, fontFamily: T.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.goldBdr; e.currentTarget.style.color = G.gold }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.rule; e.currentTarget.style.color = T.muted }}>
              <Share2 size={12} /> Partager
            </button>
            {match.pdf_url && (
              <button onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: T.gold, color: T.dark, fontFamily: T.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = G.goldD}
                onMouseLeave={e => e.currentTarget.style.background = G.gold}>
                <Download size={12} /> PDF
              </button>
            )}
          </div>
        </div>

        {/* Score card */}
        <div style={{ marginTop: 24, background: T.surface, border: `1px solid ${T.rule}`, borderTop: `2px solid ${resultColor}`, padding: isMobile ? '20px 16px' : '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 20 : 40 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
              {isHome ? 'Domicile' : match.opponent}
            </div>
            <div style={{ fontFamily: G.display, fontSize: isMobile ? 52 : 80, lineHeight: 1, color: T.ink }}>{hasScore ? scoreHome : '?'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: T.mono, fontSize: 22, color: T.rule }}>—</span>
            <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', padding: '4px 14px', background: resultColor + '18', color: resultColor, border: `1px solid ${resultColor}30` }}>{resultLabel}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
              {isHome ? match.opponent : 'Extérieur'}
            </div>
            <div style={{ fontFamily: G.display, fontSize: isMobile ? 52 : 80, lineHeight: 1, color: T.ink }}>{hasScore ? scoreAway : '?'}</div>
          </div>
        </div>

        {/* Infos contexte */}
        {(match.competition || match.location || match.formation) && (
          <div style={{ marginTop: 1, background: T.bgAlt, border: `1px solid ${T.rule}`, borderTop: 'none', padding: '12px 24px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {match.competition && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}><span style={{ color: T.gold, marginRight: 8 }}>Compétition</span>{match.competition}</div>}
            {match.location && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}><span style={{ color: T.gold, marginRight: 8 }}>Lieu</span>{match.location}</div>}
            {match.formation && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}><span style={{ color: T.gold, marginRight: 8 }}>Formation</span>{match.formation}</div>}
            {match.opponent_formation && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}><span style={{ color: T.gold, marginRight: 8 }}>Adversaire</span>{match.opponent_formation}</div>}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.rule}`, marginBottom: 28, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '12px 20px', fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            background: 'transparent', border: 'none',
            borderBottom: activeTab === tab.id ? `2px solid ${G.gold}` : '2px solid transparent',
            color: activeTab === tab.id ? G.gold : T.muted,
            cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Stats grille */}
          {match.stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 1, background: T.rule }}>
              {[
                { label: 'Possession',  value: match.stats.possession ? `${match.stats.possession}%` : null },
                { label: 'Passes',      value: match.stats.passes },
                { label: 'Tirs',        value: match.stats.shots },
                { label: 'Tirs cadrés', value: match.stats.shotsOnTarget },
                { label: 'Corners',     value: match.stats.corners },
                { label: 'Fautes',      value: match.stats.fouls },
                { label: 'Km parcourus',value: match.stats.totalDistance ? `${match.stats.totalDistance} km` : null },
                { label: 'Sprints',     value: match.stats.sprints },
              ].filter(s => s.value !== null && s.value !== undefined).map((stat, i) => (
                <StatBox key={i} label={stat.label} value={stat.value} />
              ))}
            </div>
          )}

          {/* Timeline événements */}
          {match.events && match.events.length > 0 && <MatchTimeline events={match.events} />}

          {/* Heatmap équipe */}
          {match.analysis_data?.heatmap && <HeatmapPlayer data={match.analysis_data.heatmap} playerName="Équipe" />}

          {/* Lineup */}
          {match.lineup && (
            <div style={{ background: T.surface, border: `1px solid ${T.rule}`, borderTop: `2px solid ${G.goldBdr}`, padding: '24px' }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: T.gold, marginBottom: 16 }}>— Composition</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
                {(match.lineup.starters || []).map((p, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: T.bgAlt, border: `1px solid ${T.rule}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: T.display, fontSize: 18, color: T.gold, width: 24, flexShrink: 0 }}>{p.number}</span>
                    <div>
                      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ink }}>{p.name}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{p.position}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* État analyse en attente */}
          {match.status === 'pending' && (
            <div style={{ background: T.surface, border: `1px solid ${T.goldBdr}`, borderTop: `2px solid ${T.gold}`, padding: '32px 24px', textAlign: 'center' }}>
              <Clock size={28} color={G.gold} style={{ marginBottom: 12 }} />
              <div style={{ fontFamily: T.display, fontSize: 22, textTransform: 'uppercase', color: T.ink, marginBottom: 8 }}>Analyse en attente</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>Votre vidéo a été reçue. L'analyse démarrera automatiquement. Vous serez notifié par email dès que le rapport sera prêt.</div>
            </div>
          )}

          {match.status === 'processing' && (
            <div style={{ background: T.surface, border: `1px solid ${T.blueBdr}`, borderTop: `2px solid ${T.blue}`, padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: T.display, fontSize: 22, textTransform: 'uppercase', color: T.ink, marginBottom: 12 }}>Analyse en cours</div>
              <div style={{ background: T.rule, height: 6, borderRadius: 3, overflow: 'hidden', maxWidth: 300, margin: '0 auto 12px' }}>
                <div style={{ height: '100%', background: '#3b82f6', width: `${match.progress || 0}%`, transition: 'width .5s' }} />
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{match.progress || 0}% — Détection joueurs en cours...</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'players' && match.player_stats && (
        <div>
          <h2 style={{ fontFamily: T.display, fontSize: 28, textTransform: 'uppercase', letterSpacing: '.03em', color: T.ink, marginBottom: 20 }}>Stats individuelles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {match.player_stats.map((ps, i) => <PlayerStatsCard key={i} player={ps.player} stats={ps} />)}
          </div>
        </div>
      )}

      {activeTab === 'insights' && match.ai_insights && (
        <div style={{ background: T.surface, border: `1px solid ${T.rule}`, borderTop: `2px solid ${G.gold}`, padding: '32px' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: T.gold, marginBottom: 20 }}>— Analyse IA</div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.ink, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{match.ai_insights}</div>
        </div>
      )}

      {activeTab === 'report' && match.pdf_url && (
        <div style={{ background: T.surface, border: `1px solid ${T.rule}`, borderTop: `2px solid ${G.gold}`, padding: '48px 24px', textAlign: 'center' }}>
          <Download size={28} color={G.gold} style={{ marginBottom: 16 }} />
          <div style={{ fontFamily: T.display, fontSize: 22, textTransform: 'uppercase', color: T.ink, marginBottom: 8 }}>Rapport disponible</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 24 }}>Téléchargez le rapport complet de l'analyse de ce match.</div>
          <button onClick={handleDownloadPDF} style={{ padding: '14px 32px', background: G.gold, color: T.dark, fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Télécharger le PDF
          </button>
        </div>
      )}

    </DashboardLayout>
  )
}

export default MatchDetail
