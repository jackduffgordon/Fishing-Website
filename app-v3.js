// TightLines v3.0 - Enhanced UK Fishing Booking Platform
// All fixes applied: clickability, sliders, search, modals, filter parity
// Now with real backend integration!

const { useState, useEffect, useRef, useMemo, useContext, createContext, useCallback } = React;

// ============================================================================
// API CONFIGURATION
// ============================================================================
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

// API Helper
const api = {
  getToken: () => localStorage.getItem('tightlines_token'),
  setToken: (token) => localStorage.setItem('tightlines_token', token),
  clearToken: () => localStorage.removeItem('tightlines_token'),

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth
  register: (email, password, name) => api.request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  }),
  login: (email, password) => api.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getMe: () => api.request('/auth/me'),

  // Favourites
  getFavourites: () => api.request('/user/favourites'),
  addFavouriteWater: (waterId) => api.request('/favourites/waters', {
    method: 'POST',
    body: JSON.stringify({ waterId })
  }),
  removeFavouriteWater: (waterId) => api.request(`/favourites/waters/${waterId}`, {
    method: 'DELETE'
  }),
  addFavouriteInstructor: (instructorId) => api.request('/favourites/instructors', {
    method: 'POST',
    body: JSON.stringify({ instructorId })
  }),
  removeFavouriteInstructor: (instructorId) => api.request(`/favourites/instructors/${instructorId}`, {
    method: 'DELETE'
  }),

  // Catches
  submitCatch: (waterId, species, weight, method, comment) => api.request('/catches', {
    method: 'POST',
    body: JSON.stringify({ waterId, species, weight, method, comment })
  }),
  getCatches: (waterId) => api.request(`/catches/water/${waterId}`)
};

// ============================================================================
// AUTH CONTEXT
// ============================================================================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load favourites from localStorage immediately so they work without backend
  const [favouriteWaters, setFavouriteWaters] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tl_fav_waters') || '[]'); } catch { return []; }
  });
  const [favouriteInstructors, setFavouriteInstructors] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tl_fav_instructors') || '[]'); } catch { return []; }
  });

  // Persist favourites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tl_fav_waters', JSON.stringify(favouriteWaters));
  }, [favouriteWaters]);
  useEffect(() => {
    localStorage.setItem('tl_fav_instructors', JSON.stringify(favouriteInstructors));
  }, [favouriteInstructors]);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
          // Sync favourites from backend
          const favData = await api.getFavourites();
          setFavouriteWaters(favData.waters || []);
          setFavouriteInstructors(favData.instructors || []);
        } catch (error) {
          api.clearToken();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    api.setToken(data.token);
    setUser(data.user);
    // Sync favourites from backend
    const favData = await api.getFavourites();
    setFavouriteWaters(favData.waters || []);
    setFavouriteInstructors(favData.instructors || []);
    return data;
  };

  const register = async (email, password, name) => {
    const data = await api.register(email, password, name);
    api.setToken(data.token);
    setUser(data.user);
    setFavouriteWaters([]);
    setFavouriteInstructors([]);
    return data;
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setFavouriteWaters([]);
    setFavouriteInstructors([]);
  };

  const toggleFavouriteWater = async (waterId) => {
    const isCurrentlyFav = favouriteWaters.includes(waterId);
    // Update UI immediately
    if (isCurrentlyFav) {
      setFavouriteWaters(prev => prev.filter(id => id !== waterId));
    } else {
      setFavouriteWaters(prev => [...prev, waterId]);
    }
    // Sync to backend if logged in
    if (user) {
      try {
        if (isCurrentlyFav) {
          await api.removeFavouriteWater(waterId);
        } else {
          await api.addFavouriteWater(waterId);
        }
      } catch (error) {
        // Revert on failure
        if (isCurrentlyFav) {
          setFavouriteWaters(prev => [...prev, waterId]);
        } else {
          setFavouriteWaters(prev => prev.filter(id => id !== waterId));
        }
      }
    }
    return true;
  };

  const toggleFavouriteInstructor = async (instructorId) => {
    const isCurrentlyFav = favouriteInstructors.includes(instructorId);
    // Update UI immediately
    if (isCurrentlyFav) {
      setFavouriteInstructors(prev => prev.filter(id => id !== instructorId));
    } else {
      setFavouriteInstructors(prev => [...prev, instructorId]);
    }
    // Sync to backend if logged in
    if (user) {
      try {
        if (isCurrentlyFav) {
          await api.removeFavouriteInstructor(instructorId);
        } else {
          await api.addFavouriteInstructor(instructorId);
        }
      } catch (error) {
        // Revert on failure
        if (isCurrentlyFav) {
          setFavouriteInstructors(prev => [...prev, instructorId]);
        } else {
          setFavouriteInstructors(prev => prev.filter(id => id !== instructorId));
        }
      }
    }
    return true;
  };

  const isWaterFavourited = (waterId) => favouriteWaters.includes(waterId);
  const isInstructorFavourited = (instructorId) => favouriteInstructors.includes(instructorId);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      favouriteWaters,
      favouriteInstructors,
      toggleFavouriteWater,
      toggleFavouriteInstructor,
      isWaterFavourited,
      isInstructorFavourited
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  // Return safe defaults if not in provider (shouldn't happen but prevents crashes)
  if (!context) {
    return {
      user: null,
      loading: true,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      favouriteWaters: [],
      favouriteInstructors: [],
      toggleFavouriteWater: async () => false,
      toggleFavouriteInstructor: async () => false,
      isWaterFavourited: () => false,
      isInstructorFavourited: () => false
    };
  }
  return context;
};

