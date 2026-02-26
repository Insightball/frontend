import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, X } from 'lucide-react'
import api from '../services/api'

const G = {
  gold: '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.12)', goldBdr: 'rgba(201,162,39,0.35)',
  mono: "'JetBrains Mono', monospace",
}

export default function TrialBanner() {
  const navigate = useNavigate()
  const [trialInfo, setTrialInfo] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    api.get('/subscription/trial-status')
      .then(r => {
        if (r.data.access === 'trial') setTrialInfo(r.data)
      })
      .catch(() => {})
  }, [])

  if (!trialInfo || dismissed) return null

  const { days_left, match_used } = trialInfo
  const urgent = days_left <= 2

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: urgent ? 'rgba(239,68,68,0.1)' : G.goldBg,
      border: `1px solid ${urgent ? 'rgba(239,68,68,0.3)' : G.goldBdr}`,
      borderLeft: `3px solid ${urgent ? '#ef4444' : G.gold}`,
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Clock size={13} color={urgent ? '#ef4444' : G.gold} />
        <span style={{
          fontFamily: G.mono, fontSize: 10, letterSpacing: '.08em',
          color: urgent ? '#ef4444' : G.gold,
        }}>
          {days_left === 0
            ? "Votre essai expire aujourd'hui"
            : `Essai gratuit — ${days_left} jour${days_left > 1 ? 's' : ''} restant${days_left > 1 ? 's' : ''}`
          }
        </span>
        {!match_used && (
          <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.5)', letterSpacing: '.06em' }}>
            · 1 analyse offerte disponible
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/dashboard/settings')}
          style={{
            padding: '6px 16px',
            background: urgent ? '#ef4444' : G.gold,
            color: '#0f0f0d', border: 'none', cursor: 'pointer',
            fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em',
            textTransform: 'uppercase', fontWeight: 700,
          }}>
          S'abonner →
        </button>
        <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={12} color={urgent ? '#ef4444' : G.gold} />
        </button>
      </div>
    </div>
  )
}
