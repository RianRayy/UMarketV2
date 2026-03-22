import { useState, useRef, useEffect } from 'react'
import { Heart, MapPin, Flag, Trash2, Edit2, CheckSquare, ChevronLeft, ChevronRight, CheckCircle, Award, X, ZoomIn } from 'lucide-react'
import Overlay from './Overlay'

/* ─── Lightbox ─────────────────────────────────────────────────────────── */
function Lightbox({ imgs, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const imgRef = useRef()

  // Keyboard nav
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  { setScale(1); setIdx(i => (i - 1 + imgs.length) % imgs.length) }
      if (e.key === 'ArrowRight') { setScale(1); setIdx(i => (i + 1) % imgs.length) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [imgs.length, onClose])

  function prev() { setScale(1); setIdx(i => (i - 1 + imgs.length) % imgs.length) }
  function next() { setScale(1); setIdx(i => (i + 1) % imgs.length) }

  // Scroll-wheel zoom
  function handleWheel(e) {
    e.preventDefault()
    setScale(s => Math.min(Math.max(s - e.deltaY * 0.006, 1), 4))
  }

  // Click-to-zoom
  function handleImgClick(e) {
    if (scale > 1) { setScale(1); return }
    const rect = imgRef.current.getBoundingClientRect()
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
    setScale(2.5)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.93)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.14)', border: 'none', borderRadius: '50%',
          width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
        }}
      >
        <X size={20} color="#fff" />
      </button>

      {/* Counter */}
      {imgs.length > 1 && (
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600,
          background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: 99, zIndex: 2,
        }}>
          {idx + 1} / {imgs.length}
        </div>
      )}

      {/* Zoom hint */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 5, zIndex: 2,
      }}>
        <ZoomIn size={13} color="rgba(255,255,255,0.5)" />
        {scale > 1 ? 'Click to reset' : 'Click or scroll to zoom'}
      </div>

      {/* Image area */}
      <div
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
        style={{
          position: 'relative', maxWidth: '88vw', maxHeight: '80vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', borderRadius: 12,
        }}
      >
        <img
          ref={imgRef}
          src={imgs[idx]}
          alt=""
          onClick={handleImgClick}
          draggable={false}
          style={{
            maxWidth: '88vw', maxHeight: '80vh',
            objectFit: 'contain', borderRadius: 10, display: 'block',
            transform: `scale(${scale})`,
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transition: scale === 1 ? 'transform 0.22s ease' : 'none',
            cursor: scale > 1 ? 'zoom-out' : 'zoom-in',
            userSelect: 'none', WebkitUserDrag: 'none',
          }}
        />
      </div>

      {/* Prev / Next */}
      {imgs.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.14)', border: 'none', borderRadius: '50%',
              width: 46, height: 46, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}
          >
            <ChevronLeft size={24} color="#fff" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next() }}
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.14)', border: 'none', borderRadius: '50%',
              width: 46, height: 46, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}
          >
            <ChevronRight size={24} color="#fff" />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {imgs.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8, padding: '8px 12px',
          background: 'rgba(0,0,0,0.55)', borderRadius: 14, zIndex: 2,
          maxWidth: '90vw', overflowX: 'auto',
        }}>
          {imgs.map((src, i) => (
            <div
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i); setScale(1) }}
              style={{
                width: 52, height: 52, flexShrink: 0, borderRadius: 9, overflow: 'hidden',
                border: i === idx ? '2.5px solid #fff' : '2.5px solid transparent',
                opacity: i === idx ? 1 : 0.55,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Detail Modal ──────────────────────────────────────────────────────── */
export default function DetailModal({
  listing, isFav, onFav, onClose,
  currentUser, onContact, onReport,
  onDelete, onEdit, onSold, schoolColor
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const imgs = listing.images || []
  const isOwner = currentUser?.id === listing.seller_id
  const isHousing = listing.is_housing
  const isLooking = listing.is_looking

  return (
    <>
      <Overlay onClose={onClose} wide>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* ── Image carousel ── */}
          {imgs.length > 0 ? (
            <div style={{ marginBottom: 14 }}>

              {/* Main image — click to open lightbox */}
              <div
                onClick={() => setLightbox(true)}
                style={{
                  position: 'relative', width: '100%', height: 340,
                  borderRadius: 14, overflow: 'hidden',
                  background: '#111', cursor: 'zoom-in', marginBottom: 10,
                }}
              >
                <img
                  src={imgs[imgIdx]}
                  alt={listing.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                {/* Zoom hint badge */}
                <div style={{
                  position: 'absolute', bottom: 10, left: 10,
                  background: 'rgba(0,0,0,0.55)', borderRadius: 99,
                  padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5,
                  color: '#fff', fontSize: 11, fontWeight: 600, pointerEvents: 'none',
                }}>
                  <ZoomIn size={12} color="#fff" /> Tap to expand
                </div>

                {/* Arrow buttons (stop propagation so they don't open lightbox) */}
                {imgs.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + imgs.length) % imgs.length) }}
                      style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                        width: 34, height: 34, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <ChevronLeft size={18} color="#111" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % imgs.length) }}
                      style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                        width: 34, height: 34, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <ChevronRight size={18} color="#111" />
                    </button>
                  </>
                )}

                {listing.sold && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ background: '#fff', color: '#111', fontWeight: 800, fontSize: 18, padding: '8px 20px', borderRadius: 10 }}>SOLD</span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {imgs.length > 1 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
                  {imgs.map((src, i) => (
                    <div
                      key={i}
                      onClick={() => setImgIdx(i)}
                      style={{
                        width: 62, height: 62, flexShrink: 0, borderRadius: 10, overflow: 'hidden',
                        border: i === imgIdx ? `2.5px solid ${schoolColor || '#111'}` : '2.5px solid #e5e7eb',
                        cursor: 'pointer', opacity: i === imgIdx ? 1 : 0.65,
                        transition: 'all 0.15s',
                      }}
                    >
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: 180, borderRadius: 14, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 64 }}>
              {listing.emoji || (isHousing ? '🏠' : isLooking ? '🔍' : '📦')}
            </div>
          )}

          {/* ── Title & price ── */}
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

          {/* ── Tags ── */}
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

          {/* ── Description ── */}
          {listing.description && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{listing.description}</p>
            </div>
          )}

          {/* ── Action buttons ── */}
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

      {/* Lightbox — rendered outside Overlay so it covers everything */}
      {lightbox && imgs.length > 0 && (
        <Lightbox imgs={imgs} startIdx={imgIdx} onClose={() => setLightbox(false)} />
      )}
    </>
  )
}

function Tag({ label, color, bg, icon }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: bg, color, fontSize: 12, fontWeight: 600 }}>
      {icon}{label}
    </span>
  )
}
