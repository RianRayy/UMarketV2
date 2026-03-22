import { ChevronDown, MapPin } from 'lucide-react'
import { SCHOOLS } from '../constants'
import NotificationPanel from './NotificationPanel'

export default function Header({
  school, onSchoolClick, search, onSearch,
  onPost, onAuth, currentUser, profile, favCount,
  onProfile, isMobile, schoolColor,
  unreadNotifCount, onNotifCountChange,
}) {
  const schoolObj = SCHOOLS.find(s => s.id === school)
  const red = schoolColor || '#CC0000'

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: red, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 16px' : '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18 }}>U</div>
          {!isMobile && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>U Marketplace</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.3 }}>Student housing + marketplace</div>
            </div>
          )}
        </div>

        {/* University selector */}
        <button
          onClick={onSchoolClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 99,
            background: 'rgba(255,255,255,0.2)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            cursor: 'pointer', color: '#fff',
            fontSize: 13, fontWeight: 600,
            transition: 'background 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          <MapPin size={13} color="rgba(255,255,255,0.85)" />
          {schoolObj ? schoolObj.name : 'Select your university'}
          <ChevronDown size={13} color="rgba(255,255,255,0.85)" />
        </button>

        <div style={{ flex: 1 }} />

        {/* Mobile search */}
        {isMobile && (
          <div style={{ flex: 1 }}>
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search..."
              style={{ width: '100%', padding: '7px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', fontSize: 14, outline: 'none', color: '#fff' }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {currentUser ? (
            <>
              {/* Notification bell */}
              <NotificationPanel
                currentUser={currentUser}
                schoolColor={red}
                unreadCount={unreadNotifCount || 0}
                onCountChange={onNotifCountChange}
              />

              <button
                onClick={onPost}
                style={{ padding: '7px 18px', borderRadius: 99, border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >+ Post</button>

              <button
                onClick={() => onProfile('listings')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px 5px 6px', borderRadius: 99, border: 'none', background: '#fff', color: red, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
                    {profile?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {!isMobile && (profile?.name?.split(' ')[0] || 'Profile')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAuth('login')}
                style={{ padding: '7px 18px', borderRadius: 99, border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >Log In</button>
              {!isMobile && (
                <button
                  onClick={() => onAuth('signup')}
                  style={{ padding: '7px 18px', borderRadius: 99, border: 'none', background: '#fff', color: red, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
                >Sign Up</button>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  )
}
