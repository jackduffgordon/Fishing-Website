// ============================================
// TIGHTLINES APP - Main Application Component
// UK Fishing Booking Platform v2.0
// ============================================
import { useState, useEffect } from 'react';
import { authAPI, getToken, clearToken } from './utils/api';

// Components
import { Nav } from './components/Nav';
import { SignInModal } from './components/modals/SignInModal';
import { ListWaterModal } from './components/modals/ListWaterModal';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResults';
import { VenueDetailPage } from './pages/VenueDetail';
import { InstructorsPage } from './pages/InstructorsPage';
import { InstructorDetailPage } from './pages/InstructorDetail';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

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

  // Check for existing auth token on load
  useEffect(() => {
    console.log('[TightLines] Starting auth check...');
    const checkAuth = async () => {
      const token = getToken();
      console.log('[TightLines] Token exists:', !!token);

      if (token) {
        try {
          console.log('[TightLines] Calling /api/auth/me...');
          const data = await authAPI.me();
          console.log('[TightLines] Auth successful');
          setUser(data.user);
        } catch (error) {
          console.error('[TightLines] Auth failed:', error.message);
          clearToken();
        } finally {
          console.log('[TightLines] Setting authLoading to false');
          setAuthLoading(false);
        }
      } else {
        console.log('[TightLines] No token, skipping auth check');
        setAuthLoading(false);
      }
    };

    // Add timeout wrapper as extra safety
    const timeoutId = setTimeout(() => {
      console.error('[TightLines] Auth check timeout - forcing app to load');
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
      // View all instructors
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
      />

      {/* Page Content */}
      {currentPage === 'home' && (
        <HomePage
          onSearch={() => setCurrentPage('search')}
          onSelectFishery={handleSelectFishery}
          onSelectInstructor={handleSelectInstructor}
          onSelectRegion={handleSelectRegion}
          onNavigate={(page) => setCurrentPage(page)}
        />
      )}

      {currentPage === 'search' && (
        <SearchResultsPage
          onSelectFishery={handleSelectFishery}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'venue' && selectedFishery && (
        <VenueDetailPage
          fishery={selectedFishery}
          onBack={() => setCurrentPage('search')}
          user={user}
          onSignIn={() => setShowSignIn(true)}
        />
      )}

      {currentPage === 'instructors' && (
        <InstructorsPage
          onSelectInstructor={handleSelectInstructor}
          onBack={() => setCurrentPage('home')}
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
    </div>
  );
};

export default App;
