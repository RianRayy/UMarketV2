import { Heart } from 'lucide-react'
import { getCardColor } from '../constants'

const CONDITION_COLORS = {
  'Like New': '#16a34a',
  'Good': '#2563eb',
  'Fair': '#d97706',
  'Parts Only': '#dc2626',
}

const CATEGORY_LABELS = {
  looking: 'Looking for Roommates',
  housing: 'Housing Listed',
  sublease: 'Subleases',
  textbooks: 'Textbooks',
  furniture: 'Furniture',
  electronics: 'Electronics',
  clothing: 'Clothing',
  appliances: 'Appliances',
  sports: 'Sports',
  misc: 'Misc',
}

export default function ListingCard({ listing, isFav, onFav, onClick, schoolColor, currentUser }) {
  const color = getCardColor(listing.id)
  const isHousing = listing.is_housing
  const isLooking = listing.is_looking
  const red = schoolColor || '#CC0000'

  const price = listing.price != null
    ? (listing.price === 0 ? 'Free' : `$${listing.price.toLocaleString()}${isHousing ? '/mo' : ''}`)
    : null

  return (
    <div
      onClick={() => onClick(listing)}
      style={{
        background: '#fff', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'
      }}
    >
      {/* Square image */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: color.bg, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 56 }}>{listing.emoji || (isHousing ? '🏠' : isLooking ? '🔍' : '📦')}</span>
            </div>
          )}
        </div>

        {/* Fav button */}
        <button
          onClick={e => { e.stopPropagation(); onFav(listing.id) }}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }}
        >
          <Heart size={15} color={isFav ? '#ef4444' : '#9ca3af'} fill={isFav ? '#ef4444' : 'none'} />
        </button>

        {/* Sold overlay */}
        {listing.sold && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#fff', color: '#111', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 8 }}>SOLD</span>
          </div>
        )}
      </div>

      {/* Info below photo */}
      <div style={{ padding: '10px 12px 12px' }}>
        {/* Price */}
        {price && (
          <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: '#111' }}>{price}</p>
        )}

        {/* Title */}
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#222', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
          {listing.title}
        </p>

        {/* Location */}
        {listing.location && (
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{listing.location}</p>
        )}
      </div>
    </div>
  )
}