// ============================================================================
// HEART/FAVOURITE BUTTON COMPONENT
// ============================================================================
const FavouriteButton = ({ isFavourited, onToggle, size = 'normal' }) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    setAnimating(true);
    await onToggle();
    setTimeout(() => setAnimating(false), 300);
  };

  const sizeClasses = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all ${
        isFavourited
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-white/90 text-stone-400 hover:text-red-500 hover:bg-white'
      } ${animating ? 'scale-125' : 'scale-100'}`}
    >
      <svg
        className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'}
        fill={isFavourited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

// ============================================================================
// ICONS - SVG Icon Components
// ============================================================================
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Star: ({ filled }) => (
    <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Fish: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12c-2-4-6-6-11-6-2 0-4 .5-5 1l2 2-3 3 3 3-2 2c1 .5 3 1 5 1 5 0 9-2 11-6z" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Award: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-2-4H7L5 9m14 0v8a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H8v1a1 1 0 01-1 1H6a1 1 0 01-1-1V9m14 0H5m14 0a2 2 0 012 2v3M5 9a2 2 0 00-2 2v3m4 0a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  ),
  Coffee: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h12a2 2 0 012 2v1a2 2 0 012 2v1a2 2 0 01-2 2h-1v4a4 4 0 01-4 4H8a4 4 0 01-4-4V4zm0 12h12" />
    </svg>
  ),
  Wifi: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  Target: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Accessibility: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth={2}/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v4m0 0l-3 8m3-8l3 8m-6-6h6" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Image: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Crosshair: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
    </svg>
  )
};

// ============================================================================
// DATA - Regions
// ============================================================================
const regions = [
  { id: 'scotland', name: 'Scotland', count: 245 },
  { id: 'north-england', name: 'North England', count: 189 },
  { id: 'wales', name: 'Wales', count: 156 },
  { id: 'midlands', name: 'Midlands', count: 203 },
  { id: 'south-england', name: 'South England', count: 312 },
  { id: 'east-anglia', name: 'East Anglia', count: 98 },
  { id: 'south-west', name: 'South West', count: 178 },
  { id: 'northern-ireland', name: 'Northern Ireland', count: 67 }
];

const fishTypes = [
  { id: 'game', name: 'Game Fishing', description: 'Salmon, trout, and other game fish' },
  { id: 'coarse', name: 'Coarse Fishing', description: 'Carp, pike, perch, and more' },
  { id: 'sea', name: 'Sea Fishing', description: 'Coastal and deep sea adventures' }
];

const speciesList = [
  'Atlantic Salmon', 'Brown Trout', 'Rainbow Trout', 'Sea Trout', 'Grayling',
  'Carp', 'Pike', 'Perch', 'Tench', 'Bream', 'Roach', 'Barbel', 'Chub',
  'Bass', 'Cod', 'Mackerel', 'Pollock'
];

const facilitiesList = [
  { id: 'parking', name: 'Parking', icon: 'Car' },
  { id: 'cafe', name: 'Café/Restaurant', icon: 'Coffee' },
  { id: 'toilets', name: 'Toilets', icon: 'Home' },
  { id: 'disabled', name: 'Disabled Access', icon: 'Accessibility' },
  { id: 'night', name: 'Night Fishing', icon: 'Moon' },
  { id: 'wifi', name: 'WiFi', icon: 'Wifi' }
];

// Popular specialties for instructors
const specialtiesList = [
  'Fly Fishing', 'Spey Casting', 'Dry Fly', 'Nymphing', 'Lure Fishing',
  'Pike Fishing', 'Carp Fishing', 'Sea Fishing', 'Bass Fishing', 'Tenkara',
  'Casting Instruction', 'River Craft', 'Predator Fishing', 'Match Fishing'
];

// UK Locations for search autocomplete
const ukLocations = [
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
  { name: 'Leeds', lat: 53.8008, lng: -1.5491 },
  { name: 'Glasgow', lat: 55.8642, lng: -4.2518 },
  { name: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
  { name: 'Cardiff', lat: 51.4816, lng: -3.1791 },
  { name: 'Bristol', lat: 51.4545, lng: -2.5879 },
  { name: 'Liverpool', lat: 53.4084, lng: -2.9916 },
  { name: 'Newcastle', lat: 54.9783, lng: -1.6178 },
  { name: 'Sheffield', lat: 53.3811, lng: -1.4701 },
  { name: 'Nottingham', lat: 52.9548, lng: -1.1581 },
  { name: 'Oxford', lat: 51.7520, lng: -1.2577 },
  { name: 'Cambridge', lat: 52.2053, lng: 0.1218 },
  { name: 'York', lat: 53.9600, lng: -1.0873 },
  { name: 'Bath', lat: 51.3811, lng: -2.3590 },
  { name: 'Inverness', lat: 57.4778, lng: -4.2247 },
  { name: 'Aberdeen', lat: 57.1497, lng: -2.0943 },
  { name: 'Belfast', lat: 54.5973, lng: -5.9301 },
  { name: 'Norwich', lat: 52.6309, lng: 1.2974 }
];

// ============================================================================
// DATA - Fisheries
// ============================================================================
const fisheries = [
  {
    id: 1,
    name: "River Wye - Letton Beat",
    region: "wales",
    type: "game",
    price: 85,
    rating: 4.8,
    reviewCount: 124,
    species: ["Atlantic Salmon", "Brown Trout", "Grayling"],
    description: "One of the finest salmon beats on the River Wye, offering 1.5 miles of double-bank fishing through stunning Welsh countryside.",
    highlights: ["Double-bank access", "1.5 miles of water", "Historic salmon beat", "Wading friendly"],
    rules: ["Catch and release for salmon", "Barbless hooks only", "No night fishing", "Rod licence required"],
    facilities: ["parking", "toilets"],
    bookingType: "enquiry",
    bookingOptions: [
      { id: "opt-wye-1", category: "day-tickets", name: "Day Rod", description: "Full day on the beat, 1 rod", price: 85, priceType: "day", bookingType: "enquiry" },
      { id: "opt-wye-2", category: "day-tickets", name: "Half Day Rod", description: "Morning or afternoon session", price: 55, priceType: "half-day", bookingType: "enquiry" },
      { id: "opt-wye-3", category: "guided", name: "Guided Day with Ghillie", description: "Expert ghillie, all advice and assistance", price: 150, priceType: "day", bookingType: "enquiry" },
      { id: "opt-wye-4", category: "accommodation", name: "2-Night Fishing Package", description: "2 nights B&B plus 2 days on the beat", price: 320, priceType: "person", bookingType: "enquiry" },
      { id: "opt-wye-5", category: "extras", name: "Tackle Hire", description: "Salmon rod, reel, line and flies", price: 25, priceType: "day", bookingType: "instant" }
    ],
    experienceLevel: "intermediate",
    typicalSessionHours: 8,
    bestTimeOfDay: "Early morning & evening",
    averageCatchRate: "2-3 fish per day",
    blankRate: "15%",
    recordFish: "32lb Atlantic Salmon (2019)",
    seasonInfo: "Mar-Oct for salmon, year-round for trout",
    coordinates: { lat: 52.1234, lng: -3.0567 },
    gallery: [
      { id: 1, gradient: "from-emerald-600 to-teal-700", label: "River View" },
      { id: 2, gradient: "from-blue-600 to-cyan-700", label: "Salmon Pool" },
      { id: 3, gradient: "from-green-600 to-emerald-700", label: "Autumn Colors" }
    ],
    reviewsList: [
      { id: 1, author: "James M.", rating: 5, date: "2025-10-15", title: "Exceptional salmon fishing", text: "Had an incredible day on the Letton Beat. Landed a beautiful 18lb salmon on my first visit.", verified: true },
      { id: 2, author: "Robert K.", rating: 5, date: "2025-09-22", title: "World-class water", text: "This beat consistently produces fish. The scenery is breathtaking.", verified: true },
      { id: 3, author: "Sarah L.", rating: 4, date: "2025-08-10", title: "Great experience overall", text: "Wonderful day out despite not landing a salmon. Saw several fish and had a few takes.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The Angler's Rest B&B", type: "B&B", distance: "2.3 miles", priceRange: "£85-£120", rating: 4.6, reviewCount: 89, amenities: ["Breakfast", "Rod storage", "Drying room"] },
      { id: 2, name: "Letton Court Hotel", type: "Hotel", distance: "1.8 miles", priceRange: "£120-£180", rating: 4.8, reviewCount: 156, amenities: ["Restaurant", "Bar", "Spa"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 85 },
      '2026-02-11': { status: 'available', price: 85 },
      '2026-02-12': { status: 'booked' },
      '2026-02-13': { status: 'available', price: 85 },
      '2026-02-14': { status: 'available', price: 95 },
      '2026-02-15': { status: 'available', price: 95 }
    }
  },
  {
    id: 2,
    name: "Loch Awe - Kilchurn Bay",
    region: "scotland",
    type: "game",
    price: 45,
    rating: 4.6,
    reviewCount: 89,
    species: ["Brown Trout", "Rainbow Trout", "Pike", "Perch"],
    description: "Fish in the shadow of the iconic Kilchurn Castle on Scotland's longest freshwater loch.",
    highlights: ["Historic castle backdrop", "Wild brown trout", "Boat hire available", "Stunning scenery"],
    rules: ["Boat fishing only in designated areas", "Pike must be returned", "No live bait"],
    facilities: ["parking", "cafe", "toilets"],
    bookingType: "instant",
    bookingOptions: [
      { id: "opt-awe-1", category: "day-tickets", name: "Day Ticket (Bank)", description: "Full day bank fishing", price: 45, priceType: "day", bookingType: "instant" },
      { id: "opt-awe-2", category: "day-tickets", name: "Day Ticket (Boat)", description: "Full day with boat hire included", price: 65, priceType: "day", bookingType: "instant" },
      { id: "opt-awe-3", category: "day-tickets", name: "Evening Ticket", description: "4pm to dusk", price: 25, priceType: "session", bookingType: "instant" },
      { id: "opt-awe-4", category: "guided", name: "Guided Boat Trip", description: "Half day with local guide and boat", price: 120, priceType: "person", bookingType: "enquiry" },
      { id: "opt-awe-5", category: "extras", name: "Boat Hire", description: "Self-drive rowing boat", price: 30, priceType: "day", bookingType: "instant" }
    ],
    experienceLevel: "beginner",
    typicalSessionHours: 6,
    bestTimeOfDay: "Mid-morning to afternoon",
    averageCatchRate: "4-6 fish per day",
    blankRate: "10%",
    recordFish: "28lb Pike (2021)",
    seasonInfo: "Mar-Oct (best May-Sep)",
    coordinates: { lat: 56.4023, lng: -5.0287 },
    gallery: [
      { id: 1, gradient: "from-blue-700 to-indigo-800", label: "Loch View" },
      { id: 2, gradient: "from-slate-600 to-blue-700", label: "Kilchurn Castle" }
    ],
    reviewsList: [
      { id: 1, author: "Duncan S.", rating: 5, date: "2025-09-18", title: "Magical location", text: "The setting is absolutely stunning. Caught a dozen beautiful wild brownies.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Kilchurn Lodge", type: "Guest House", distance: "3.1 miles", priceRange: "£75-£110", rating: 4.5, reviewCount: 67, amenities: ["Breakfast", "Packed lunches", "Parking"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 45 },
      '2026-02-11': { status: 'available', price: 45 },
      '2026-02-13': { status: 'booked' },
      '2026-02-14': { status: 'available', price: 55 }
    }
  },
  {
    id: 3,
    name: "Packington Somers Fishery",
    region: "midlands",
    type: "coarse",
    price: 25,
    rating: 4.9,
    reviewCount: 312,
    species: ["Carp", "Tench", "Bream", "Roach", "Perch"],
    description: "Award-winning coarse fishery set in the historic Packington Estate. Four pristine lakes stocked with specimen carp to 35lb+.",
    highlights: ["Specimen carp to 35lb+", "4 lakes to choose from", "Well-maintained swims", "Match & pleasure fishing"],
    rules: ["Barbless hooks only", "No braided mainline", "Landing nets must be used", "Keep nets by arrangement"],
    facilities: ["parking", "cafe", "toilets", "disabled", "wifi"],
    bookingType: "instant",
    bookingOptions: [
      { id: "opt-pack-1", category: "day-tickets", name: "Day Ticket", description: "Dawn to dusk on any lake", price: 25, priceType: "day", bookingType: "instant" },
      { id: "opt-pack-2", category: "day-tickets", name: "24hr Ticket", description: "24 hours including night fishing", price: 40, priceType: "session", bookingType: "instant" },
      { id: "opt-pack-3", category: "day-tickets", name: "48hr Ticket", description: "Full weekend session", price: 70, priceType: "session", bookingType: "instant" },
      { id: "opt-pack-4", category: "guided", name: "Beginner Lesson", description: "2hr session with qualified instructor, tackle included", price: 55, priceType: "person", bookingType: "instant" },
      { id: "opt-pack-5", category: "extras", name: "Bait Package", description: "Boilies, pellets and particles", price: 12, priceType: "session", bookingType: "instant" }
    ],
    experienceLevel: "beginner",
    typicalSessionHours: 8,
    bestTimeOfDay: "Dawn and dusk",
    averageCatchRate: "10-20 fish per day",
    blankRate: "5%",
    recordFish: "38lb 4oz Mirror Carp (2023)",
    seasonInfo: "Year-round",
    coordinates: { lat: 52.5123, lng: -1.5678 },
    gallery: [
      { id: 1, gradient: "from-green-600 to-emerald-700", label: "Main Lake" },
      { id: 2, gradient: "from-emerald-600 to-teal-700", label: "Specimen Lake" }
    ],
    reviewsList: [
      { id: 1, author: "Steve B.", rating: 5, date: "2025-11-02", title: "Best fishery in the Midlands", text: "Consistently brilliant fishing. The lakes are immaculate.", verified: true },
      { id: 2, author: "Dave T.", rating: 5, date: "2025-10-18", title: "Specimen heaven", text: "Landed my PB carp here - 31lb 8oz mirror.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Packington Hall Hotel", type: "Hotel", distance: "0.8 miles", priceRange: "£95-£150", rating: 4.4, reviewCount: 203, amenities: ["Restaurant", "Bar", "Pool"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 25 },
      '2026-02-11': { status: 'available', price: 25 },
      '2026-02-14': { status: 'available', price: 30 },
      '2026-02-15': { status: 'booked' }
    }
  },
  {
    id: 4,
    name: "Chesil Beach - West Bexington",
    region: "south-west",
    type: "sea",
    price: 0,
    rating: 4.5,
    reviewCount: 178,
    species: ["Bass", "Cod", "Mackerel", "Pollock", "Plaice"],
    description: "Iconic 18-mile shingle beach offering world-class bass fishing and excellent winter cod. Free access.",
    highlights: ["Free fishing", "World-famous bass venue", "18 miles of beach", "Jurassic Coast UNESCO site"],
    rules: ["Bass size limits apply", "No fishing in marked swimming areas", "Respect other beach users"],
    facilities: ["parking"],
    bookingType: "free",
    experienceLevel: "intermediate",
    typicalSessionHours: 4,
    bestTimeOfDay: "High tide, dawn/dusk",
    averageCatchRate: "2-5 fish per session",
    blankRate: "25%",
    recordFish: "14lb 8oz Bass (2020)",
    seasonInfo: "Bass Apr-Nov, Cod Nov-Feb",
    coordinates: { lat: 50.6789, lng: -2.6543 },
    gallery: [
      { id: 1, gradient: "from-blue-500 to-cyan-600", label: "Beach View" },
      { id: 2, gradient: "from-orange-500 to-amber-600", label: "Sunset Fishing" }
    ],
    reviewsList: [
      { id: 1, author: "Tom H.", rating: 5, date: "2025-10-28", title: "Bass fishing at its best", text: "Nothing beats Chesil for bass. Landed 4 schoolies and a cracking 7lb fish.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The Seaside B&B", type: "B&B", distance: "0.3 miles", priceRange: "£70-£95", rating: 4.3, reviewCount: 112, amenities: ["Sea views", "Breakfast", "Bait freezer"] }
    ],
    availability: {}
  },
  {
    id: 5,
    name: "River Test - Broadlands Estate",
    region: "south-england",
    type: "game",
    price: 250,
    rating: 4.9,
    reviewCount: 67,
    species: ["Brown Trout", "Rainbow Trout", "Grayling"],
    description: "The legendary River Test at Broadlands - arguably the finest chalk stream fishing in the world.",
    highlights: ["World-famous chalk stream", "Wild brown trout", "Pristine water quality", "Historic estate"],
    rules: ["Dry fly and upstream nymph only", "Catch and release", "Wading by arrangement", "No dogs"],
    facilities: ["parking", "toilets"],
    bookingType: "enquiry",
    bookingOptions: [
      { id: "opt-test-1", category: "day-tickets", name: "Day Rod", description: "Full day on the beat, 2 rods", price: 250, priceType: "day", bookingType: "enquiry" },
      { id: "opt-test-2", category: "day-tickets", name: "Half Day Rod", description: "Morning or afternoon session", price: 160, priceType: "half-day", bookingType: "enquiry" },
      { id: "opt-test-3", category: "guided", name: "Guided Day with Keeper", description: "Full day with expert river keeper, lunch included", price: 395, priceType: "day", bookingType: "enquiry" },
      { id: "opt-test-4", category: "accommodation", name: "Rod & Lodge Package", description: "2 nights at The Mill plus 2 days fishing", price: 650, priceType: "person", bookingType: "enquiry" },
      { id: "opt-test-5", category: "extras", name: "Tackle Hire", description: "Complete chalk stream setup including waders", price: 35, priceType: "day", bookingType: "instant" }
    ],
    experienceLevel: "expert",
    typicalSessionHours: 8,
    bestTimeOfDay: "Late morning to early evening",
    averageCatchRate: "3-6 fish per day",
    blankRate: "10%",
    recordFish: "8lb 12oz Brown Trout (2018)",
    seasonInfo: "May-Sep (best Jun-Jul)",
    coordinates: { lat: 50.9876, lng: -1.5234 },
    gallery: [
      { id: 1, gradient: "from-emerald-500 to-green-600", label: "Chalk Stream" },
      { id: 2, gradient: "from-teal-500 to-emerald-600", label: "Mayfly Hatch" }
    ],
    reviewsList: [
      { id: 1, author: "Richard E.", rating: 5, date: "2025-07-22", title: "Bucket list experience", text: "Finally fished the Test and it exceeded all expectations.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "The Mill at Broadlands", type: "Hotel", distance: "0.2 miles", priceRange: "£180-£280", rating: 4.9, reviewCount: 89, amenities: ["Restaurant", "Bar", "River views"] }
    ],
    availability: {
      '2026-05-15': { status: 'available', price: 250 },
      '2026-05-16': { status: 'available', price: 280 },
      '2026-05-17': { status: 'booked' }
    }
  },
  {
    id: 6,
    name: "Linear Fisheries - St Johns",
    region: "south-england",
    type: "coarse",
    price: 35,
    rating: 4.7,
    reviewCount: 445,
    species: ["Carp", "Catfish", "Tench", "Bream"],
    description: "One of the UK's premier carp venues with multiple lakes holding fish to over 50lb.",
    highlights: ["Carp to 50lb+", "Multiple lakes", "24hr fishing available", "On-site tackle shop"],
    rules: ["Minimum 42\" landing net", "Unhooking mat required", "No fixed leads", "Booking essential"],
    facilities: ["parking", "cafe", "toilets", "night", "wifi"],
    bookingType: "instant",
    bookingOptions: [
      { id: "opt-lin-1", category: "day-tickets", name: "Day Ticket", description: "Dawn to dusk", price: 35, priceType: "day", bookingType: "instant" },
      { id: "opt-lin-2", category: "day-tickets", name: "24hr Ticket", description: "24 hours including night fishing", price: 55, priceType: "session", bookingType: "instant" },
      { id: "opt-lin-3", category: "day-tickets", name: "48hr Ticket", description: "Full weekend session with 2 nights", price: 95, priceType: "session", bookingType: "instant" },
      { id: "opt-lin-4", category: "accommodation", name: "Lakeside Lodge", description: "Private lodge overlooking specimen lake, fishing included", price: 120, priceType: "night", bookingType: "enquiry" },
      { id: "opt-lin-5", category: "guided", name: "Carp Masterclass", description: "Full day 1-to-1 with pro angler, all tackle provided", price: 150, priceType: "person", bookingType: "instant" },
      { id: "opt-lin-6", category: "extras", name: "Bait Package", description: "Boilies, pellets and particles", price: 15, priceType: "session", bookingType: "instant" },
      { id: "opt-lin-7", category: "extras", name: "Bivvy Hire", description: "2-man bivvy with bedchair and sleeping bag", price: 30, priceType: "night", bookingType: "instant" }
    ],
    experienceLevel: "intermediate",
    typicalSessionHours: 24,
    bestTimeOfDay: "Night and early morning",
    averageCatchRate: "2-4 carp per 24hrs",
    blankRate: "15%",
    recordFish: "52lb 8oz Mirror Carp (2024)",
    seasonInfo: "Year-round (best Apr-Oct)",
    coordinates: { lat: 51.8234, lng: -1.2345 },
    gallery: [
      { id: 1, gradient: "from-green-700 to-emerald-800", label: "St Johns Lake" },
      { id: 2, gradient: "from-amber-600 to-orange-700", label: "Specimen Carp" }
    ],
    reviewsList: [
      { id: 1, author: "Mark C.", rating: 5, date: "2025-10-05", title: "Incredible carp fishing", text: "Did a 48hr session and landed 7 carp including a 38lb mirror.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "On-site Bivvy Hire", type: "Bivvy", distance: "On-site", priceRange: "£30/night", rating: 4.2, reviewCount: 234, amenities: ["Bedchair", "Sleeping bag", "Cooking gear"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 35 },
      '2026-02-11': { status: 'available', price: 35 },
      '2026-02-12': { status: 'booked' },
      '2026-02-14': { status: 'available', price: 40 }
    }
  },
  {
    id: 7,
    name: "River Tweed - Junction Pool",
    region: "scotland",
    type: "game",
    price: 150,
    rating: 4.8,
    reviewCount: 98,
    species: ["Atlantic Salmon", "Sea Trout", "Brown Trout"],
    description: "The famous Junction Pool where the Teviot meets the Tweed. One of Scotland's most productive salmon beats.",
    highlights: ["Famous junction pool", "Prolific autumn runs", "Historic fishing huts", "Experienced ghillies"],
    rules: ["Catch and release encouraged", "Fly fishing only Sep-Nov", "Spinning permitted early season"],
    facilities: ["parking", "toilets"],
    bookingType: "enquiry",
    bookingOptions: [
      { id: "opt-tweed-1", category: "day-tickets", name: "Day Rod", description: "Full day on the Junction Beat", price: 150, priceType: "day", bookingType: "enquiry" },
      { id: "opt-tweed-2", category: "guided", name: "Guided Day with Ghillie", description: "Full day with experienced Tweed ghillie", price: 280, priceType: "day", bookingType: "enquiry" },
      { id: "opt-tweed-3", category: "accommodation", name: "3-Night Salmon Package", description: "3 nights at Kelso Bridge Hotel plus 3 days fishing", price: 750, priceType: "person", bookingType: "enquiry" },
      { id: "opt-tweed-4", category: "extras", name: "Tackle Hire", description: "15ft Spey rod, reel and flies", price: 30, priceType: "day", bookingType: "instant" }
    ],
    experienceLevel: "intermediate",
    typicalSessionHours: 8,
    bestTimeOfDay: "All day during runs",
    averageCatchRate: "1-2 salmon per day (in season)",
    blankRate: "30%",
    recordFish: "42lb Atlantic Salmon (1998)",
    seasonInfo: "Feb-Nov (best Sep-Oct)",
    coordinates: { lat: 55.5987, lng: -2.4567 },
    gallery: [
      { id: 1, gradient: "from-blue-600 to-indigo-700", label: "Junction Pool" },
      { id: 2, gradient: "from-amber-600 to-yellow-700", label: "Autumn Run" }
    ],
    reviewsList: [
      { id: 1, author: "Alistair M.", rating: 5, date: "2025-10-25", title: "Legendary water", text: "The Junction Pool lived up to its reputation. Hooked 4 salmon, landed 2.", verified: true }
    ],
    nearbyStays: [
      { id: 1, name: "Kelso Bridge Hotel", type: "Hotel", distance: "2.0 miles", priceRange: "£110-£160", rating: 4.6, reviewCount: 189, amenities: ["Restaurant", "Bar", "Drying room"] }
    ],
    availability: {
      '2026-02-10': { status: 'available', price: 120 },
      '2026-09-15': { status: 'available', price: 180 },
      '2026-10-01': { status: 'available', price: 200 }
    }
  }
];

// ============================================================================
// DATA - Instructors
// ============================================================================
const instructors = [
  {
    id: 1,
    name: "Callum MacLeod",
    location: "River Spey, Scotland",
    region: "scotland",
    specialties: ["Fly Fishing", "Spey Casting", "Salmon"],
    rating: 4.9,
    reviewCount: 89,
    price: 250,
    experience: "25 years",
    bio: "Third-generation Spey ghillie with unparalleled knowledge of the river. Callum specialises in teaching traditional Spey casting techniques.",
    certifications: ["SGAIC Master", "AAPGAI", "First Aid", "DBS Checked"],
    languages: ["English", "Gaelic"],
    maxGroupSize: 2,
    hasCalendar: true,
    gallery: [
      { id: 1, gradient: "from-blue-700 to-indigo-800", label: "On the Spey" },
      { id: 2, gradient: "from-teal-600 to-cyan-700", label: "Spey Casting" }
    ],
    typicalDay: [
      { time: "08:30", activity: "Meet at the fishing hut for coffee and introductions" },
      { time: "09:00", activity: "Assess experience level and set goals for the day" },
      { time: "10:30", activity: "Move to the river - begin fishing instruction" },
      { time: "12:30", activity: "Lunch break (packed lunch provided)" },
      { time: "16:30", activity: "Final fishing and wrap-up discussion" }
    ],
    reviewsList: [
      { id: 1, author: "Peter M.", rating: 5, date: "2025-10-12", title: "Master of his craft", text: "Callum transformed my Spey casting in one day.", verified: true },
      { id: 2, author: "Hans G.", rating: 5, date: "2025-09-28", title: "Worth every mile", text: "Made the trip specifically to fish with Callum. Caught my first Scottish salmon.", verified: true }
    ],
    availability: ['2026-02-10', '2026-02-12', '2026-02-15', '2026-02-18', '2026-03-05']
  },
  {
    id: 2,
    name: "Emma Richardson",
    location: "Hampshire Chalk Streams",
    region: "south-england",
    specialties: ["Dry Fly", "Nymphing", "River Craft"],
    rating: 4.8,
    reviewCount: 67,
    price: 195,
    experience: "15 years",
    bio: "Former competitive fly fisher turned full-time guide, Emma brings technical precision and infectious enthusiasm to her teaching.",
    certifications: ["GAIA Level 2", "Angling Trust Coach", "First Aid", "DBS Checked"],
    languages: ["English", "French"],
    maxGroupSize: 3,
    hasCalendar: true,
    gallery: [
      { id: 1, gradient: "from-emerald-500 to-teal-600", label: "Chalk Stream" },
      { id: 2, gradient: "from-green-500 to-emerald-600", label: "Dry Fly Session" }
    ],
    typicalDay: [
      { time: "09:00", activity: "Meet at the river - tackle check and briefing" },
      { time: "10:00", activity: "Casting practice and line control exercises" },
      { time: "13:00", activity: "Lunch at riverside (included)" },
      { time: "16:30", activity: "Review and homework for continued improvement" }
    ],
    reviewsList: [
      { id: 1, author: "Sophie L.", rating: 5, date: "2025-09-15", title: "Finally got my first chalk stream trout!", text: "Emma's patience is incredible.", verified: true }
    ],
    availability: ['2026-02-11', '2026-02-14', '2026-02-17', '2026-03-02']
  },
  {
    id: 3,
    name: "Mike Thompson",
    location: "Norfolk Broads & East Anglia",
    region: "east-anglia",
    specialties: ["Pike Fishing", "Predator Fishing", "Lure Fishing"],
    rating: 4.7,
    reviewCount: 112,
    price: 175,
    experience: "20 years",
    bio: "The East's leading pike specialist, Mike has guided anglers to over 500 twenty-pound pike.",
    certifications: ["Angling Trust Level 2", "Boat Master", "First Aid", "DBS Checked"],
    languages: ["English"],
    maxGroupSize: 2,
    hasCalendar: false,
    gallery: [
      { id: 1, gradient: "from-slate-600 to-gray-700", label: "Norfolk Broads" },
      { id: 2, gradient: "from-green-600 to-teal-700", label: "Monster Pike" }
    ],
    typicalDay: [
      { time: "07:00", activity: "Meet at boat launch - early start essential for pike" },
      { time: "08:00", activity: "First drift - focus on prime early morning spots" },
      { time: "12:00", activity: "Lunch on the boat" },
      { time: "16:30", activity: "Return to mooring, session ends" }
    ],
    reviewsList: [
      { id: 1, author: "Terry O.", rating: 5, date: "2025-11-05", title: "PB smashed!", text: "Mike put me on a 28lb pike on my first drift!", verified: true }
    ],
    availability: []
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    location: "Welsh Dee & Border Rivers",
    region: "wales",
    specialties: ["Tenkara", "Grayling", "Casting Instruction"],
    rating: 4.9,
    reviewCount: 45,
    price: 165,
    experience: "12 years",
    bio: "Pioneer of tenkara fishing in the UK, Sarah combines Japanese minimalism with Welsh river traditions.",
    certifications: ["GAIA Level 2", "Tenkara Ambassador", "First Aid", "DBS Checked"],
    languages: ["English", "Welsh"],
    maxGroupSize: 2,
    hasCalendar: true,
    gallery: [
      { id: 1, gradient: "from-emerald-600 to-green-700", label: "Welsh Dee" },
      { id: 2, gradient: "from-teal-600 to-emerald-700", label: "Tenkara Style" }
    ],
    typicalDay: [
      { time: "10:00", activity: "Meet at riverside - tenkara introduction" },
      { time: "11:30", activity: "Move upstream - practical fishing begins" },
      { time: "13:00", activity: "Picnic lunch by the river (included)" },
      { time: "17:30", activity: "Session ends" }
    ],
    reviewsList: [
      { id: 1, author: "Jennifer K.", rating: 5, date: "2025-10-30", title: "Tenkara converted me", text: "Caught more fish than usual with half the gear. Now I'm obsessed!", verified: true }
    ],
    availability: ['2026-02-12', '2026-02-15', '2026-02-19', '2026-03-01']
  }
];


// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

// Star Rating Display
const StarRating = ({ rating, showNumber = true, size = "normal" }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const starClass = size === "small" ? "w-4 h-4" : "w-5 h-5";

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className={`${starClass} text-amber-400 fill-current`} viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className={`${starClass} text-gray-300`} viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showNumber && <span className="text-sm font-medium text-stone-600 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};

// Photo Carousel Component
const PhotoCarousel = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  return (
    <div className="relative">
      <div className={`h-64 md:h-96 rounded-xl bg-gradient-to-br ${images[currentIndex]?.gradient || 'from-teal-600 to-emerald-700'} flex items-center justify-center relative overflow-hidden`}>
        <span className="text-white/70 text-lg">{images[currentIndex]?.label || title}</span>

        {images.length > 1 && (
          <React.Fragment>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Icons.ChevronLeft />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Icons.ChevronRight />
            </button>
          </React.Fragment>
        )}

        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg bg-gradient-to-br ${img.gradient} ${currentIndex === idx ? 'ring-2 ring-teal-600 ring-offset-2' : 'opacity-70 hover:opacity-100'} transition-all`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Simple Calendar Date Picker
