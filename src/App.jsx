// ============================================
// TIGHTLINES APP - Main Application Component
// UK Fishing Booking Platform v2.0
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { authAPI, getToken, clearToken } from './utils/api';

// Components
import { Nav } from './components/Nav';
import { SignInModal } from './components/modals/SignInModal';
import { ListWaterModal } from './components/modals/ListWaterModal';
import { ListInstructorModal } from './components/modals/ListInstructorModal';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResults';
import { VenueDetailPage } from './pages/VenueDetail';
import { InstructorsPage } from './pages/InstructorsPage';
import { InstructorDetailPage } from './pages/InstructorDetail';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { WaterOwnerDashboard } from './pages/WaterOwnerDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';

const App = () => {
  // Navigation state
  const [currentPage, setCurrentPage] = useState('home');
  const [currentTab, setCurrentTab] = useState('waters');

  // Selection state
  const [selectedFishery, setSelectedFishery] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Search params passed from homepage
  const [searchParams, setSearchParams] = useState({ query: '', type: '', radius: 25 });

  // User state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Modal state
  const [showSignIn, setShowSignIn] = useState(false);
  const [showListWater, setShowListWater] = useState(false);
  const [showListInstructor, setShowListInstructor] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Handle Stripe return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('booking') === 'success') {
      setBookingSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('booking') === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Favourites state - load from localStorage initially for guest users
  const [favouriteWaters, setFavouriteWaters] = useState(() => {
    try {
      const saved = localStorage.getItem('tightlines_guest_fav_waters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favouriteInstructors, setFavouriteInstructors] = useState(() => {
    try {
      const saved = localStorage.getItem('tightlines_guest_fav_instructors');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync guest favorites to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('tightlines_guest_fav_waters', JSON.stringify(favouriteWaters));
      localStorage.setItem('tightlines_guest_fav_instructors', JSON.stringify(favouriteInstructors));
    }
  }, [favouriteWaters, favouriteInstructors, user]);

  // Sync pre-login favorites to database after authentication
  const syncGuestFavourites = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log('[Favorites] No token available, skipping sync');
      return;
    }

    // Read guest favorites directly from localStorage (not from state)
    // to ensure we get the latest values before they're cleared
    let guestWaters = [];
    let guestInstructors = [];

    try {
      const savedWaters = localStorage.getItem('tightlines_guest_fav_waters');
      guestWaters = savedWaters ? JSON.parse(savedWaters) : [];
    } catch (e) {
      console.error('[Favorites] Failed to read guest waters from localStorage:', e);
    }

    try {
      const savedInstructors = localStorage.getItem('tightlines_guest_fav_instructors');
      guestInstructors = savedInstructors ? JSON.parse(savedInstructors) : [];
    } catch (e) {
      console.error('[Favorites] Failed to read guest instructors from localStorage:', e);
    }

    console.log('[Favorites] Syncing guest favorites:', {
      waters: guestWaters.length,
      instructors: guestInstructors.length
    });

    // Track successful syncs
    let watersSynced = 0;
    let instructorsSynced = 0;

    // Push each guest favorite to the database
    for (const waterId of guestWaters) {
      try {
        const res = await fetch('/api/favourites/waters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ waterId })
        });
        if (res.ok) {
          watersSynced++;
          console.log('[Favorites] Synced water:', waterId);
        } else {
          console.error('[Favorites] Failed to sync water:', waterId, await res.text());
        }
      } catch (err) {
        console.error('[Favorites] Error syncing water:', waterId, err);
      }
    }

    for (const instructorId of guestInstructors) {
      try {
        const res = await fetch('/api/favourites/instructors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ instructorId })
        });
        if (res.ok) {
          instructorsSynced++;
          console.log('[Favorites] Synced instructor:', instructorId);
        } else {
          console.error('[Favorites] Failed to sync instructor:', instructorId, await res.text());
        }
      } catch (err) {
        console.error('[Favorites] Error syncing instructor:', instructorId, err);
      }
    }

    console.log('[Favorites] Sync complete:', {
      watersSynced,
      instructorsSynced,
      totalWaters: guestWaters.length,
      totalInstructors: guestInstructors.length
    });

    // Clear guest favorites from localStorage only after successful sync
    if (watersSynced === guestWaters.length && instructorsSynced === guestInstructors.length) {
      localStorage.removeItem('tightlines_guest_fav_waters');
      localStorage.removeItem('tightlines_guest_fav_instructors');
      console.log('[Favorites] Cleared guest favorites from localStorage');
    } else {
      console.warn('[Favorites] Not all favorites synced successfully, keeping localStorage data');
    }
  }, []);

  // Fetch favourites when user logs in
  const fetchFavourites = useCallback(async () => {
    if (!user) {
      // Don't clear favorites - keep guest favorites in state
      return;
    }
    try {
      const token = getToken();
      if (!token) {
        console.log('[Favorites] No token available when fetching favorites');
        return;
      }

      console.log('[Favorites] Fetching favorites for user:', user.id);

      // First, sync any guest favorites to the database
      await syncGuestFavourites();

      // Then fetch all favorites from database
      const res = await fetch('/api/user/favourites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[Favorites] Loaded from database:', {
          waters: data.waters?.length || 0,
          instructors: data.instructors?.length || 0
        });
        setFavouriteWaters(data.waters || []);
        setFavouriteInstructors(data.instructors || []);
      } else {
        console.error('[Favorites] Failed to fetch favorites:', await res.text());
      }
    } catch (err) {
      console.error('[Favorites] Error fetching favorites:', err);
    }
  }, [user, syncGuestFavourites]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  // Toggle favourite water
  const toggleFavouriteWater = async (waterId) => {
    const isFav = favouriteWaters.includes(waterId);
    console.log(`[Favorites] Toggle water ${waterId}:`, isFav ? 'REMOVING' : 'ADDING', `(User: ${user ? 'logged in' : 'guest'})`);

    // Optimistic update for both guest and logged-in users
    if (isFav) {
      setFavouriteWaters(prev => prev.filter(id => id !== waterId));
    } else {
      setFavouriteWaters(prev => [...prev, waterId]);
    }

    // If not logged in, store in localStorage only
    if (!user) {
      console.log('[Favorites] Guest mode - will sync after login');
      return;
    }

    // If logged in, sync to database
    const token = getToken();
    if (!token) {
      console.error('[Favorites] No token available!');
      return;
    }

    try {
      if (isFav) {
        const res = await fetch(`/api/favourites/waters/${waterId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('[Favorites] DELETE response:', res.status, res.ok);
        if (!res.ok) {
          const text = await res.text();
          console.error('[Favorites] DELETE failed:', text);
        }
      } else {
        const res = await fetch('/api/favourites/waters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ waterId })
        });
        console.log('[Favorites] POST response:', res.status, res.ok);
        if (!res.ok) {
          const text = await res.text();
          console.error('[Favorites] POST failed:', text);
        }
      }
    } catch (err) {
      console.error('[Favorites] API error:', err);
      // Revert on failure
      if (isFav) {
        setFavouriteWaters(prev => [...prev, waterId]);
      } else {
        setFavouriteWaters(prev => prev.filter(id => id !== waterId));
      }
    }
  };

  // Toggle favourite instructor
  const toggleFavouriteInstructor = async (instructorId) => {
    const isFav = favouriteInstructors.includes(instructorId);
    console.log(`[Favorites] Toggle instructor ${instructorId}:`, isFav ? 'REMOVING' : 'ADDING', `(User: ${user ? 'logged in' : 'guest'})`);

    // Optimistic update for both guest and logged-in users
    if (isFav) {
      setFavouriteInstructors(prev => prev.filter(id => id !== instructorId));
    } else {
      setFavouriteInstructors(prev => [...prev, instructorId]);
    }

    // If not logged in, store in localStorage only
    if (!user) {
      console.log('[Favorites] Guest mode - will sync after login');
      return;
    }

    // If logged in, sync to database
    const token = getToken();
    if (!token) {
      console.error('[Favorites] No token available!');
      return;
    }

    try {
      if (isFav) {
        const res = await fetch(`/api/favourites/instructors/${instructorId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('[Favorites] DELETE response:', res.status, res.ok);
        if (!res.ok) {
          const text = await res.text();
          console.error('[Favorites] DELETE failed:', text);
        }
      } else {
        const res = await fetch('/api/favourites/instructors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ instructorId })
        });
        console.log('[Favorites] POST response:', res.status, res.ok);
        if (!res.ok) {
          const text = await res.text();
          console.error('[Favorites] POST failed:', text);
        }
      }
    } catch (err) {
      console.error('[Favorites] API error:', err);
      // Revert on failure
      if (isFav) {
        setFavouriteInstructors(prev => [...prev, instructorId]);
      } else {
        setFavouriteInstructors(prev => prev.filter(id => id !== instructorId));
      }
    }
  };

  // Check for existing auth token on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await authAPI.me();
          setUser(data.user);
        } catch (error) {
          console.error('[TightLines] Auth failed:', error.message);
          clearToken();
        } finally {
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      setAuthLoading(false);
    }, 5000);

    checkAuth().finally(() => clearTimeout(timeoutId));
  }, []);

  // Navigation handlers
  const handleSelectFishery = (fishery) => {
    setSelectedFishery(fishery);
    setCurrentPage('venue');
  };

  const handleSelectInstructor = (instructor) => {
    if (instructor) {
      setSelectedInstructor(instructor);
      setCurrentPage('instructor-detail');
    } else {
      setCurrentPage('instructors');
      setCurrentTab('instructors');
    }
  };

  const handleSelectRegion = (region) => {
    setCurrentPage('search');
  };

  const handleSignIn = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    clearToken();
    setUser(null);
    setFavouriteWaters([]);
    setFavouriteInstructors([]);
    setCurrentPage('home');
  };

  // Scroll to top on page change and sync tab highlighting
  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentPage === 'search' || currentPage === 'venue') {
      setCurrentTab('waters');
    } else if (currentPage === 'instructors' || currentPage === 'instructor-detail') {
      setCurrentTab('instructors');
    } else if (currentPage === 'about') {
      setCurrentTab('about');
    } else if (currentPage === 'contact') {
      setCurrentTab('contact');
    } else if (currentPage === 'home') {
      setCurrentTab('');
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <Nav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setCurrentPage={setCurrentPage}
        user={user}
        setUser={handleSignOut}
        onSignIn={() => setShowSignIn(true)}
        onListWater={() => setShowListWater(true)}
        onListInstructor={() => setShowListInstructor(true)}
        onProfile={() => setCurrentPage('profile')}
      />

      {/* Page Content */}
      {currentPage === 'home' && (
        <HomePage
          onSearch={(params) => { if (params) setSearchParams(params); setCurrentPage('search'); }}
          onSelectFishery={handleSelectFishery}
          onSelectInstructor={handleSelectInstructor}
          onSelectRegion={handleSelectRegion}
          onNavigate={(page) => setCurrentPage(page)}
          favouriteWaters={favouriteWaters}
          onToggleFavouriteWater={toggleFavouriteWater}
          favouriteInstructors={favouriteInstructors}
          onToggleFavouriteInstructor={toggleFavouriteInstructor}
        />
      )}

      {currentPage === 'search' && (
        <SearchResultsPage
          onSelectFishery={handleSelectFishery}
          onBack={() => setCurrentPage('home')}
          favouriteWaters={favouriteWaters}
          onToggleFavouriteWater={toggleFavouriteWater}
          initialSearch={searchParams}
        />
      )}

      {currentPage === 'venue' && selectedFishery && (
        <VenueDetailPage
          fishery={selectedFishery}
          onBack={() => setCurrentPage('search')}
          user={user}
          onSignIn={() => setShowSignIn(true)}
          isFavourite={favouriteWaters.includes(selectedFishery.id)}
          onToggleFavourite={toggleFavouriteWater}
        />
      )}

      {currentPage === 'instructors' && (
        <InstructorsPage
          onSelectInstructor={handleSelectInstructor}
          onBack={() => setCurrentPage('home')}
          favouriteInstructors={favouriteInstructors}
          onToggleFavouriteInstructor={toggleFavouriteInstructor}
        />
      )}

      {currentPage === 'instructor-detail' && selectedInstructor && (
        <InstructorDetailPage
          instructor={selectedInstructor}
          onBack={() => {
            setCurrentPage('instructors');
            setCurrentTab('instructors');
          }}
          user={user}
          onSignIn={() => setShowSignIn(true)}
        />
      )}

      {currentPage === 'about' && (
        <AboutPage
          onSearch={() => setCurrentPage('search')}
          onListWater={() => setShowListWater(true)}
        />
      )}

      {currentPage === 'contact' && (
        <ContactPage />
      )}

      {currentPage === 'terms' && (
        <TermsPage />
      )}

      {currentPage === 'privacy' && (
        <PrivacyPage />
      )}

      {currentPage === 'admin' && user?.role === 'admin' && (
        <AdminPage user={user} />
      )}

      {currentPage === 'profile' && user && (
        <ProfilePage
          user={user}
          setUser={setUser}
          onBack={() => setCurrentPage('home')}
          onSignOut={handleSignOut}
          favouriteWaters={favouriteWaters}
          favouriteInstructors={favouriteInstructors}
          onToggleFavouriteWater={toggleFavouriteWater}
          onToggleFavouriteInstructor={toggleFavouriteInstructor}
          onNavigateToWater={() => setCurrentPage('search')}
          onNavigateToInstructor={() => { setCurrentPage('instructors'); setCurrentTab('instructors'); }}
        />
      )}

      {currentPage === 'water-dashboard' && user && (user.role === 'water_owner' || user.role === 'pending_water_owner' || user.hasWaters) && (
        <WaterOwnerDashboard
          user={user}
          onBack={() => setCurrentPage('home')}
          onListWater={() => setShowListWater(true)}
        />
      )}

      {currentPage === 'instructor-dashboard' && user && (user.role === 'instructor' || user.role === 'pending_instructor' || user.hasInstructorProfile) && (
        <InstructorDashboard
          user={user}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {/* Booking success overlay (after Stripe return) */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-stone-600 mb-6">
              Your booking has been confirmed. Check your email for full details.
            </p>
            <button
              onClick={() => setBookingSuccess(false)}
              className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignIn={handleSignIn}
      />

      <ListWaterModal
        isOpen={showListWater}
        onClose={() => setShowListWater(false)}
        onSuccess={async () => {
          try { const data = await authAPI.me(); setUser(data.user); } catch {}
        }}
      />

      <ListInstructorModal
        isOpen={showListInstructor}
        onClose={() => setShowListInstructor(false)}
        onSuccess={async () => {
          try { const data = await authAPI.me(); setUser(data.user); } catch {}
        }}
      />
    </div>
  );
};

export default App;
