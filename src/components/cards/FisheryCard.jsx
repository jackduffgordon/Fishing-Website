// ============================================
// FISHERY CARD COMPONENT
// Card display for fishery listings
// Now supports multiple booking options display
// ============================================
import { MapPin, Star, Tag } from 'lucide-react';

const typeColors = {
  game: 'bg-blue-50 text-blue-700',
  coarse: 'bg-green-50 text-green-700',
  sea: 'bg-cyan-50 text-cyan-700'
};

const typeLabels = {
  game: 'Game',
  coarse: 'Coarse',
  sea: 'Sea'
};

export const FisheryCard = ({ fishery, onClick }) => {
  // Determine pricing display
  const hasBookingOptions = fishery.bookingOptions && fishery.bookingOptions.length > 0;

  const getLowestPrice = () => {
    if (!hasBookingOptions) return fishery.price;
    const prices = fishery.bookingOptions.map(o => parseInt(o.price)).filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.min(...prices) : fishery.price;
  };

  const getPriceType = () => {
    if (!hasBookingOptions) return fishery.priceType;
    const lowestPrice = getLowestPrice();
    const cheapestOption = fishery.bookingOptions.find(o => parseInt(o.price) === lowestPrice);
    return cheapestOption?.priceType || 'day';
  };

  const optionCount = hasBookingOptions ? fishery.bookingOptions.length : 0;
  const hasInstant = hasBookingOptions
    ? fishery.bookingOptions.some(o => o.bookingType === 'instant')
    : fishery.bookingType === 'instant';
  const isFree = !hasBookingOptions && fishery.bookingType === 'free';
  const lowestPrice = getLowestPrice();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg hover:border-stone-300 transition-all cursor-pointer group"
    >
      {/* Image */}
      <div className="h-48 relative" style={{ background: fishery.image }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[fishery.type]}`}>
            {typeLabels[fishery.type]}
          </span>
          {fishery.topRated && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              Top Rated
            </span>
          )}
        </div>

        {/* Booking type badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {hasInstant && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500 text-white">
              Instant Book
            </span>
          )}
          {isFree && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
              Free Access
            </span>
          )}
          {optionCount > 1 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-stone-700">
              {optionCount} options
            </span>
          )}
        </div>

        {/* Water type */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-white/90 text-sm">{fishery.waterType}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-stone-900 group-hover:text-brand-700 transition mb-1">
          {fishery.name}
        </h3>

        <div className="flex items-center text-sm text-stone-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="ml-1">{fishery.location}, {fishery.region}</span>
        </div>

        <p className="text-stone-600 text-sm mb-3 line-clamp-2">
          {fishery.shortDescription}
        </p>

        {/* Species tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {fishery.species.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full">
              {s}
            </span>
          ))}
          {fishery.species.length > 3 && (
            <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
              +{fishery.species.length - 3}
            </span>
          )}
        </div>

        {/* Booking options preview (if multiple) */}
        {optionCount > 1 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {fishery.bookingOptions.slice(0, 3).map((opt, i) => (
              <span key={i} className="px-2 py-0.5 bg-brand-50 text-brand-600 text-xs rounded-full">
                {opt.name}
              </span>
            ))}
            {optionCount > 3 && (
              <span className="px-2 py-0.5 bg-brand-50 text-brand-500 text-xs rounded-full">
                +{optionCount - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{fishery.rating}</span>
            <span className="text-stone-400 text-sm">({fishery.reviews})</span>
          </div>
          <div>
            {isFree ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <>
                {hasBookingOptions && <span className="text-stone-500 text-xs">from </span>}
                <span className="text-lg font-bold text-stone-900">£{lowestPrice}</span>
                <span className="text-stone-500 text-sm ml-1">/{getPriceType()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FisheryCard;
