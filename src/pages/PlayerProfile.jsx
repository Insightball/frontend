import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, User, Shield, Zap, Target, Calendar, Ruler, Weight, Footprints, Activity, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PlayerForm from '../components/PlayerForm'
import playerService from '../services/playerService'
import { T, globalStyles } from '../theme'

const G = {
  bg: T.bg, card: T.surface, border: T.rule,
  text: T.ink, muted: T.muted, gold: T.gold, goldD: T.goldD,
  goldBg: T.goldBg, goldBdr: T.goldBdr,
  mono: T.mono, display: T.display,
  dark: '#0a0908', dark2: '#0f0e0c',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', orange: '#f59e0b', yellow: '#eab308',
}

const POS = {
  'Gardien':   { color: '#eab308', icon: Shield,  label: 'Gardien' },
  'Défenseur': { color: '#3b82f6', icon: Shield,  label: 'Défenseur' },
  'Milieu':    { color: '#22c55e', icon: Zap,     label: 'Milieu' },
  'Attaquant': { color: '#ef4444', icon: Target,  label: 'Attaquant' },
}

const FOOT = {
  'droit':      { label: 'Pied droit',   short: 'D', color: G.gold },
  'gauche':     { label: 'Pied gauche',  short: 'G', color: G.blue },
  'ambidextre': { label: 'Ambidextre',   short: 'A', color: G.green },
}

const STATUS = {
  'actif':    { label: 'Actif',    color: G.green },
  'blessé':   { label: 'Blessé',   color: G.red },
  'suspendu': { label: 'Suspendu', color: G.orange },
  'inactif':  { label: 'Inactif',  color: 'rgba(26,25,22,0.35)' },
}

function getAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ── Stat mini-card ── */
function StatBox({ value, label, sub, color, big }) {
  return (
    <div style={{
      background: G.card, border: `1px solid ${G.border}`,
      borderTop: color ? `2px solid ${color}` : `1px solid ${G.border}`,
      padding: big ? '20px 18px' : '16px 14px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <span style={{ fontFamily: G.display, fontSize: big ? 38 : 28, lineHeight: 1, color: G.text, letterSpacing: '.01em' }}>
        {value ?? '—'}
      </span>
      <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted }}>
        {label}
      </span>
      {sub && <span style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(26,25,22,0.30)', marginTop: 2 }}>{sub}</span>}
    </div>
  )
}

/* ── Info row ── */
function InfoRow({ icon: Icon, label, value, color }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${G.border}` }}>
      <div style={{ width: 32, height: 32, background: G.goldBg, border: `1px solid ${G.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} color={color || G.gold} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: G.muted }}>{label}</div>
        <div style={{ fontFamily: G.display, fontSize: 16, color: G.text, letterSpacing: '.02em', textTransform: 'uppercase' }}>{value}</div>
      </div>
    </div>
  )
}

/* ── Bar chart simple ── */
function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: G.muted }}>{label}</span>
        <span style={{ fontFamily: G.mono, fontSize: 9, fontWeight: 600, color: G.text }}>{value}</span>
      </div>
      <div style={{ height: 4, background: G.border, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color || G.gold, transition: 'width .8s ease' }} />
      </div>
    </div>
  )
}

