// ============================================
// REVIEW FORM - Submit reviews for waters or instructors
// ============================================
import { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import { getToken } from '../../utils/api';

const StarRating = ({ rating, setRating, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && setRating(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`transition ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`w-8 h-8 ${
              star <= (hover || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-stone-200 text-stone-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const ReviewForm = ({ waterId, instructorId, onSuccess, user, hasBooking = false }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!text.trim()) {
      setError('Please write your review');
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          waterId,
          instructorId,
          rating,
          title,
          text
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setIsVerified(data.verified);
      setRating(0);
      setTitle('');
      setText('');

      if (onSuccess) {
        onSuccess(data.review);
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-stone-50 rounded-xl p-6 text-center">
        <p className="text-stone-600">Please sign in to leave a review</p>
      </div>
    );
  }

  if (!hasBooking) {
    return (
      <div className="bg-stone-50 rounded-xl p-6 text-center">
        <p className="text-stone-600">You need a confirmed booking to leave a review</p>
        <p className="text-stone-500 text-sm mt-1">Reviews can only be left after you've visited</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="font-semibold text-green-900">Review submitted successfully!</h3>
        </div>
        <p className="text-green-700 mb-2">Thank you for sharing your experience.</p>
        {isVerified && (
          <p className="text-sm text-green-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Your review has been marked as verified because you have a confirmed booking.
          </p>
        )}
        {!isVerified && (
          <p className="text-sm text-green-600">
            Your review will appear once it's been moderated.
          </p>
        )}
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-green-700 hover:text-green-800 font-medium"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6">
      <h3 className="font-semibold text-lg text-stone-900 mb-4">Write a Review</h3>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Review Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          maxLength={100}
          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
        />
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share details about your experience..."
          rows={5}
          maxLength={1000}
          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent resize-none"
        />
        <p className="text-xs text-stone-500 mt-1">{text.length}/1000 characters</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || rating === 0 || !text.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>

      <p className="text-xs text-stone-500 mt-3 text-center">
        Your review will be marked as verified based on your confirmed booking.
      </p>
    </form>
  );
};

export default ReviewForm;
