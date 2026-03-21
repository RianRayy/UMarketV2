import { Check } from 'lucide-react'
import Overlay from './Overlay'
import { SCHOOLS } from '../constants'

export default function SchoolPicker({ current, onSelect, onClose }) {
  const live = SCHOOLS.filter(s => s.live)
  const coming = SCHOOLS.filter(s => !s.live)

  return (
    <Overlay onClose={onClose} title="Pick your campus">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Live now</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {live.map(s => (
              <SchoolRow key={s.id} school={s} active={current === s.id} onSelect={() => { onSelect(s.id); onClose() }} />
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Coming soon</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {coming.map(s => (
              <SchoolRow key={s.id} school={s} active={false} disabled onSelect={() => {}} />
            ))}
          </div>
        </div>
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
