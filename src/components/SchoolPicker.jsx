import { Check, Search } from 'lucide-react'
import { useState } from 'react'
import Overlay from './Overlay'
import { SCHOOLS } from '../constants'

export default function SchoolPicker({ current, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const filtered = SCHOOLS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.short.toLowerCase().includes(query.toLowerCase())
  )

  const live = filtered.filter(s => s.live)
  const coming = filtered.filter(s => !s.live)

  return (
    <Overlay onClose={onClose} title="Pick your campus">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search schools..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              borderRadius: 10, border: '1px solid #e5e7eb',
              background: '#f9fafb', fontSize: 14, outline: 'none', color: '#111'
            }}
          />
        </div>

        {live.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Live now</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {live.map(s => (
                <SchoolRow key={s.id} school={s} active={current === s.id} onSelect={() => { onSelect(s.id); onClose() }} />
              ))}
            </div>
          </div>
        )}

        {coming.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Coming soon</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {coming.map(s => (
                <SchoolRow key={s.id} school={s} active={false} disabled onSelect={() => {}} />
              ))}
            </div>
          </div>
        )}

        {live.length === 0 && coming.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, margin: '8px 0' }}>No schools found</p>
        )}
      </div>
    </Overlay>
  )
}

function SchoolRow({ school, active, onSelect, disabled }) {
  return (
    <button
      onClick={!disabled ? onSelect : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 12,
        border: active ? `1.5px solid ${school.color}` : '1.5px solid #e5e7eb',
        background: active ? school.color + '10' : '#f9fafb',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.45 : 1, textAlign: 'left', width: '100%'
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: school.color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111' }}>{school.name}</p>
      </div>
      {active && <Check size={16} color={school.color} />}
      {disabled && <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Soon</span>}
    </button>
  )
}
