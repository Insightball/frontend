import DashboardLayout from '../components/DashboardLayout'
import SubscriptionManagement from '../components/SubscriptionManagement'
import { useAuth } from '../context/AuthContext'
import { T } from '../theme'
import { User, Mail, Shield } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      {/* ── HEADER ── */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${T.rule}` }}>
        <p style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 14, height: 1, background: T.gold, display: 'inline-block' }} />Paramètres
        </p>
        <h1 style={{ fontFamily: T.display, fontSize: 52, textTransform: 'uppercase', lineHeight: .88, letterSpacing: '.01em' }}>
          <span style={{ color: T.ink }}>Mon</span><br />
          <span style={{ color: T.gold }}>compte.</span>
        </h1>
      </div>

      {/* ── INFOS UTILISATEUR ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 2, height: 14, background: T.gold, display: 'inline-block' }} />
          <h2 style={{ fontFamily: T.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: T.ink }}>Informations</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.rule }}>
          {[
            { icon: User,   label: 'Nom',   value: user?.name  || '—' },
            { icon: Mail,   label: 'Email', value: user?.email || '—' },
            { icon: Shield, label: 'Plan',  value: user?.plan ? `${user.plan} — ${user.plan === 'COACH' ? '39 €/mois · 4 matchs' : '129 €/mois · 12 matchs'}` : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: T.surface, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 34, height: 34, background: T.goldBg, border: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} color={T.gold} />
              </div>
              <div>
                <p style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 3 }}>{label}</p>
                <p style={{ fontFamily: T.mono, fontSize: 12, color: T.ink, letterSpacing: '.04em' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABONNEMENT ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 2, height: 14, background: T.gold, display: 'inline-block' }} />
          <h2 style={{ fontFamily: T.display, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: T.ink }}>Abonnement</h2>
        </div>
        <SubscriptionManagement />
      </div>
    </DashboardLayout>
  )
}
