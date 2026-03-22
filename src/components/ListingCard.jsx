import { Heart, MapPin } from 'lucide-react'
import { getCardColor } from '../constants'

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

  const catLabel = listing.is_looking
    ? 'Looking for Roommates'
    : CATEGORY_LABELS[listing.category] || (listing.category ? listing.category.charAt(0).toUpperCase() + listing.category.slice(1) : 'Listing')

  const price = listing.price != null
    ? (listing.price === 0 ? 'Free' : `$${listing.price.toLocaleString()}${isHousing ? '/mo' : ''}`)
    : null

  const tags = []
  if (listing.profiles?.verified) tags.push('Verified listing')
  if (listing.condition) tags.push(listing.condition)
  if (listing.is_looking) tags.push('Students only')

  return (
    <div
      onClick={() => onClick(listing)}
      style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 240, background: color.bg, overflow: 'hidden', flexShrink: 0 }}>
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

        {/* Category badge */}
        <span style={{
          position: 'absolute', top: 12, left: 12,
          background: red, color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '4px 10px',
          borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>{catLabel}</span>

        {/* Price badge */}
        {price && (
          <span style={{
            position: 'absolute', top: 12, right: 44,
            background: '#fff', color: '#111',
            fontSize: 13, fontWeight: 700, padding: '4px 10px',
            borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
          }}>{price}</span>
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

        {/* Sold overlay */}
        {listing.sold && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#fff', color: '#111', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 8 }}>SOLD</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Title */}
        <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 6px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {listing.title}
        </p>

        {/* Location */}
        {listing.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <MapPin size={12} color="#9ca3af" />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{listing.location}</span>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {listing.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#f3f4f6', color: '#374151' }}>{tag}</span>
            ))}
          </div>
        )}

        {/* CTA button */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={e => { e.stopPropagation(); onClick(listing) }}
            style={{
              width: '100%', padding: '10px 0',
              borderRadius: 10, border: `1.5px solid ${red}`,
              background: 'transparent', color: red,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = red; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = red }}
          >
            {currentUser ? 'Message seller' : 'Sign in to message'}
          </button>
        </div>
      </div>
    </div>
  )
}