const SimpleDatePicker = ({ selectedDate, onDateSelect, selectedEndDate, onEndDateSelect, availability = {}, minDate = new Date(), multiDay = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(minDate.getFullYear(), minDate.getMonth(), 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle multi-day click logic
  const handleDayClick = (dateStr) => {
    if (!multiDay) {
      onDateSelect(dateStr);
      return;
    }
    // Multi-day: first click = start, second click = end
    if (!selectedDate || (selectedDate && selectedEndDate)) {
      // Starting a new selection
      onDateSelect(dateStr);
      if (onEndDateSelect) onEndDateSelect(null);
    } else {
      // Selecting end date
      if (dateStr < selectedDate) {
        // Clicked before start — swap
        if (onEndDateSelect) onEndDateSelect(selectedDate);
        onDateSelect(dateStr);
      } else if (dateStr === selectedDate) {
        // Same day — single day
        if (onEndDateSelect) onEndDateSelect(null);
      } else {
        if (onEndDateSelect) onEndDateSelect(dateStr);
      }
    }
  };

  const isInRange = (dateStr) => {
    if (!multiDay || !selectedDate || !selectedEndDate) return false;
    return dateStr > selectedDate && dateStr < selectedEndDate;
  };

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availability[dateStr];
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const isStart = selectedDate && dateStr === selectedDate;
    const isEnd = selectedEndDate && dateStr === selectedEndDate;
    const inRange = isInRange(dateStr);

    let bgColor = 'bg-gray-100 text-gray-400';
    let hoverColor = '';

    if (!isPast) {
      if (dayAvailability?.status === 'available') {
        bgColor = 'bg-green-100 text-green-800';
        hoverColor = 'hover:bg-green-200 cursor-pointer';
      } else if (dayAvailability?.status === 'booked') {
        bgColor = 'bg-red-100 text-red-800';
      } else if (dayAvailability?.status === 'closed') {
        bgColor = 'bg-gray-200 text-gray-500';
      } else {
        bgColor = 'bg-white text-stone-700';
        hoverColor = 'hover:bg-stone-100 cursor-pointer';
      }
    }

    if (inRange) {
      bgColor = 'bg-teal-100 text-teal-800';
    }
    if (isStart || isEnd) {
      bgColor = 'bg-teal-600 text-white';
    }

    days.push(
      <button
        key={day}
        onClick={() => !isPast && dayAvailability?.status !== 'booked' && dayAvailability?.status !== 'closed' && handleDayClick(dateStr)}
        disabled={isPast || dayAvailability?.status === 'booked' || dayAvailability?.status === 'closed'}
        className={`h-10 rounded-lg text-sm font-medium ${bgColor} ${hoverColor} transition-colors flex items-center justify-center`}
      >
        {day}
      </button>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Icons.ChevronLeft />
        </button>
        <span className="font-semibold text-stone-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Icons.ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-stone-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-stone-200 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          <span className="text-stone-600">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          <span className="text-stone-600">Booked</span>
        </div>
      </div>
    </div>
  );
};

// Certification Badge
const CertificationBadge = ({ cert }) => {
  const badgeStyles = {
    'SGAIC Master': { bg: 'bg-amber-100', text: 'text-amber-800', icon: '🏆' },
    'AAPGAI': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🎣' },
    'GAIA Level 2': { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
    'Angling Trust Level 2': { bg: 'bg-teal-100', text: 'text-teal-800', icon: '✓' },
    'Angling Trust Coach': { bg: 'bg-teal-100', text: 'text-teal-800', icon: '👨‍🏫' },
    'First Aid': { bg: 'bg-red-100', text: 'text-red-800', icon: '➕' },
    'DBS Checked': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '✔' },
    'Boat Master': { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: '⚓' },
    'Tenkara Ambassador': { bg: 'bg-pink-100', text: 'text-pink-800', icon: '🎌' }
  };

  const style = badgeStyles[cert] || { bg: 'bg-stone-100', text: 'text-stone-800', icon: '•' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
      <span>{style.icon}</span>
      {cert}
    </span>
  );
};

// ============================================================================
// IMPROVED FILTER COMPONENTS (FIXED CLICKABILITY)
// ============================================================================

// FIXED: Checkbox now has proper onClick handler
const CheckboxFilter = ({ label, checked, onChange }) => (
  <div
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onChange();
    }}
    className="flex items-center gap-3 cursor-pointer group py-1 select-none"
    role="checkbox"
    aria-checked={checked}
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); } }}
  >
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${checked ? 'bg-teal-600 border-teal-600 text-white' : 'border-stone-300 group-hover:border-teal-400 bg-white'}`}>
      {checked && <Icons.Check />}
    </div>
    <span className="text-stone-700 group-hover:text-stone-900">{label}</span>
  </div>
);

// IMPROVED: Price Range Slider with numeric inputs
const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);
  const trackRef = useRef(null);

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
  }, [value]);

  const handleMinInput = (e) => {
    const val = Number(e.target.value) || 0;
    const newMin = Math.max(min, Math.min(val, localMax - 10));
    setLocalMin(newMin);
    onChange([newMin, localMax]);
  };

  const handleMaxInput = (e) => {
    const val = Number(e.target.value) || max;
    const newMax = Math.min(max, Math.max(val, localMin + 10));
    setLocalMax(newMax);
    onChange([localMin, newMax]);
  };

  // Click on track to set value
  const handleTrackClick = (e, type) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newValue = Math.round(min + percent * (max - min));

    if (type === 'min') {
      const clamped = Math.min(newValue, localMax - 10);
      setLocalMin(clamped);
      onChange([clamped, localMax]);
    } else {
      const clamped = Math.max(newValue, localMin + 10);
      setLocalMax(clamped);
      onChange([localMin, clamped]);
    }
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Numeric Inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-stone-500 mb-1 block">Min</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">£</span>
            <input
              type="number"
              value={localMin}
              onChange={handleMinInput}
              min={min}
              max={localMax - 10}
              className="w-full pl-7 pr-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="text-stone-400 mt-5">—</div>
        <div className="flex-1">
          <label className="text-xs text-stone-500 mb-1 block">Max</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">£</span>
            <input
              type="number"
              value={localMax}
              onChange={handleMaxInput}
              min={localMin + 10}
              max={max}
              className="w-full pl-7 pr-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Min Slider */}
      <div>
        <label className="text-xs text-stone-500 mb-2 block">Click or drag to set minimum: £{localMin}</label>
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={(e) => {
            const newMin = Math.min(Number(e.target.value), localMax - 10);
            setLocalMin(newMin);
            onChange([newMin, localMax]);
          }}
          className="w-full h-3 bg-stone-200 rounded-full appearance-none cursor-pointer slider-thumb-teal"
        />
      </div>

      {/* Max Slider */}
      <div>
        <label className="text-xs text-stone-500 mb-2 block">Click or drag to set maximum: £{localMax}</label>
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={(e) => {
            const newMax = Math.max(Number(e.target.value), localMin + 10);
            setLocalMax(newMax);
            onChange([localMin, newMax]);
          }}
          className="w-full h-3 bg-stone-200 rounded-full appearance-none cursor-pointer slider-thumb-teal"
        />
      </div>

      {/* Visual Range Bar */}
      <div ref={trackRef} className="relative h-3 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-teal-500 rounded-full"
          style={{ left: minPercent + '%', right: (100 - maxPercent) + '%' }}
        />
      </div>
    </div>
  );
};

// Location Search Component - Type any location, then choose radius
const LocationSearch = ({ location, radius, onLocationChange, onRadiusChange }) => {
  const [query, setQuery] = useState(location?.name || '');
  const [isSearching, setIsSearching] = useState(false);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsSearching(true);
  };

  const handleSearch = () => {
    if (query.trim().length > 0) {
      // Create a location object from the search text
      onLocationChange({ name: query.trim(), isCustom: true });
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearLocation = () => {
    setQuery('');
    onLocationChange(null);
    setIsSearching(false);
  };

  // Show radius when location is set (either from search or has a name)
  const showRadius = location && location.name;

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          <Icons.Search />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (query.trim() && isSearching) handleSearch(); }}
          placeholder="Type any location (town, city, postcode...)"
          className="w-full pl-10 pr-10 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            <Icons.X />
          </button>
        )}
      </div>

      {/* Search button when typing */}
      {isSearching && query.trim().length > 0 && (
        <button
          onClick={handleSearch}
          className="w-full py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        >
          <Icons.Search />
          Search near "{query}"
        </button>
      )}

      {/* Radius Selector - only show when location is set */}
      {showRadius && (
        <div className="bg-teal-50 rounded-lg p-3">
          <label className="text-sm font-medium text-teal-800 mb-2 block">
            Expand search radius from "{location.name}"
          </label>
          <div className="flex gap-2 flex-wrap">
            {[5, 10, 15, 25, 50].map(r => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  radius === r
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {r} miles
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Toggle Switch Component (FIXED)
const ToggleSwitch = ({ checked, onChange, label }) => (
  <div
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between cursor-pointer select-none py-1"
    role="switch"
    aria-checked={checked}
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}
  >
    <span className="font-semibold text-stone-800">{label}</span>
    <div className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-teal-600' : 'bg-stone-300'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </div>
  </div>
);


// ============================================================================
// ADVANCED FILTERS FOR WATERS (with Location Search)
// ============================================================================

const AdvancedFilters = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Location Search - NEW */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Location</h4>
        <LocationSearch
          location={filters.location}
          radius={filters.radius}
          onLocationChange={(loc) => onFilterChange({ ...filters, location: loc })}
          onRadiusChange={(r) => onFilterChange({ ...filters, radius: r })}
        />
      </div>

      {/* Price Range - IMPROVED */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Price Range (per day)</h4>
        <PriceRangeSlider
          min={0}
          max={500}
          value={filters.priceRange}
          onChange={(value) => onFilterChange({ ...filters, priceRange: value })}
        />
      </div>

      {/* Popular Species - RENAMED */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Popular Species</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
          {speciesList.slice(0, 12).map(species => (
            <CheckboxFilter
              key={species}
              label={species}
              checked={filters.species.includes(species)}
              onChange={() => {
                const newSpecies = filters.species.includes(species)
                  ? filters.species.filter(s => s !== species)
                  : [...filters.species, species];
                onFilterChange({ ...filters, species: newSpecies });
              }}
            />
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Experience Level</h4>
        <div className="space-y-2">
          {['beginner', 'intermediate', 'expert'].map(level => (
            <div
              key={level}
              onClick={() => onFilterChange({ ...filters, experience: filters.experience === level ? '' : level })}
              className="flex items-center gap-3 cursor-pointer py-1 select-none group"
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${filters.experience === level ? 'border-teal-600' : 'border-stone-300 group-hover:border-teal-400'}`}>
                {filters.experience === level && <div className="w-2 h-2 rounded-full bg-teal-600" />}
              </div>
              <span className="text-stone-700 capitalize group-hover:text-stone-900">{level}</span>
            </div>
          ))}
          <div
            onClick={() => onFilterChange({ ...filters, experience: '' })}
            className="flex items-center gap-3 cursor-pointer py-1 select-none group"
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${!filters.experience ? 'border-teal-600' : 'border-stone-300 group-hover:border-teal-400'}`}>
              {!filters.experience && <div className="w-2 h-2 rounded-full bg-teal-600" />}
            </div>
            <span className="text-stone-700 group-hover:text-stone-900">Any level</span>
          </div>
        </div>
      </div>

      {/* Facilities - FIXED */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Facilities</h4>
        <div className="space-y-1">
          {facilitiesList.map(facility => (
            <CheckboxFilter
              key={facility.id}
              label={facility.name}
              checked={filters.facilities.includes(facility.id)}
              onChange={() => {
                const newFacilities = filters.facilities.includes(facility.id)
                  ? filters.facilities.filter(f => f !== facility.id)
                  : [...filters.facilities, facility.id];
                onFilterChange({ ...filters, facilities: newFacilities });
              }}
            />
          ))}
        </div>
      </div>

      {/* Weekend Toggle - FIXED */}
      <ToggleSwitch
        checked={filters.weekendOnly}
        onChange={(val) => onFilterChange({ ...filters, weekendOnly: val })}
        label="Available this weekend"
      />

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange({
          priceRange: [0, 500],
          species: [],
          experience: '',
          facilities: [],
          weekendOnly: false,
          location: null,
          radius: 15
        })}
        className="w-full py-2 text-teal-600 hover:text-teal-700 font-medium"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <React.Fragment>
      <div className="hidden lg:block">
        <div className={`bg-white rounded-xl border border-stone-200 overflow-hidden transition-all ${isOpen ? 'p-6' : 'p-0 h-0'}`}>
          {isOpen && <FilterContent />}
        </div>
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        <Icons.Filter />
        <span>Filters</span>
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <Icons.X />
              </button>
            </div>
            <div className="p-6">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

// ============================================================================
// INSTRUCTOR FILTERS (NEW - matches Waters style with Popular Specialties)
// ============================================================================

const InstructorFilters = ({ filters, onFilterChange, isOpen }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Location Search */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Location</h4>
        <LocationSearch
          location={filters.location}
          radius={filters.radius}
          onLocationChange={(loc) => onFilterChange({ ...filters, location: loc })}
          onRadiusChange={(r) => onFilterChange({ ...filters, radius: r })}
        />
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Price Range (per day)</h4>
        <PriceRangeSlider
          min={0}
          max={500}
          value={filters.priceRange}
          onChange={(value) => onFilterChange({ ...filters, priceRange: value })}
        />
      </div>

      {/* Popular Specialties (replaces Facilities) */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Popular Specialties</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
          {specialtiesList.map(specialty => (
            <CheckboxFilter
              key={specialty}
              label={specialty}
              checked={filters.specialties.includes(specialty)}
              onChange={() => {
                const newSpecialties = filters.specialties.includes(specialty)
                  ? filters.specialties.filter(s => s !== specialty)
                  : [...filters.specialties, specialty];
                onFilterChange({ ...filters, specialties: newSpecialties });
              }}
            />
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="font-semibold text-stone-800 mb-3">Good for</h4>
        <div className="space-y-2">
          {['Beginners', 'Improvers', 'Advanced'].map(level => (
            <div
              key={level}
              onClick={() => onFilterChange({ ...filters, targetLevel: filters.targetLevel === level ? '' : level })}
              className="flex items-center gap-3 cursor-pointer py-1 select-none group"
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${filters.targetLevel === level ? 'border-teal-600' : 'border-stone-300 group-hover:border-teal-400'}`}>
                {filters.targetLevel === level && <div className="w-2 h-2 rounded-full bg-teal-600" />}
              </div>
              <span className="text-stone-700 group-hover:text-stone-900">{level}</span>
            </div>
          ))}
          <div
            onClick={() => onFilterChange({ ...filters, targetLevel: '' })}
            className="flex items-center gap-3 cursor-pointer py-1 select-none group"
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${!filters.targetLevel ? 'border-teal-600' : 'border-stone-300 group-hover:border-teal-400'}`}>
              {!filters.targetLevel && <div className="w-2 h-2 rounded-full bg-teal-600" />}
            </div>
            <span className="text-stone-700 group-hover:text-stone-900">All levels</span>
          </div>
        </div>
      </div>

      {/* Calendar Availability Toggle */}
      <ToggleSwitch
        checked={filters.hasCalendar}
        onChange={(val) => onFilterChange({ ...filters, hasCalendar: val })}
        label="Online booking available"
      />

      {/* Weekend Toggle */}
      <ToggleSwitch
        checked={filters.weekendOnly}
        onChange={(val) => onFilterChange({ ...filters, weekendOnly: val })}
        label="Available this weekend"
      />

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange({
          priceRange: [0, 500],
          specialties: [],
          targetLevel: '',
          hasCalendar: false,
          weekendOnly: false,
          location: null,
          radius: 15
        })}
        className="w-full py-2 text-teal-600 hover:text-teal-700 font-medium"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <React.Fragment>
      <div className="hidden lg:block">
        <div className={`bg-white rounded-xl border border-stone-200 overflow-hidden transition-all ${isOpen ? 'p-6' : 'p-0 h-0'}`}>
          {isOpen && <FilterContent />}
        </div>
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        <Icons.Filter />
        <span>Filters</span>
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <Icons.X />
              </button>
            </div>
            <div className="p-6">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

// ============================================================================
// WEATHER & CONDITIONS WIDGET
// ============================================================================

// Real weather data from Open-Meteo API (free, no key needed)
const useWeatherData = (venue) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lat = venue.coordinates?.lat || venue.lat || (51.5 + (venue.id * 0.3));
        const lon = venue.coordinates?.lng || venue.lng || (-1.5 + (venue.id * 0.2));
        const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,surface_pressure,precipitation&timezone=Europe/London`);
        const data = await resp.json();
        const c = data.current;

        // Map WMO weather codes to readable conditions
        const wmoMap = {
          0: { condition: 'Clear', icon: '☀️' },
          1: { condition: 'Mainly Clear', icon: '🌤️' },
          2: { condition: 'Partly Cloudy', icon: '⛅' },
          3: { condition: 'Overcast', icon: '☁️' },
          45: { condition: 'Foggy', icon: '🌫️' },
          48: { condition: 'Freezing Fog', icon: '🌫️' },
          51: { condition: 'Light Drizzle', icon: '🌦️' },
          53: { condition: 'Drizzle', icon: '🌦️' },
          55: { condition: 'Heavy Drizzle', icon: '🌧️' },
          61: { condition: 'Light Rain', icon: '🌧️' },
          63: { condition: 'Rain', icon: '🌧️' },
          65: { condition: 'Heavy Rain', icon: '🌧️' },
          71: { condition: 'Light Snow', icon: '🌨️' },
          73: { condition: 'Snow', icon: '🌨️' },
          75: { condition: 'Heavy Snow', icon: '❄️' },
          80: { condition: 'Rain Showers', icon: '🌦️' },
          81: { condition: 'Heavy Showers', icon: '🌧️' },
          95: { condition: 'Thunderstorm', icon: '⛈️' }
        };
        const wmo = wmoMap[c.weather_code] || wmoMap[Math.floor(c.weather_code / 10) * 10] || { condition: 'Unknown', icon: '🌤️' };

        // Determine pressure trend
        const pressureHpa = c.surface_pressure;
        const pressureTrend = pressureHpa > 1020 ? 'Rising' : pressureHpa < 1005 ? 'Falling' : 'Stable';

        setWeather({
          temp: Math.round(c.temperature_2m),
          condition: wmo.condition,
          icon: wmo.icon,
          wind: Math.round(c.wind_speed_10m * 0.621371), // km/h to mph
          rain: Math.round(c.precipitation * 100) || (c.weather_code >= 51 ? 60 : 0),
          pressure: pressureTrend,
          humidity: c.relative_humidity_2m
        });
      } catch (err) {
        // Fallback to simulated if API fails
        const fallbacks = [
          { temp: 12, condition: 'Partly Cloudy', icon: '⛅', wind: 8, rain: 10, pressure: 'Stable' },
          { temp: 14, condition: 'Sunny', icon: '☀️', wind: 5, rain: 0, pressure: 'Rising' },
          { temp: 9, condition: 'Overcast', icon: '☁️', wind: 12, rain: 30, pressure: 'Falling' }
        ];
        setWeather(fallbacks[venue.id % fallbacks.length]);
      }
      setLoading(false);
    };
    fetchWeather();
  }, [venue.id]);

  return { weather, loading };
};

// Simulated river level data
const getRiverLevel = (venueId, type) => {
  if (type === 'sea') return null; // Sea fishing doesn't need river levels
  const levels = ['Low', 'Normal', 'Rising', 'High', 'Falling'];
  const colors = ['text-amber-600', 'text-green-600', 'text-blue-600', 'text-red-600', 'text-blue-500'];
  const idx = venueId % levels.length;
  return { level: levels[idx], color: colors[idx], percent: 30 + (idx * 15) };
};

// Simulated tide data for sea fishing
const getTideData = (venueId) => {
  const tides = [
    { high: '06:34', low: '12:48', nextHigh: '18:52' },
    { high: '07:12', low: '13:26', nextHigh: '19:30' },
    { high: '08:45', low: '14:59', nextHigh: '21:03' }
  ];
  return tides[venueId % tides.length];
};

