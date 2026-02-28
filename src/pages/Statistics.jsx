import { useState, useEffect } from 'react'
import { BarChart3, Lock, ArrowRight, CheckCircle, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import matchService from '../services/matchService'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { T } from '../theme'

export default function Statistics() {
  const { user } = useAuth()
  const [matches,       setMatches]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [isMobile,      setIsMobile]      = useState(false)
  const [quotaBlocked,  setQuotaBlocked]  = useState(false) // trial épuisé ou pas de sub

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    ;(async () => {
      try { const m = await matchService.getMatches(); setMatches(m) }
      catch (e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [])

  // Vérifier si le quota est épuisé pour désactiver le bouton upload
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/matches/quota')
        setQuotaBlocked(data.remaining === 0)
      } catch {
        setQuotaBlocked(false)
      }
    })()
  }, [])

  const completed = matches.filter(m => m.status === 'completed')
  const pending   = matches.filter(m => m.status === 'pending' || m.status === 'processing')

  const features = [
    'Heatmaps d\'activité par joueur et par poste',
    'Statistiques individuelles et collectives',
    'Progression match après match',
    'Comparaison joueurs côte à côte',
    'Analyse possession, passes, tirs, duels',
    'Export PDF du rapport complet',
  ]

  return (
    <DashboardLayout>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${T.rule}` }}>
        <p style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 14, height: 1, background: T.gold, display: 'inline-block' }} />Statistiques
        </p>
        <h1 style={{ fontFamily: T.display, fontSize: isMobile ? 36 : 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em' }}>
          <span style={{ color: T.ink }}>Analyse</span><br />
          <span style={{ color: T.gold }}>de la saison.</span>
        </h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 26, height: 26, border: `2px solid ${T.goldBdr}`, borderTopColor: T.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : completed.length > 0 ? (
        // ── CAS : matchs analysés mais pipeline IA pas encore connecté ──
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 1, background: T.rule }}>

          {/* KPI disponibles */}
          <div style={{ background: T.surface, padding: '28px 24px', borderTop: `2px solid ${T.gold}` }}>
            <p style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 2, height: 12, background: T.gold }} />Saison en cours
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: T.rule, marginBottom: 1 }}>
              {[
                { label: 'Matchs analysés', value: completed.length },
                { label: 'Victoires',       value: completed.filter(m => m.score_home > m.score_away).length },
                { label: 'Nuls',            value: completed.filter(m => m.score_home === m.score_away).length },
                { label: 'Défaites',        value: completed.filter(m => m.score_home < m.score_away).length },
              ].map(s => (
                <div key={s.label} style={{ background: T.surface, padding: '18px 16px' }}>
                  <p style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>{s.label}</p>
                  <p style={{ fontFamily: T.display, fontSize: 40, lineHeight: 1, color: T.ink }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Liste matchs */}
            <div style={{ marginTop: 1 }}>
              {completed.slice(0, 5).map((m, i) => {
                const won  = m.score_home > m.score_away
                const draw = m.score_home === m.score_away
                const rc   = won ? T.green : draw ? T.orange : T.red
                const rl   = won ? 'V' : draw ? 'N' : 'D'
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: T.surface, borderBottom: i < completed.slice(0, 5).length - 1 ? `1px solid ${T.rule}` : 'none', borderLeft: `2px solid ${rc}` }}>
                    <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, padding: '2px 6px', background: rc + '18', color: rc, flexShrink: 0 }}>{rl}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>vs {m.opponent}</span>
                    {m.score_home !== null && (
                      <span style={{ fontFamily: T.display, fontSize: 16, color: T.ink, flexShrink: 0 }}>{m.score_home}–{m.score_away}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Locked — pipeline IA */}
          <div style={{ background: T.surface, padding: '28px 24px', borderTop: `2px solid ${T.rule}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, background: T.goldBg, border: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Lock size={20} color={T.gold} />
            </div>
            <p style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: T.gold, marginBottom: 12 }}>Bientôt disponible</p>
            <h2 style={{ fontFamily: T.display, fontSize: 28, textTransform: 'uppercase', lineHeight: .9, color: T.ink, marginBottom: 16 }}>
              Statistiques<br />avancées
            </h2>
            <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, lineHeight: 1.7, maxWidth: 280 }}>
              L'analyse IA de vos vidéos génèrera automatiquement heatmaps, stats individuelles et données tactiques.
            </p>
          </div>
        </div>
      ) : (
        // ── CAS : aucun match analysé ──
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 1, background: T.rule, alignItems: 'stretch' }}>

          {/* Gauche — explication */}
          <div style={{
            background: T.dark, padding: isMobile ? '24px 20px' : '36px 32px',
            position: 'relative', overflow: 'hidden',
            borderTop: `2px solid ${T.gold}`,
          }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
              backgroundImage: 'linear-gradient(rgba(201,162,39,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,1) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ width: 48, height: 48, background: T.goldBg2, border: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <BarChart3 size={20} color={T.gold} />
              </div>
              <p style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.7)', marginBottom: 12 }}>
                Pipeline IA
              </p>
              <h2 style={{ fontFamily: T.display, fontSize: isMobile ? 28 : 36, textTransform: 'uppercase', lineHeight: .9, color: '#f5f2eb', marginBottom: 16 }}>
                Vos stats<br /><span style={{ color: T.gold }}>vous attendent.</span>
              </h2>
              <p style={{ fontFamily: T.mono, fontSize: 11, color: 'rgba(245,242,235,0.45)', lineHeight: 1.7, marginBottom: 24 }}>
                Uploadez et lancez l'analyse d'un match. Notre IA génère automatiquement toutes vos statistiques.
              </p>
              {quotaBlocked ? (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', background: 'rgba(201,162,39,0.12)',
                  border: `1px solid ${T.goldBdr}`,
                  fontFamily: T.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: 'rgba(201,162,39,0.45)', cursor: 'not-allowed',
                }}>
                  <Lock size={11} /> Quota atteint
                </div>
              ) : (
                <Link to="/dashboard/matches/upload" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', background: T.gold, color: T.dark,
                  fontFamily: T.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700,
                  textDecoration: 'none', transition: 'background .12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.goldD}
                  onMouseLeave={e => e.currentTarget.style.background = T.gold}
                >
                  <Zap size={11} /> Analyser un match
                </Link>
              )}

              {pending.length > 0 && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.blue, animation: 'pulse 1.4s infinite', flexShrink: 0 }} />
                  <p style={{ fontFamily: T.mono, fontSize: 10, color: 'rgba(245,242,235,0.65)', letterSpacing: '.04em' }}>
                    {pending.length} match{pending.length > 1 ? 's' : ''} en cours d'analyse
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Droite — features à venir */}
          <div style={{ background: T.surface, padding: isMobile ? '24px 20px' : '36px 32px', borderTop: `2px solid ${T.rule}` }}>
            <p style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: T.muted, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 2, height: 12, background: T.gold }} />Ce que vous obtiendrez
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {features.map((f, i) => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: i < features.length - 1 ? `1px solid ${T.rule}` : 'none',
                }}>
                  <div style={{ width: 20, height: 20, background: T.goldBg, border: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={10} color={T.gold} />
                  </div>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2, letterSpacing: '.03em', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
