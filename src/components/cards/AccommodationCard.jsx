// ============================================
// ACCOMMODATION CARD COMPONENT
// Card display for nearby stays
// ============================================
import { MapPin, Star, ExternalLink, Bed, Building } from 'lucide-react';

const typeIcons = {
  'B&B': Bed,
  'Hotel': Building,
  'Inn': Building,
  'Self-catering': Bed,
  'Camping': Bed,
  'On-site lodges': Bed
};

export const AccommodationCard = ({ accommodation }) => {
  const Icon = typeIcons[accommodation.type] || Building;

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition">
      {/* Image placeholder */}
      <div
        className="h-32 relative"
        style={{ background: 'linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 100%)' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-12 h-12 text-stone-400" />
        </div>
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-white rounded-full text-xs font-medium text-stone-600">
          {accommodation.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-stone-900 mb-1 line-clamp-1">
          {accommodation.name}
        </h4>

        <div className="flex items-center gap-3 text-sm text-stone-500 mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {accommodation.distance}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {accommodation.rating}
            <span className="text-stone-400">({accommodation.reviewCount})</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand-700">
            {accommodation.priceRange}
            <span className="text-stone-400 font-normal text-sm">/night</span>
          </span>
          <a
            href={accommodation.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800"
            onClick={(e) => e.stopPropagation()}
          >
            Book <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

// Horizontal variant for list views
export const AccommodationCardHorizontal = ({ accommodation }) => {
  const Icon = typeIcons[accommodation.type] || Building;

  return (
    <div className="flex bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition">
      {/* Image placeholder */}
      <div
        className="w-24 h-24 flex-shrink-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 100%)' }}
      >
        <Icon className="w-8 h-8 text-stone-400" />
      </div>

      {/* Content */}
      <div className="flex-1 p-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-stone-900 text-sm">{accommodation.name}</h4>
            <p className="text-xs text-stone-500">{accommodation.type} • {accommodation.distance}</p>
          </div>
          <span className="flex items-center gap-0.5 text-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {accommodation.rating}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-brand-700 text-sm">{accommodation.priceRange}</span>
          <a
            href={accommodation.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View →
          </a>
        </div>
      </div>
    </div>
  );
};

export default AccommodationCard;
