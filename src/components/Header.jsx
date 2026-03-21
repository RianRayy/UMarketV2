import { Search, Plus, Heart, User, ChevronDown, MapPin } from 'lucide-react'
import { SCHOOLS } from '../constants'

export default function Header({
  school, onSchoolClick, search, onSearch,
  onPost, onAuth, currentUser, favCount,
  onProfile, isMobile, schoolColor
}) {
  const schoolObj = SCHOOLS.find(s => s.id === school)

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Logo */}
        <div
          onClick={() => {}}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: schoolColor || '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.5px'
          }}>U</div>
          {!isMobile && (
            <span style={{ fontWeight: 800, fontSize: 18, color: '#111', letterSpacing: '-0.5px' }}>
              UMarket
            </span>
          )}
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#fff',
            background: '#111', borderRadius: 4,
            padding: '2px 5px', letterSpacing: '0.5px'
          }}>BETA</span>
        </div>

        {/* School picker */}
        <button
          onClick={onSchoolClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
            background: '#f9fafb', cursor: 'pointer', flexShrink: 0,
            fontSize: 13, fontWeight: 600, color: '#374151'
          }}
        >
          <MapPin size={13} color={schoolColor || '#6b7280'} />
          {schoolObj ? (isMobile ? schoolObj.short : schoolObj.short) : 'Pick School'}
          <ChevronDown size={13} color="#9ca3af" />
        </button>

        {/* Search */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search listings..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              borderRadius: 10, border: '1px solid #e5e7eb',
              background: '#f9fafb', fontSize: 14, outline: 'none',
              color: '#111'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {!isMobile && (
            <button
              onClick={onPost}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                background: schoolColor || '#111', color: '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14
              }}
            >
              <Plus size={16} />
              Post
            </button>
          )}

          {currentUser ? (
            <>
              <button
                onClick={() => onProfile('saved')}
                style={{ position: 'relative', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Heart size={18} color={favCount > 0 ? '#ef4444' : '#6b7280'} fill={favCount > 0 ? '#ef4444' : 'none'} />
                {favCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '99px', fontSize: 10, fontWeight: 700, padding: '1px 5px', minWidth: 18, textAlign: 'center' }}>
                    {favCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onProfile('listings')}
                style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <User size={18} color="#374151" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAuth('login')}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#374151' }}
              >
                Log in
              </button>
              {!isMobile && (
                <button
                  onClick={() => onAuth('signup')}
                  style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: schoolColor || '#111', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                  Sign up
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
