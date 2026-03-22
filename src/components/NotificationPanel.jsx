import { useState, useEffect, useRef } from 'react'
import { Bell, X, Package } from 'lucide-react'
import { supabase } from '../supabase'
import { timeAgo } from '../utils/time'

export default function NotificationPanel({ currentUser, schoolColor, unreadCount, onCountChange }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef()

  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function openPanel() {
    setOpen(v => !v)
    if (!open && currentUser) {
      setLoading(true)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(30)
      setNotifs(data || [])
      setLoading(false)
      // Mark all read
      await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id).eq('read', false)
      onCountChange(0)
    }
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={openPanel}
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      >
        <Bell size={17} color="#fff" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            background: '#ef4444', color: '#fff',
            borderRadius: '99px', fontSize: 9, fontWeight: 800,
            minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid transparent',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 320, background: '#fff', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid #e5e7eb',
          zIndex: 200, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>Notifications</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
              <X size={16} color="#6b7280" />
            </button>
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading...</div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <Bell size={28} color="#d1d5db" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>No notifications yet</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Follow sellers to get notified when they post</p>
              </div>
            ) : notifs.map(n => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                borderBottom: '1px solid #f9fafb', background: n.read ? '#fff' : '#eff6ff',
                transition: 'background 0.2s',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: schoolColor || '#CC0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                  {n.seller_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 13, color: '#111', lineHeight: 1.4 }}>
                    <strong>{n.seller_name}</strong> posted a new listing
                  </p>
                  <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 700, color: schoolColor || '#111' }}>
                    {n.listing_title}{n.listing_price != null ? ` · $${n.listing_price}` : ''}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{timeAgo(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
