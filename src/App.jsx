import { useState, useEffect, useCallback } from 'react'
import './index.css'
import { supabase } from './supabase'
import { SCHOOLS, CATEGORIES } from './constants'

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ListingCard from './components/ListingCard'
import MobileNav from './components/MobileNav'
import Toast from './components/Toast'

import AuthModal from './components/AuthModal'
import SchoolPicker from './components/SchoolPicker'
import PostModal from './components/PostModal'
import DetailModal from './components/DetailModal'
import ContactModal from './components/ContactModal'
import ReportModal from './components/ReportModal'
import FilterModal from './components/FilterModal'
import ProfilePage from './components/ProfilePage'

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Auth & user
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)

  // School & navigation
  const [school, setSchool] = useState(() => localStorage.getItem('umarket_school') || '')
  const [page, setPage] = useState('home')
  const [profileTab, setProfileTab] = useState('listings')

  // Feed
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [activeSection, setActiveSection] = useState(null) // null | 'housing' | 'marketplace'
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ sort: 'newest' })
  const [favs, setFavs] = useState(new Set())

  // Modals
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [showSchool, setShowSchool] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const [detail, setDetail] = useState(null)
  const [showContact, setShowContact] = useState(null)
  const [showReport, setShowReport] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showEdit, setShowEdit] = useState(null)

  // Toast
  const [toast, setToast] = useState('')

  const schoolObj = SCHOOLS.find(s => s.id === school)
  const schoolColor = schoolObj?.color || '#111'

  // Resize
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) loadUser(session.user)
      else { setCurrentUser(null); setProfile(null); setFavs(new Set()) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadUser(user) {
    setCurrentUser(user)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data)
      if (data.school && !school) setSchool(data.school)
    }
    loadFavs(user.id)
  }

  async function loadFavs(userId) {
    const { data } = await supabase.from('favorites').select('listing_id').eq('user_id', userId)
    if (data) setFavs(new Set(data.map(f => f.listing_id)))
  }

  // Load listings
  useEffect(() => {
    if (!school) { setListings([]); setLoading(false); return }
    loadListings()
  }, [school, category, filters.sort, activeSection])

  async function loadListings() {
    setLoading(true)
    let query = supabase.from('listings')
      .select('*, profiles(name, verified, grade, transactions, sold_count)')
      .eq('school_id', school)

    if (category !== 'all') {
      if (category === 'housing') query = query.eq('is_housing', true).eq('category', 'housing')
      else if (category === 'sublease') query = query.eq('is_housing', true).eq('category', 'sublease')
      else if (category === 'looking') query = query.eq('is_looking', true)
      else query = query.eq('category', category)
    }

    if (filters.sort === 'low') query = query.order('price', { ascending: true })
    else if (filters.sort === 'high') query = query.order('price', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    const { data } = await query
    setListings(data || [])
    setLoading(false)
  }

  // Filter listings client-side
  const filtered = listings.filter(l => {
    if (search) {
      const q = search.toLowerCase()
      if (!l.title?.toLowerCase().includes(q) && !l.description?.toLowerCase().includes(q)) return false
    }
    if (filters.minPrice && l.price < parseInt(filters.minPrice)) return false
    if (filters.maxPrice && l.price > parseInt(filters.maxPrice)) return false
    if (filters.freeOnly && l.price !== 0) return false
    if (filters.conditions?.length > 0 && !filters.conditions.includes(l.condition)) return false
    return true
  })

  const favListings = listings.filter(l => favs.has(l.id))

  async function toggleFav(listingId) {
    if (!currentUser) { setAuthMode('login'); setShowAuth(true); return }
    if (favs.has(listingId)) {
      await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('listing_id', listingId)
      setFavs(prev => { const n = new Set(prev); n.delete(listingId); return n })
    } else {
      await supabase.from('favorites').insert({ user_id: currentUser.id, listing_id: listingId })
      setFavs(prev => new Set([...prev, listingId]))
    }
  }

  async function deleteListing(listing) {
    await supabase.from('listings').delete().eq('id', listing.id)
    setListings(prev => prev.filter(l => l.id !== listing.id))
    setDetail(null)
    setToast('Listing deleted')
  }

  async function markSold(listing) {
    await supabase.from('listings').update({ sold: true }).eq('id', listing.id)
    await supabase.from('profiles').update({ sold_count: (profile?.sold_count || 0) + 1 }).eq('id', currentUser.id)
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, sold: true } : l))
    setDetail(null)
    setToast('Marked as sold!')
  }

  function handleAuth(mode) {
    setAuthMode(mode)
    setShowAuth(true)
  }

  function handlePost() {
    if (!currentUser) { handleAuth('login'); return }
    if (!school) { setShowSchool(true); return }
    setShowPost(true)
  }

  function handleProfile(tab) {
    if (!currentUser) { handleAuth('login'); return }
    setProfileTab(tab)
    setPage('profile')
  }

  // Category mobile strip
  const mobileCategories = CATEGORIES.slice(0, 8)

  if (!school && !loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, flexDirection: 'column', gap: 24, textAlign: 'center' }}>
        <div>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24, margin: '0 auto 16px' }}>U</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Welcome to UMarket</h1>
          <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>The student marketplace for your campus</p>
        </div>
        <button
          onClick={() => setShowSchool(true)}
          style={{ padding: '14px 32px', borderRadius: 14, border: 'none', background: '#111', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
        >
          Pick your school →
        </button>
        {showSchool && <SchoolPicker current={school} onSelect={s => { setSchool(s); localStorage.setItem('umarket_school', s) }} onClose={() => setShowSchool(false)} />}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf8f6' }}>
      <Header
        school={school} onSchoolClick={() => setShowSchool(true)}
        search={search} onSearch={setSearch}
        onPost={handlePost} onAuth={handleAuth}
        currentUser={currentUser} favCount={favs.size}
        onProfile={handleProfile} isMobile={isMobile}
        schoolColor={schoolColor}
      />

      {/* Mobile tab strip */}
      {isMobile && page === 'home' && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '10px 16px', overflowX: 'auto', display: 'flex', gap: 8 }} className="no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'looking', label: 'Roommates' },
            { id: 'housing', label: 'Housing' },
            { id: 'sublease', label: 'Subleases' },
            { id: 'textbooks', label: 'Textbooks' },
            { id: 'electronics', label: 'Electronics' },
            { id: 'furniture', label: 'Furniture' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              style={{
                flexShrink: 0, padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: category === tab.id ? schoolColor : '#f3f4f6',
                color: category === tab.id ? '#fff' : '#374151',
                transition: 'all 0.15s'
              }}
            >{tab.label}</button>
          ))}
        </div>
      )}

      {/* Hero — full width, only on home */}
      {page === 'home' && school && (
        <div style={{ background: '#fdf8f6', borderBottom: '1px solid #e5e7eb', padding: isMobile ? '32px 16px 28px' : '48px 32px 36px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>

            {/* Headline */}
            <h1 style={{ fontSize: isMobile ? 28 : 52, fontWeight: 900, color: '#111', margin: '0 0 32px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
              Find housing, roommates, subleases, and student deals in one place.
            </h1>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { count: listings.filter(l => l.is_looking || l.category === 'looking').length, label: 'Looking for Roommates', cat: 'looking' },
                { count: listings.filter(l => l.category === 'housing').length, label: 'Housing Listed', cat: 'housing' },
                { count: listings.filter(l => l.category === 'sublease').length, label: 'Subleases', cat: 'sublease' },
              ].map(s => (
                <button
                  key={s.cat}
                  onClick={() => { setCategory(s.cat); setActiveSection('housing') }}
                  style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: isMobile ? '12px 8px' : '20px 24px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
                >
                  <div style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, color: schoolColor, lineHeight: 1, marginBottom: 4 }}>{s.count}</div>
                  <div style={{ fontSize: isMobile ? 11 : 13, color: '#374151', fontWeight: 500 }}>{s.label}</div>
                </button>
              ))}
            </div>

            {/* CTAs — below stats */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setCategory('all'); setActiveSection(null) }}
                style={{
                  padding: '12px 26px', borderRadius: 99, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  border: `1.5px solid ${activeSection === null ? schoolColor : '#d1d5db'}`,
                  background: activeSection === null ? schoolColor + '15' : 'transparent',
                  color: activeSection === null ? schoolColor : '#374151',
                  transition: 'all 0.15s'
                }}
              >All</button>
              <button
                onClick={() => { setCategory('all'); setActiveSection('housing') }}
                style={{
                  padding: '12px 26px', borderRadius: 99, fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none',
                  background: activeSection === 'housing' ? schoolColor : '#f3f4f6',
                  color: activeSection === 'housing' ? '#fff' : '#374151',
                  transition: 'all 0.15s'
                }}
              >Explore Housing</button>
              <button
                onClick={() => { setCategory('textbooks'); setActiveSection('marketplace') }}
                style={{
                  padding: '12px 26px', borderRadius: 99, fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none',
                  background: activeSection === 'marketplace' ? '#111' : '#f3f4f6',
                  color: activeSection === 'marketplace' ? '#fff' : '#374151',
                  transition: 'all 0.15s'
                }}
              >Browse Marketplace</button>
            </div>

          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '32px 32px' }}>
        {page === 'home' ? (
          <div style={{ display: 'flex', gap: 40 }}>
            {!isMobile && activeSection === 'housing' && (
              <Sidebar category={category} onCategory={setCategory} schoolColor={schoolColor} mode="housing" />
            )}
            {!isMobile && activeSection === 'marketplace' && (
              <Sidebar category={category} onCategory={setCategory} schoolColor={schoolColor} mode="marketplace" />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Search + filter bar */}
              {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search listings..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, outline: 'none', color: '#111' }}
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', flexShrink: 0 }}
                  >
                    ⚙️ Filters
                    {Object.keys(filters).filter(k => k !== 'sort' && filters[k]).length > 0 && (
                      <span style={{ background: schoolColor, color: '#fff', borderRadius: '99px', fontSize: 11, fontWeight: 700, padding: '1px 6px', marginLeft: 2 }}>
                        {Object.keys(filters).filter(k => k !== 'sort' && filters[k]).length}
                      </span>
                    )}
                  </button>
                  <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', flexShrink: 0 }}>
                    {loading ? 'Loading...' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              )}

              {/* Grid */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
                      <div className="skeleton" style={{ height: 200 }} />
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div className="skeleton" style={{ height: 16, borderRadius: 6, width: '80%' }} />
                        <div className="skeleton" style={{ height: 13, borderRadius: 6, width: '50%' }} />
                        <div className="skeleton" style={{ height: 13, borderRadius: 6, width: '90%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>No listings found</p>
                  <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Try a different category or search term</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }} className="animate-fade-in">
                  {filtered.map(listing => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isFav={favs.has(listing.id)}
                      onFav={toggleFav}
                      onClick={setDetail}
                      schoolColor={schoolColor}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ProfilePage
            currentUser={currentUser}
            profile={profile}
            listings={listings}
            favListings={favListings}
            onEdit={setShowEdit}
            onDelete={deleteListing}
            onSold={markSold}
            onDetail={setDetail}
            onSchoolSwitch={() => setShowSchool(true)}
            onLogout={async () => { await supabase.auth.signOut(); setPage('home'); setToast('Logged out') }}
            schoolColor={schoolColor}
            initTab={profileTab}
            onToast={setToast}
          />
        )}
      </div>

      {isMobile && (
        <MobileNav
          page={page}
          onHome={() => setPage('home')}
          onPost={handlePost}
          onProfile={handleProfile}
          favCount={favs.size}
          schoolColor={schoolColor}
        />
      )}

      {/* Modals */}
      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); setToast('Welcome!') }}
          schoolColor={schoolColor}
        />
      )}
      {showSchool && (
        <SchoolPicker
          current={school}
          onSelect={s => { setSchool(s); localStorage.setItem('umarket_school', s) }}
          onClose={() => setShowSchool(false)}
        />
      )}
      {showPost && (
        <PostModal
          onClose={() => setShowPost(false)}
          onSuccess={() => { setShowPost(false); setToast('Posted!'); loadListings() }}
          currentUser={currentUser}
          school={school}
          schoolColor={schoolColor}
        />
      )}
      {detail && (
        <DetailModal
          listing={detail}
          isFav={favs.has(detail.id)}
          onFav={toggleFav}
          onClose={() => setDetail(null)}
          currentUser={currentUser}
          onContact={l => { setDetail(null); setShowContact(l) }}
          onReport={l => { setDetail(null); setShowReport(l) }}
          onDelete={deleteListing}
          onEdit={l => { setDetail(null); setShowEdit(l) }}
          onSold={markSold}
          schoolColor={schoolColor}
        />
      )}
      {showContact && (
        <ContactModal
          listing={showContact}
          onClose={() => setShowContact(null)}
          onToast={setToast}
        />
      )}
      {showReport && (
        <ReportModal
          listing={showReport}
          currentUser={currentUser}
          onClose={() => setShowReport(null)}
          onToast={setToast}
        />
      )}
      {showFilters && (
        <FilterModal
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
          schoolColor={schoolColor}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  )
}

export default App