export default function PlayerProfile() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { loadPlayer() }, [playerId])

  const loadPlayer = async () => {
    try {
      setLoading(true)
      const data = await playerService.getPlayer(playerId)
      setPlayer(data)
    } catch (e) {
      setError('Joueur introuvable')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (data) => {
    await playerService.updatePlayer(playerId, data)
    await loadPlayer()
    setIsFormOpen(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <div style={{ width: 28, height: 28, border: `2px solid ${G.goldBdr}`, borderTopColor: G.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: G.muted }}>Chargement...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </DashboardLayout>
    )
  }

  if (error || !player) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <AlertCircle size={32} color={G.red} style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: G.display, fontSize: 28, color: G.text, textTransform: 'uppercase', marginBottom: 8 }}>{error || 'Joueur introuvable'}</h2>
          <button onClick={() => navigate('/dashboard/players')} style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: G.gold, background: 'none', border: `1px solid ${G.goldBdr}`, padding: '10px 20px', cursor: 'pointer', marginTop: 12 }}>
            ← Retour à l'effectif
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const pos = POS[player.position] || POS['Milieu']
  const foot = FOOT[player.preferred_foot]
  const status = STATUS[player.status] || STATUS['actif']
  const age = getAge(player.birth_date)

  // Placeholder stats — seront alimentées par le pipeline IA
  const matchStats = {
    played: player.matches_played ?? 0,
    starter: player.matches_starter ?? 0,
    sub: player.matches_sub ?? 0,
    minutes: player.total_minutes ?? 0,
    goals: player.goals ?? 0,
    assists: player.assists ?? 0,
  }

  const techStats = {
    passes: player.total_passes ?? null,
    passSuccess: player.pass_success_rate ?? null,
    shots: player.total_shots ?? null,
    shotsOnTarget: player.shots_on_target ?? null,
    duels: player.total_duels ?? null,
    duelsWon: player.duels_won ?? null,
    distance: player.total_distance ?? null,
    avgDistance: player.avg_distance ?? null,
  }

  const hasTechStats = Object.values(techStats).some(v => v !== null)
  const hasMatchStats = matchStats.played > 0

  return (
    <DashboardLayout>
      <style>{`
        ${globalStyles}
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* ── BACK BUTTON ── */}
      <button onClick={() => navigate('/dashboard/players')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
        color: G.muted, background: 'none', border: 'none', cursor: 'pointer',
        padding: '0 0 20px', transition: 'color .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = G.gold}
        onMouseLeave={e => e.currentTarget.style.color = G.muted}
      >
        <ArrowLeft size={14} /> Retour à l'effectif
      </button>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: G.card, border: `1px solid ${G.border}`, borderTop: `3px solid ${pos.color}`,
        padding: isMobile ? '24px 20px' : '32px 32px',
        marginBottom: 20, animation: 'fadeIn .4s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 28, alignItems: isMobile ? 'center' : 'flex-start' }}>
          
          {/* Photo + numéro */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} style={{
                width: isMobile ? 100 : 120, height: isMobile ? 100 : 120,
                objectFit: 'cover', display: 'block', border: `2px solid ${G.border}`,
              }} />
            ) : (
              <div style={{
                width: isMobile ? 100 : 120, height: isMobile ? 100 : 120,
                background: G.goldBg, border: `2px solid ${G.goldBdr}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={isMobile ? 40 : 48} color='rgba(201,162,39,0.3)' />
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: -8, right: -8,
              width: 36, height: 36, background: G.gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: G.display, fontSize: 18, color: '#0f0f0d', fontWeight: 900,
            }}>
              {player.number}
            </div>
            {/* Status dot */}
            {player.status && player.status !== 'actif' && (
              <div style={{
                position: 'absolute', top: -4, left: -4,
                padding: '3px 8px', background: status.color + '15', border: `1px solid ${status.color}40`,
                fontFamily: G.mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: status.color,
              }}>
                {status.label}
              </div>
            )}
          </div>

          {/* Info principale */}
          <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <span style={{ width: 16, height: 1, background: G.gold, display: 'inline-block' }} />
              Fiche joueur
            </div>
            <h1 style={{
              fontFamily: G.display, fontSize: isMobile ? 32 : 48,
              textTransform: 'uppercase', lineHeight: .9, letterSpacing: '.01em',
              color: G.text, margin: '0 0 12px',
            }}>
              {player.name}
            </h1>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <span style={{
                fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
                padding: '5px 14px', background: pos.color + '12', border: `1px solid ${pos.color}30`, color: pos.color,
              }}>
                {player.position}
              </span>
              <span style={{
                fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
                padding: '5px 14px', background: G.goldBg, border: `1px solid ${G.goldBdr}`, color: G.gold,
              }}>
                {player.category}
              </span>
              {foot && (
                <span style={{
                  fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
                  padding: '5px 14px', background: foot.color + '10', border: `1px solid ${foot.color}25`, color: foot.color,
                }}>
                  {foot.label}
                </span>
              )}
              {player.status === 'actif' && (
                <span style={{
                  fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
                  padding: '5px 14px', background: G.green + '10', border: `1px solid ${G.green}25`, color: G.green,
                }}>
                  Actif
                </span>
              )}
            </div>

            {/* Quick stats row */}
            <div style={{ display: 'flex', gap: isMobile ? 20 : 28, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              {age && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontFamily: G.display, fontSize: 26, color: G.text, lineHeight: 1 }}>{age}</span>
                  <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', color: G.muted, textTransform: 'uppercase' }}>ans</span>
                </div>
              )}
              {player.height && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontFamily: G.display, fontSize: 26, color: G.text, lineHeight: 1 }}>{player.height}</span>
                  <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', color: G.muted, textTransform: 'uppercase' }}>cm</span>
                </div>
              )}
              {player.weight && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontFamily: G.display, fontSize: 26, color: G.text, lineHeight: 1 }}>{player.weight}</span>
                  <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', color: G.muted, textTransform: 'uppercase' }}>kg</span>
                </div>
              )}
              {(age || player.height || player.weight) && <div style={{ width: 1, height: 28, background: G.border, alignSelf: 'center' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontFamily: G.display, fontSize: 26, color: hasMatchStats ? G.gold : G.muted, lineHeight: 1 }}>{matchStats.played}</span>
                <span style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.12em', color: G.muted, textTransform: 'uppercase' }}>matchs</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button onClick={() => setIsFormOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'transparent', border: `1px solid ${G.goldBdr}`,
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            color: G.gold, cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
            alignSelf: isMobile ? 'center' : 'flex-start',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = G.goldBg; e.currentTarget.style.borderColor = G.gold }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = G.goldBdr }}
          >
            <Edit2 size={12} /> Modifier
          </button>
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 28 }}>

        {/* ── INFOS PERSONNELLES ── */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, padding: '24px', animation: 'fadeIn .4s ease .1s both' }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 1, background: G.gold }} />Informations
          </div>

          <InfoRow icon={User} label="Nom complet" value={player.name} />
          <InfoRow icon={Calendar} label="Date de naissance" value={player.birth_date ? `${formatDate(player.birth_date)} (${age} ans)` : null} />
          <InfoRow icon={Ruler} label="Taille" value={player.height ? `${player.height} cm` : null} />
          <InfoRow icon={Weight} label="Poids" value={player.weight ? `${player.weight} kg` : null} />
          <InfoRow icon={Footprints} label="Pied fort" value={foot?.label} color={foot?.color} />
          <InfoRow icon={Activity} label="Statut" value={status.label} color={status.color} />
          <InfoRow icon={Shield} label="Catégorie" value={player.category} />

          <div style={{ fontFamily: G.mono, fontSize: 8, color: 'rgba(26,25,22,0.30)', marginTop: 16, letterSpacing: '.06em' }}>
            Ajouté le {formatDate(player.created_at)}
          </div>
        </div>

        {/* ── STATS MATCHS ── */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, padding: '24px', animation: 'fadeIn .4s ease .2s both' }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 1, background: G.gold }} />Statistiques matchs
          </div>

          {hasMatchStats ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                <StatBox value={matchStats.played} label="Matchs joués" color={G.gold} />
                <StatBox value={matchStats.goals} label="Buts" color={G.red} />
                <StatBox value={matchStats.assists} label="Passes D." color={G.blue} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
                <StatBox value={matchStats.starter} label="Titulaire" />
                <StatBox value={matchStats.sub} label="Remplaçant" />
              </div>
              {matchStats.minutes > 0 && (
                <div style={{ background: G.goldBg, border: `1px solid ${G.goldBdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: G.muted }}>Minutes jouées</span>
                  <span style={{ fontFamily: G.display, fontSize: 28, color: G.gold }}>{matchStats.minutes}'</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <Clock size={28} color='rgba(26,25,22,0.20)' style={{ marginBottom: 12 }} />
              <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em', color: G.muted, lineHeight: 1.7 }}>
                Les statistiques apparaîtront<br />après le premier match analysé.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── STATS TECHNIQUES (conditionnel) ── */}
      {hasTechStats && (
        <div style={{ background: G.card, border: `1px solid ${G.border}`, padding: '24px', marginBottom: 28, animation: 'fadeIn .4s ease .3s both' }}>
          <div style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: G.gold, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 1, background: G.gold }} />Performance technique
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28 }}>
            {/* Colonne gauche */}
            <div>
              {techStats.passes !== null && (
                <ProgressBar label="Passes" value={techStats.passes} max={techStats.passes} color={G.gold} />
              )}
              {techStats.passSuccess !== null && (
                <ProgressBar label="% Passes réussies" value={techStats.passSuccess} max={100} color={G.green} />
              )}
              {techStats.distance !== null && (
                <ProgressBar label={`Distance (${techStats.distance} km)`} value={techStats.distance} max={15} color={G.blue} />
              )}
            </div>
            {/* Colonne droite */}
            <div>
              {techStats.shots !== null && (
                <ProgressBar label="Tirs" value={techStats.shots} max={techStats.shots} color={G.red} />
              )}
              {techStats.shotsOnTarget !== null && (
                <ProgressBar label="Tirs cadrés" value={techStats.shotsOnTarget} max={techStats.shots || 1} color={G.orange} />
              )}
              {techStats.duelsWon !== null && (
                <ProgressBar label={`Duels gagnés (${techStats.duelsWon}/${techStats.duels})`} value={techStats.duelsWon} max={techStats.duels || 1} color={G.gold} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PLACEHOLDER EVOLUTION (futur) ── */}
      {!hasTechStats && (
        <div style={{
          background: G.card, border: `1px dashed ${G.border}`,
          padding: '48px 24px', textAlign: 'center', marginBottom: 28,
          animation: 'fadeIn .4s ease .3s both',
        }}>
          <TrendingUp size={28} color='rgba(26,25,22,0.15)' style={{ marginBottom: 12 }} />
          <h3 style={{ fontFamily: G.display, fontSize: 22, textTransform: 'uppercase', color: G.muted, marginBottom: 6, letterSpacing: '.02em' }}>
            Évolution & performance
          </h3>
          <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.06em', color: 'rgba(26,25,22,0.30)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>
            Les graphiques de progression, heatmaps individuelles et comparaisons seront disponibles après les premiers matchs analysés.
          </p>
        </div>
      )}

      {/* ── EDIT FORM MODAL ── */}
      <PlayerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleEdit}
        player={player}
      />
    </DashboardLayout>
  )
}
