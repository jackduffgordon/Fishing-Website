// ============================================
// NAVIGATION COMPONENT - v4
// Added: Become an Instructor, Clickable profile avatar
// ============================================
import { useState, useRef, useEffect } from 'react';
import { Fish, Menu, X, ChevronDown, User, LogOut, Shield, Droplets, Award } from 'lucide-react';

export const Nav = ({
  currentTab,
  setCurrentTab,
  setCurrentPage,
  user,
  setUser,
  onSignIn,
  onListWater,
  onListInstructor,
  onProfile
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => {
              setCurrentPage('home');
              setCurrentTab('waters');
            }}
            className="flex items-center space-x-2 text-brand-700 hover:text-brand-800"
          >
            <Fish className="w-6 h-6" />
            <span className="text-xl font-bold">TightLines</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => {
                setCurrentPage('search');
                setCurrentTab('waters');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'waters'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Find Waters
            </button>
            <button
              onClick={() => {
                setCurrentPage('instructors');
                setCurrentTab('instructors');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'instructors'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Instructors
            </button>

            <div className="w-px h-6 bg-stone-200 mx-2" />

            <button
              onClick={() => {
                setCurrentPage('about');
                setCurrentTab('about');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'about'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              About
            </button>
            <button
              onClick={() => {
                setCurrentPage('contact');
                setCurrentTab('contact');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'contact'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Contact
            </button>

            <div className="w-px h-6 bg-stone-200 mx-2" />

            {/* List dropdown for Water & Instructor */}
            <div className="relative group">
              <button className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-brand-700 transition flex items-center gap-1">
                List Your...
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <button
                  onClick={onListWater}
                  className="block w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 rounded-t-xl"
                >
                  List Your Water
                </button>
                <button
                  onClick={onListInstructor}
                  className="block w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 rounded-b-xl border-t border-stone-100"
                >
                  Become an Instructor
                </button>
              </div>
            </div>

            {user ? (
              <div className="relative ml-2" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 transition"
                >
                  {user.role === 'admin' && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      Admin
                    </span>
                  )}
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-medium">
                    {(user.name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.name || user.email}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-1">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-sm font-medium text-stone-900">{user.name || user.email}</p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { onProfile(); setUserMenuOpen(false); }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      My Profile
                    </button>
                    {(user.role === 'water_owner' || user.role === 'pending_water_owner') && (
                      <button
                        onClick={() => { setCurrentPage('water-dashboard'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <Droplets className="w-4 h-4 text-stone-400" />
                        My Waters
                      </button>
                    )}
                    {(user.role === 'instructor' || user.role === 'pending_instructor') && (
                      <button
                        onClick={() => { setCurrentPage('instructor-dashboard'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <Award className="w-4 h-4 text-stone-400" />
                        Instructor Dashboard
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setCurrentPage('admin'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <Shield className="w-4 h-4 text-stone-400" />
                        Admin Dashboard
                      </button>
                    )}
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => { setUser(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="ml-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 py-2">
          <button
            onClick={() => {
              setCurrentPage('search');
              setCurrentTab('waters');
              setMobileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
          >
            Find Waters
          </button>
          <button
            onClick={() => {
              setCurrentPage('instructors');
              setCurrentTab('instructors');
              setMobileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
          >
            Instructors
          </button>
          <button
            onClick={() => {
              setCurrentPage('about');
              setCurrentTab('about');
              setMobileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
          >
            About
          </button>
          <button
            onClick={() => {
              setCurrentPage('contact');
              setCurrentTab('contact');
              setMobileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
          >
            Contact
          </button>
          <div className="border-t border-stone-100 mt-1 pt-1">
            <button
              onClick={() => {
                onListWater();
                setMobileOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
            >
              List Your Water
            </button>
            <button
              onClick={() => {
                onListInstructor();
                setMobileOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
            >
              Become an Instructor
            </button>
          </div>
          {user ? (
            <div className="px-4 py-3 border-t border-stone-200">
              <button
                onClick={() => {
                  onProfile();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full"
              >
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-medium">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium block">{user.name || user.email}</span>
                  <span className="text-xs text-stone-500">View profile</span>
                </div>
              </button>
              {(user.role === 'water_owner' || user.role === 'pending_water_owner') && (
                <button
                  onClick={() => { setCurrentPage('water-dashboard'); setMobileOpen(false); }}
                  className="mt-2 block text-sm text-brand-700 font-medium"
                >
                  My Waters
                </button>
              )}
              {(user.role === 'instructor' || user.role === 'pending_instructor') && (
                <button
                  onClick={() => { setCurrentPage('instructor-dashboard'); setMobileOpen(false); }}
                  className="mt-2 block text-sm text-brand-700 font-medium"
                >
                  Instructor Dashboard
                </button>
              )}
              {user.role === 'admin' && (
                <button
                  onClick={() => { setCurrentPage('admin'); setMobileOpen(false); }}
                  className="mt-2 block text-sm text-amber-700 font-medium"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  setUser();
                  setMobileOpen(false);
                }}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onSignIn();
                setMobileOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-brand-700 font-medium border-t border-stone-200"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Nav;
