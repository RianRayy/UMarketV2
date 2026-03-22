import { useState, useRef, useEffect } from 'react'
import { X, Image, MapPin, Search } from 'lucide-react'
import Overlay from './Overlay'
import { supabase } from '../supabase'
import { CONDITIONS, CATEGORIES } from '../constants'

const POST_TYPES = [
  { id: 'sell', label: 'Sell Item', icon: '📦' },
  { id: 'housing', label: 'Housing', icon: '🏠' },
  { id: 'sublease', label: 'Sublease', icon: '🔑' },
  { id: 'looking', label: 'Looking For', icon: '🔍' },
]

const MAX_PHOTOS = 6

export default function PostModal({ onClose, onSuccess, currentUser, school, schoolColor }) {
  const [type, setType] = useState('sell')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [coords, setCoords] = useState(null) // { lat, lng }
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  const [condition, setCondition] = useState('')
  const [category, setCategory] = useState('misc')
  const [beds, setBeds] = useState('')
  const [avail, setAvail] = useState('')
  const [budget, setBudget] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const locationRef = useRef()
  const suggestionsRef = useRef()

  const isHousing = type === 'housing' || type === 'sublease'
  const isLooking = type === 'looking'

  // Debounced Nominatim search — street-level results
  useEffect(() => {
    if (locationConfirmed || !location || location.length < 3) {
      setLocationSuggestions([])
      setShowSuggestions(false)
      return
    }
    const t = setTimeout(async () => {
      setLocationLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=8&addressdetails=1&countrycodes=us`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'UMarket-Student-App' } }
        )
        const data = await res.json()
        setLocationSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        setLocationSuggestions([])
      }
      setLocationLoading(false)
    }, 450)
    return () => clearTimeout(t)
  }, [location, locationConfirmed])

  // Close suggestions on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) && !locationRef.current?.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function buildLocationLabel(suggestion) {
    const a = suggestion.address || {}
    const street = [a.house_number, a.road].filter(Boolean).join(' ')
    const neighborhood = a.neighbourhood || a.suburb || ''
    const city = a.city || a.town || a.village || a.county || ''
    const state = a.state || ''
    // Street-level: "123 Main St, Salt Lake City, UT"
    if (street) return [street, city, state].filter(Boolean).join(', ')
    // Neighborhood/area: "Sugar House, Salt Lake City, UT"
    if (neighborhood) return [neighborhood, city, state].filter(Boolean).join(', ')
    // City-level fallback
    if (city) return [city, state].filter(Boolean).join(', ')
    // Last resort: first 3 comma parts of display_name
    return suggestion.display_name.split(',').slice(0, 3).join(',').trim()
  }

  function pickLocation(suggestion) {
    setLocation(buildLocationLabel(suggestion))
    setCoords({ lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) })
    setLocationConfirmed(true)
    setShowSuggestions(false)
  }

  async function handleImages(files) {
    const remaining = MAX_PHOTOS - images.length
    const selected = Array.from(files).slice(0, remaining)
    if (!selected.length) return

    const localPreviews = selected.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...localPreviews])

    setUploading(true)
    setError('')
    const urls = []
    let failed = 0
    for (const file of selected) {
      // Sanitize filename and ensure valid extension
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `${currentUser.id}/${safeName}`
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        console.error('Upload error:', uploadError.message)
        failed++
      } else {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    if (failed > 0) setError(`${failed} photo(s) failed to upload. Try again or use a smaller file.`)
    setImages(prev => [...prev, ...urls])
    // Remove previews for failed uploads (keep only ones that succeeded)
    if (failed > 0) {
      setPreviews(prev => prev.slice(0, prev.length - failed))
    }
    setUploading(false)
  }

  function removeImage(i) {
    setImages(imgs => imgs.filter((_, j) => j !== i))
    setPreviews(ps => ps.filter((_, j) => j !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (uploading) { setError('Please wait — photos are still uploading'); return }
    if (!title) { setError('Title is required'); return }
    if (!contactEmail && !contactPhone) { setError('Please provide at least an email or phone number'); return }
    setLoading(true)
    setError('')

    const contactData = JSON.stringify({
      email: contactEmail || null,
      phone: contactPhone || null,
    })

    const listing = {
      title, description, location,
      lat: coords?.lat || null,
      lng: coords?.lng || null,
      seller_id: currentUser.id,
      school_id: school,
      is_housing: isHousing,
      is_looking: isLooking,
      category: isHousing ? type : (isLooking ? 'looking' : category),
      images,
      contact: contactData,
      contact_type: 'multi',
      sold: false,
    }

    if (!isLooking) listing.price = price ? parseInt(price) : 0
    if (isHousing) { listing.beds = beds; listing.avail = avail }
    if (!isHousing && !isLooking) listing.condition = condition
    if (isLooking) listing.budget = budget ? parseInt(budget) : null

    const { error } = await supabase.from('listings').insert(listing)
    if (error) setError(error.message)
    else onSuccess({ title, price: price ? parseInt(price) : 0, location })
    setLoading(false)
  }

  const displayImages = previews.length > 0 ? previews : images

  return (
    <Overlay onClose={onClose} title="Post a listing" wide>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {POST_TYPES.map(t => (
            <button
              key={t.id} type="button" onClick={() => setType(t.id)}
              style={{
                padding: '10px 8px', borderRadius: 10, border: '1.5px solid',
                borderColor: type === t.id ? (schoolColor || '#111') : '#e5e7eb',
                background: type === t.id ? (schoolColor ? schoolColor + '12' : '#f3f4f6') : '#f9fafb',
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: type === t.id ? (schoolColor || '#111') : '#374151' }}>{t.label}</div>
            </button>
          ))}
        </div>

        <FInput label="Title" value={title} onChange={setTitle} placeholder={isHousing ? '2BR near campus' : isLooking ? 'Looking for a desk...' : 'Item name'} required />

        {isHousing && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FInput label="Beds" value={beds} onChange={setBeds} placeholder="2" />
            <FInput label="Available" value={avail} onChange={setAvail} placeholder="Aug 2025" />
          </div>
        )}

        {isLooking ? (
          <FInput label="Max Budget" value={budget} onChange={setBudget} placeholder="500" prefix="$" />
        ) : (
          <FInput label={isHousing ? 'Price / month' : 'Price'} value={price} onChange={setPrice} placeholder="0" prefix="$" />
        )}

        {!isHousing && !isLooking && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectInput label="Condition" value={condition} onChange={setCondition} options={CONDITIONS} />
            <SelectInput label="Category" value={category} onChange={setCategory}
              options={CATEGORIES.slice(4).map(c => c.label)}
            />
          </div>
        )}

        {/* ── Location search ── */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Location <span style={{ color: '#9ca3af', fontWeight: 400 }}>(select from suggestions for map)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                ref={locationRef}
                value={location}
                onChange={e => { setLocation(e.target.value); setLocationConfirmed(false); setCoords(null) }}
                onFocus={() => { if (locationSuggestions.length > 0) setShowSuggestions(true) }}
                placeholder="Start typing a city or address..."
                style={{
                  width: '100%', padding: '10px 36px 10px 34px', borderRadius: 10,
                  border: `1px solid ${locationConfirmed ? '#22c55e' : '#e5e7eb'}`,
                  background: '#f9fafb', fontSize: 14, outline: 'none', color: '#111', boxSizing: 'border-box',
                }}
              />
              {locationLoading && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: '2px solid #e5e7eb', borderTopColor: schoolColor || '#111', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              )}
              {locationConfirmed && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: 12, fontWeight: 700 }}>✓</div>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4, overflow: 'hidden',
                }}
              >
                {locationSuggestions.map((s, i) => {
                  const a = s.address || {}
                  const street = [a.house_number, a.road].filter(Boolean).join(' ')
                  const neighborhood = a.neighbourhood || a.suburb || ''
                  const city = a.city || a.town || a.village || a.county || ''
                  const state = a.state || ''
                  const primary = street || neighborhood || city || s.display_name.split(',')[0]
                  const secondary = street || neighborhood
                    ? [city, state].filter(Boolean).join(', ')
                    : [state].filter(Boolean).join(', ')
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={() => pickLocation(s)}
                      style={{
                        width: '100%', padding: '10px 14px', border: 'none', borderBottom: i < locationSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                        background: 'transparent', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <MapPin size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111' }}>{primary}</p>
                        {secondary && <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{secondary}</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          {coords && (
            <p style={{ margin: '5px 0 0', fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
              📍 Location confirmed — buyers will see an approximate map area
            </p>
          )}
        </div>

        <FInput label="Description" value={description} onChange={setDescription} placeholder="Tell buyers more..." textarea />

        {/* Contact info */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Contact Info <span style={{ color: '#9ca3af', fontWeight: 400 }}>(at least one required)</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
              placeholder="Email address"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' }}
            />
            <input
              type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
              placeholder="Phone number"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Photos <span style={{ color: '#9ca3af', fontWeight: 400 }}>({images.length}/{MAX_PHOTOS})</span>
          </label>

          {displayImages.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
              {displayImages.map((url, i) => (
                <div key={i} style={{ position: 'relative', paddingTop: '75%', borderRadius: 10, overflow: 'hidden', background: '#f3f4f6' }}>
                  <img src={url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  <button
                    type="button" onClick={() => removeImage(i)}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={13} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < MAX_PHOTOS && (
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed #e5e7eb', borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = schoolColor || '#111'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <Image size={22} color="#9ca3af" style={{ margin: '0 auto 6px' }} />
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                {uploading ? 'Uploading...' : `Click to add photos (${MAX_PHOTOS - images.length} remaining)`}
              </p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleImages(e.target.files)} style={{ display: 'none' }} />
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: 13, background: '#fee2e2', padding: '10px 12px', borderRadius: 8, margin: 0 }}>{error}</p>}

        <button
          type="submit" disabled={loading || uploading}
          style={{ padding: '13px', borderRadius: 12, border: 'none', background: (loading || uploading) ? '#d1d5db' : (schoolColor || '#111'), color: '#fff', fontWeight: 700, fontSize: 15, cursor: (loading || uploading) ? 'not-allowed' : 'pointer' }}
        >
          {uploading ? '⏳ Uploading photos...' : loading ? 'Posting...' : 'Post listing'}
        </button>
      </form>
    </Overlay>
  )
}

function FInput({ label, value, onChange, placeholder, prefix, textarea, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }}>{prefix}</span>}
        {textarea ? (
          <textarea
            value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={3} required={required}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, outline: 'none', color: '#111', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        ) : (
          <input
            value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} required={required}
            style={{ width: '100%', padding: '10px 12px 10px ' + (prefix ? '28px' : '12px'), borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, outline: 'none', color: '#111', boxSizing: 'border-box' }}
          />
        )}
      </div>
    </div>
  )
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111', outline: 'none' }}
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
