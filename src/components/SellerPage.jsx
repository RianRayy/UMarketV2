import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, Award, Package } from 'lucide-react'
import { supabase } from '../supabase'
import ListingCard from './ListingCard'

export default function SellerPage({ sellerId, onBack, onDetail, onFav, favs, schoolColor, currentUser }) {
  const [sellerProfile, setSellerProfile] = useState(null)
  const [sellerListings, setSellerListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sellerId) return
    async function load() {
      setLoading(true)
      const [{ data: prof }, { data: listings }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', sellerId).single(),
        supabase.from('listings').select('*').eq('seller_id', sellerId).eq('sold', false).order('created_at', { ascending: false }),
      ])
      if (prof) setSellerProfile(prof)
      if (listings) setSellerListings(listings)
      setLoading(false)
    }
    load()
  }, [sellerId])

  const name = sellerProfile?.name || 'Seller'
  const initial = name[0]?.toUpperCase() || '?'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 100px' }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginBottom: 20, padding: '8px 16px', borderRadius: 99,
          border: `1.5px solid ${schoolColor || '#CC0000'}`,
          background: 'transparent', color: schoolColor || '#CC0000',
          fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = schoolColor || '#CC0000'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = schoolColor || '#CC0000' }}
      >
        <ArrowLeft size={15} /> Back
      </button>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 14 }}>Loading seller profile...</div>
      ) : (
        <>
          {/* Profile card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: schoolColor || '#CC0000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#fff', flexShrink: 0,
              boxShadow: `0 4px 12px ${schoolColor || '#CC0000'}40`,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{name}</h2>
                {sellerProfile?.verified && <CheckCircle size={16} color="#22c55e" />}
                {sellerProfile?.sold_count >= 5 && <Award size={16} color="#f59e0b" title="Power Seller" />}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                {sellerProfile?.grade ? `Class of ${sellerProfile.grade}` : ''}
                {sellerProfile?.grade && sellerProfile?.school ? ' · ' : ''}
                {sellerProfile?.school?.toUpperCase() || ''}
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: schoolColor || '#111' }}>{sellerListings.length}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Active posts</p>
                </div>
                {(sellerProfile?.sold_count || 0) > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#22c55e' }}>{sellerProfile.sold_count}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Sold</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Listings grid */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Package size={16} color="#374151" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#374151' }}>
              {name.split(' ')[0]}'s Listings ({sellerListings.length})
            </h3>
          </div>

          {sellerListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#374151' }}>No active listings</p>
              <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>This seller doesn't have any active listings right now</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
              {sellerListings.map(l => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  isFav={favs?.has(l.id) || false}
                  onFav={onFav}
                  onClick={onDetail}
                  schoolColor={schoolColor}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
