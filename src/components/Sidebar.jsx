import { CATEGORIES } from '../constants'

const HOUSING_CATS = [
  { id: 'all', label: 'All Housing', icon: '🏠' },
  { id: 'housing', label: 'Housing Listed', icon: '🏡' },
  { id: 'sublease', label: 'Subleases', icon: '🔑' },
  { id: 'looking', label: 'Looking for Roommates', icon: '🔍' },
]

const MARKETPLACE_CATS = CATEGORIES.filter(c => !['all','housing','sublease','looking'].includes(c.id))

export default function Sidebar({ category, onCategory, schoolColor, mode }) {
  const cats = mode === 'housing' ? HOUSING_CATS : MARKETPLACE_CATS
  const label = mode === 'housing' ? 'Housing' : 'Marketplace'

  return (
    <aside style={{ width: 210, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 76, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cats.map(cat => (
              <SidebarItem key={cat.id} cat={cat} active={category === cat.id} onClick={onCategory} schoolColor={schoolColor} />
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4 }}>⚡ Boost your listing</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.4 }}>Get 10x more views for just $2</p>
          <button style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Boost for $2
          </button>
        </div>
      </div>
    </aside>
  )
}

function SidebarItem({ cat, active, onClick, schoolColor }) {
  return (
    <button
      onClick={() => onClick(cat.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 8, border: 'none',
        background: active ? (schoolColor ? schoolColor + '15' : '#f3f4f6') : 'transparent',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        color: active ? (schoolColor || '#111') : '#374151',
        fontWeight: active ? 600 : 500, fontSize: 14,
        transition: 'all 0.1s'
      }}
    >
      <span style={{ fontSize: 16 }}>{cat.icon}</span>
      {cat.label}
    </button>
  )
}
