// ============================================
// STAR RATING COMPONENT
// Display and input star ratings
// ============================================
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count = 0,
  interactive = false,
  onChange
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const handleClick = (newRating) => {
    if (interactive && onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isPartial = !isFilled && starValue - 0.5 <= rating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isPartial
                    ? 'fill-amber-200 text-amber-400'
                    : 'fill-stone-200 text-stone-200'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="font-medium text-stone-800 ml-1">{rating.toFixed(1)}</span>
      )}

      {showCount && count > 0 && (
        <span className="text-stone-400 text-sm">({count})</span>
      )}
    </div>
  );
};

// Compact variant for cards
export const StarRatingCompact = ({ rating, reviews }) => (
  <div className="flex items-center gap-1">
    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
    <span className="font-medium">{rating}</span>
    {reviews !== undefined && (
      <span className="text-stone-400 text-sm">({reviews})</span>
    )}
  </div>
);

export default StarRating;
