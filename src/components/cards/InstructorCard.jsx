// ============================================
// INSTRUCTOR CARD COMPONENT
// Card display for instructor listings
// Redesigned to match FisheryCard visual style
// ============================================
import { MapPin, Star, Heart, Shield } from 'lucide-react';

const specialtyColors = {
  'Atlantic Salmon': 'bg-cyan-50 text-cyan-700',
  'Salmon': 'bg-cyan-50 text-cyan-700',
  'Spey Casting': 'bg-blue-50 text-blue-700',
  'Fly Fishing': 'bg-blue-50 text-blue-700',
  'Trout': 'bg-green-50 text-green-700',
  'Wild Brown Trout': 'bg-green-50 text-green-700',
  'Sea Fishing': 'bg-teal-50 text-teal-700',
  'Sea Trout': 'bg-teal-50 text-teal-700',
  'Carp': 'bg-amber-50 text-amber-700',
  'Pike': 'bg-amber-50 text-amber-700',
  'Coarse': 'bg-lime-50 text-lime-700',
  'Stillwater': 'bg-sky-50 text-sky-700',
  'Beginners': 'bg-purple-50 text-purple-700',
  "Women's Courses": 'bg-pink-50 text-pink-700',
  'Dry Fly': 'bg-emerald-50 text-emerald-700',
  'Tenkara': 'bg-orange-50 text-orange-700',
  'Scottish Rivers': 'bg-indigo-50 text-indigo-700',
  'Small Streams': 'bg-teal-50 text-teal-700',
};

const verifiedCerts = ['AAPGAI', 'GAIA', 'SGAIC', 'Angling Trust'];

const isVerified = (instructor) =>
  (instructor.certifications || []).some(c =>
    verifiedCerts.some(vc => c.includes(vc))
  );

export const InstructorCard = ({ instructor, onClick, isFavourite, onToggleFavourite }) => {
  const verified = isVerified(instructor);
  const primarySpecialty = instructor.specialties?.[0];
  const primaryColor = specialtyColors[primarySpecialty] || 'bg-brand-50 text-brand-700';

  const hasBookingOptions = instructor.bookingOptions && instructor.bookingOptions.length > 0;
  const lowestPrice = hasBookingOptions
    ? Math.min(...instructor.bookingOptions.map(o => parseInt(o.price)).filter(p => !isNaN(p) && p > 0))
    : instructor.price;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg hover:border-stone-300 transition-all cursor-pointer group"
    >
      {/* Image */}
      <div className="h-48 relative" style={{ background: instructor.image }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {primarySpecialty && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${primaryColor}`}>
              {primarySpecialty}
            </span>
          )}
          {verified && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Favourite button */}
        {onToggleFavourite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavourite(instructor.id); }}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition shadow-sm"
          >
            <Heart className={`w-5 h-5 transition ${isFavourite ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} />
          </button>
        )}

        {/* Price & booking badges - right side */}
        <div className={`absolute ${onToggleFavourite ? 'top-14' : 'top-3'} right-3 flex flex-col gap-1 items-end`}>
          {instructor.hasCalendar && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500 text-white">
              Instant Book
            </span>
          )}
          {hasBookingOptions && instructor.bookingOptions.length > 1 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-stone-700">
              {instructor.bookingOptions.length} options
            </span>
          )}
        </div>

        {/* Title overlay at bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-white/90 text-sm">{instructor.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-stone-900 group-hover:text-brand-700 transition mb-1">
          {instructor.name}
        </h3>

        <div className="flex items-center text-sm text-stone-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="ml-1">{instructor.location}</span>
        </div>

        <p className="text-stone-600 text-sm mb-3 line-clamp-2">
          {instructor.bio}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {instructor.specialties.slice(0, 3).map(s => (
            <span key={s} className={`px-2 py-0.5 text-xs rounded-full ${specialtyColors[s] || 'bg-stone-100 text-stone-600'}`}>
              {s}
            </span>
          ))}
          {instructor.specialties.length > 3 && (
            <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
              +{instructor.specialties.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{instructor.rating}</span>
            <span className="text-stone-400 text-sm">({instructor.reviews})</span>
          </div>
          <div>
            {hasBookingOptions && <span className="text-stone-500 text-xs">from </span>}
            <span className="text-lg font-bold text-stone-900">£{lowestPrice}</span>
            <span className="text-stone-500 text-sm ml-1">/{instructor.priceType}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact card for homepage carousel
export const InstructorCardCompact = ({ instructor, onClick, isFavourite, onToggleFavourite }) => {
  const verified = isVerified(instructor);
  const primarySpecialty = instructor.specialties?.[0];
  const primaryColor = specialtyColors[primarySpecialty] || 'bg-brand-50 text-brand-700';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg transition cursor-pointer group flex-shrink-0 w-72"
    >
      {/* Image */}
      <div
        className="h-36 relative"
        style={{ background: instructor.image }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top-left badge */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {primarySpecialty && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${primaryColor}`}>
              {primarySpecialty}
            </span>
          )}
          {verified && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1">
              <Shield className="w-3 h-3" />
            </span>
          )}
        </div>

        {onToggleFavourite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavourite(instructor.id); }}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition shadow-sm"
          >
            <Heart className={`w-4 h-4 transition ${isFavourite ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} />
          </button>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-white">{instructor.name}</h3>
          <p className="text-white/80 text-sm">{instructor.title}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center text-sm text-stone-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="ml-1">{instructor.location}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {instructor.specialties.slice(0, 2).map(s => (
            <span key={s} className={`px-2 py-0.5 text-xs rounded-full ${specialtyColors[s] || 'bg-stone-100 text-stone-600'}`}>
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-sm">{instructor.rating}</span>
          </div>
          <span className="font-semibold">£{instructor.price}</span>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;
