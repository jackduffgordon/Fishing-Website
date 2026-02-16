// ============================================
// CATCH REPORT FORM - Report catches with verification
// ============================================
import { useState, useEffect } from 'react';
import { Fish, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { getToken } from '../../utils/api';

export const CatchReportForm = ({ waterId: initialWaterId, waterName: initialWaterName, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [waters, setWaters] = useState([]);
  const [loadingWaters, setLoadingWaters] = useState(!initialWaterId);

  const [formData, setFormData] = useState({
    waterId: initialWaterId || '',
    waterName: initialWaterName || '',
    species: '',
    weight: '',
    method: '',
    comment: '',
    isPublic: true
  });

  // Fetch available waters if waterId not provided
  useEffect(() => {
    const fetchWaters = async () => {
      if (initialWaterId) {
        setLoadingWaters(false);
        return;
      }

      try {
        const res = await fetch('/api/waters');
        if (res.ok) {
          const data = await res.json();
          setWaters(data.waters || []);
        }
      } catch (err) {
        console.error('Failed to fetch waters:', err);
      }
      setLoadingWaters(false);
    };

    fetchWaters();
  }, [initialWaterId]);

  // Check if user has a confirmed booking for this water
  useEffect(() => {
    const checkBooking = async () => {
      if (!user || !formData.waterId) {
        setCheckingBooking(false);
        return;
      }

      try {
        const token = getToken();
        const res = await fetch('/api/inquiries/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Check if user has a confirmed booking for this water
          const confirmedBooking = data.inquiries?.find(
            inquiry => inquiry.waterId === formData.waterId && inquiry.status === 'confirmed'
          );
          setHasBooking(!!confirmedBooking);
        }
      } catch (err) {
        console.error('Failed to check booking:', err);
      }
      setCheckingBooking(false);
    };

    checkBooking();
  }, [user, formData.waterId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please sign in to report a catch');
      return;
    }

    if (!formData.waterId) {
      setError('Please select a water');
      return;
    }

    if (!formData.species.trim()) {
      setError('Please specify the species caught');
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch('/api/catches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          waterId: formData.waterId,
          species: formData.species,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          method: formData.method || null,
          comment: formData.comment || null,
          isPublic: formData.isPublic,
          verified: hasBooking // Only verified if user has confirmed booking
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit catch report');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit catch report');
    } finally {
      setLoading(false);
    }
  };

  if (checkingBooking || loadingWaters) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <Loader className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-4" />
        <p className="text-stone-600">
          {loadingWaters ? 'Loading waters...' : 'Checking your booking status...'}
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-stone-900 mb-2">Catch Reported!</h3>
        <p className="text-stone-600">
          {hasBooking
            ? 'Your verified catch has been submitted successfully.'
            : 'Your catch has been submitted successfully.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
            <Fish className="w-5 h-5 text-brand-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Report a Catch</h3>
            <p className="text-sm text-stone-600">
              {formData.waterName || (initialWaterName) || 'Select a water to report your catch'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Verification status */}
      {hasBooking ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">Verified Booking</p>
            <p className="text-xs text-green-700">You have a confirmed booking here - this catch will be verified!</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Unverified Catch</p>
            <p className="text-xs text-amber-700">You don't have a confirmed booking here yet. You can still report your catch!</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!initialWaterId && (
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-2">
              Water <span className="text-red-500">*</span>
            </label>
            <select
              name="waterId"
              value={formData.waterId}
              onChange={(e) => {
                const selectedWater = waters.find(w => w.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  waterId: e.target.value,
                  waterName: selectedWater?.name || ''
                }));
              }}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              required
            >
              <option value="">Select a water</option>
              {waters.map(water => (
                <option key={water.id} value={water.id}>
                  {water.name} - {water.region}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-stone-900 mb-2">
            Species <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
            placeholder="e.g. Brown Trout, Carp, Pike"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-900 mb-2">
            Weight (lbs)
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
            placeholder="e.g. 5.5"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-900 mb-2">
            Method
          </label>
          <select
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
          >
            <option value="">Select method</option>
            <option value="Fly fishing">Fly fishing</option>
            <option value="Spinning">Spinning</option>
            <option value="Bait fishing">Bait fishing</option>
            <option value="Lure fishing">Lure fishing</option>
            <option value="Float fishing">Float fishing</option>
            <option value="Ledgering">Ledgering</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-900 mb-2">
            Comment
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent resize-none"
            placeholder="Share details about your catch..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublic"
            id="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="w-4 h-4 text-brand-700 border-stone-300 rounded focus:ring-2 focus:ring-brand-700"
          />
          <label htmlFor="isPublic" className="text-sm text-stone-700">
            Make this catch public (visible to other anglers)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Fish className="w-5 h-5" />
              Report Catch
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CatchReportForm;
