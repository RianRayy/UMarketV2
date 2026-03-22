import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Award, LogOut, Package, Heart, Settings, Edit2, Trash2, ChevronRight, School, ArrowLeft, Camera } from 'lucide-react'
import { supabase } from '../supabase'
import { getCardColor, GRADES } from '../constants'

/* ── Avatar component — reused everywhere ───────────────────────────────── */
export function Avatar({ profile, size = 68, schoolColor, onClick, uploading }) {
  const initial = profile?.name?.[0]?.toUpperCase() || '?'
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: profile?.avatar_url ? '#f3f4f6' : (schoolColor || '#CC0000'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: onClick ? `0 4px 12px ${schoolColor || '#CC0000'}40` : `0 2px 8px rgba(0,0,0,0.12)`,
      }}
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: size * 0.38, fontWeight: 900, color: '#fff' }}>{initial}</span>
      )}
      {/* Camera overlay on hover (only if clickable) */}
      {onClick && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: uploading ? 1 : 0, transition: 'opacity 0.2s',
          borderRadius: '50%',
        }}
          onMouseEnter={e => { if (!uploading) e.currentTarget.style.opacity = 1 }}
          onMouseLeave={e => { if (!uploading) e.currentTarget.style.opacity = 0 }}
        >
          {uploading
            ? <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : <Camera size={size * 0.28} color="#fff" />
          }
        </div>
      )}
    </div>
  )
}

/* ── Verified badge ─────────────────────────────────────────────────────── */
export function VerifiedBadge({ size = 'md' }) {
  const isLg = size === 'lg'
  return (
    <span
      title="Verified Student — signed up with a .edu email"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: isLg ? 5 : 3,
        background: '#dbeafe', color: '#1d4ed8',
        borderRadius: 99, padding: isLg ? '3px 10px 3px 6px' : '2px 7px 2px 4px',
        fontSize: isLg ? 12 : 10, fontWeight: 700, cursor: 'default',
        border: '1px solid #bfdbfe',
        letterSpacing: '0.01em',
      }}
    >
      <CheckCircle size={isLg ? 13 : 11} color="#1d4ed8" />
      Verified Student
    </span>
  )
}

