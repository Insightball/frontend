import { useState } from 'react'
import { X, User, Hash } from 'lucide-react'

const G = {
  bg:    '#0a0908', bg2: '#0f0e0c', bg3: '#141311',
  gold:  '#c9a227', goldD: '#a8861f',
  goldBg: 'rgba(201,162,39,0.08)', goldBdr: 'rgba(201,162,39,0.25)',
  mono:  "'JetBrains Mono', monospace", display: "'Anton', sans-serif",
  border: 'rgba(255,255,255,0.08)', muted: 'rgba(245,242,235,0.62)',
  text:  '#f5f2eb', red: '#ef4444',
}

const iSt = (focused) => ({
  width: '100%', background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${focused ? G.goldBdr : G.border}`,
  padding: '11px 14px', color: G.text,
  fontFamily: G.mono, fontSize: 13, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
})

const labelSt = {
  fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em',
  textTransform: 'uppercase', color: G.muted,
  display: 'block', marginBottom: 8,
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelSt}>{label}</label>
      {children}
    </div>
  )
}

function PlayerForm({ isOpen, onClose, onSubmit, player = null, category }) {
  const [formData, setFormData] = useState({
    name:           player?.name           || '',
    number:         player?.number         || '',
    position:       player?.position       || 'Milieu',
    category:       player?.category       || category || 'N3',
    photo_url:      player?.photo_url      || '',
    birth_date:     player?.birth_date     || '',
    height:         player?.height         || '',
    weight:         player?.weight         || '',
    preferred_foot: player?.preferred_foot || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [focused, setFocused] = useState(null)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.name || !formData.number || !formData.position) {
      setError('Nom, numéro et poste sont obligatoires')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        number: parseInt(formData.number),
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        birth_date: formData.birth_date || null,
        preferred_foot: formData.preferred_foot || null,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const selectSt = (name) => ({
    ...iSt(focused === name),
    cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a227' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
    paddingRight: 36,
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.85)' }}>
      <div style={{ width: '100%', maxWidth: 640, background: G.bg2, border: `1px solid rgba(255,255,255,0.08)`, borderTop: `2px solid ${G.gold}`, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${G.border}` }}>
          <div>
            <div style={{ fontFamily: G.mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 4 }}>
              {player ? 'Modifier' : 'Ajouter'}
            </div>
            <h2 style={{ fontFamily: G.display, fontSize: 24, textTransform: 'uppercase', color: G.text, margin: 0, letterSpacing: '.02em' }}>
              {player ? player.name : 'Nouveau joueur'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: G.muted }}
            onMouseEnter={e => e.currentTarget.style.color = G.text}
            onMouseLeave={e => e.currentTarget.style.color = G.muted}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderLeft: `2px solid ${G.red}` }}>
              <p style={{ fontFamily: G.mono, fontSize: 11, color: G.red, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Ligne 1 : Nom + Numéro */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Nom complet *">
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,235,0.30)' }} />
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="Kylian Mbappé"
                  style={{ ...iSt(focused === 'name'), paddingLeft: 34 }}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
              </div>
            </Field>
            <Field label="Numéro *">
              <div style={{ position: 'relative' }}>
                <Hash size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,235,0.30)' }} />
                <input type="number" name="number" value={formData.number} onChange={handleChange} required
                  min="1" max="99" placeholder="10"
                  style={{ ...iSt(focused === 'number'), paddingLeft: 34 }}
                  onFocus={() => setFocused('number')} onBlur={() => setFocused(null)} />
              </div>
            </Field>
          </div>

          {/* Ligne 2 : Poste + Catégorie */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Poste *">
              <select name="position" value={formData.position} onChange={handleChange} required
                style={selectSt('position')}
                onFocus={() => setFocused('position')} onBlur={() => setFocused(null)}>
                {['Gardien','Défenseur','Milieu','Attaquant'].map(p => <option key={p} style={{ background: G.bg2 }}>{p}</option>)}
              </select>
            </Field>
            <Field label="Catégorie *">
              <select name="category" value={formData.category} onChange={handleChange} required
                style={selectSt('category')}
                onFocus={() => setFocused('category')} onBlur={() => setFocused(null)}>
                {['N3','U19','U17','U15','Seniors'].map(c => <option key={c} style={{ background: G.bg2 }}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* Ligne 3 : Pied fort */}
          <div style={{ marginBottom: 16 }}>
            <Field label="Pied fort">
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { val: 'droit',      label: 'Droit',       color: G.gold  },
                  { val: 'gauche',     label: 'Gauche',      color: '#3b82f6' },
                  { val: 'ambidextre', label: 'Ambidextre',  color: '#22c55e' },
                ].map(opt => (
                  <button key={opt.val} type="button"
                    onClick={() => setFormData(p => ({ ...p, preferred_foot: p.preferred_foot === opt.val ? '' : opt.val }))}
                    style={{
                      flex: 1, padding: '9px 0',
                      fontFamily: G.mono, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
                      background: formData.preferred_foot === opt.val ? `rgba(${opt.color === G.gold ? '201,162,39' : opt.color === '#3b82f6' ? '59,130,246' : '34,197,94'},0.12)` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.preferred_foot === opt.val ? opt.color : G.border}`,
                      color: formData.preferred_foot === opt.val ? opt.color : G.muted,
                      cursor: 'pointer', transition: 'all .15s',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Ligne 4 : Date + Taille + Poids */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Date de naissance">
              <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange}
                style={{ ...iSt(focused === 'birth_date'), colorScheme: 'dark' }}
                onFocus={() => setFocused('birth_date')} onBlur={() => setFocused(null)} />
            </Field>
            <Field label="Taille (cm)">
              <input type="number" name="height" value={formData.height} onChange={handleChange}
                placeholder="180" min="100" max="230"
                style={iSt(focused === 'height')}
                onFocus={() => setFocused('height')} onBlur={() => setFocused(null)} />
            </Field>
            <Field label="Poids (kg)">
              <input type="number" name="weight" value={formData.weight} onChange={handleChange}
                placeholder="75" min="40" max="130"
                style={iSt(focused === 'weight')}
                onFocus={() => setFocused('weight')} onBlur={() => setFocused(null)} />
            </Field>
          </div>

          {/* Photo URL */}
          <div style={{ marginBottom: 28 }}>
            <Field label="Photo (URL)">
              <input type="url" name="photo_url" value={formData.photo_url} onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                style={iSt(focused === 'photo_url')}
                onFocus={() => setFocused('photo_url')} onBlur={() => setFocused(null)} />
              <span style={{ fontFamily: G.mono, fontSize: 9, color: 'rgba(245,242,235,0.40)', marginTop: 6, display: 'block' }}>Optionnel</span>
            </Field>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: `1px solid ${G.border}` }}>
            <button type="button" onClick={onClose}
              style={{ fontFamily: G.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading}
              style={{
                padding: '12px 28px', background: loading ? 'rgba(201,162,39,0.5)' : G.gold,
                color: '#0f0f0d', fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em',
                textTransform: 'uppercase', fontWeight: 700, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = G.goldD }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = G.gold }}>
              {loading ? 'Enregistrement...' : player ? 'Modifier →' : 'Ajouter →'}
            </button>
          </div>
        </form>

        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
          select option { background: #0f0e0c; color: #f5f2eb; }
        `}</style>
      </div>
    </div>
  )
}

export default PlayerForm
