import { useState, useEffect } from 'react'
import { ArrowLeft, Award, Package, UserPlus, UserCheck } from 'lucide-react'
import { supabase } from '../supabase'
import ListingCard from './ListingCard'
import { Avatar, VerifiedBadge } from './ProfilePage'

export default function SellerPage({
  sellerId, onBack, onDetail, onFav, favs,
  schoolColor, currentUser,
  isFollowing, onFollow, onUnfollow,
}) {
  const [sellerProfile, setSellerProfile] = useState(null)
  const [sellerListings, setSellerListings] = useState([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (!sellerId) return
    async function load() {
      setLoading(true)
      const [{ data: prof }, { data: listings }, { count: frs }, { count: fing }] = await Promise.all([
        supabase.from('profiles').select('name, grade, verified, sold_count, avatar_url, school').eq('id', sellerId).single(),
        supabase.from('listings').select('*').eq('seller_id', sellerId).eq('sold', false).order('created_at', { ascending: false }),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', sellerId),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', sellerId),
      ])
      if (prof) setSellerProfile(prof)
      if (listings) setSellerListings(listings)
      setFollowerCount(frs || 0)
      setFollowingCount(fing || 0)
      setLoading(false)
    }
    load()
  }, [sellerId])

  async function handleFollow() {
    if (!currentUser) return
    setFollowLoading(true)
    if (isFollowing) {
      await onUnfollow(sellerId)
      setFollowerCount(c => Math.max(0, c - 1))
    } else {
      await onFollow(sellerId)
      setFollowerCount(c => c + 1)
    }
    setFollowLoading(false)
  }

  const name = sellerProfile?.name || 'Seller'
  const isSelf = currentUser?.id === sellerId

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
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 14 }}>Loading...</div>
      ) : (
        <>
          {/* Profile card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <Avatar profile={sellerProfile} size={72} schoolColor={schoolColor} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + badge row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{name}</h2>
                    {sellerProfile?.verified && <VerifiedBadge size="lg" />}
                    {sellerProfile?.sold_count >= 5 && <Award size={16} color="#f59e0b" />}
                  </div>
                  {/* Follow button */}
                  {!isSelf && currentUser && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 700,
                        border: isFollowing ? `1.5px solid ${schoolColor || '#CC0000'}` : 'none',
                        background: isFollowing ? 'transparent' : (schoolColor || '#CC0000'),
                        color: isFollowing ? (schoolColor || '#CC0000') : '#fff',
                        cursor: followLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                    </button>
                  )}
                </div>

                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>
                  {sellerProfile?.grade ? `Class of ${sellerProfile.grade}` : ''}
                  {sellerProfile?.grade && sellerProfile?.school ? ' · ' : ''}
                  {sellerProfile?.school?.toUpperCase() || ''}
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#111' }}>{followerCount}</span>
                    <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>Followers</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#111' }}>{followingCount}</span>
                    <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>Following</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#111' }}>{sellerListings.length}</span>
                    <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>Active posts</span>
                  </div>
                  {(sellerProfile?.sold_count || 0) > 0 && (
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#22c55e' }}>{sellerProfile.sold_count}</span>
                      <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>Sold</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Package size={16} color="#374151" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#374151' }}>
              {name.split(' ')[0]}'s Listings ({sellerListings.length})
            </h3>
          </div>

          {sellerListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#374151' }}>No active listings</p>
              <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Nothing listed right now</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
              {sellerListings.map(l => (
                <ListingCard
                  key={l.id} listing={l}
                  isFav={favs?.has(l.id) || false}
                  onFav={onFav} onClick={onDetail}
                  schoolColor={schoolColor} currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