export default function ProfilePage({
  currentUser, profile, listings, favListings,
  onEdit, onDelete, onSold, onDetail,
  onSchoolSwitch, onLogout, schoolColor,
  initTab, onToast, onProfileUpdate, onHome
}) {
  const [tab, setTab] = useState(initTab || 'listings')
  const [editingProfile, setEditingProfile] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [grade, setGrade] = useState(profile?.grade || '')
  const [contactType, setContactType] = useState(profile?.contact_type || 'instagram')
  const [contact, setContact] = useState(profile?.contact || '')
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [myListings, setMyListings] = useState([])
  const avatarRef = useRef()

  // Load user's own listings
  useEffect(() => {
    if (!currentUser) return
    supabase
      .from('listings')
      .select('*')
      .eq('seller_id', currentUser.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setMyListings(data) })
  }, [currentUser])

  // Sync when profile prop updates
  useEffect(() => {
    if (profile?.name) setName(profile.name)
    if (profile?.grade) setGrade(profile.grade)
    if (profile?.contact_type) setContactType(profile.contact_type)
    if (profile?.contact) setContact(profile.contact)
  }, [profile])

  /* ── Avatar upload ─────────────────────────────────────────────── */
  async function handleAvatarFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `avatars/${currentUser.id}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('listing-images')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (upErr) {
      onToast('Photo upload failed — try again')
      setAvatarUploading(false)
      return
    }
    const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
    const avatarUrl = data.publicUrl
    const { error: dbErr } = await supabase.from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', currentUser.id)
    if (dbErr) {
      onToast('Could not save photo')
    } else {
      onProfileUpdate?.({ avatar_url: avatarUrl })
      onToast('Profile photo updated ✓')
    }
    setAvatarUploading(false)
  }

  /* ── Save profile edits ────────────────────────────────────────── */
  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: currentUser.id,
      name,
      grade,
      contact,
      contact_type: contactType,
    }, { onConflict: 'id' })
    if (error) {
      console.error('Profile save error:', error.message)
      onToast('Error saving — try again')
    } else {
      onProfileUpdate?.({ name, grade, contact, contact_type: contactType })
      onToast('Profile updated ✓')
      setEditingProfile(false)
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 100px' }}>

      {/* Back to home */}
      <button
        onClick={onHome}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginBottom: 20, padding: '8px 16px', borderRadius: 99,
          border: `1.5px solid ${schoolColor || '#CC0000'}`,
          background: 'transparent', color: schoolColor || '#CC0000',
          fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = schoolColor || '#CC0000'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = schoolColor || '#CC0000' }}
      >
        <ArrowLeft size={15} /> Back to Home
      </button>

      {/* Profile header card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>

          {/* Avatar — click to upload */}
          <div style={{ position: 'relative' }}>
            <Avatar
              profile={profile}
              size={72}
              schoolColor={schoolColor}
              uploading={avatarUploading}
              onClick={() => avatarRef.current?.click()}
            />
            {/* Camera badge */}
            <div
              onClick={() => avatarRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 24, height: 24, borderRadius: '50%',
                background: schoolColor || '#CC0000', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              <Camera size={12} color="#fff" />
            </div>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFile}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                {profile?.name || 'User'}
              </h2>
              {profile?.verified && <VerifiedBadge size="lg" />}
              {profile?.sold_count >= 5 && (
                <span title="Power Seller — 5+ items sold" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#fef3c7', color: '#92400e', borderRadius: 99, padding: '2px 8px 2px 5px', fontSize: 10, fontWeight: 700, border: '1px solid #fde68a' }}>
                  <Award size={11} color="#d97706" /> Power Seller
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              {profile?.grade ? `Class of ${profile.grade}` : 'No grad year set'}
              {profile?.school ? ` · ${profile.school.toUpperCase()}` : ''}
            </p>
          </div>

          <button
            onClick={() => setEditingProfile(!editingProfile)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', background: editingProfile ? '#f3f4f6' : '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
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

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5 }}>Display name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', color: '#111', background: '#f9fafb', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5 }}>Graduating year</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, color: '#111', background: '#f9fafb' }}
              >
                <option value="">Select graduating year</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5 }}>Social / contact</label>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 8 }}>
                <select
                  value={contactType}
                  onChange={e => setContactType(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, color: '#111', background: '#f9fafb' }}
                >
                  <option value="instagram">Instagram</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select>
                <input
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="@username"
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', color: '#111', background: '#f9fafb' }}
                />
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              style={{ padding: '11px', borderRadius: 10, border: 'none', background: saving ? '#d1d5db' : (schoolColor || '#111'), color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[
          ['listings', 'My Listings', <Package size={15} />],
          ['saved', 'Saved', <Heart size={15} />],
          ['settings', 'Settings', <Settings size={15} />],
        ].map(([id, label, icon]) => (
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
          <SettingsRow
            icon={<CheckCircle size={18} color={profile?.verified ? '#1d4ed8' : '#9ca3af'} />}
            label={profile?.verified ? 'Verified Student ✓' : 'Not verified'}
            sub={profile?.verified ? 'Signed up with your .edu email' : 'Only .edu emails can sign up'}
          />
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
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', display: 'flex' }}>
      <div onClick={() => onDetail(listing)} style={{ width: 80, flexShrink: 0, background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
        {listing.images?.[0]
          ? <img src={listing.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 28 }}>{listing.emoji || '📦'}</span>
        }
        {listing.sold && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>SOLD</span>
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: '12px 14px', cursor: 'pointer', minWidth: 0 }} onClick={() => onDetail(listing)}>
        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <p style={{ margin: 0, fontSize: 13, color: schoolColor || '#374151', fontWeight: 700 }}>
            {listing.price != null && !listing.is_looking ? (listing.price === 0 ? 'Free' : `$${listing.price}`) : listing.budget ? `Budget: $${listing.budget}` : ''}
          </p>
          {listing.condition && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99, color: ({ 'Like New': '#16a34a', 'Good': '#2563eb', 'Fair': '#d97706', 'Parts Only': '#dc2626' }[listing.condition] || '#374151'), background: ({ 'Like New': '#dcfce7', 'Good': '#dbeafe', 'Fair': '#fef3c7', 'Parts Only': '#fee2e2' }[listing.condition] || '#f3f4f6') }}>
              {listing.condition}
            </span>
          )}
        </div>
        {listing.description && (
          <p style={{ margin: 0, fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.description}</p>
        )}
      </div>
      {onEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', borderLeft: '1px solid #f3f4f6' }}>
          <button onClick={() => onEdit(listing)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, display: 'flex' }}>
            <Edit2 size={15} color="#6b7280" />
          </button>
          {!listing.sold && onSold && (
            <button onClick={() => onSold(listing)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, display: 'flex' }}>
              <CheckCircle size={15} color="#22c55e" />
            </button>
          )}
          <button onClick={() => onDelete(listing)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, display: 'flex' }}>
            <Trash2 size={15} color="#ef4444" />
          </button>
        </div>
      )}
    </div>
  )
}

function SettingsRow({ icon, label, sub, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', cursor: onClick ? 'pointer' : 'default', textAlign: 'left' }}>
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
