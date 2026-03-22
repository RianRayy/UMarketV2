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

        {/* School badge — acts as school picker */}
        <button
          onClick={onSchoolClick}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 99,
            border: `1.5px solid ${red}`,
            background: red + '10',
            cursor: 'pointer', flexShrink: 0,
            fontSize: 13, fontWeight: 600, color: red,
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = red + '20'}
          onMouseLeave={e => e.currentTarget.style.background = red + '10'}
        >
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>U</div>
          {schoolObj ? `Built for ${schoolObj.name} students` : 'Pick your school'}
          <span style={{ fontSize: 11, opacity: 0.7 }}>▾</span>
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
