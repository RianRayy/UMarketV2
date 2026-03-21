import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import Overlay from './Overlay'

export default function FilterModal({ filters, onApply, onClose, schoolColor }) {
  const [f, setF] = useState({ ...filters })

  function toggle(key) { setF(prev => ({ ...prev, [key]: !prev[key] })) }
  function set(key, val) { setF(prev => ({ ...prev, [key]: val })) }

  return (
    <Overlay onClose={onClose} title="Filter listings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Price range */}
        <Section title="Price">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <PriceInput label="Min" value={f.minPrice} onChange={v => set('minPrice', v)} />
            <PriceInput label="Max" value={f.maxPrice} onChange={v => set('maxPrice', v)} />
          </div>
          <Toggle label="Free only" active={f.freeOnly} onClick={() => toggle('freeOnly')} schoolColor={schoolColor} />
        </Section>

        {/* Condition */}
        <Section title="Condition">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Like New', 'Good', 'Fair', 'Parts Only'].map(c => (
              <Chip key={c} label={c} active={f.conditions?.includes(c)} onClick={() => {
                const cur = f.conditions || []
                set('conditions', cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c])
              }} schoolColor={schoolColor} />
            ))}
          </div>
        </Section>

        {/* Housing */}
        <Section title="Housing">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Studio', '1 bed', '2 bed', '3+ bed'].map(b => (
              <Chip key={b} label={b} active={f.beds === b} onClick={() => set('beds', f.beds === b ? '' : b)} schoolColor={schoolColor} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <Toggle label="Pet friendly" active={f.petFriendly} onClick={() => toggle('petFriendly')} schoolColor={schoolColor} />
            <Toggle label="Utilities included" active={f.utilities} onClick={() => toggle('utilities')} schoolColor={schoolColor} />
            <Toggle label="Furnished" active={f.furnished} onClick={() => toggle('furnished')} schoolColor={schoolColor} />
            <Toggle label="Parking" active={f.parking} onClick={() => toggle('parking')} schoolColor={schoolColor} />
          </div>
        </Section>

        {/* Sort */}
        <Section title="Sort by">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[['newest', 'Newest'], ['low', 'Price: Low'], ['high', 'Price: High']].map(([val, label]) => (
              <Chip key={val} label={label} active={f.sort === val} onClick={() => set('sort', val)} schoolColor={schoolColor} />
            ))}
          </div>
        </Section>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { onApply({}); onClose() }}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#374151' }}
          >
            Clear all
          </button>
          <button
            onClick={() => { onApply(f); onClose() }}
            style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: schoolColor || '#111', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Apply filters
          </button>
        </div>
      </div>
    </Overlay>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#111' }}>{title}</p>
      {children}
    </div>
  )
}

function PriceInput({ label, value, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }}>$</span>
        <input
          type="number" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={{ width: '100%', padding: '9px 10px 9px 22px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, outline: 'none', color: '#111' }}
        />
      </div>
    </div>
  )
}

function Chip({ label, active, onClick, schoolColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: 99, border: '1.5px solid ' + (active ? (schoolColor || '#111') : '#e5e7eb'),
        background: active ? (schoolColor ? schoolColor + '15' : '#f3f4f6') : '#f9fafb',
        color: active ? (schoolColor || '#111') : '#374151',
        fontWeight: active ? 600 : 500, fontSize: 13, cursor: 'pointer'
      }}
    >
      {label}
    </button>
  )
}

function Toggle({ label, active, onClick, schoolColor }) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 0' }}
    >
      <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{label}</span>
      <div style={{
        width: 42, height: 24, borderRadius: 12,
        background: active ? (schoolColor || '#111') : '#e5e7eb',
        position: 'relative', transition: 'background 0.2s'
      }}>
        <div style={{
          position: 'absolute', top: 3, left: active ? 21 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
        }} />
      </div>
    </div>
  )
}
