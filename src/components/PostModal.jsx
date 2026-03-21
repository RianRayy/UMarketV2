import { useState, useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'
import Overlay from './Overlay'
import { supabase } from '../supabase'
import { CONDITIONS, CATEGORIES } from '../constants'

const POST_TYPES = [
  { id: 'sell', label: 'Sell Item', icon: '📦' },
  { id: 'housing', label: 'Housing', icon: '🏠' },
  { id: 'sublease', label: 'Sublease', icon: '🔑' },
  { id: 'looking', label: 'Looking For', icon: '🔍' },
]

export default function PostModal({ onClose, onSuccess, currentUser, school, schoolColor }) {
  const [type, setType] = useState('sell')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [condition, setCondition] = useState('')
  const [category, setCategory] = useState('misc')
  const [beds, setBeds] = useState('')
  const [avail, setAvail] = useState('')
  const [budget, setBudget] = useState('')
  const [contactType, setContactType] = useState('instagram')
  const [contact, setContact] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const isHousing = type === 'housing' || type === 'sublease'
  const isLooking = type === 'looking'

  async function handleImages(files) {
    setUploading(true)
    const urls = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${currentUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('listing-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setImages(prev => [...prev, ...urls])
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title) { setError('Title is required'); return }
    setLoading(true)
    setError('')

    const listing = {
      title, description, location,
      seller_id: currentUser.id,
      school_id: school,
      is_housing: isHousing,
      is_looking: isLooking,
      category: isHousing ? type : (isLooking ? 'looking' : category),
      images,
      contact, contact_type: contactType,
      sold: false
    }

    if (!isLooking) listing.price = price ? parseInt(price) : 0
    if (isHousing) { listing.beds = beds; listing.avail = avail }
    if (!isHousing && !isLooking) listing.condition = condition
    if (isLooking) listing.budget = budget ? parseInt(budget) : null

    const { error } = await supabase.from('listings').insert(listing)
    if (error) setError(error.message)
    else onSuccess()
    setLoading(false)
  }

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
                cursor: 'pointer', textAlign: 'center'
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

        <FInput label="Location" value={location} onChange={setLocation} placeholder="Salt Lake City, UT" />
        <FInput label="Description" value={description} onChange={setDescription} placeholder="Tell buyers more..." textarea />

        {/* Contact */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Contact</label>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
            <select
              value={contactType}
              onChange={e => setContactType(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111' }}
            >
              <option value="instagram">Instagram</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
            <input
              value={contact} onChange={e => setContact(e.target.value)}
              placeholder={contactType === 'instagram' ? '@username' : contactType === 'phone' ? '(555) 000-0000' : 'contact info'}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111', outline: 'none' }}
            />
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Photos</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed #e5e7eb', borderRadius: 12, padding: '20px',
              textAlign: 'center', cursor: 'pointer', background: '#f9fafb'
            }}
          >
            <Image size={24} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>{uploading ? 'Uploading...' : 'Click to add photos'}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleImages(e.target.files)} style={{ display: 'none' }} />

          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                  <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  <button
                    type="button"
                    onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, background: '#111', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={11} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: 13, background: '#fee2e2', padding: '10px 12px', borderRadius: 8, margin: 0 }}>{error}</p>}

        <button
          type="submit" disabled={loading}
          style={{ padding: '13px', borderRadius: 12, border: 'none', background: loading ? '#d1d5db' : (schoolColor || '#111'), color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Posting...' : 'Post listing'}
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
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, outline: 'none', color: '#111', resize: 'vertical', fontFamily: 'inherit' }}
          />
        ) : (
          <input
            value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} required={required}
            style={{ width: '100%', padding: '10px 12px 10px ' + (prefix ? '28px' : '12px'), borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, outline: 'none', color: '#111' }}
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
