// ============================================
// SIGN IN MODAL COMPONENT
// Authentication modal with sign in/register modes
// ============================================
import { useState } from 'react';
import { X, User, Mail, Lock, Fish } from 'lucide-react';

export const SignInModal = ({ isOpen, onClose, onSignIn }) => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'register' && !name) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignIn({ email, name: name || email.split('@')[0] });
      onClose();
    }, 1000);
  };

  const resetAndClose = () => {
    setMode('signin');
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-brand-700">
            <Fish className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {mode === 'signin'
              ? 'Sign in to manage your bookings'
              : 'Join thousands of anglers'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="John Smith"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 transition"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* Mode switch */}
        <div className="mt-6 text-center text-sm">
          {mode === 'signin' ? (
            <p className="text-stone-600">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-brand-700 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-stone-600">
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-brand-700 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
