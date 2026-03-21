import { useState } from 'react'
import { CheckCircle, Award, LogOut, Package, Heart, Settings, Edit2, Trash2, ChevronRight, School } from 'lucide-react'
import { supabase } from '../supabase'
import { getCardColor } from '../constants'

export default function ProfilePage({
  currentUser, profile, listings, favListings,
  onEdit, onDelete, onSold, onDetail,
  onSchoolSwitch, onLogout, schoolColor,
  initTab, onToast
}) {
  const [tab, setTab] = useState(initTab || 'listings')
  const [editingProfile, setEditingProfile] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [contactType, setContactType] = useState(profile?.contact_type || 'instagram')
  const [contact, setContact] = useState(profile?.contact || '')
  const [saving, setSaving] = useState(false)

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update({ name, contact, contact_type: contactType }).eq('id', currentUser.id)
    onToast('Profile updated')
    setEditingProfile(false)
    setSaving(false)
  }

  const myListings = listings.filter(l => l.seller_id === currentUser?.id)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 100px' }}>

      {/* Profile header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: schoolColor ? schoolColor + '20' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: schoolColor || '#374151', flexShrink: 0 }}>
            {profile?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111' }}>{profile?.name || 'User'}</h2>
              {profile?.verified && <CheckCircle size={16} color="#22c55e" />}
              {profile?.sold_count >= 5 && <Award size={16} color="#f59e0b" />}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{profile?.grade} · {profile?.school?.toUpperCase()}</p>
          </div>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Edit2 size={16} color="#374151" />
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <StatCard label="Posts" value={myListings.length} color={schoolColor} />
          <StatCard label="Sold" value={profile?.sold_count || 0} color="#22c55e" />
          <StatCard label="Saved" value={favListings.length} color="#ef4444" />
        </div>

        {/* Edit form */}
        {editingProfile && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', color: '#111', background: '#f9fafb' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
              <select value={contactType} onChange={e => setContactType(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, color: '#111', background: '#f9fafb' }}>
                <option value="instagram">Instagram</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
              <input value={contact} onChange={e => setContact(e.target.value)} placeholder="@username"
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', color: '#111', background: '#f9fafb' }} />
            </div>
            <button onClick={saveProfile} disabled={saving}
              style={{ padding: '11px', borderRadius: 10, border: 'none', background: schoolColor || '#111', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[['listings', 'My Listings', <Package size={15} />], ['saved', 'Saved', <Heart size={15} />], ['settings', 'Settings', <Settings size={15} />]].map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 9, border: 'none', background: tab === id ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: tab === id ? 700 : 500, fontSize: 13, color: tab === id ? '#111' : '#6b7280', boxShadow: tab === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'listings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myListings.length === 0 ? (
            <Empty label="No listings yet" sub="Post something to see it here" />
          ) : myListings.map(l => (
            <ListingRow key={l.id} listing={l} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} onSold={onSold} schoolColor={schoolColor} />
          ))}
        </div>
      )}

      {tab === 'saved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {favListings.length === 0 ? (
            <Empty label="No saved listings" sub="Heart listings to save them" />
          ) : favListings.map(l => (
            <ListingRow key={l.id} listing={l} onDetail={onDetail} schoolColor={schoolColor} />
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingsRow icon={<School size={18} color="#374151" />} label="Switch school" onClick={onSchoolSwitch} />
          <SettingsRow icon={<CheckCircle size={18} color="#22c55e" />} label={profile?.verified ? 'Verified ✓' : 'Get verified'} sub={profile?.verified ? 'Your .edu email is verified' : 'Sign up with your .edu email'} />
          <SettingsRow icon={<LogOut size={18} color="#ef4444" />} label="Log out" onClick={onLogout} danger />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: color || '#111' }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

function ListingRow({ listing, onDetail, onEdit, onDelete, onSold, schoolColor }) {
  const color = getCardColor(listing.id)
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', display: 'flex', gap: 0 }}>
      <div
        onClick={() => onDetail(listing)}
        style={{ width: 80, flexShrink: 0, background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
      >
        {listing.images?.[0] ? (
          <img src={listing.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 28 }}>{listing.emoji || '📦'}</span>
        )}
        {listing.sold && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>SOLD</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '12px 14px', cursor: 'pointer' }} onClick={() => onDetail(listing)}>
        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</p>
        <p style={{ margin: 0, fontSize: 13, color: schoolColor || '#374151', fontWeight: 600 }}>
          {listing.price != null && !listing.is_looking ? (listing.price === 0 ? 'Free' : `$${listing.price}`) : listing.budget ? `Budget: $${listing.budget}` : ''}
        </p>
      </div>

      {onEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', borderLeft: '1px solid #f3f4f6' }}>
          <button onClick={() => onEdit(listing)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <Edit2 size={15} color="#6b7280" />
          </button>
          {!listing.sold && onSold && (
            <button onClick={() => onSold(listing)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
              <CheckCircle size={15} color="#22c55e" />
            </button>
          )}
          <button onClick={() => onDelete(listing)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <Trash2 size={15} color="#ef4444" />
          </button>
        </div>
      )}
    </div>
  )
}

function SettingsRow({ icon, label, sub, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', cursor: onClick ? 'pointer' : 'default', textAlign: 'left' }}
    >
      {icon}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: danger ? '#ef4444' : '#111' }}>{label}</p>
        {sub && <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{sub}</p>}
      </div>
      {onClick && <ChevronRight size={16} color="#9ca3af" />}
    </button>
  )
}

function Empty({ label, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#374151' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>{sub}</p>
    </div>
  )
}
