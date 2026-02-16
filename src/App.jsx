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

  // User state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Modal state
  const [showSignIn, setShowSignIn] = useState(false);
  const [showListWater, setShowListWater] = useState(false);
  const [showListInstructor, setShowListInstructor] = useState(false);

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
    if (!token) return;

    const guestWaters = favouriteWaters;
    const guestInstructors = favouriteInstructors;

    // Push each guest favorite to the database
    for (const waterId of guestWaters) {
      try {
        await fetch('/api/favourites/waters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ waterId })
        });
      } catch (err) {
        console.log('Failed to sync water favourite:', waterId);
      }
    }

    for (const instructorId of guestInstructors) {
      try {
        await fetch('/api/favourites/instructors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ instructorId })
        });
      } catch (err) {
        console.log('Failed to sync instructor favourite:', instructorId);
      }
    }

    // Clear guest favorites from localStorage
    localStorage.removeItem('tightlines_guest_fav_waters');
    localStorage.removeItem('tightlines_guest_fav_instructors');
  }, [favouriteWaters, favouriteInstructors]);

  // Fetch favourites when user logs in
  const fetchFavourites = useCallback(async () => {
    if (!user) {
      // Don't clear favorites - keep guest favorites in state
      return;
    }
    try {
      const token = getToken();
      if (!token) return;

      // First, sync any guest favorites to the database
      await syncGuestFavourites();

      // Then fetch all favorites from database
      const res = await fetch('/api/user/favourites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFavouriteWaters(data.waters || []);
        setFavouriteInstructors(data.instructors || []);
      }
    } catch (err) {
      console.log('Could not fetch favourites:', err.message);
    }
  }, [user, syncGuestFavourites]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  // Toggle favourite water
  const toggleFavouriteWater = async (waterId) => {
    const isFav = favouriteWaters.includes(waterId);

    // Optimistic update for both guest and logged-in users
    if (isFav) {
      setFavouriteWaters(prev => prev.filter(id => id !== waterId));
    } else {
      setFavouriteWaters(prev => [...prev, waterId]);
    }

    // If not logged in, store in localStorage only
    if (!user) {
      return;
    }

    // If logged in, sync to database
    const token = getToken();
    if (!token) return;

    try {
      if (isFav) {
        await fetch(`/api/favourites/waters/${waterId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch('/api/favourites/waters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ waterId })
        });
      }
    } catch (err) {
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

    // Optimistic update for both guest and logged-in users
    if (isFav) {
      setFavouriteInstructors(prev => prev.filter(id => id !== instructorId));
    } else {
      setFavouriteInstructors(prev => [...prev, instructorId]);
    }

    // If not logged in, store in localStorage only
    if (!user) {
      return;
    }

    // If logged in, sync to database
    const token = getToken();
    if (!token) return;

    try {
      if (isFav) {
        await fetch(`/api/favourites/instructors/${instructorId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch('/api/favourites/instructors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ instructorId })
        });
      }
    } catch (err) {
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
          onSearch={() => setCurrentPage('search')}
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
          onNavigateToWater={() => setCurrentPage('search')}
          onNavigateToInstructor={() => { setCurrentPage('instructors'); setCurrentTab('instructors'); }}
        />
      )}

      {currentPage === 'water-dashboard' && user && (user.role === 'water_owner' || user.role === 'pending_water_owner') && (
        <WaterOwnerDashboard
          user={user}
          onBack={() => setCurrentPage('home')}
          onListWater={() => setShowListWater(true)}
        />
      )}

      {currentPage === 'instructor-dashboard' && user && (user.role === 'instructor' || user.role === 'pending_instructor') && (
        <InstructorDashboard
          user={user}
          onBack={() => setCurrentPage('home')}
        />
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
      />

      <ListInstructorModal
        isOpen={showListInstructor}
        onClose={() => setShowListInstructor(false)}
      />
    </div>
  );
};

export default App;
