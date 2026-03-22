import { useState, useRef, useEffect } from 'react'
import {
  Heart, MapPin, Flag, Trash2, Edit2, CheckSquare,
  ChevronLeft, ChevronRight, CheckCircle, Award,
  X, ZoomIn, Share2, Mail, MessageSquare, Copy, ExternalLink, User,
} from 'lucide-react'
import Overlay from './Overlay'
import { timeAgo } from '../utils/time'
import { supabase } from '../supabase'

/* ─── Lightbox ─────────────────────────────────────────────────────────── */
function Lightbox({ imgs, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const imgRef = useRef()

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

  function handleWheel(e) {
    e.preventDefault()
    setScale(s => Math.min(Math.max(s - e.deltaY * 0.006, 1), 4))
  }

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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.14)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <X size={20} color="#fff" />
      </button>
      {imgs.length > 1 && (
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: 99, zIndex: 2 }}>
          {idx + 1} / {imgs.length}
        </div>
      )}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, zIndex: 2 }}>
        <ZoomIn size={13} color="rgba(255,255,255,0.5)" />
        {scale > 1 ? 'Click to reset' : 'Click or scroll to zoom'}
      </div>
      <div onClick={e => e.stopPropagation()} onWheel={handleWheel} style={{ position: 'relative', maxWidth: '88vw', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 12 }}>
        <img
          ref={imgRef} src={imgs[idx]} alt=""
          onClick={handleImgClick} draggable={false}
          style={{ maxWidth: '88vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 10, display: 'block', transform: `scale(${scale})`, transformOrigin: `${origin.x}% ${origin.y}%`, transition: scale === 1 ? 'transform 0.22s ease' : 'none', cursor: scale > 1 ? 'zoom-out' : 'zoom-in', userSelect: 'none', WebkitUserDrag: 'none' }}
        />
      </div>
      {imgs.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.14)', border: 'none', borderRadius: '50%', width: 46, height: 46, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <ChevronLeft size={24} color="#fff" />
          </button>
          <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.14)', border: 'none', borderRadius: '50%', width: 46, height: 46, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <ChevronRight size={24} color="#fff" />
          </button>
        </>
      )}
      {imgs.length > 1 && (
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.55)', borderRadius: 14, zIndex: 2, maxWidth: '90vw', overflowX: 'auto' }}>
          {imgs.map((src, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); setIdx(i); setScale(1) }} style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 9, overflow: 'hidden', border: i === idx ? '2.5px solid #fff' : '2.5px solid transparent', opacity: i === idx ? 1 : 0.55, cursor: 'pointer', transition: 'all 0.15s' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Share Sheet ───────────────────────────────────────────────────────── */
function ShareSheet({ listing, onClose }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href
  const text = `${listing.title}${listing.price != null ? ` — $${listing.price}` : ''} on UMarket`

  const options = [
    {
      label: 'Facebook', color: '#1877f2', bg: '#e7f0fe', emoji: '📘',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      label: 'Twitter / X', color: '#000', bg: '#f3f4f6', emoji: '𝕏',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      label: 'Text message', color: '#22c55e', bg: '#dcfce7', icon: <MessageSquare size={18} color="#22c55e" />,
      action: () => window.open(`sms:?body=${encodeURIComponent(text + '\n' + url)}`),
    },
    {
      label: 'Email', color: '#6366f1', bg: '#eef2ff', icon: <Mail size={18} color="#6366f1" />,
      action: () => window.open(`mailto:?subject=${encodeURIComponent('Check this out on UMarket')}&body=${encodeURIComponent(text + '\n\n' + url)}`),
    },
    {
      label: copied ? 'Copied!' : 'Copy link', color: copied ? '#22c55e' : '#374151', bg: '#f9fafb', icon: <Copy size={18} color={copied ? '#22c55e' : '#374151'} />,
      action: () => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) },
    },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 8888, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 16px 32px', width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#111' }}>Share listing</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => (
            <button
              key={opt.label}
              onClick={() => { opt.action(); if (opt.label !== 'Copy link' && opt.label !== 'Copied!') onClose() }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 12, border: `1px solid ${opt.bg === '#f9fafb' ? '#e5e7eb' : opt.bg}`, background: opt.bg, cursor: 'pointer', textAlign: 'left' }}
            >
              {opt.icon ? opt.icon : <span style={{ fontSize: 18, width: 18, textAlign: 'center', fontWeight: 900 }}>{opt.emoji}</span>}
              <span style={{ fontWeight: 600, fontSize: 14, color: opt.color }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Map section ───────────────────────────────────────────────────────── */
function ListingMap({ lat, lng, location }) {
  // Show a ~2km radius bounding box (not exact address — just general area)
  const delta = 0.018
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const appleMapsUrl = `https://maps.apple.com/?q=${lat},${lng}`

  return (
    <div style={{ marginTop: 16, borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <div style={{ padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justify: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <MapPin size={14} color="#6b7280" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            General area {location ? `· ${location}` : ''}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>Approximate — exact address shared upon contact</span>
      </div>

      {/* Interactive OpenStreetMap embed */}
      <div style={{ position: 'relative', height: 240 }}>
        <iframe
          src={embedUrl}
          title="Listing area map"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Navigate buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 10, background: '#fff', border: '1px solid #e5e7eb', textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 600 }}
        >
          <ExternalLink size={13} /> Google Maps
        </a>
        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 10, background: '#fff', border: '1px solid #e5e7eb', textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 600 }}
        >
          <ExternalLink size={13} /> Apple Maps
        </a>
      </div>
    </div>
  )
}

/* ─── Detail Modal ──────────────────────────────────────────────────────── */
export default function DetailModal({
  listing, isFav, onFav, onClose,
  currentUser, onContact, onReport,
  onDelete, onEdit, onSold, schoolColor, onViewSeller,
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [sellerProfile, setSellerProfile] = useState(listing.profiles || null)
  const imgs = listing.images || []
  const isOwner = currentUser?.id === listing.seller_id
  const isHousing = listing.is_housing
  const isLooking = listing.is_looking
  const hasMap = listing.lat && listing.lng

  // Fetch seller profile if not already attached
  useEffect(() => {
    if (sellerProfile || !listing.seller_id) return
    supabase
      .from('profiles')
      .select('name, grade, verified, sold_count')
      .eq('id', listing.seller_id)
      .single()
      .then(({ data }) => { if (data) setSellerProfile(data) })
  }, [listing.seller_id])

  return (
    <>
      <Overlay onClose={onClose} wide>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* ── Image carousel ── */}
          {imgs.length > 0 ? (
            <div style={{ marginBottom: 14 }}>
              <div onClick={() => setLightbox(true)} style={{ position: 'relative', width: '100%', height: 340, borderRadius: 14, overflow: 'hidden', background: '#111', cursor: 'zoom-in', marginBottom: 10 }}>
                <img src={imgs[imgIdx]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 99, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, color: '#fff', fontSize: 11, fontWeight: 600, pointerEvents: 'none' }}>
                  <ZoomIn size={12} color="#fff" /> Tap to expand
                </div>
                {imgs.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + imgs.length) % imgs.length) }} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                      <ChevronLeft size={18} color="#111" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % imgs.length) }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
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
              {imgs.length > 1 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
                  {imgs.map((src, i) => (
                    <div key={i} onClick={() => setImgIdx(i)} style={{ width: 62, height: 62, flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: i === imgIdx ? `2.5px solid ${schoolColor || '#111'}` : '2.5px solid #e5e7eb', cursor: 'pointer', opacity: i === imgIdx ? 1 : 0.65, transition: 'all 0.15s' }}>
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

          {/* ── Title, price, time ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
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

          {/* Time listed */}
          <p style={{ margin: '0 0 10px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
            Listed {timeAgo(listing.created_at)}
          </p>

          {/* ── Tags ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {listing.condition && !isHousing && <Tag label={listing.condition} color="#374151" bg="#f3f4f6" />}
            {isHousing && listing.beds && <Tag label={`${listing.beds} bed`} color="#374151" bg="#f3f4f6" />}
            {isHousing && listing.avail && <Tag label={`Available ${listing.avail}`} color="#374151" bg="#f3f4f6" />}
            {listing.location && <Tag label={listing.location} color="#6b7280" bg="#f9fafb" icon={<MapPin size={11} />} />}
          </div>

          {/* ── Description ── */}
          {listing.description && (
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{listing.description}</p>
          )}

          {/* ── Seller card — clickable ── */}
          {sellerProfile && (
            <button
              onClick={() => onViewSeller && onViewSeller(listing.seller_id)}
              style={{
                width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
                cursor: onViewSeller ? 'pointer' : 'default', textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (onViewSeller) e.currentTarget.style.background = '#f0f0f0' }}
              onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: schoolColor ? schoolColor + '20' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: schoolColor || '#374151', flexShrink: 0 }}>
                {sellerProfile.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111' }}>{sellerProfile.name}</p>
                  {sellerProfile.verified && <CheckCircle size={14} color="#22c55e" />}
                  {sellerProfile.sold_count >= 5 && <Award size={14} color="#f59e0b" />}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                  {sellerProfile.grade} · {sellerProfile.sold_count > 0 ? `${sellerProfile.sold_count} sold` : 'New seller'}
                </p>
              </div>
              {onViewSeller && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: schoolColor || '#6b7280', fontWeight: 600 }}>
                  <User size={13} /> View profile
                </div>
              )}
            </button>
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

              {/* Share button */}
              <button
                onClick={() => setShowShare(true)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: '#374151' }}
              >
                <Share2 size={16} /> Share
              </button>

              {!isOwner && (
                <button
                  onClick={() => onReport(listing)}
                  style={{ padding: '11px 13px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Flag size={16} color="#9ca3af" />
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => onEdit(listing)}
                    style={{ padding: '11px 13px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Edit2 size={16} color="#374151" />
                  </button>
                  {!listing.sold && (
                    <button
                      onClick={() => onSold(listing)}
                      style={{ padding: '11px 13px', borderRadius: 12, border: '1.5px solid #22c55e', background: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <CheckSquare size={16} color="#16a34a" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(listing)}
                    style={{ padding: '11px 13px', borderRadius: 12, border: '1.5px solid #fee2e2', background: '#fff1f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Map ── */}
          {hasMap && <ListingMap lat={listing.lat} lng={listing.lng} location={listing.location} />}

        </div>
      </Overlay>

      {lightbox && imgs.length > 0 && (
        <Lightbox imgs={imgs} startIdx={imgIdx} onClose={() => setLightbox(false)} />
      )}

      {showShare && (
        <ShareSheet listing={listing} onClose={() => setShowShare(false)} />
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
