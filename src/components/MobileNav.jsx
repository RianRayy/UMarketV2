import { Home, Search, Plus, Heart, User } from 'lucide-react'

export default function MobileNav({ page, onHome, onPost, onProfile, favCount, schoolColor }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50
    }}>
      <NavBtn icon={<Home size={22} />} label="Home" active={page === 'home'} onClick={onHome} schoolColor={schoolColor} />
      <NavBtn icon={<Search size={22} />} label="Search" active={false} onClick={onHome} schoolColor={schoolColor} />

      {/* Center post button */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px 0' }}>
        <button
          onClick={onPost}
          style={{
            width: 50, height: 50, borderRadius: '50%',
            background: schoolColor || '#111', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          <Plus size={24} color="#fff" />
        </button>
      </div>

      <NavBtn
        icon={
          <div style={{ position: 'relative' }}>
            <Heart size={22} color={favCount > 0 ? '#ef4444' : undefined} fill={favCount > 0 ? '#ef4444' : 'none'} />
            {favCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -8, background: '#ef4444', color: '#fff', borderRadius: '99px', fontSize: 9, fontWeight: 700, padding: '1px 4px' }}>
                {favCount}
              </span>
            )}
          </div>
        }
        label="Saved"
        active={page === 'profile'}
        onClick={() => onProfile('saved')}
        schoolColor={schoolColor}
      />
      <NavBtn icon={<User size={22} />} label="Profile" active={page === 'profile'} onClick={() => onProfile('listings')} schoolColor={schoolColor} />
    </nav>
  )
}

function NavBtn({ icon, label, active, onClick, schoolColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '8px 0', border: 'none', background: 'transparent', cursor: 'pointer',
        color: active ? (schoolColor || '#111') : '#9ca3af', gap: 3
      }}
    >
      {icon}
      <span style={{ fontSize: 10, fontWeight: active ? 600 : 500 }}>{label}</span>
    </button>
  )
}
