import { Heart, MapPin, CheckCircle } from 'lucide-react'
import { getCardColor } from '../constants'

export default function ListingCard({ listing, isFav, onFav, onClick, schoolColor }) {
  const color = getCardColor(listing.id)
  const isHousing = listing.is_housing
  const isLooking = listing.is_looking

  return (
    <div
      onClick={() => onClick(listing)}
      style={{
        background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Image / Color block */}
      <div style={{ position: 'relative', height: 160, background: color.bg, overflow: 'hidden' }}>
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 48 }}>{listing.emoji || (isHousing ? '🏠' : isLooking ? '🔍' : '📦')}</span>
          </div>
        )}

        {/* Fav button */}
        <button
          onClick={e => { e.stopPropagation(); onFav(listing.id) }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
          }}
        >
          <Heart size={15} color={isFav ? '#ef4444' : '#9ca3af'} fill={isFav ? '#ef4444' : 'none'} />
        </button>

        {/* Condition badge */}
        {listing.condition && !isHousing && (
          <span style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,0.65)', color: '#fff',
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6
          }}>
            {listing.condition}
          </span>
        )}

        {listing.sold && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ background: '#fff', color: '#111', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 8 }}>SOLD</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0, lineHeight: 1.3, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {listing.title}
          </p>
          {listing.price != null && !isLooking && (
            <p style={{ fontSize: 15, fontWeight: 700, color: schoolColor || '#111', margin: 0, flexShrink: 0 }}>
              {listing.price === 0 ? 'Free' : `$${listing.price}${isHousing ? '/mo' : ''}`}
            </p>
          )}
          {isLooking && listing.budget && (
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', margin: 0, flexShrink: 0 }}>
              Budget: ${listing.budget}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {listing.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} color="#9ca3af" />
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{listing.location}</span>
            </div>
          )}
          {listing.profiles?.verified && (
            <CheckCircle size={11} color="#22c55e" style={{ marginLeft: 'auto' }} />
          )}
        </div>

        {listing.profiles?.name && (
          <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.profiles.name}
          </p>
        )}
      </div>
    </div>
  )
}
