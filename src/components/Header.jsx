import { SCHOOLS } from '../constants'

export default function Header({
  school, onSchoolClick, search, onSearch,
  onPost, onAuth, currentUser, favCount,
  onProfile, isMobile, schoolColor
}) {
  const schoolObj = SCHOOLS.find(s => s.id === school)
  const red = schoolColor || '#CC0000'

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 16px' : '0 32px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Logo — clicks to open school picker */}
        <button
          onClick={onSchoolClick}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0, background: 'none', border: 'none', padding: 0 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 20, flexShrink: 0 }}>U</div>
          {!isMobile && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111', letterSpacing: '-0.3px', lineHeight: 1.2 }}>U Marketplace</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.3 }}>
                {schoolObj ? `${schoolObj.name} student housing + marketplace` : 'Student housing + marketplace'}
              </div>
            </div>
          )}
        </button>

        <div style={{ flex: 1 }} />

        {/* Mobile search */}
        {isMobile && (
          <div style={{ flex: 1 }}>
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search..."
              style={{ width: '100%', padding: '7px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, outline: 'none', color: '#111' }}
            />
          </div>
        )}

        {/* Auth actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {currentUser ? (
            <>
              <button
                onClick={onPost}
                style={{ padding: '7px 18px', borderRadius: 99, border: `1.5px solid ${red}`, background: 'transparent', color: red, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >+ Post</button>
              <button
                onClick={() => onProfile('listings')}
                style={{ padding: '7px 18px', borderRadius: 99, border: 'none', background: red, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >Profile</button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAuth('login')}
                style={{ padding: '7px 18px', borderRadius: 99, border: `1.5px solid ${red}`, background: 'transparent', color: red, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >Log In</button>
              {!isMobile && (
                <button
                  onClick={() => onAuth('signup')}
                  style={{ padding: '7px 18px', borderRadius: 99, border: 'none', background: red, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                >Sign Up</button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
