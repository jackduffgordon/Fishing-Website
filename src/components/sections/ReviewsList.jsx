// ============================================
// REVIEWS LIST COMPONENT
// Display customer reviews with ratings
// ============================================
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';

const StarDisplay = ({ rating }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating
            ? 'fill-amber-400 text-amber-400'
            : 'fill-stone-200 text-stone-200'
        }`}
      />
    ))}
  </div>
);

export const ReviewCard = ({ review }) => {
  return (
    <div className="bg-stone-50 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-stone-900">{review.author}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                Verified booking
              </span>
            )}
          </div>
          <span className="text-sm text-stone-400">
            {new Date(review.date).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
        <StarDisplay rating={review.rating} />
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-medium text-stone-900 mb-2">{review.title}</h4>
      )}

      {/* Text */}
      <p className="text-stone-600">{review.text}</p>

      {/* Helpful button */}
      <button className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 mt-3 transition">
        <ThumbsUp className="w-4 h-4" />
        Helpful
      </button>
    </div>
  );
};

export const ReviewsList = ({ reviews = [], showCount = 5 }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-stone-500">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: (reviews.filter(r => r.rating === stars).length / reviews.length) * 100
  }));

  return (
    <div>
      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-stone-200">
        {/* Average rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-stone-900 mb-2">
            {avgRating.toFixed(1)}
          </div>
          <StarDisplay rating={Math.round(avgRating)} />
          <p className="text-sm text-stone-500 mt-1">{reviews.length} reviews</p>
        </div>

        {/* Distribution */}
        <div className="flex-1 space-y-2">
          {distribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-8 text-sm text-stone-600">{stars}★</span>
              <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-sm text-stone-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.slice(0, showCount).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Show more */}
      {reviews.length > showCount && (
        <button className="w-full mt-4 py-3 text-brand-700 font-medium hover:bg-brand-50 rounded-xl transition">
          Show all {reviews.length} reviews
        </button>
      )}
    </div>
  );
};

export default ReviewsList;