const WeatherConditionsWidget = ({ venue }) => {
  const { weather, loading: weatherLoading } = useWeatherData(venue);
  const riverLevel = getRiverLevel(venue.id, venue.type);

  if (weatherLoading || !weather) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2"><Icons.Sun /> Conditions Today</h4>
        <div className="text-center py-4 text-stone-400">Loading weather...</div>
      </div>
    );
  }
  const tideData = venue.type === 'sea' ? getTideData(venue.id) : null;

  // Simple fishing forecast based on conditions
  const getFishingForecast = () => {
    if (weather.wind > 12) return { rating: 'Fair', color: 'text-amber-600', desc: 'Windy conditions' };
    if (weather.rain > 50) return { rating: 'Poor', color: 'text-red-600', desc: 'Heavy rain expected' };
    if (weather.pressure === 'Falling') return { rating: 'Good', color: 'text-green-600', desc: 'Fish often feed before storms' };
    if (weather.pressure === 'Stable' && weather.wind < 10) return { rating: 'Excellent', color: 'text-green-700', desc: 'Ideal conditions' };
    return { rating: 'Good', color: 'text-green-600', desc: 'Favorable conditions' };
  };

  const forecast = getFishingForecast();

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
      <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
        <Icons.Sun />
        Conditions Today
      </h4>

      {/* Weather Row */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{weather.icon}</span>
          <div>
            <div className="text-xl font-bold text-stone-800">{weather.temp}°C</div>
            <div className="text-xs text-stone-500">{weather.condition}</div>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-stone-600">Wind: {weather.wind}mph</div>
          <div className="text-stone-600">Rain: {weather.rain}%</div>
        </div>
      </div>

      {/* River Level (for game/coarse) or Tides (for sea) */}
      {riverLevel && (
        <div className="mb-3 pb-3 border-b border-stone-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-stone-600">River Level</span>
            <span className={`text-sm font-medium ${riverLevel.color}`}>{riverLevel.level}</span>
          </div>
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-green-500 to-blue-500 rounded-full"
              style={{ width: `${riverLevel.percent}%` }}
            />
          </div>
        </div>
      )}

      {tideData && (
        <div className="mb-3 pb-3 border-b border-stone-100">
          <div className="text-sm text-stone-600 mb-2">Today's Tides</div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-blue-600 font-medium">High</div>
              <div className="text-stone-800 font-bold">{tideData.high}</div>
            </div>
            <div className="bg-stone-50 rounded-lg p-2">
              <div className="text-stone-500 font-medium">Low</div>
              <div className="text-stone-800 font-bold">{tideData.low}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-blue-600 font-medium">High</div>
              <div className="text-stone-800 font-bold">{tideData.nextHigh}</div>
            </div>
          </div>
        </div>
      )}

      {/* Fishing Forecast */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-600">Fishing Forecast</span>
        <div className="text-right">
          <span className={`font-semibold ${forecast.color}`}>{forecast.rating}</span>
          <div className="text-xs text-stone-500">{forecast.desc}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// RECENT CATCHES COMPONENT
// ============================================================================

// Simulated catch reports (in production, would come from database)
const generateCatchReports = (venueId, species) => {
  const names = ['James M.', 'Sarah K.', 'Robert T.', 'Emily W.', 'David P.', 'Lucy B.', 'Tom H.', 'Anna R.'];
  const daysAgo = [0, 1, 2, 3, 5, 7, 10, 14];
  const methods = ['Fly', 'Spinner', 'Bait', 'Lure', 'Float', 'Ledger', 'Feeder'];

  const reports = [];
  const numReports = 3 + (venueId % 4); // 3-6 reports per venue

  for (let i = 0; i < numReports; i++) {
    const speciesIdx = (venueId + i) % species.length;
    const nameIdx = (venueId + i * 2) % names.length;
    const dayIdx = i % daysAgo.length;

    reports.push({
      id: venueId * 100 + i,
      angler: names[nameIdx],
      species: species[speciesIdx],
      weight: (Math.random() * 20 + 2).toFixed(1),
      method: methods[(venueId + i) % methods.length],
      daysAgo: daysAgo[dayIdx],
      comment: i === 0 ? 'Great day on the water!' : null
    });
  }

  return reports.sort((a, b) => a.daysAgo - b.daysAgo);
};

const RecentCatches = ({ venue, onReportCatch }) => {
  const catches = generateCatchReports(venue.id, venue.species);
  const [showAll, setShowAll] = useState(false);
  const displayCatches = showAll ? catches : catches.slice(0, 4);

  const formatDate = (daysAgo) => {
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    return `${daysAgo} days ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-stone-800">Recent Catches</h3>
          <p className="text-sm text-stone-500">{catches.length} catches reported recently</p>
        </div>
        <button
          onClick={onReportCatch}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium flex items-center gap-2"
        >
          <Icons.Plus />
          Report Catch
        </button>
      </div>

      <div className="space-y-3">
        {displayCatches.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
              <Icons.Fish />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-stone-800">{c.species}</span>
                <span className="text-stone-400">•</span>
                <span className="text-teal-600 font-medium">{c.weight}lb</span>
                <span className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded-full">{c.method}</span>
              </div>
              <div className="text-sm text-stone-500">
                {c.angler} • {formatDate(c.daysAgo)}
              </div>
              {c.comment && <p className="text-sm text-stone-600 mt-1 italic">"{c.comment}"</p>}
            </div>
          </div>
        ))}
      </div>

      {catches.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
        >
          {showAll ? 'Show less' : `View all ${catches.length} catches`}
        </button>
      )}
    </div>
  );
};

// ============================================================================
// REPORT CATCH MODAL
// ============================================================================

const ReportCatchModal = ({ isOpen, onClose, venue, onSignInRequired }) => {
  const auth = useAuth();
  const [formData, setFormData] = useState({
    species: '',
    weight: '',
    method: '',
    comment: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const methods = ['Fly', 'Spinner', 'Bait', 'Lure', 'Float', 'Ledger', 'Feeder', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.user) {
      onSignInRequired?.();
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.submitCatch(
        venue.id,
        formData.species,
        formData.weight ? parseFloat(formData.weight) : null,
        formData.method,
        formData.comment
      );
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({ species: '', weight: '', method: '', comment: '' });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit catch');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-800">Report a Catch</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg">
            <Icons.X />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Catch Reported!</h3>
            <p className="text-stone-600">Thanks for sharing. Your catch has been added.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Species Caught *</label>
              <select
                required
                value={formData.species}
                onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select species...</option>
                {venue?.species.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Weight (lb)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 12.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Method</label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select...</option>
                  {methods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Comment (optional)</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="How was your session?"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {!auth.user && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                You need to be signed in to report a catch.
              </div>
            )}

            <button
              type="submit"
              disabled={!formData.species || loading}
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : auth.user ? 'Submit Catch Report' : 'Sign in to Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SIGN IN MODAL (Functional)
// ============================================================================

const SignInModal = ({ isOpen, onClose }) => {
  const auth = useAuth();
  const [mode, setMode] = useState('signin'); // signin, signup, forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        await auth.login(email, password);
        setSuccess('Welcome back! Signing you in...');
        setTimeout(() => {
          onClose();
          setSuccess('');
          setEmail('');
          setPassword('');
        }, 1000);
      } else if (mode === 'signup') {
        if (!email || !password || !name) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await auth.register(email, password, name);
        setSuccess('Account created! Welcome to TightLines!');
        setTimeout(() => {
          onClose();
          setSuccess('');
          setEmail('');
          setPassword('');
          setName('');
        }, 1000);
      } else if (mode === 'forgot') {
        if (!email) {
          setError('Please enter your email');
          setLoading(false);
          return;
        }
        await api.request('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        setSuccess('If that email is registered, a new password has been sent to your inbox. Check your email!');
        setTimeout(() => {
          setMode('signin');
          setSuccess('');
        }, 5000);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {mode === 'forgot' ? <Icons.Mail /> : <Icons.User />}
          </div>
          <h2 className="text-2xl font-bold">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-teal-100 mt-1">
            {mode === 'signin' && 'Sign in to access your bookings'}
            {mode === 'signup' && 'Join the TightLines community'}
            {mode === 'forgot' && "We'll email you a new password"}
          </p>
        </div>

        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
          <Icons.X />
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">{success}</div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="John Smith"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="you@example.com"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === 'signin' && (
            <div className="text-right">
              <button type="button" onClick={() => setMode('forgot')} className="text-sm text-teal-600 hover:text-teal-700">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Please wait...' : (
              mode === 'signin' ? 'Sign In' :
              mode === 'signup' ? 'Create Account' :
              'Send Reset Link'
            )}
          </button>

          <div className="text-center text-sm text-stone-500">
            {mode === 'signin' && (
              <span>
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign up
                </button>
              </span>
            )}
            {mode === 'signup' && (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign in
                </button>
              </span>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => setMode('signin')} className="text-teal-600 hover:text-teal-700 font-medium">
                Back to sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// LIST YOUR WATER MODAL (Functional)
// ============================================================================

// Water body types for the form
const waterBodyTypes = [
  { id: 'river', name: 'River / Stream' },
  { id: 'lake', name: 'Lake / Loch' },
  { id: 'reservoir', name: 'Reservoir' },
  { id: 'pond', name: 'Pond' },
  { id: 'canal', name: 'Canal' },
  { id: 'stillwater', name: 'Stillwater Complex' },
  { id: 'coastal', name: 'Coastal / Beach' },
  { id: 'charter', name: 'Charter Boat' }
];

const ListWaterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    waterBodyType: '',
    fishingType: '',
    region: '',
    // Step 2: Location
    address: '',
    townCity: '',
    county: '',
    postcode: '',
    // Step 3: Details
    description: '',
    species: [],
    facilities: [],
    rules: '',
    highlights: '',
    // Step 4: Booking Options
    bookingOptions: [],
    bookingType: 'instant',
    openingHours: '',
    seasonDates: '',
    // Step 5: Contact & Photos
    contactName: '',
    email: '',
    phone: '',
    website: '',
    facebook: '',
    instagram: '',
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState(null);

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.request('/register/water', {
        method: 'POST',
        body: JSON.stringify({
          ownerName: formData.contactName,
          ownerEmail: formData.email,
          ownerPhone: formData.phone,
          waterName: formData.name,
          waterType: formData.fishingType,
          region: formData.region,
          description: formData.description,
          species: formData.species,
          bookingOptions: formData.bookingOptions || [],
          price: formData.bookingOptions?.length > 0 ? Math.min(...formData.bookingOptions.map(o => parseInt(o.price) || 0)) : 0,
          bookingType: formData.bookingOptions?.some(o => o.bookingType === 'instant') ? 'instant' : 'enquiry',
          facilities: formData.facilities,
          rules: formData.rules ? formData.rules.split('\n').filter(r => r.trim()) : []
        })
      });
      setSubmitted(true);
      if (response.isNewUser && response.tempPassword) {
        setCredentials({ email: response.loginEmail, password: response.tempPassword });
      }
    } catch (e) {
      setError(e.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setCredentials(null);
    setError('');
    setFormData({
      name: '', waterBodyType: '', fishingType: '', region: '',
      address: '', townCity: '', county: '', postcode: '',
      description: '', species: [], facilities: [], rules: '', highlights: '',
      bookingOptions: [], bookingType: 'instant', openingHours: '', seasonDates: '',
      contactName: '', email: '', phone: '', website: '', facebook: '', instagram: '', photos: []
    });
    setSubmitted(false);
  };

  const stepTitles = ['Basic Info', 'Location', 'Details', 'Pricing', 'Contact'];

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name && formData.waterBodyType && formData.fishingType && formData.region;
      case 2: return formData.townCity && formData.postcode;
      case 3: return formData.species.length > 0;
      case 4: return formData.bookingOptions && formData.bookingOptions.length > 0 && formData.bookingOptions.every(o => o.name && o.price);
      case 5: return formData.contactName && formData.email;
      default: return true;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-stone-800">List Your Water</h2>
            {!submitted && <p className="text-sm text-stone-500">Step {step} of {totalSteps}: {stepTitles[step-1]}</p>}
          </div>
          <button onClick={() => { onClose(); resetForm(); }} className="p-2 hover:bg-stone-100 rounded-lg">
            <Icons.X />
          </button>
        </div>

        {/* Progress Bar */}
        {!submitted && (
          <div className="px-6 py-4 bg-stone-50">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? 'bg-teal-600' : 'bg-stone-200'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Submission Received!</h3>
              <p className="text-stone-600 mb-4">
                Thank you for listing your water with TightLines. Our team will review your submission and get in touch within 2-3 business days.
              </p>
              {credentials && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6 text-left">
                  <p className="font-semibold text-teal-800 mb-2">Your Account Credentials:</p>
                  <p className="text-sm text-teal-700">Email: <span className="font-mono">{credentials.email}</span></p>
                  <p className="text-sm text-teal-700">Temporary Password: <span className="font-mono">{credentials.password}</span></p>
                  <p className="text-xs text-teal-600 mt-2">Please save these details and change your password after logging in.</p>
                </div>
              )}
              <button
                onClick={() => { onClose(); resetForm(); }}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
              >
                Done
              </button>
            </div>
          ) : (
            <React.Fragment>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Water Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., River Wye - Letton Beat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Water Body Type *</label>
                    <select
                      value={formData.waterBodyType}
                      onChange={(e) => updateForm('waterBodyType', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select water type...</option>
                      {waterBodyTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Fishing Type *</label>
                      <select
                        value={formData.fishingType}
                        onChange={(e) => updateForm('fishingType', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select type...</option>
                        <option value="game">Game Fishing</option>
                        <option value="coarse">Coarse Fishing</option>
                        <option value="sea">Sea Fishing</option>
                        <option value="mixed">Mixed (Game & Coarse)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Region *</label>
                      <select
                        value={formData.region}
                        onChange={(e) => updateForm('region', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select region...</option>
                        {regions.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-blue-700 text-sm">📍 Your exact address won't be shown publicly. We'll display the general area to help anglers find your water.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Address / Location Name</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Letton Court Farm, or main access point"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Town / City *</label>
                      <input
                        type="text"
                        value={formData.townCity}
                        onChange={(e) => updateForm('townCity', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Hereford"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">County</label>
                      <input
                        type="text"
                        value={formData.county}
                        onChange={(e) => updateForm('county', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Herefordshire"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Postcode *</label>
                    <input
                      type="text"
                      value={formData.postcode}
                      onChange={(e) => updateForm('postcode', e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                      placeholder="e.g., HR3 6DL"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Describe your water, what makes it special, typical catches, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Highlights (one per line)</label>
                    <textarea
                      value={formData.highlights}
                      onChange={(e) => updateForm('highlights', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g.,&#10;Double-bank access&#10;1.5 miles of water&#10;Wading friendly"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">Species Available *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {speciesList.map(species => (
                        <CheckboxFilter
                          key={species}
                          label={species}
                          checked={formData.species.includes(species)}
                          onChange={() => {
                            const newSpecies = formData.species.includes(species)
                              ? formData.species.filter(s => s !== species)
                              : [...formData.species, species];
                            updateForm('species', newSpecies);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">Facilities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {facilitiesList.map(facility => (
                        <CheckboxFilter
                          key={facility.id}
                          label={facility.name}
                          checked={formData.facilities.includes(facility.id)}
                          onChange={() => {
                            const newFacilities = formData.facilities.includes(facility.id)
                              ? formData.facilities.filter(f => f !== facility.id)
                              : [...formData.facilities, facility.id];
                            updateForm('facilities', newFacilities);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Rules & Regulations</label>
                    <textarea
                      value={formData.rules}
                      onChange={(e) => updateForm('rules', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Barbless hooks only, catch and release, no night fishing..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: What Can Anglers Book? */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-1">What Can Anglers Book?</h4>
                    <p className="text-sm text-stone-500">Add the different things anglers can book or enquire about. You need at least one option.</p>
                  </div>

                  {/* Existing options */}
                  {(formData.bookingOptions || []).map((opt, idx) => (
                    <div key={idx} className="border border-stone-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-stone-800 text-sm">{opt.name || `Option ${idx + 1}`}</span>
                        <button type="button" onClick={() => {
                          const updated = formData.bookingOptions.filter((_, i) => i !== idx);
                          updateForm('bookingOptions', updated);
                        }} className="text-red-500 text-xs hover:text-red-700">Remove</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-stone-600 mb-1">Category</label>
                          <select value={opt.category} onChange={(e) => {
                            const updated = [...formData.bookingOptions];
                            updated[idx] = { ...opt, category: e.target.value };
                            updateForm('bookingOptions', updated);
                          }} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                            <option value="day-tickets">Day Tickets & Passes</option>
                            <option value="guided">Guided Experiences</option>
                            <option value="accommodation">Accommodation</option>
                            <option value="extras">Extras & Add-ons</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-stone-600 mb-1">Booking Type</label>
                          <select value={opt.bookingType} onChange={(e) => {
                            const updated = [...formData.bookingOptions];
                            updated[idx] = { ...opt, bookingType: e.target.value };
                            updateForm('bookingOptions', updated);
                          }} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                            <option value="instant">Instant Book</option>
                            <option value="enquiry">Enquiry Only</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Name *</label>
                        <input type="text" value={opt.name} onChange={(e) => {
                          const updated = [...formData.bookingOptions];
                          updated[idx] = { ...opt, name: e.target.value };
                          updateForm('bookingOptions', updated);
                        }} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" placeholder="e.g., Day Ticket, Guided Session" />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Description</label>
                        <input type="text" value={opt.description || ''} onChange={(e) => {
                          const updated = [...formData.bookingOptions];
                          updated[idx] = { ...opt, description: e.target.value };
                          updateForm('bookingOptions', updated);
                        }} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" placeholder="What's included?" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-stone-600 mb-1">Price (£) *</label>
                          <input type="number" value={opt.price} onChange={(e) => {
                            const updated = [...formData.bookingOptions];
                            updated[idx] = { ...opt, price: e.target.value };
                            updateForm('bookingOptions', updated);
                          }} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" placeholder="45" />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-600 mb-1">Price Per</label>
                          <select value={opt.priceType} onChange={(e) => {
                            const updated = [...formData.bookingOptions];
                            updated[idx] = { ...opt, priceType: e.target.value };
                            updateForm('bookingOptions', updated);
                          }} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                            <option value="day">Per Day</option>
                            <option value="half-day">Per Half Day</option>
                            <option value="session">Per Session</option>
                            <option value="night">Per Night</option>
                            <option value="person">Per Person</option>
                            <option value="season">Per Season</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Quick-add templates */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { cat: 'day-tickets', label: '+ Day Ticket', defaults: { name: 'Day Ticket', description: 'Full day fishing access', priceType: 'day', bookingType: 'instant' } },
                      { cat: 'guided', label: '+ Guided Session', defaults: { name: 'Guided Session', description: 'Half day with expert guide', priceType: 'day', bookingType: 'enquiry' } },
                      { cat: 'accommodation', label: '+ Accommodation', defaults: { name: 'Lodge & Fishing', description: 'Overnight stay with fishing included', priceType: 'night', bookingType: 'enquiry' } },
                      { cat: 'extras', label: '+ Extra / Add-on', defaults: { name: '', description: '', priceType: 'day', bookingType: 'instant' } }
                    ].map(tmpl => (
                      <button key={tmpl.cat} type="button" onClick={() => {
                        const newOpt = { category: tmpl.cat, ...tmpl.defaults, price: '' };
                        updateForm('bookingOptions', [...(formData.bookingOptions || []), newOpt]);
                      }} className="p-2 rounded-lg border border-dashed border-stone-300 text-stone-600 text-sm hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition">
                        {tmpl.label}
                      </button>
                    ))}
                  </div>

                  {(!formData.bookingOptions || formData.bookingOptions.length === 0) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                      Add at least one booking option using the buttons above.
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Opening Hours</label>
                      <input type="text" value={formData.openingHours} onChange={(e) => updateForm('openingHours', e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Dawn to dusk" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Season Dates</label>
                      <input type="text" value={formData.seasonDates} onChange={(e) => updateForm('seasonDates', e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., March - October" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Contact & Photos */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="bg-teal-50 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-teal-800 mb-1">Almost there!</h4>
                    <p className="text-teal-600 text-sm">Add your contact details so anglers can reach you and we can verify your listing.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Contact Name *</label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => updateForm('contactName', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="07XXX XXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Website (optional)</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateForm('website', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="https://www.yourfishery.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Facebook (optional)</label>
                      <input
                        type="text"
                        value={formData.facebook}
                        onChange={(e) => updateForm('facebook', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="facebook.com/yourpage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Instagram (optional)</label>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => updateForm('instagram', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="@yourhandle"
                      />
                    </div>
                  </div>

                  {/* Photo Upload Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">Photos (upload up to 5)</label>
                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="aspect-square bg-stone-100 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 hover:border-teal-400 transition-colors">
                          <Icons.Image />
                          <span className="text-xs text-stone-400 mt-1">Add</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-stone-500 mt-2">Photo upload will be available after account creation</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-stone-50 rounded-xl p-4 mt-6">
                    <h4 className="font-semibold text-stone-800 mb-3">Listing Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Water Name:</span>
                        <span className="font-medium text-stone-800">{formData.name || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Type:</span>
                        <span className="font-medium text-stone-800">{waterBodyTypes.find(t => t.id === formData.waterBodyType)?.name || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Location:</span>
                        <span className="font-medium text-stone-800">{formData.townCity ? `${formData.townCity}, ${formData.postcode}` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Price:</span>
                        <span className="font-medium text-stone-800">
                          {formData.bookingType === 'free' ? 'Free Access' : formData.dayTicketPrice ? `£${formData.dayTicketPrice}/day` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Species:</span>
                        <span className="font-medium text-stone-800">{formData.species.length > 0 ? formData.species.slice(0, 3).join(', ') + (formData.species.length > 3 ? '...' : '') : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 border border-stone-200 text-stone-700 rounded-lg font-semibold hover:bg-stone-50"
                  >
                    Back
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-stone-300 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !canProceed()}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-stone-300 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Listing'}
                  </button>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// INSTRUCTOR REGISTER MODAL - Comprehensive instructor registration
// ============================================================================

// Certification options for instructors
const certificationOptions = [
  { id: 'gaia', name: 'GAIA (Game Angling Instructors Association)' },
  { id: 'aapgai', name: 'AAPGAI (Advanced Professional Game Angling Instructors)' },
  { id: 'angling-trust-2', name: 'Angling Trust Level 2' },
  { id: 'angling-trust-3', name: 'Angling Trust Level 3' },
  { id: 'first-aid', name: 'First Aid Certified' },
  { id: 'dbs', name: 'DBS Checked' },
  { id: 'casting-instructor', name: 'Certified Casting Instructor' },
  { id: 'ghillie', name: 'Professional Ghillie' }
];

const InstructorRegisterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    // Step 2: Qualifications
    certifications: [],
    yearsExperience: '',
    specialties: [],
    // Step 3: Services
    lessonTypes: [],
    hourlyRate: '',
    halfDayRate: '',
    fullDayRate: '',
    coverageArea: '',
    travelWilling: false,
    // Step 4: Bio & Photos
    bio: '',
    website: '',
    instagram: '',
    facebook: '',
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState(null);

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.request('/register/instructor', {
        method: 'POST',
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          specialties: formData.specialties,
          region: formData.location,
          experience: formData.yearsExperience ? `${formData.yearsExperience} years` : '',
          bio: formData.bio,
          price: parseInt(formData.fullDayRate || formData.halfDayRate || formData.hourlyRate) || 0,
          certifications: formData.certifications,
          availability: formData.lessonTypes
        })
      });
      setSubmitted(true);
      if (response.isNewUser && response.tempPassword) {
        setCredentials({ email: response.loginEmail, password: response.tempPassword });
      }
    } catch (e) {
      setError(e.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setCredentials(null);
    setError('');
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', location: '',
      certifications: [], yearsExperience: '', specialties: [],
      lessonTypes: [], hourlyRate: '', halfDayRate: '', fullDayRate: '', coverageArea: '', travelWilling: false,
      bio: '', website: '', instagram: '', facebook: '', photos: []
    });
    setSubmitted(false);
  };

  const stepTitles = ['Personal Info', 'Qualifications', 'Services', 'Profile'];

  const canProceed = () => {
    switch (step) {
      case 1: return formData.firstName && formData.lastName && formData.email && formData.location;
      case 2: return formData.specialties.length > 0;
      case 3: return formData.hourlyRate || formData.halfDayRate || formData.fullDayRate;
      case 4: return formData.bio.length >= 50;
      default: return true;
    }
  };

  const lessonTypeOptions = [
    { id: 'one-to-one', name: '1-to-1 Lessons' },
    { id: 'small-group', name: 'Small Group (2-4)' },
    { id: 'large-group', name: 'Large Group (5+)' },
    { id: 'corporate', name: 'Corporate Events' },
    { id: 'kids', name: 'Children/Youth' },
    { id: 'beginners', name: 'Complete Beginners' },
    { id: 'intermediate', name: 'Intermediate Improvement' },
    { id: 'advanced', name: 'Advanced Techniques' },
    { id: 'guided-trips', name: 'Guided Fishing Trips' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Become an Instructor</h2>
            {!submitted && <p className="text-sm text-stone-500">Step {step} of {totalSteps}: {stepTitles[step-1]}</p>}
          </div>
          <button onClick={() => { onClose(); resetForm(); }} className="p-2 hover:bg-stone-100 rounded-lg">
            <Icons.X />
          </button>
        </div>

        {/* Progress Bar */}
        {!submitted && (
          <div className="px-6 py-4 bg-stone-50">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? 'bg-amber-500' : 'bg-stone-200'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Award />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Application Submitted!</h3>
              <p className="text-stone-600 mb-4">
                Thank you for applying to become a TightLines instructor. Our team will review your application and get in touch within 3-5 business days.
              </p>
              {credentials && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                  <p className="font-semibold text-amber-800 mb-2">Your Account Credentials:</p>
                  <p className="text-sm text-amber-700">Email: <span className="font-mono">{credentials.email}</span></p>
                  <p className="text-sm text-amber-700">Temporary Password: <span className="font-mono">{credentials.password}</span></p>
                  <p className="text-xs text-amber-600 mt-2">Please save these details and change your password after logging in.</p>
                </div>
              )}
              <button
                onClick={() => { onClose(); resetForm(); }}
                className="px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600"
              >
                Done
              </button>
            </div>
          ) : (
            <React.Fragment>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-amber-800 mb-1">Join our instructor network</h4>
                    <p className="text-amber-700 text-sm">Connect with anglers looking to improve their skills and share your passion for fishing.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateForm('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateForm('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="07XXX XXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Location / Base Area *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateForm('location', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g., Scottish Highlands, Hampshire, Wales"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Qualifications */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Years of Experience</label>
                    <select
                      value={formData.yearsExperience}
                      onChange={(e) => updateForm('yearsExperience', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select...</option>
                      <option value="1-3">1-3 years</option>
                      <option value="4-7">4-7 years</option>
                      <option value="8-15">8-15 years</option>
                      <option value="15+">15+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">Certifications & Qualifications</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {certificationOptions.map(cert => (
                        <CheckboxFilter
                          key={cert.id}
                          label={cert.name}
                          checked={formData.certifications.includes(cert.id)}
                          onChange={() => {
                            const newCerts = formData.certifications.includes(cert.id)
                              ? formData.certifications.filter(c => c !== cert.id)
                              : [...formData.certifications, cert.id];
                            updateForm('certifications', newCerts);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">Specialties *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {specialtiesList.map(specialty => (
                        <CheckboxFilter
                          key={specialty}
                          label={specialty}
                          checked={formData.specialties.includes(specialty)}
                          onChange={() => {
                            const newSpecialties = formData.specialties.includes(specialty)
                              ? formData.specialties.filter(s => s !== specialty)
                              : [...formData.specialties, specialty];
                            updateForm('specialties', newSpecialties);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Services */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">Lesson Types Offered</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {lessonTypeOptions.map(type => (
                        <CheckboxFilter
                          key={type.id}
                          label={type.name}
                          checked={formData.lessonTypes.includes(type.id)}
                          onChange={() => {
                            const newTypes = formData.lessonTypes.includes(type.id)
                              ? formData.lessonTypes.filter(t => t !== type.id)
                              : [...formData.lessonTypes, type.id];
                            updateForm('lessonTypes', newTypes);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">Pricing (at least one required) *</label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Hourly Rate (£)</label>
                        <input
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => updateForm('hourlyRate', e.target.value)}
                          className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., 50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Half Day Rate (£)</label>
                        <input
                          type="number"
                          value={formData.halfDayRate}
                          onChange={(e) => updateForm('halfDayRate', e.target.value)}
                          className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., 150"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Full Day Rate (£)</label>
                        <input
                          type="number"
                          value={formData.fullDayRate}
                          onChange={(e) => updateForm('fullDayRate', e.target.value)}
                          className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., 250"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Coverage Area</label>
                    <input
                      type="text"
                      value={formData.coverageArea}
                      onChange={(e) => updateForm('coverageArea', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g., Scottish Highlands, within 50 miles of Edinburgh"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="travelWilling"
                      checked={formData.travelWilling}
                      onChange={(e) => updateForm('travelWilling', e.target.checked)}
                      className="w-5 h-5 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="travelWilling" className="text-sm text-stone-700">I'm willing to travel to clients (may charge extra)</label>
                  </div>
                </div>
              )}

              {/* Step 4: Bio & Photos */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Bio / About You * (min 50 characters)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => updateForm('bio', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Tell anglers about yourself, your background, teaching style, and what makes your lessons special..."
                    />
                    <p className="text-xs text-stone-500 mt-1">{formData.bio.length}/50 characters minimum</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Website (optional)</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateForm('website', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="https://www.yoursite.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Instagram (optional)</label>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => updateForm('instagram', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="@yourhandle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Facebook (optional)</label>
                      <input
                        type="text"
                        value={formData.facebook}
                        onChange={(e) => updateForm('facebook', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="facebook.com/yourpage"
                      />
                    </div>
                  </div>

                  {/* Photo Upload Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">Profile & Action Photos (upload up to 5)</label>
                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="aspect-square bg-stone-100 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 hover:border-amber-400 transition-colors">
                          <Icons.Image />
                          <span className="text-xs text-stone-400 mt-1">{i === 1 ? 'Profile' : 'Add'}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-stone-500 mt-2">Photo upload will be available after account creation</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-stone-50 rounded-xl p-4 mt-6">
                    <h4 className="font-semibold text-stone-800 mb-3">Application Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Name:</span>
                        <span className="font-medium text-stone-800">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Location:</span>
                        <span className="font-medium text-stone-800">{formData.location || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Experience:</span>
                        <span className="font-medium text-stone-800">{formData.yearsExperience || '—'} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Specialties:</span>
                        <span className="font-medium text-stone-800">{formData.specialties.length > 0 ? formData.specialties.slice(0, 2).join(', ') + (formData.specialties.length > 2 ? '...' : '') : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 border border-stone-200 text-stone-700 rounded-lg font-semibold hover:bg-stone-50"
                  >
                    Back
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !canProceed()}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// REVIEWS LIST COMPONENT
// ============================================================================

const ReviewsList = ({ reviews, showAll = false }) => {
  const [expanded, setExpanded] = useState(showAll);
  const displayReviews = expanded ? reviews : reviews.slice(0, 3);

  return (
    <div className="space-y-4">
      {displayReviews.map(review => (
        <div key={review.id} className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-800">{review.author}</span>
                {review.verified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Verified</span>
                )}
              </div>
              <div className="text-sm text-stone-500">{new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <StarRating rating={review.rating} showNumber={false} size="small" />
          </div>
          <h4 className="font-medium text-stone-800 mb-2">{review.title}</h4>
          <p className="text-stone-600 text-sm leading-relaxed">{review.text}</p>
        </div>
      ))}

      {reviews.length > 3 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full py-3 text-teal-600 hover:text-teal-700 font-medium"
        >
          Show all {reviews.length} reviews
        </button>
      )}
    </div>
  );
};

// ============================================================================
// TYPICAL DAY TIMELINE
// ============================================================================

const TypicalDayTimeline = ({ schedule }) => (
  <div className="space-y-0">
    {schedule.map((item, idx) => (
      <div key={idx} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
            {item.time.split(':')[0]}
          </div>
          {idx < schedule.length - 1 && (
            <div className="w-0.5 h-full min-h-[40px] bg-teal-200 my-1" />
          )}
        </div>
        <div className="pb-6">
          <div className="text-sm font-medium text-teal-600">{item.time}</div>
          <div className="text-stone-700">{item.activity}</div>
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// WHAT TO EXPECT SECTION
// ============================================================================

const WhatToExpect = ({ venue }) => {
  const items = [
    { icon: Icons.Clock, label: 'Typical session', value: venue.typicalSessionHours + ' hours' },
    { icon: Icons.Sun, label: 'Best time', value: venue.bestTimeOfDay },
    { icon: Icons.Target, label: 'Avg catch rate', value: venue.averageCatchRate },
    { icon: Icons.TrendingUp, label: 'Blank rate', value: venue.blankRate },
    { icon: Icons.Award, label: 'Record fish', value: venue.recordFish },
    { icon: Icons.Calendar, label: 'Season', value: venue.seasonInfo }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-stone-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-teal-600 mb-2">
            <item.icon />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <div className="text-stone-800 font-semibold">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// NEARBY STAYS MAP (Leaflet)
// ============================================================================

const NearbyStaysMap = ({ venue, stays }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (typeof L === 'undefined') return;

    const map = L.map(mapRef.current).setView([venue.coordinates.lat, venue.coordinates.lng], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    L.marker([venue.coordinates.lat, venue.coordinates.lng])
      .addTo(map)
      .bindPopup('<strong>' + venue.name + '</strong><br/>Fishing venue');

    stays.forEach((stay, idx) => {
      const offset = (idx + 1) * 0.008;
      L.marker([venue.coordinates.lat + offset, venue.coordinates.lng + offset * 1.5])
        .addTo(map)
        .bindPopup('<strong>' + stay.name + '</strong><br/>' + stay.type + ' • ' + stay.distance);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venue, stays]);

  return (
    <div ref={mapRef} className="h-64 md:h-80 rounded-xl overflow-hidden border border-stone-200" />
  );
};

// ============================================================================
// ACCOMMODATION CARD
// ============================================================================

const AccommodationCard = ({ stay }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-semibold text-stone-800">{stay.name}</h4>
        <div className="text-sm text-stone-500">{stay.type} • {stay.distance}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-teal-600">{stay.priceRange}</div>
        <div className="flex items-center gap-1 text-sm">
          <StarRating rating={stay.rating} size="small" showNumber={false} />
          <span className="text-stone-500">({stay.reviewCount})</span>
        </div>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mt-3">
      {stay.amenities.map((amenity, idx) => (
        <span key={idx} className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full">
          {amenity}
        </span>
      ))}
    </div>
  </div>
);

// ============================================================================
// NAVIGATION COMPONENT
// ============================================================================

const Nav = ({ currentPage, onNavigate, onSignIn, onListWater, onBecomeInstructor }) => {
  const auth = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <Icons.Fish />
            </div>
            <span className="text-xl font-bold text-stone-800">TightLines</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => onNavigate('search', { type: 'game' })} className="text-stone-600 hover:text-teal-600 font-medium">
              Game Fishing
            </button>
            <button onClick={() => onNavigate('search', { type: 'coarse' })} className="text-stone-600 hover:text-teal-600 font-medium">
              Coarse Fishing
            </button>
            <button onClick={() => onNavigate('search', { type: 'sea' })} className="text-stone-600 hover:text-teal-600 font-medium">
              Sea Fishing
            </button>
            <button onClick={() => onNavigate('instructors')} className="text-stone-600 hover:text-teal-600 font-medium">
              Guides & Instructors
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {auth.user ? (
              /* Logged in state */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100"
                >
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {auth.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-stone-700">{auth.user.name.split(' ')[0]}</span>
                  <Icons.ChevronDown />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <div className="font-medium text-stone-800">{auth.user.name}</div>
                      <div className="text-sm text-stone-500">{auth.user.email}</div>
                      <div className="text-xs text-teal-600 capitalize mt-1">{auth.user.role?.replace('_', ' ')}</div>
                    </div>

                    {/* Role-based dashboard links */}
                    {auth.user.role === 'admin' && (
                      <button
                        onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 text-purple-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Console
                      </button>
                    )}
                    {auth.user.role === 'water_owner' && (
                      <button
                        onClick={() => { onNavigate('owner-dashboard'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        My Waters Dashboard
                      </button>
                    )}
                    {auth.user.role === 'instructor' && (
                      <button
                        onClick={() => { onNavigate('instructor-dashboard'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Instructor Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => { onNavigate('profile'); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </button>
                    <button
                      onClick={() => { onNavigate('favourites'); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      My Favourites
                    </button>
                    <div className="border-t border-stone-100 mt-2 pt-2">
                      <button
                        onClick={() => { auth.logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-50 text-red-600 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged out state */
              <button onClick={onSignIn} className="text-stone-600 hover:text-teal-600 font-medium">
                Sign In
              </button>
            )}
            <button onClick={onBecomeInstructor} className="border-2 border-amber-500 text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 font-medium">
              Become an Instructor
            </button>
            <button onClick={onListWater} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
              List Your Water
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            <Icons.Menu />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <div className="flex flex-col gap-4">
              <button onClick={() => { onNavigate('search', { type: 'game' }); setMobileMenuOpen(false); }} className="text-left text-stone-600">Game Fishing</button>
              <button onClick={() => { onNavigate('search', { type: 'coarse' }); setMobileMenuOpen(false); }} className="text-left text-stone-600">Coarse Fishing</button>
              <button onClick={() => { onNavigate('search', { type: 'sea' }); setMobileMenuOpen(false); }} className="text-left text-stone-600">Sea Fishing</button>
              <button onClick={() => { onNavigate('instructors'); setMobileMenuOpen(false); }} className="text-left text-stone-600">Guides & Instructors</button>
              <hr className="border-stone-200" />
              {auth.user ? (
                <>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {auth.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-stone-700">{auth.user.name}</span>
                  </div>
                  <button onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }} className="text-left text-stone-600">My Profile</button>
                  <button onClick={() => { onNavigate('favourites'); setMobileMenuOpen(false); }} className="text-left text-stone-600">My Favourites</button>
                  <button onClick={() => { auth.logout(); setMobileMenuOpen(false); }} className="text-left text-red-600">Sign Out</button>
                </>
              ) : (
                <button onClick={() => { onSignIn(); setMobileMenuOpen(false); }} className="text-left text-stone-600">Sign In</button>
              )}
              <button onClick={() => { onBecomeInstructor(); setMobileMenuOpen(false); }} className="border-2 border-amber-500 text-amber-600 px-4 py-2 rounded-lg text-center">Become an Instructor</button>
              <button onClick={() => { onListWater(); setMobileMenuOpen(false); }} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-center">List Your Water</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================================================
// FISHERY CARD COMPONENT
// ============================================================================

const FisheryCard = ({ fishery, onClick, onSignInRequired }) => {
  const auth = useAuth();
  const isFavourited = auth.isWaterFavourited(fishery.id);
  const hasOptions = fishery.bookingOptions && fishery.bookingOptions.length > 0;
  const optionCount = hasOptions ? fishery.bookingOptions.length : 0;

  const getLowestPrice = () => {
    if (!hasOptions) return fishery.price;
    const prices = fishery.bookingOptions.map(o => parseInt(o.price)).filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.min(...prices) : fishery.price;
  };

  const getPriceType = () => {
    if (!hasOptions) return 'day';
    const lowest = getLowestPrice();
    const cheapest = fishery.bookingOptions.find(o => parseInt(o.price) === lowest);
    return cheapest?.priceType || 'day';
  };

  const handleFavourite = async () => {
    if (!auth.user) { onSignInRequired?.(); return; }
    await auth.toggleFavouriteWater(fishery.id);
  };

  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group">
      <div className={`h-48 bg-gradient-to-br ${fishery.gallery?.[0]?.gradient || 'from-teal-600 to-emerald-700'} flex items-center justify-center relative`}>
        <span className="text-white/50 text-sm">Photo</span>
        {/* Favourite button */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          <FavouriteButton isFavourited={isFavourited} onToggle={handleFavourite} size="small" />
        </div>
        {/* Options count badge */}
        {optionCount > 1 && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 text-stone-700 text-xs px-2 py-1 rounded-full font-medium">{optionCount} options</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-stone-800">{fishery.name}</h3>
          <div className="flex items-center gap-1">
            <StarRating rating={fishery.rating} size="small" />
            <span className="text-sm text-stone-500">({fishery.reviewCount})</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-stone-500 text-sm mb-3">
          <Icons.MapPin />
          <span>{regions.find(r => r.id === fishery.region)?.name}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {fishery.species.slice(0, 3).map(species => (
            <span key={species} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full">
              {species}
            </span>
          ))}
        </div>
        {/* Booking options preview */}
        {optionCount > 1 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {fishery.bookingOptions.slice(0, 3).map((opt, i) => (
              <span key={i} className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded-full">{opt.name}</span>
            ))}
            {optionCount > 3 && <span className="bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded-full">+{optionCount - 3} more</span>}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            {fishery.price === 0 && !hasOptions ? (
              <span className="text-green-600 font-semibold">Free Fishing</span>
            ) : (
              <span className="text-stone-800 font-semibold">{hasOptions ? 'From ' : ''}£{getLowestPrice()}/{getPriceType()}</span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            fishery.bookingType === 'instant' ? 'bg-green-100 text-green-700' :
            fishery.bookingType === 'enquiry' ? 'bg-amber-100 text-amber-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {fishery.bookingType === 'instant' ? 'Instant Book' :
             fishery.bookingType === 'enquiry' ? 'Enquiry' : 'Free Access'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// INSTRUCTOR CARD COMPONENT
// ============================================================================

const InstructorCard = ({ instructor, onClick, onSignInRequired }) => {
  const auth = useAuth();
  const isFavourited = auth.isInstructorFavourited(instructor.id);

  const handleFavourite = async () => {
    if (!auth.user) { onSignInRequired?.(); return; }
    await auth.toggleFavouriteInstructor(instructor.id);
  };

  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group">
      <div className={`h-40 bg-gradient-to-br ${instructor.gallery?.[0]?.gradient || 'from-blue-600 to-indigo-700'} flex items-center justify-center relative`}>
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white">
          <Icons.Users />
        </div>
        {/* Favourite button - always visible */}
        <div className="absolute top-3 right-3">
          <FavouriteButton isFavourited={isFavourited} onToggle={handleFavourite} size="small" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-stone-800 mb-1">{instructor.name}</h3>
        <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
          <Icons.MapPin />
          <span>{instructor.location}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={instructor.rating} size="small" />
          <span className="text-sm text-stone-500">({instructor.reviewCount})</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {instructor.specialties.slice(0, 3).map(spec => (
            <span key={spec} className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full">
              {spec}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-800 font-semibold">From £{instructor.price}/day</span>
          <span className="text-teal-600 text-sm font-medium">{instructor.experience} exp.</span>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// FEATURED FISHERY CARD (for What's Fishing Well section)
// ============================================================================

const FeaturedFisheryCard = ({ fishery, onClick, onSignInRequired, catchCount, hotSpecies, conditions }) => {
  const auth = useAuth();
  const isFavourited = auth.isWaterFavourited(fishery.id);

  const handleFavourite = async () => {
    if (!auth.user) { onSignInRequired?.(); return; }
    await auth.toggleFavouriteWater(fishery.id);
  };

  const conditionColor = conditions === 'Excellent' ? 'bg-green-100 text-green-700' : conditions === 'Very Good' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700';

  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className={`h-40 bg-gradient-to-br ${fishery.gallery?.[0]?.gradient || 'from-teal-600 to-emerald-700'} flex items-center justify-center relative`}>
        <span className="text-white/50 text-sm">Photo</span>
        {/* Fishing status badge */}
        <div className={`absolute top-3 left-3 ${conditionColor} px-3 py-1 rounded-full text-xs font-semibold`}>
          {conditions}
        </div>
        {/* Favourite button */}
        <div className="absolute top-3 right-3">
          <FavouriteButton isFavourited={isFavourited} onToggle={handleFavourite} size="small" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-stone-800 group-hover:text-teal-600 transition-colors">{fishery.name}</h3>
        <div className="flex items-center gap-2 text-stone-500 text-sm mt-1 mb-3">
          <Icons.MapPin />
          <span>{regions.find(r => r.id === fishery.region)?.name}</span>
        </div>

        {/* Catch info banner */}
        <div className="bg-teal-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎣</span>
              <div>
                <div className="text-sm font-semibold text-teal-800">{catchCount} catches this week</div>
                <div className="text-xs text-teal-600">{hotSpecies} fishing well</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {fishery.price === 0 ? (
              <span className="text-green-600 font-semibold">Free</span>
            ) : (
              <span className="text-stone-800 font-semibold">From £{fishery.price}/day</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Icons.Star filled />
            <span className="text-stone-700 font-medium">{fishery.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HOME PAGE
// ============================================================================

const HomePage = ({ onNavigate, onSignInRequired }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchRadius, setSearchRadius] = useState(15);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const matches = [
        ...fisheries.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).map(f => ({ type: 'fishery', item: f })),
        ...regions.filter(r => r.name.toLowerCase().includes(query.toLowerCase())).map(r => ({ type: 'region', item: r })),
        ...ukLocations.filter(l => l.name.toLowerCase().includes(query.toLowerCase())).map(l => ({ type: 'location', item: l }))
      ].slice(0, 6);
      setSearchSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="bg-gradient-to-br from-teal-700 to-emerald-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Find & Book the Best Fishing in the UK
          </h1>
          <p className="text-lg md:text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            From legendary salmon beats to specimen carp lakes. Search, compare, and book — all in one place.
          </p>

          {/* Streamlined Search */}
          <div className="max-w-3xl mx-auto relative">
            <div className="bg-white rounded-2xl p-3 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search waters, regions, or locations..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-5 py-3.5 text-stone-800 focus:outline-none rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <select
                  value={searchType}
                  className="px-4 py-3.5 border border-stone-200 rounded-xl text-stone-600 bg-white focus:ring-2 focus:ring-teal-500 md:w-44"
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="game">Game</option>
                  <option value="coarse">Coarse</option>
                  <option value="sea">Sea</option>
                </select>
                <button
                  onClick={() => {
                    const params = { query: searchQuery, ...(searchType && { type: searchType }) };
                    if (selectedLocation?.type === 'region') {
                      params.region = selectedLocation.id;
                    } else if (selectedLocation?.type === 'location') {
                      params.location = selectedLocation.item;
                      params.radius = searchRadius;
                    }
                    onNavigate('search', params);
                  }}
                  className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition"
                >
                  <Icons.Search />
                  <span>Search</span>
                </button>
              </div>
              {/* Radius selector — shows when a location or region is selected */}
              {selectedLocation && (
                <div className="flex items-center justify-center gap-3 mt-3 text-stone-600">
                  <span className="text-sm">Search within</span>
                  <select value={searchRadius} onChange={(e) => setSearchRadius(Number(e.target.value))} className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500">
                    <option value={5}>5 miles</option>
                    <option value={10}>10 miles</option>
                    <option value={15}>15 miles</option>
                    <option value={25}>25 miles</option>
                    <option value={50}>50 miles</option>
                    <option value={100}>100 miles</option>
                  </select>
                  <button onClick={() => { setSelectedLocation(null); setSearchQuery(''); setSearchRadius(15); }} className="text-xs text-stone-400 hover:text-stone-600 underline">Clear</button>
                </div>
              )}
            </div>

            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-xl mt-2 overflow-hidden z-10">
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (suggestion.type === 'fishery') {
                        onNavigate('venue', { id: suggestion.item.id });
                      } else if (suggestion.type === 'region') {
                        setSearchQuery(suggestion.item.name);
                        setSelectedLocation({ type: 'region', id: suggestion.item.id });
                        setShowSuggestions(false);
                      } else {
                        setSearchQuery(suggestion.item.name);
                        setSelectedLocation({ type: 'location', item: suggestion.item });
                        setShowSuggestions(false);
                      }
                    }}
                    className="w-full px-6 py-3 text-left hover:bg-stone-50 flex items-center gap-3 text-stone-800"
                  >
                    {suggestion.type === 'fishery' && <Icons.Fish />}
                    {suggestion.type === 'region' && <Icons.MapPin />}
                    {suggestion.type === 'location' && <Icons.Crosshair />}
                    <span>{suggestion.item.name}</span>
                    <span className="text-xs text-stone-400 ml-auto capitalize">{suggestion.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Two key stats */}
          <div className="flex justify-center gap-12 mt-10 text-center">
            <div>
              <span className="text-3xl font-bold">500+</span>
              <p className="text-teal-200 text-sm">Waters to Explore</p>
            </div>
            <div>
              <span className="text-3xl font-bold">12,000+</span>
              <p className="text-teal-200 text-sm">Bookings Made</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED WATERS ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800">Featured Waters</h2>
              <p className="text-stone-500 mt-1">Hand-picked fisheries offering exceptional sport</p>
            </div>
            <button onClick={() => onNavigate('search')} className="hidden md:flex text-teal-600 hover:text-teal-700 font-medium items-center gap-1">
              Browse all waters <Icons.ChevronRight />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fisheries.slice(0, 6).map((fishery, idx) => {
              const catchCount = 8 + (fishery.id * 3) % 20;
              const hotSpecies = fishery.species[0];
              const conditions = ['Excellent', 'Good', 'Very Good'][idx % 3];

              return (
                <FeaturedFisheryCard
                  key={fishery.id}
                  fishery={fishery}
                  onClick={() => onNavigate('venue', { id: fishery.id })}
                  onSignInRequired={onSignInRequired}
                  catchCount={catchCount}
                  hotSpecies={hotSpecies}
                  conditions={conditions}
                />
              );
            })}
          </div>

          <div className="text-center mt-8 md:hidden">
            <button onClick={() => onNavigate('search')} className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
              Browse all waters <Icons.ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-800 mb-12">How TightLines Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Search', desc: 'Browse 500+ waters across the UK. Filter by species, region, price, or fishing type.' },
              { step: '2', title: 'Book', desc: 'Book day tickets instantly or send enquiries for premium beats. Transparent pricing, no hidden fees.' },
              { step: '3', title: 'Fish', desc: 'Get your confirmation, check rules and facilities, and enjoy your day on the water.' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg text-stone-800 mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED GUIDES ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800">Fishing Guides & Instructors</h2>
              <p className="text-stone-500 mt-1">Learn from the UK's best</p>
            </div>
            <button onClick={() => onNavigate('instructors')} className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              View all <Icons.ChevronRight />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructors.slice(0, 4).map(instructor => (
              <InstructorCard key={instructor.id} instructor={instructor} onClick={() => onNavigate('instructor', { id: instructor.id })} onSignInRequired={onSignInRequired} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-800 mb-10">What Anglers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "Found an incredible salmon beat on the Wye I'd never have discovered otherwise. Booking was seamless.", name: "James T.", location: "Herefordshire", rating: 5 },
              { text: "The filtering makes it so easy to find exactly what you want. Booked a carp lake for the weekend in minutes.", name: "Sarah M.", location: "Norfolk", rating: 5 },
              { text: "Brilliant platform. The instructor I found through TightLines completely transformed my fly casting technique.", name: "David R.", location: "Hampshire", rating: 5 }
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-stone-600 mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-medium text-stone-800">{t.name}</p>
                  <p className="text-stone-400 text-sm">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// SEARCH RESULTS PAGE
// ============================================================================

const SearchResultsPage = ({ onNavigate, params, onSignInRequired }) => {
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Pre-populate species filter if passed from homepage
  const initialSpecies = params?.species ? [params.species] : [];

  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    species: initialSpecies,
    experience: '',
    facilities: [],
    weekendOnly: false,
    location: params?.location || null,
    radius: 15
  });

  const filteredFisheries = useMemo(() => {
    return fisheries.filter(f => {
      if (params?.type && f.type !== params.type) return false;
      if (params?.region && f.region !== params.region) return false;
      if (f.price < filters.priceRange[0] || f.price > filters.priceRange[1]) return false;
      if (filters.species.length > 0 && !filters.species.some(s => f.species.includes(s))) return false;
      if (filters.experience && f.experienceLevel !== filters.experience) return false;
      if (filters.facilities.length > 0 && !filters.facilities.every(fac => f.facilities.includes(fac))) return false;
      return true;
    });
  }, [params, filters]);

  const getTitle = () => {
    if (params?.species) return params.species + ' Fishing';
    if (params?.type) return fishTypes.find(t => t.id === params.type)?.name || 'Fishing';
    if (params?.region) return regions.find(r => r.id === params.region)?.name || 'All Waters';
    return 'All Waters';
  };

  // Unique descriptions for each fishing type
  const getDescription = () => {
    if (params?.species) {
      return `Discover the best waters for ${params.species} fishing across the UK. From peaceful lakes to rushing rivers, find your perfect spot.`;
    }
    if (params?.type === 'game') {
      return "Experience the thrill of game fishing across the UK's finest salmon rivers, chalk streams, and wild trout lochs. From the legendary River Tweed to Hampshire's crystal-clear chalk streams, discover world-class fly fishing.";
    }
    if (params?.type === 'coarse') {
      return "Explore the UK's best coarse fisheries, from specimen carp lakes to tranquil canal stretches. Whether you're after a personal best or a relaxing day by the water, find the perfect venue for your style.";
    }
    if (params?.type === 'sea') {
      return "Cast into the UK's productive coastal waters, from dramatic rock marks to sandy beaches and charter boat adventures. Target bass, cod, mackerel and more around Britain's stunning coastline.";
    }
    if (params?.region) {
      const regionName = regions.find(r => r.id === params.region)?.name;
      return `Browse fishing waters in ${regionName}. From hidden gems to well-known hotspots, find your next fishing adventure.`;
    }
    return "Search and filter through hundreds of fishing waters across the UK to find your perfect day out.";
  };

  return (
    <div>
      {/* Compact header */}
      <div className="bg-white border-b border-stone-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('home')} className="text-stone-400 hover:text-stone-600 transition">
              <Icons.ChevronLeft />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-stone-800">{getTitle()}</h1>
              <p className="text-stone-500 text-sm">{filteredFisheries.length} waters found</p>
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-sm">
              <Icons.Filter />
              <span>{filtersOpen ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

      <div className="flex gap-8">
        <div className={`hidden lg:block w-72 flex-shrink-0 transition-all ${filtersOpen ? '' : 'w-0 overflow-hidden'}`}>
          <AdvancedFilters filters={filters} onFilterChange={setFilters} isOpen={filtersOpen} onToggle={() => setFiltersOpen(!filtersOpen)} />
        </div>

        <div className="flex-1">
          {filteredFisheries.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFisheries.map(fishery => (
                <FisheryCard key={fishery.id} fishery={fishery} onClick={() => onNavigate('venue', { id: fishery.id })} onSignInRequired={onSignInRequired} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-teal-600 mb-4"><Icons.Fish /></div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">No waters found</h3>
              <p className="text-stone-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      <AdvancedFilters filters={filters} onFilterChange={setFilters} isOpen={false} onToggle={() => {}} />
      </div>
    </div>
  );
};

// ============================================================================
// VENUE DETAIL PAGE
// ============================================================================

// ============================================================================
// BOOKING CARD COMPONENT - Multi-option booking sidebar
// ============================================================================
const categoryLabels = { 'day-tickets': 'Day Tickets & Passes', 'guided': 'Guided Experiences', 'accommodation': 'Accommodation', 'extras': 'Extras & Add-ons' };
const categoryColors = {
  'day-tickets': { active: 'bg-teal-100 border-teal-500', text: 'text-teal-700' },
  'guided': { active: 'bg-amber-100 border-amber-500', text: 'text-amber-700' },
  'accommodation': { active: 'bg-purple-100 border-purple-500', text: 'text-purple-700' },
  'extras': { active: 'bg-blue-100 border-blue-500', text: 'text-blue-700' }
};

const BookingCard = ({ venue, selectedDate, onDateSelect, selectedEndDate, onEndDateSelect, getNumberOfDays, onBook }) => {
  const hasOptions = venue.bookingOptions && venue.bookingOptions.length > 0;
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const activeOption = hasOptions
    ? venue.bookingOptions.find(o => o.id === selectedOptionId) || venue.bookingOptions[0]
    : null;

  const groupedOptions = hasOptions
    ? venue.bookingOptions.reduce((acc, opt) => {
        const cat = opt.category || 'day-tickets';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(opt);
        return acc;
      }, {})
    : {};

  const getLowestPrice = () => {
    if (!hasOptions) return venue.price;
    const prices = venue.bookingOptions.map(o => parseInt(o.price)).filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.min(...prices) : venue.price;
  };

  if (venue.bookingType === 'free' && !hasOptions) {
    return (
      <div className="sticky top-24 bg-white rounded-xl border border-stone-200 p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎣</div>
          <h4 className="text-lg font-semibold text-green-600 mb-2">Free Access</h4>
          <p className="text-stone-500 text-sm">No booking required!</p>
        </div>
      </div>
    );
  }

  if (!hasOptions) {
    // Legacy single booking type
    return (
      <div className="sticky top-24 bg-white rounded-xl border border-stone-200 p-6">
        <h3 className="text-xl font-semibold text-stone-800 mb-4">Book Your Session</h3>
        <p className="text-xs text-stone-500 mb-2">Click a start date, then an end date for multi-day bookings</p>
        <SimpleDatePicker selectedDate={selectedDate} onDateSelect={onDateSelect} selectedEndDate={selectedEndDate} onEndDateSelect={onEndDateSelect} availability={venue.availability || {}} multiDay={true} />
        {selectedDate && (
          <div className="mt-4 p-4 bg-teal-50 rounded-xl space-y-2">
            <div className="flex justify-between"><span className="text-stone-600">From:</span><span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
            {selectedEndDate && <div className="flex justify-between"><span className="text-stone-600">To:</span><span className="font-semibold">{new Date(selectedEndDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>}
            <div className="flex justify-between"><span className="text-stone-600">Days:</span><span className="font-semibold">{getNumberOfDays()}</span></div>
            {venue.price > 0 && <div className="flex justify-between border-t border-teal-200 pt-2 mt-2"><span className="text-stone-700 font-medium">Total:</span><span className="font-bold text-teal-700">£{venue.price * getNumberOfDays()}</span></div>}
          </div>
        )}
        <button onClick={onBook} disabled={!selectedDate && venue.bookingType === 'instant'} className={`w-full mt-4 py-3 rounded-xl font-semibold ${venue.bookingType === 'instant' ? 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-stone-300' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
          {venue.bookingType === 'instant' ? 'Book Now' : 'Send Enquiry'}
        </button>
      </div>
    );
  }

  // Multi-option booking card
  return (
    <div className="sticky top-24 bg-white rounded-xl border border-stone-200 p-6 space-y-4">
      {/* Header price */}
      <div className="text-center">
        <span className="text-sm text-stone-500">From</span>
        <span className="text-3xl font-bold text-stone-800 ml-2">£{getLowestPrice()}</span>
        <span className="text-stone-500 ml-1">/{venue.bookingOptions.find(o => parseInt(o.price) === getLowestPrice())?.priceType || 'day'}</span>
      </div>

      {/* Option tiles by category */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-stone-700">Choose an option:</p>
        {Object.entries(groupedOptions).map(([catId, options]) => {
          const colors = categoryColors[catId] || categoryColors['day-tickets'];
          return (
            <div key={catId}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${colors.text}`}>{categoryLabels[catId] || catId}</p>
              <div className="space-y-2">
                {options.map(opt => {
                  const isSelected = selectedOptionId === opt.id || (!selectedOptionId && venue.bookingOptions[0]?.id === opt.id);
                  return (
                    <button key={opt.id} onClick={() => setSelectedOptionId(opt.id)} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${isSelected ? `${colors.active} shadow-sm` : 'bg-white border-stone-200 hover:border-stone-300'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-800 text-sm">{opt.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${opt.bookingType === 'instant' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {opt.bookingType === 'instant' ? 'Book' : 'Enquire'}
                            </span>
                          </div>
                          {opt.description && <p className="text-xs text-stone-500 mt-0.5 truncate">{opt.description}</p>}
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <span className="font-bold text-stone-800">£{opt.price}</span>
                          <span className="text-stone-500 text-xs ml-0.5">/{opt.priceType}</span>
                        </div>
                      </div>
                      {isSelected && <div className="mt-1 flex items-center gap-1"><Icons.Check /><span className="text-xs text-teal-600 font-medium">Selected</span></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking action based on selected option */}
      {activeOption && activeOption.bookingType === 'instant' && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-stone-500">Select a date for {activeOption.name}</p>
          <SimpleDatePicker selectedDate={selectedDate} onDateSelect={onDateSelect} selectedEndDate={selectedEndDate} onEndDateSelect={onEndDateSelect} availability={venue.availability || {}} multiDay={true} />
          {selectedDate && (
            <div className="p-3 bg-teal-50 rounded-xl space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-stone-600">Date:</span><span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
              {getNumberOfDays() > 1 && <div className="flex justify-between"><span className="text-stone-600">Days:</span><span className="font-semibold">{getNumberOfDays()}</span></div>}
              <div className="flex justify-between border-t border-teal-200 pt-1 mt-1"><span className="text-stone-700 font-medium">Total:</span><span className="font-bold text-teal-700">£{activeOption.price * getNumberOfDays()}</span></div>
            </div>
          )}
          <button onClick={onBook} disabled={!selectedDate} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:bg-stone-300">
            Book {activeOption.name}
          </button>
        </div>
      )}

      {activeOption && activeOption.bookingType === 'enquiry' && (
        <div className="space-y-3 pt-2">
          <p className="text-sm text-stone-600 text-center">Send an enquiry to check availability for {activeOption.name}.</p>
          <SimpleDatePicker selectedDate={selectedDate} onDateSelect={onDateSelect} selectedEndDate={selectedEndDate} onEndDateSelect={onEndDateSelect} availability={venue.availability || {}} multiDay={true} />
          <button onClick={onBook} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600">
            Enquire About {activeOption.name}
          </button>
        </div>
      )}
    </div>
  );
};

const VenueDetailPage = ({ onNavigate, params, onSignInRequired }) => {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [showCatchReport, setShowCatchReport] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  const getNumberOfDays = () => {
    if (!selectedDate) return 0;
    if (!selectedEndDate) return 1;
    const start = new Date(selectedDate);
    const end = new Date(selectedEndDate);
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleBooking = async (venue) => {
    if (!selectedDate && venue.bookingType === 'instant') return;

    // If logged in, pre-fill from user
    if (auth.user && !bookingForm.name) {
      setBookingForm(prev => ({ ...prev, name: auth.user.name || '', email: auth.user.email || '' }));
    }
    setShowBookingModal(true);
  };

  const submitBooking = async (venue) => {
    if (!bookingForm.name || !bookingForm.email) {
      setBookingError('Please enter your name and email.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const endpoint = venue.bookingType === 'instant' ? '/bookings' : '/contact';
      const numDays = getNumberOfDays();
      await api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          waterId: venue.id,
          date: selectedDate,
          startDate: selectedDate,
          endDate: selectedEndDate || selectedDate,
          numberOfDays: numDays,
          anglerName: bookingForm.name,
          anglerEmail: bookingForm.email,
          anglerPhone: bookingForm.phone,
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone,
          message: bookingForm.message || `Booking request for ${venue.name} — ${numDays} day${numDays > 1 ? 's' : ''} from ${selectedDate}${selectedEndDate ? ' to ' + selectedEndDate : ''}`,
          type: venue.bookingType === 'instant' ? 'booking' : 'enquiry'
        })
      });
      setBookingSuccess(true);
      setTimeout(() => { setShowBookingModal(false); setBookingSuccess(false); }, 3000);
    } catch (err) {
      setBookingError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const venue = fisheries.find(f => f.id === params?.id);

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Venue not found</h2>
        <button onClick={() => onNavigate('search')} className="text-teal-600">Back to search</button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'catches', label: 'Catches' },
    { id: 'species', label: 'Species' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'rules', label: 'Rules' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'stays', label: 'Stays' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-teal-600">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('search', { type: venue.type })} className="hover:text-teal-600 capitalize">{venue.type} Fishing</button>
        <span>/</span>
        <span className="text-stone-800">{venue.name}</span>
      </div>

      <PhotoCarousel images={venue.gallery || []} title={venue.name} />

      <div className="mt-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">{venue.name}</h1>
            <div className="flex items-center gap-4 text-stone-500">
              <div className="flex items-center gap-1"><Icons.MapPin /><span>{regions.find(r => r.id === venue.region)?.name}</span></div>
              <div className="flex items-center gap-1"><StarRating rating={venue.rating} /><span>({venue.reviewCount})</span></div>
            </div>
          </div>
          <div className="text-right">
            {venue.price === 0 ? (
              <div className="text-2xl font-bold text-green-600">Free Fishing</div>
            ) : (
              <div><div className="text-2xl font-bold text-stone-800">£{venue.price}</div><div className="text-stone-500">per day</div></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-stone-200 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-teal-600 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div>
                <p className="text-stone-600 leading-relaxed mb-6">{venue.description}</p>
                <h3 className="text-xl font-semibold text-stone-800 mb-4">What to Expect</h3>
                <WhatToExpect venue={venue} />
              </div>
            )}
            {activeTab === 'catches' && (
              <RecentCatches venue={venue} onReportCatch={() => setShowCatchReport(true)} />
            )}
            {activeTab === 'species' && (
              <div>
                <h3 className="text-xl font-semibold text-stone-800 mb-4">Target Species</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                  {venue.species.map(s => <span key={s} className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-medium">{s}</span>)}
                </div>
                <div className="bg-amber-50 rounded-xl p-6">
                  <h4 className="font-semibold text-amber-800 mb-2">Venue Record</h4>
                  <p className="text-amber-700 text-lg">{venue.recordFish}</p>
                </div>
              </div>
            )}
            {activeTab === 'facilities' && (
              <div className="grid md:grid-cols-2 gap-4">
                {facilitiesList.map(f => {
                  const has = venue.facilities.includes(f.id);
                  return (
                    <div key={f.id} className={`flex items-center gap-3 p-4 rounded-xl ${has ? 'bg-green-50 text-green-700' : 'bg-stone-50 text-stone-400'}`}>
                      {Icons[f.icon] ? React.createElement(Icons[f.icon]) : <Icons.Check />}
                      <span className={has ? 'font-medium' : ''}>{f.name}</span>
                      {has && <Icons.Check />}
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === 'rules' && (
              <ul className="space-y-3">
                {venue.rules.map((r, i) => <li key={i} className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl"><span className="text-amber-500">•</span><span className="text-stone-700">{r}</span></li>)}
              </ul>
            )}
            {activeTab === 'reviews' && <ReviewsList reviews={venue.reviewsList || []} />}
            {activeTab === 'stays' && (
              <div>
                {venue.coordinates && venue.nearbyStays && <NearbyStaysMap venue={venue} stays={venue.nearbyStays} />}
                <div className="space-y-4 mt-6">{(venue.nearbyStays || []).map(s => <AccommodationCard key={s.id} stay={s} />)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          {/* Weather & Conditions Widget */}
          <WeatherConditionsWidget venue={venue} />

          {/* Booking Card */}
          <BookingCard venue={venue} selectedDate={selectedDate} onDateSelect={setSelectedDate} selectedEndDate={selectedEndDate} onEndDateSelect={setSelectedEndDate} getNumberOfDays={getNumberOfDays} onBook={() => handleBooking(venue)} />
        </div>
      </div>

      {/* Booking/Enquiry Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-6 text-white">
              <h2 className="text-xl font-bold">{venue.bookingType === 'instant' ? 'Confirm Booking' : 'Send Enquiry'}</h2>
              <p className="text-teal-100 text-sm mt-1">{venue.name}{selectedDate ? ` — ${getNumberOfDays()} day${getNumberOfDays() > 1 ? 's' : ''} from ${new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}${selectedEndDate ? ' to ' + new Date(selectedEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}` : ''}</p>
            </div>
            <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white"><Icons.X /></button>

            {bookingSuccess ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-stone-800 mb-2">{venue.bookingType === 'instant' ? 'Booking Confirmed!' : 'Enquiry Sent!'}</h3>
                <p className="text-stone-500">We've sent a confirmation to {bookingForm.email}</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); submitBooking(venue); }} className="p-6 space-y-4">
                {bookingError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{bookingError}</div>}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Your Name *</label>
                  <input type="text" required value={bookingForm.name} onChange={(e) => setBookingForm(prev => ({...prev, name: e.target.value}))} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email *</label>
                  <input type="email" required value={bookingForm.email} onChange={(e) => setBookingForm(prev => ({...prev, email: e.target.value}))} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                  <input type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm(prev => ({...prev, phone: e.target.value}))} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="07xxx" />
                </div>
                {venue.bookingType === 'enquiry' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                    <textarea rows="3" value={bookingForm.message} onChange={(e) => setBookingForm(prev => ({...prev, message: e.target.value}))} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="Any questions or requests..." />
                  </div>
                )}
                {venue.bookingType === 'instant' && selectedDate && (
                  <div className="p-4 bg-teal-50 rounded-xl space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-stone-600">From</span><span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
                    {selectedEndDate && <div className="flex justify-between text-sm"><span className="text-stone-600">To</span><span className="font-medium">{new Date(selectedEndDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-stone-600">Days</span><span className="font-medium">{getNumberOfDays()}</span></div>
                    <div className="flex justify-between text-sm border-t border-teal-200 pt-1 mt-1"><span className="text-stone-600">Total</span><span className="font-bold text-stone-800">£{venue.price * getNumberOfDays()}</span></div>
                  </div>
                )}
                <button type="submit" disabled={bookingLoading} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:bg-stone-300">
                  {bookingLoading ? 'Submitting...' : venue.bookingType === 'instant' ? 'Confirm Booking' : 'Send Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Catch Modal */}
      <ReportCatchModal isOpen={showCatchReport} onClose={() => setShowCatchReport(false)} venue={venue} onSignInRequired={onSignInRequired} />
    </div>
  );
};

// ============================================================================
// INSTRUCTOR DETAIL PAGE
// ============================================================================

const InstructorDetailPage = ({ onNavigate, params }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const getNumberOfDays = () => {
    if (!selectedDate) return 0;
    if (!selectedEndDate) return 1;
    const start = new Date(selectedDate);
    const end = new Date(selectedEndDate);
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const instructor = instructors.find(i => i.id === params?.id);

  if (!instructor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Instructor not found</h2>
        <button onClick={() => onNavigate('instructors')} className="text-teal-600">Back to instructors</button>
      </div>
    );
  }

  const availabilityObj = {};
  (instructor.availability || []).forEach(d => { availabilityObj[d] = { status: 'available', price: instructor.price }; });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-teal-600">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('instructors')} className="hover:text-teal-600">Guides</button>
        <span>/</span>
        <span className="text-stone-800">{instructor.name}</span>
      </div>

      <PhotoCarousel images={instructor.gallery || []} title={instructor.name} />

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">{instructor.name}</h1>
        <div className="flex items-center gap-4 text-stone-500 mb-4">
          <div className="flex items-center gap-1"><Icons.MapPin /><span>{instructor.location}</span></div>
          <div className="flex items-center gap-1"><StarRating rating={instructor.rating} /><span>({instructor.reviewCount})</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {instructor.certifications.map(c => <CertificationBadge key={c} cert={c} />)}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-semibold text-stone-800 mb-4">About</h3>
            <p className="text-stone-600 leading-relaxed">{instructor.bio}</p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="font-medium text-stone-800 mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map(s => <span key={s} className="bg-teal-100 text-teal-700 text-sm px-3 py-1 rounded-full">{s}</span>)}
                </div>
              </div>
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="font-medium text-stone-800 mb-2">Details</h4>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>Languages: {instructor.languages.join(', ')}</li>
                  <li>Max group: {instructor.maxGroupSize}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-semibold text-stone-800 mb-6">A Typical Day</h3>
            <TypicalDayTimeline schedule={instructor.typicalDay || []} />
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-xl font-semibold text-stone-800 mb-6">Reviews</h3>
            <ReviewsList reviews={instructor.reviewsList || []} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {instructor.hasCalendar && (
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Book a Session</h3>
                <p className="text-xs text-stone-500 mb-2">Click a start date, then an end date for multi-day sessions</p>
                <SimpleDatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate} selectedEndDate={selectedEndDate} onEndDateSelect={setSelectedEndDate} availability={availabilityObj} multiDay={true} />
                {selectedDate && (
                  <div className="mt-4 p-4 bg-teal-50 rounded-xl space-y-2">
                    <div className="flex justify-between"><span>From:</span><span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
                    {selectedEndDate && (
                      <div className="flex justify-between"><span>To:</span><span className="font-semibold">{new Date(selectedEndDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
                    )}
                    <div className="flex justify-between"><span>Days:</span><span className="font-semibold">{getNumberOfDays()}</span></div>
                    <div className="flex justify-between border-t border-teal-200 pt-2 mt-2"><span className="font-medium">Total:</span><span className="font-bold text-teal-700">£{instructor.price * getNumberOfDays()}</span></div>
                  </div>
                )}
                <button
                  disabled={!selectedDate}
                  onClick={async () => {
                    if (!selectedDate) return;
                    const name = prompt('Your name:');
                    const email = prompt('Your email:');
                    if (!name || !email) return;
                    const numDays = getNumberOfDays();
                    try {
                      await api.request('/bookings', {
                        method: 'POST',
                        body: JSON.stringify({
                          instructorId: instructor.id,
                          date: selectedDate,
                          startDate: selectedDate,
                          endDate: selectedEndDate || selectedDate,
                          numberOfDays: numDays,
                          anglerName: name,
                          anglerEmail: email,
                          name, email,
                          type: 'instructor_booking'
                        })
                      });
                      alert(`Booking confirmed for ${numDays} day${numDays > 1 ? 's' : ''}! Check your email for details.`);
                      setSelectedDate(null);
                      setSelectedEndDate(null);
                    } catch (err) {
                      alert('Booking failed: ' + (err.message || 'Please try again'));
                    }
                  }}
                  className="w-full mt-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:bg-stone-300"
                >Book Now</button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">{instructor.hasCalendar ? 'Or Send a Message' : 'Get in Touch'}</h3>
              {!showContactForm ? (
                <div className="space-y-3">
                  <button onClick={() => setShowContactForm(true)} className="w-full py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 flex items-center justify-center gap-2">
                    <Icons.Mail /> Send Message
                  </button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  try {
                    await api.request('/contact', {
                      method: 'POST',
                      body: JSON.stringify({
                        instructorId: instructor.id,
                        name: formData.get('contactName'),
                        email: formData.get('contactEmail'),
                        message: formData.get('contactMessage'),
                        type: 'instructor_enquiry'
                      })
                    });
                    alert('Message sent! The instructor will be in touch.');
                    setShowContactForm(false);
                  } catch (err) {
                    alert('Failed to send: ' + (err.message || 'Please try again'));
                  }
                }} className="space-y-4">
                  <input name="contactName" type="text" required className="w-full px-4 py-2 border border-stone-200 rounded-lg" placeholder="Your name" />
                  <input name="contactEmail" type="email" required className="w-full px-4 py-2 border border-stone-200 rounded-lg" placeholder="Email" />
                  <textarea name="contactMessage" rows="4" required className="w-full px-4 py-2 border border-stone-200 rounded-lg" placeholder="Message" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 py-2 border border-stone-200 rounded-lg">Cancel</button>
                    <button type="submit" className="flex-1 py-2 bg-teal-600 text-white rounded-lg">Send</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// INSTRUCTORS PAGE (with full filters)
// ============================================================================

const InstructorsPage = ({ onNavigate, onSignInRequired }) => {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    specialties: [],
    targetLevel: '',
    hasCalendar: false,
    weekendOnly: false,
    location: null,
    radius: 15
  });

  const filteredInstructors = useMemo(() => {
    return instructors.filter(i => {
      if (i.price < filters.priceRange[0] || i.price > filters.priceRange[1]) return false;
      if (filters.specialties.length > 0 && !filters.specialties.some(s => i.specialties.includes(s))) return false;
      if (filters.hasCalendar && !i.hasCalendar) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">Fishing Guides & Instructors</h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto">
          Learn from the UK's finest fishing guides. Whether you're a beginner or looking to master advanced techniques.
        </p>
      </div>

      <div className="flex items-center justify-end mb-6">
        <button onClick={() => setFiltersOpen(!filtersOpen)} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50">
          <Icons.Filter />
          <span>{filtersOpen ? 'Hide' : 'Show'} Filters</span>
        </button>
      </div>

      <div className="flex gap-8">
        <div className={`hidden lg:block w-72 flex-shrink-0 transition-all ${filtersOpen ? '' : 'w-0 overflow-hidden'}`}>
          <InstructorFilters filters={filters} onFilterChange={setFilters} isOpen={filtersOpen} />
        </div>

        <div className="flex-1">
          <p className="text-stone-500 mb-6">{filteredInstructors.length} instructors found</p>
          {filteredInstructors.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInstructors.map(instructor => (
                <InstructorCard key={instructor.id} instructor={instructor} onClick={() => onNavigate('instructor', { id: instructor.id })} onSignInRequired={onSignInRequired} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-teal-600 mb-4"><Icons.Users /></div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">No instructors found</h3>
              <p className="text-stone-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      <InstructorFilters filters={filters} onFilterChange={setFilters} isOpen={false} />
    </div>
  );
};

// ============================================================================
// FAVOURITES PAGE
// ============================================================================

const FavouritesPage = ({ onNavigate, onSignInRequired }) => {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('waters');

  // Get favourite waters and instructors
  const favouriteWaters = fisheries.filter(f => auth.favouriteWaters.includes(f.id));
  const favouriteInstructorsList = instructors.filter(i => auth.favouriteInstructors.includes(i.id));

  // Favourites now work without login (localStorage), so always show them
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">My Favourites</h1>
        <p className="text-stone-500">Your saved waters and instructors</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('waters')}
            className={`pb-4 font-medium transition-colors relative ${activeTab === 'waters' ? 'text-teal-600' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Waters ({favouriteWaters.length})
            {activeTab === 'waters' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>}
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`pb-4 font-medium transition-colors relative ${activeTab === 'instructors' ? 'text-teal-600' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Instructors ({favouriteInstructorsList.length})
            {activeTab === 'instructors' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'waters' && (
        <div>
          {favouriteWaters.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favouriteWaters.map(fishery => (
                <FisheryCard key={fishery.id} fishery={fishery} onClick={() => onNavigate('venue', { id: fishery.id })} onSignInRequired={onSignInRequired} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-stone-50 rounded-xl">
              <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                <Icons.Fish />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">No favourite waters yet</h3>
              <p className="text-stone-500 mb-6">Browse waters and click the heart icon to save them here</p>
              <button onClick={() => onNavigate('search')} className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 font-medium">
                Browse Waters
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'instructors' && (
        <div>
          {favouriteInstructorsList.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {favouriteInstructorsList.map(instructor => (
                <InstructorCard key={instructor.id} instructor={instructor} onClick={() => onNavigate('instructor', { id: instructor.id })} onSignInRequired={onSignInRequired} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-stone-50 rounded-xl">
              <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                <Icons.Users />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">No favourite instructors yet</h3>
              <p className="text-stone-500 mb-6">Browse instructors and click the heart icon to save them here</p>
              <button onClick={() => onNavigate('instructors')} className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 font-medium">
                Browse Instructors
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PROFILE PAGE
// ============================================================================

const ProfilePage = ({ onNavigate, onSignInRequired }) => {
  const auth = useAuth();
  const [activeSection, setActiveSection] = useState('overview'); // overview, edit, notifications, privacy
  const [catches, setCatches] = useState([]);
  const [loadingCatches, setLoadingCatches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '', location: '', bio: '', favouriteSpecies: '', experienceLevel: 'beginner'
  });

  // Notification prefs
  const [notifications, setNotifications] = useState({
    bookings: true, catches: true, newsletters: false, promotions: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profilePublic: false, showCatches: true, showFavourites: false
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');

  const favouriteWatersCount = auth.favouriteWaters.length;
  const favouriteInstructorsCount = auth.favouriteInstructors.length;

  // Load user data
  useEffect(() => {
    if (auth.user) {
      setProfileForm({
        name: auth.user.name || '', phone: auth.user.phone || '', location: auth.user.location || '',
        bio: auth.user.bio || '', favouriteSpecies: auth.user.favouriteSpecies || '',
        experienceLevel: auth.user.experienceLevel || 'beginner'
      });
      setNotifications(auth.user.notifications || { bookings: true, catches: true, newsletters: false, promotions: false });
      setPrivacy(auth.user.privacy || { profilePublic: false, showCatches: true, showFavourites: false });

      // Load catches
      setLoadingCatches(true);
      api.request('/catches/user').then(data => {
        setCatches(data.catches || []);
      }).catch(() => {}).finally(() => setLoadingCatches(false));
    }
  }, [auth.user]);

  const saveProfile = async () => {
    setSaving(true); setSaveMsg('');
    try {
      await api.request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileForm) });
      setSaveMsg('Profile saved!');
      // Refresh user data
      const meData = await api.request('/auth/me');
      if (meData.user) auth.setUser(meData.user);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) { setSaveMsg('Error: ' + (err.message || 'Failed to save')); }
    finally { setSaving(false); }
  };

  const saveNotifications = async () => {
    setSaving(true); setSaveMsg('');
    try {
      await api.request('/auth/notifications', { method: 'PUT', body: JSON.stringify(notifications) });
      setSaveMsg('Preferences saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) { setSaveMsg('Error: ' + (err.message || 'Failed to save')); }
    finally { setSaving(false); }
  };

  const savePrivacy = async () => {
    setSaving(true); setSaveMsg('');
    try {
      await api.request('/auth/privacy', { method: 'PUT', body: JSON.stringify(privacy) });
      setSaveMsg('Privacy settings saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) { setSaveMsg('Error: ' + (err.message || 'Failed to save')); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    setPasswordMsg('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordMsg('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { setPasswordMsg('Password must be at least 6 characters'); return; }
    try {
      await api.request('/auth/password', { method: 'PUT', body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }) });
      setPasswordMsg('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) { setPasswordMsg(err.message || 'Failed to change password'); }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await api.request('/auth/account', { method: 'DELETE' });
      auth.logout();
    } catch (err) { alert('Failed to delete account: ' + err.message); }
  };

  if (!auth.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600"><Icons.User /></div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Sign in to view your profile</h2>
        <p className="text-stone-500 mb-6">Access your account, favourites, and catch history</p>
        <button onClick={onSignInRequired} className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 font-medium">Sign In</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">{auth.user.name.charAt(0).toUpperCase()}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-800">{auth.user.name}</h1>
            <p className="text-stone-500">{auth.user.email}</p>
            <p className="text-sm text-stone-400 mt-1">Member since {new Date(auth.user.createdAt).getFullYear()}</p>
          </div>
          <button onClick={auth.logout} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium">Sign Out</button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'edit', label: 'Edit Profile' },
          { id: 'catches', label: 'My Catches' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'privacy', label: 'Privacy & Security' }
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveSection(tab.id); setSaveMsg(''); }}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeSection === tab.id ? 'bg-teal-600 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Save message */}
      {saveMsg && <div className={`mb-4 p-3 rounded-lg text-sm ${saveMsg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{saveMsg}</div>}

      {/* === OVERVIEW === */}
      {activeSection === 'overview' && (
        <div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <button onClick={() => onNavigate('favourites')} className="bg-white rounded-xl border border-stone-200 p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <span className="text-2xl font-bold text-stone-800">{favouriteWatersCount}</span>
              </div>
              <span className="text-stone-600">Favourite Waters</span>
            </button>
            <button onClick={() => onNavigate('favourites')} className="bg-white rounded-xl border border-stone-200 p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><Icons.Users /></div>
                <span className="text-2xl font-bold text-stone-800">{favouriteInstructorsCount}</span>
              </div>
              <span className="text-stone-600">Favourite Instructors</span>
            </button>
            <button onClick={() => setActiveSection('catches')} className="bg-white rounded-xl border border-stone-200 p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600"><Icons.Fish /></div>
                <span className="text-2xl font-bold text-stone-800">{catches.length}</span>
              </div>
              <span className="text-stone-600">Catches Reported</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => onNavigate('search')} className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600"><Icons.Search /></div>
                <div className="text-left"><div className="font-medium text-stone-800">Find Waters</div><div className="text-sm text-stone-500">Discover new fishing spots</div></div>
              </button>
              <button onClick={() => onNavigate('instructors')} className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><Icons.Users /></div>
                <div className="text-left"><div className="font-medium text-stone-800">Find Instructors</div><div className="text-sm text-stone-500">Book a guided session</div></div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Account Settings</h2>
            <div className="space-y-1">
              {[
                { id: 'edit', label: 'Edit Profile', IconComp: Icons.User },
                { id: 'notifications', label: 'Notification Preferences', IconComp: Icons.Mail },
                { id: 'privacy', label: 'Privacy & Security', IconComp: Icons.Lock }
              ].map(item => (
                <button key={item.id} onClick={() => setActiveSection(item.id)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-stone-50">
                  <div className="flex items-center gap-3">
                    <item.IconComp />
                    <span className="text-stone-700">{item.label}</span>
                  </div>
                  <Icons.ChevronRight />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === EDIT PROFILE === */}
      {activeSection === 'edit' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">Edit Profile</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
              <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({...p, name: e.target.value}))}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({...p, phone: e.target.value}))}
                  placeholder="07xxx xxxxxx" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                <input type="text" value={profileForm.location} onChange={e => setProfileForm(p => ({...p, location: e.target.value}))}
                  placeholder="e.g. Hampshire, UK" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
              <textarea rows="3" value={profileForm.bio} onChange={e => setProfileForm(p => ({...p, bio: e.target.value}))}
                placeholder="Tell other anglers about yourself..." className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Favourite Species</label>
                <input type="text" value={profileForm.favouriteSpecies} onChange={e => setProfileForm(p => ({...p, favouriteSpecies: e.target.value}))}
                  placeholder="e.g. Carp, Pike, Trout" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Experience Level</label>
                <select value={profileForm.experienceLevel} onChange={e => setProfileForm(p => ({...p, experienceLevel: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-500">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setActiveSection('overview')} className="px-6 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50">Cancel</button>
              <button onClick={saveProfile} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:bg-stone-300 font-medium">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MY CATCHES === */}
      {activeSection === 'catches' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">My Catches</h2>
          {loadingCatches ? (
            <div className="text-center py-8 text-stone-500">Loading catches...</div>
          ) : catches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600"><Icons.Fish /></div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">No catches yet</h3>
              <p className="text-stone-500 mb-4">Report your first catch from any venue page!</p>
              <button onClick={() => onNavigate('search')} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 font-medium">Browse Waters</button>
            </div>
          ) : (
            <div className="space-y-4">
              {catches.map(c => {
                const venue = fisheries.find(f => f.id === c.waterId);
                return (
                  <div key={c.id} className="flex items-start gap-4 p-4 rounded-xl border border-stone-100 hover:bg-stone-50">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 flex-shrink-0"><Icons.Fish /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-stone-800">{c.species}</h4>
                          <p className="text-sm text-stone-500">{venue?.name || 'Unknown venue'}</p>
                        </div>
                        {c.weight && <span className="bg-teal-100 text-teal-700 text-sm px-3 py-1 rounded-full font-medium whitespace-nowrap">{c.weight}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                        {c.method && <span>Method: {c.method}</span>}
                        <span>{new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {c.comment && <p className="text-sm text-stone-600 mt-2">{c.comment}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === NOTIFICATIONS === */}
      {activeSection === 'notifications' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { key: 'bookings', label: 'Booking Confirmations', desc: 'Get notified when your bookings are confirmed or updated' },
              { key: 'catches', label: 'Catch Reports', desc: 'See when others report catches at your favourite waters' },
              { key: 'newsletters', label: 'Weekly Newsletter', desc: 'Fishing tips, featured waters, and seasonal advice' },
              { key: 'promotions', label: 'Offers & Promotions', desc: 'Special deals and discounts from waters and guides' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-stone-100">
                <div>
                  <div className="font-medium text-stone-800">{item.label}</div>
                  <div className="text-sm text-stone-500">{item.desc}</div>
                </div>
                <button
                  onClick={() => setNotifications(n => ({...n, [item.key]: !n[item.key]}))}
                  className={`w-12 h-7 rounded-full transition-colors relative ${notifications[item.key] ? 'bg-teal-600' : 'bg-stone-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setActiveSection('overview')} className="px-6 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50">Cancel</button>
            <button onClick={saveNotifications} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:bg-stone-300 font-medium">
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* === PRIVACY & SECURITY === */}
      {activeSection === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Privacy Settings</h2>
            <div className="space-y-4">
              {[
                { key: 'profilePublic', label: 'Public Profile', desc: 'Allow other anglers to see your profile' },
                { key: 'showCatches', label: 'Show My Catches', desc: 'Display your catch reports on venue pages' },
                { key: 'showFavourites', label: 'Show Favourites', desc: 'Let others see your favourite waters and guides' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-stone-100">
                  <div>
                    <div className="font-medium text-stone-800">{item.label}</div>
                    <div className="text-sm text-stone-500">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => setPrivacy(p => ({...p, [item.key]: !p[item.key]}))}
                    className={`w-12 h-7 rounded-full transition-colors relative ${privacy[item.key] ? 'bg-teal-600' : 'bg-stone-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${privacy[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={savePrivacy} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:bg-stone-300 font-medium">
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Change Password</h2>
            {passwordMsg && <div className={`mb-4 p-3 rounded-lg text-sm ${passwordMsg.includes('changed') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{passwordMsg}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({...p, currentPassword: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
                  <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({...p, newPassword: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({...p, confirmPassword: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={changePassword} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium">Change Password</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Danger Zone</h2>
            <p className="text-stone-500 text-sm mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button onClick={deleteAccount} className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium">Delete My Account</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

const AdminDashboard = ({ onNavigate }) => {
  const auth = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingWaters, setPendingWaters] = useState([]);
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [allWaters, setAllWaters] = useState([]);
  const [allInstructors, setAllInstructors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, pendingRes, watersRes, instructorsRes, usersRes] = await Promise.all([
        api.request('/admin/stats'),
        api.request('/admin/pending'),
        api.request('/admin/waters'),
        api.request('/admin/instructors'),
        api.request('/admin/users')
      ]);
      setStats(statsRes);
      setPendingWaters(pendingRes.pendingWaters || []);
      setPendingInstructors(pendingRes.pendingInstructors || []);
      setAllWaters([...(watersRes.approved || []), ...(watersRes.pending || [])]);
      setAllInstructors([...(instructorsRes.approved || []), ...(instructorsRes.pending || [])]);
      setAllUsers(usersRes.users || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWater = async (id) => {
    setActionLoading(`water-${id}`);
    try {
      await api.request(`/admin/approve/water/${id}`, { method: 'POST' });
      loadData();
    } catch (e) {
      alert('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectWater = async (id) => {
    if (!confirm('Reject this water listing?')) return;
    setActionLoading(`water-${id}`);
    try {
      await api.request(`/admin/reject/water/${id}`, { method: 'POST' });
      loadData();
    } catch (e) {
      alert('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveInstructor = async (id) => {
    setActionLoading(`instructor-${id}`);
    try {
      await api.request(`/admin/approve/instructor/${id}`, { method: 'POST' });
      loadData();
    } catch (e) {
      alert('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectInstructor = async (id) => {
    if (!confirm('Reject this instructor?')) return;
    setActionLoading(`instructor-${id}`);
    try {
      await api.request(`/admin/reject/instructor/${id}`, { method: 'POST' });
      loadData();
    } catch (e) {
      alert('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteWater = async (id) => {
    if (!confirm('Delete this water? This cannot be undone.')) return;
    try {
      await api.request(`/admin/waters/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const handleDeleteInstructor = async (id) => {
    if (!confirm('Delete this instructor? This cannot be undone.')) return;
    try {
      await api.request(`/admin/instructors/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  if (!auth.user || auth.user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Access Denied</h2>
        <p className="text-stone-500">You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-stone-500 mt-4">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Admin Console</h1>
        <p className="text-stone-500">Manage waters, instructors, and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-teal-600">{stats?.totalWaters || 0}</div>
          <div className="text-stone-500">Waters</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-amber-600">{stats?.totalInstructors || 0}</div>
          <div className="text-stone-500">Instructors</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
          <div className="text-stone-500">Users</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-red-600">{(stats?.pendingWaters || 0) + (stats?.pendingInstructors || 0)}</div>
          <div className="text-stone-500">Pending Approval</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-6">
        <div className="flex gap-6">
          {['overview', 'waters', 'instructors', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-medium capitalize ${activeTab === tab ? 'text-teal-600 border-b-2 border-teal-600' : 'text-stone-500'}`}
            >
              {tab}
              {tab === 'overview' && (pendingWaters.length + pendingInstructors.length) > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingWaters.length + pendingInstructors.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab - Pending Approvals */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Pending Waters */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Pending Water Listings ({pendingWaters.length})</h3>
            {pendingWaters.length === 0 ? (
              <p className="text-stone-500">No pending water listings</p>
            ) : (
              <div className="space-y-4">
                {pendingWaters.map(water => (
                  <div key={water.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-stone-800">{water.name}</h4>
                        <p className="text-sm text-stone-500">{water.type} • {water.region}</p>
                        <p className="text-sm text-stone-600 mt-2">{water.description?.substring(0, 100)}...</p>
                        <p className="text-sm text-stone-400 mt-2">Submitted by: {water.ownerName} ({water.ownerEmail})</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveWater(water.id)}
                          disabled={actionLoading === `water-${water.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === `water-${water.id}` ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectWater(water.id)}
                          disabled={actionLoading === `water-${water.id}`}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Instructors */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Pending Instructor Registrations ({pendingInstructors.length})</h3>
            {pendingInstructors.length === 0 ? (
              <p className="text-stone-500">No pending instructor registrations</p>
            ) : (
              <div className="space-y-4">
                {pendingInstructors.map(instructor => (
                  <div key={instructor.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-stone-800">{instructor.name}</h4>
                        <p className="text-sm text-stone-500">{instructor.specialties?.join(', ')} • {instructor.region}</p>
                        <p className="text-sm text-stone-600 mt-2">{instructor.bio?.substring(0, 100)}...</p>
                        <p className="text-sm text-stone-400 mt-2">Email: {instructor.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveInstructor(instructor.id)}
                          disabled={actionLoading === `instructor-${instructor.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === `instructor-${instructor.id}` ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectInstructor(instructor.id)}
                          disabled={actionLoading === `instructor-${instructor.id}`}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Waters Tab */}
      {activeTab === 'waters' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Type</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Region</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Price</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Status</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {allWaters.map(water => (
                <tr key={water.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-medium text-stone-800">{water.name}</td>
                  <td className="px-6 py-4 text-stone-600 capitalize">{water.type}</td>
                  <td className="px-6 py-4 text-stone-600 capitalize">{water.region}</td>
                  <td className="px-6 py-4 text-stone-600">£{water.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${water.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {water.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onNavigate('venue', { id: water.id })} className="text-teal-600 hover:text-teal-700 mr-3">View</button>
                    <button onClick={() => handleDeleteWater(water.id)} className="text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Instructors Tab */}
      {activeTab === 'instructors' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Specialties</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Region</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Price</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Status</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {allInstructors.map(instructor => (
                <tr key={instructor.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-medium text-stone-800">{instructor.name}</td>
                  <td className="px-6 py-4 text-stone-600">{instructor.specialties?.slice(0, 2).join(', ')}</td>
                  <td className="px-6 py-4 text-stone-600 capitalize">{instructor.region}</td>
                  <td className="px-6 py-4 text-stone-600">£{instructor.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${instructor.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {instructor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onNavigate('instructor', { id: instructor.id })} className="text-teal-600 hover:text-teal-700 mr-3">View</button>
                    <button onClick={() => handleDeleteInstructor(instructor.id)} className="text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Role</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {allUsers.map(user => (
                <tr key={user.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-medium text-stone-800">{user.name}</td>
                  <td className="px-6 py-4 text-stone-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'water_owner' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'instructor' ? 'bg-amber-100 text-amber-700' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {user.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// WATER OWNER DASHBOARD
// ============================================================================

const WaterOwnerDashboard = ({ onNavigate }) => {
  const auth = useAuth();
  const [waters, setWaters] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWater, setEditingWater] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [watersRes, inquiriesRes] = await Promise.all([
        api.request('/owner/waters'),
        api.request('/owner/inquiries')
      ]);
      setWaters(watersRes.waters || []);
      setInquiries(inquiriesRes.inquiries || []);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWater = async (waterId, updates) => {
    try {
      await api.request(`/owner/waters/${waterId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      loadData();
      setEditingWater(null);
    } catch (e) {
      alert('Failed to update');
    }
  };

  if (!auth.user || !['water_owner', 'admin'].includes(auth.user.role)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Access Denied</h2>
        <p className="text-stone-500">You need to be a water owner to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Water Owner Dashboard</h1>
        <p className="text-stone-500">Manage your water listings</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-teal-600">{waters.length}</div>
          <div className="text-stone-500">Your Waters</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-amber-600">{inquiries.filter(i => i.status === 'pending').length}</div>
          <div className="text-stone-500">Pending Inquiries</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-blue-600">{inquiries.length}</div>
          <div className="text-stone-500">Total Inquiries</div>
        </div>
      </div>

      {/* Your Waters */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Your Waters</h3>
        {waters.length === 0 ? (
          <p className="text-stone-500">You don't have any water listings yet.</p>
        ) : (
          <div className="space-y-4">
            {waters.map(water => (
              <div key={water.id} className="border border-stone-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-stone-800">{water.name}</h4>
                    <p className="text-sm text-stone-500">{water.type} • {water.region} • £{water.price}/day</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate('venue', { id: water.id })}
                      className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditingWater(water)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiries */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Recent Inquiries</h3>
        {inquiries.length === 0 ? (
          <p className="text-stone-500">No inquiries yet.</p>
        ) : (
          <div className="space-y-4">
            {inquiries.map(inquiry => (
              <div key={inquiry.id} className="border border-stone-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-stone-800">{inquiry.userName}</h4>
                    <p className="text-sm text-stone-500">{inquiry.userEmail}</p>
                    <p className="text-sm text-stone-600 mt-2">{inquiry.message}</p>
                    <p className="text-xs text-stone-400 mt-2">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${inquiry.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {inquiry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingWater && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingWater(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-stone-800 mb-4">Edit {editingWater.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Price per day (£)</label>
                <input
                  type="number"
                  value={editingWater.price}
                  onChange={(e) => setEditingWater({...editingWater, price: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  value={editingWater.description}
                  onChange={(e) => setEditingWater({...editingWater, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingWater(null)}
                  className="flex-1 px-4 py-2 border border-stone-200 text-stone-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateWater(editingWater.id, { price: editingWater.price, description: editingWater.description })}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INSTRUCTOR DASHBOARD
// ============================================================================

const InstructorDashboard = ({ onNavigate }) => {
  const auth = useAuth();
  const [profile, setProfile] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, inquiriesRes] = await Promise.all([
        api.request('/instructor/profile'),
        api.request('/instructor/inquiries')
      ]);
      setProfile(profileRes.instructor);
      setEditForm(profileRes.instructor || {});
      setInquiries(inquiriesRes.inquiries || []);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.request('/instructor/profile', {
        method: 'PUT',
        body: JSON.stringify({
          bio: editForm.bio,
          price: editForm.price,
          availability: editForm.availability
        })
      });
      loadData();
      setEditing(false);
    } catch (e) {
      alert('Failed to update');
    }
  };

  if (!auth.user || !['instructor', 'admin'].includes(auth.user.role)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Access Denied</h2>
        <p className="text-stone-500">You need to be an instructor to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Instructor Dashboard</h1>
        <p className="text-stone-500">Manage your profile and bookings</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-amber-600">{inquiries.filter(i => i.status === 'pending').length}</div>
          <div className="text-stone-500">Pending Bookings</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="text-3xl font-bold text-teal-600">£{profile?.price || 0}</div>
          <div className="text-stone-500">Your Day Rate</div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-stone-800">Your Profile</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Day Rate (£)</label>
              <input
                type="number"
                value={editForm.price || ''}
                onChange={(e) => setEditForm({...editForm, price: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
              <textarea
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg"
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div><span className="font-medium">Name:</span> {profile?.name}</div>
            <div><span className="font-medium">Specialties:</span> {profile?.specialties?.join(', ')}</div>
            <div><span className="font-medium">Region:</span> {profile?.region}</div>
            <div><span className="font-medium">Day Rate:</span> £{profile?.price}</div>
            <div><span className="font-medium">Bio:</span> {profile?.bio}</div>
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Booking Inquiries</h3>
        {inquiries.length === 0 ? (
          <p className="text-stone-500">No booking inquiries yet.</p>
        ) : (
          <div className="space-y-4">
            {inquiries.map(inquiry => (
              <div key={inquiry.id} className="border border-stone-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-stone-800">{inquiry.userName}</h4>
                    <p className="text-sm text-stone-500">{inquiry.userEmail}</p>
                    {inquiry.date && <p className="text-sm text-teal-600 mt-1">Requested date: {inquiry.date}</p>}
                    <p className="text-sm text-stone-600 mt-2">{inquiry.message}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${inquiry.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {inquiry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [showSignIn, setShowSignIn] = useState(false);
  const [showListWater, setShowListWater] = useState(false);
  const [showInstructorRegister, setShowInstructorRegister] = useState(false);

  const navigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const handleSignInRequired = () => setShowSignIn(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={navigate} onSignInRequired={handleSignInRequired} />;
      case 'search': return <SearchResultsPage onNavigate={navigate} params={pageParams} onSignInRequired={handleSignInRequired} />;
      case 'venue': return <VenueDetailPage onNavigate={navigate} params={pageParams} onSignInRequired={handleSignInRequired} />;
      case 'instructor': return <InstructorDetailPage onNavigate={navigate} params={pageParams} />;
      case 'instructors': return <InstructorsPage onNavigate={navigate} onSignInRequired={handleSignInRequired} />;
      case 'favourites': return <FavouritesPage onNavigate={navigate} onSignInRequired={handleSignInRequired} />;
      case 'profile': return <ProfilePage onNavigate={navigate} onSignInRequired={handleSignInRequired} />;
      case 'admin': return <AdminDashboard onNavigate={navigate} />;
      case 'owner-dashboard': return <WaterOwnerDashboard onNavigate={navigate} />;
      case 'instructor-dashboard': return <InstructorDashboard onNavigate={navigate} />;
      default: return <HomePage onNavigate={navigate} onSignInRequired={handleSignInRequired} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Nav currentPage={currentPage} onNavigate={navigate} onSignIn={() => setShowSignIn(true)} onListWater={() => setShowListWater(true)} onBecomeInstructor={() => setShowInstructorRegister(true)} />
      <main>{renderPage()}</main>

      <footer className="bg-stone-800 text-stone-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white"><Icons.Fish /></div>
                <span className="text-xl font-bold text-white">TightLines</span>
              </div>
              <p className="text-sm">The UK's leading fishing booking platform.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Fishing</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('search', { type: 'game' })} className="hover:text-teal-400">Game Fishing</button></li>
                <li><button onClick={() => navigate('search', { type: 'coarse' })} className="hover:text-teal-400">Coarse Fishing</button></li>
                <li><button onClick={() => navigate('search', { type: 'sea' })} className="hover:text-teal-400">Sea Fishing</button></li>
                <li><button onClick={() => navigate('instructors')} className="hover:text-teal-400">Guides</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Regions</h4>
              <ul className="space-y-2 text-sm">
                {regions.slice(0, 4).map(r => <li key={r.id}><button onClick={() => navigate('search', { region: r.id })} className="hover:text-teal-400">{r.name}</button></li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400">Contact</a></li>
                <li><button onClick={() => setShowListWater(true)} className="hover:text-teal-400">List Your Water</button></li>
                <li><button onClick={() => setShowInstructorRegister(true)} className="hover:text-teal-400">Become an Instructor</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-8 pt-8 text-sm text-center">© 2026 TightLines</div>
        </div>
      </footer>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
      <ListWaterModal isOpen={showListWater} onClose={() => setShowListWater(false)} />
      <InstructorRegisterModal isOpen={showInstructorRegister} onClose={() => setShowInstructorRegister(false)} />
    </div>
  );
};

// ============================================================================
// RENDER
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
