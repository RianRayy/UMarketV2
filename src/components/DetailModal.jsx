import { useState } from 'react'
import { Heart, MapPin, Phone, Flag, Trash2, Edit2, CheckSquare, ChevronLeft, ChevronRight, CheckCircle, Award } from 'lucide-react'
import Overlay from './Overlay'

export default function DetailModal({
  listing, isFav, onFav, onClose,
  currentUser, onContact, onReport,
  onDelete, onEdit, onSold, schoolColor
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const imgs = listing.images || []
  const isOwner = currentUser?.id === listing.seller_id
  const isHousing = listing.is_housing
  const isLooking = listing.is_looking

  return (
    <Overlay onClose={onClose} wide>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Image carousel */}
        {imgs.length > 0 ? (
          <div style={{ position: 'relative', height: 260, borderRadius: 14, overflow: 'hidden', background: '#f3f4f6', marginBottom: 18 }}>
            <img src={imgs[imgIdx]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {imgs.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={18} />
                </button>
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {imgs.map((_, i) => (
                    <div key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'width 0.2s' }} />
                  ))}
                </div>
              </>
            )}
            {listing.sold && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ background: '#fff', color: '#111', fontWeight: 800, fontSize: 18, padding: '8px 20px', borderRadius: 10 }}>SOLD</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: 180, borderRadius: 14, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 64 }}>
            {listing.emoji || (isHousing ? '🏠' : isLooking ? '🔍' : '📦')}
          </div>
        )}

        {/* Title & price row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.2 }}>{listing.title}</h2>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {!isLooking && listing.price != null && (
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: schoolColor || '#111' }}>
                {listing.price === 0 ? 'Free' : `$${listing.price}${isHousing ? '/mo' : ''}`}
              </p>
            )}
            {isLooking && listing.budget && (
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#6b7280' }}>Budget: ${listing.budget}</p>
            )}
          </div>
        </div>

        {/* Tags row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {listing.condition && !isHousing && (
            <Tag label={listing.condition} color="#374151" bg="#f3f4f6" />
          )}
          {isHousing && listing.beds && (
            <Tag label={`${listing.beds} bed`} color="#374151" bg="#f3f4f6" />
          )}
          {isHousing && listing.avail && (
            <Tag label={`Available ${listing.avail}`} color="#374151" bg="#f3f4f6" />
          )}
          {listing.location && (
            <Tag label={listing.location} color="#6b7280" bg="#f9fafb" icon={<MapPin size={11} />} />
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{listing.description}</p>
          </div>
        )}

        {/* Seller card */}
        {listing.profiles && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: schoolColor ? schoolColor + '20' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: schoolColor || '#374151', flexShrink: 0 }}>
              {listing.profiles.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111' }}>{listing.profiles.name}</p>
                {listing.profiles.verified && <CheckCircle size={14} color="#22c55e" />}
                {listing.profiles.sold_count >= 5 && <Award size={14} color="#f59e0b" />}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                {listing.profiles.grade} · {listing.profiles.transactions || 0} posts
                {listing.profiles.sold_count > 0 && ` · ${listing.profiles.sold_count} sold`}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!isOwner && (
            <button
              onClick={() => onContact(listing)}
              style={{ padding: '13px', borderRadius: 12, border: 'none', background: schoolColor || '#111', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              Contact Seller
            </button>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onFav(listing.id)}
              style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid ' + (isFav ? '#ef4444' : '#e5e7eb'), background: isFav ? '#fff1f2' : '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: isFav ? '#ef4444' : '#374151' }}
            >
              <Heart size={16} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#374151'} />
              {isFav ? 'Saved' : 'Save'}
            </button>

            {!isOwner && (
              <button
                onClick={() => onReport(listing)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: '#374151' }}
              >
                <Flag size={16} />
                Report
              </button>
            )}

            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(listing)}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: '#374151' }}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                {!listing.sold && (
                  <button
                    onClick={() => onSold(listing)}
                    style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #22c55e', background: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: '#16a34a' }}
                  >
                    <CheckSquare size={16} />
                    Sold
                  </button>
                )}
                <button
                  onClick={() => onDelete(listing)}
                  style={{ padding: '11px 14px', borderRadius: 12, border: '1.5px solid #fee2e2', background: '#fff1f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  )
}

function Tag({ label, color, bg, icon }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: bg, color, fontSize: 12, fontWeight: 600 }}>
      {icon}{label}
    </span>
  )
}
