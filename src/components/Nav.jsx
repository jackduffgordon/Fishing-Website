// ============================================
// NAVIGATION COMPONENT - Streamlined v3
// Clean: Logo, Find Waters, Instructors, List Your Water, Sign In
// ============================================
import { useState } from 'react';
import { Fish, Menu, X } from 'lucide-react';

export const Nav = ({
  currentTab,
  setCurrentTab,
  setCurrentPage,
  user,
  setUser,
  onSignIn,
  onListWater
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
                setCurrentTab('');
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
                setCurrentTab('');
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

            <button
              onClick={onListWater}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-brand-700 transition"
            >
              List Your Water
            </button>

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                {user.role === 'admin' && (
                  <button
                    onClick={() => setCurrentPage('admin')}
                    className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition"
                  >
                    Admin
                  </button>
                )}
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-medium">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name || user.email}</span>
                <button
                  onClick={() => setUser()}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Sign out
                </button>
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
              setCurrentTab('');
              setMobileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
          >
            About
          </button>
          <button
            onClick={() => {
              setCurrentPage('contact');
              setCurrentTab('');
              setMobileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
          >
            Contact
          </button>
          <button
            onClick={() => {
              onListWater();
              setMobileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50"
          >
            List Your Water
          </button>
          {user ? (
            <div className="px-4 py-3 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-medium">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name || user.email}</span>
              </div>
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
                className="mt-2 text-sm text-stone-500 hover:text-stone-700"
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
              className="block w-full text-left px-4 py-3 text-brand-700 font-medium"
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
