// ============================================
// INSTRUCTOR CARD COMPONENT
// Card display for instructor listings
// ============================================
import { MapPin, Star } from 'lucide-react';

export const InstructorCard = ({ instructor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg transition cursor-pointer group"
    >
      <div className="flex">
        {/* Image */}
        <div
          className="w-32 md:w-40 h-full min-h-[200px] flex-shrink-0"
          style={{ background: instructor.image }}
        />

        {/* Content */}
        <div className="flex-1 p-5">
          <h3 className="font-semibold text-lg text-stone-900 group-hover:text-brand-700 transition">
            {instructor.name}
          </h3>

          <p className="text-brand-600 text-sm mb-2">{instructor.title}</p>

          <div className="flex items-center text-sm text-stone-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="ml-1">{instructor.location}</span>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-3">
            {instructor.specialties.slice(0, 3).map(s => (
              <span key={s} className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full">
                {s}
              </span>
            ))}
            {instructor.specialties.length > 3 && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
                +{instructor.specialties.length - 3}
              </span>
            )}
          </div>

          <p className="text-stone-600 text-sm mb-3 line-clamp-2">
            {instructor.bio}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{instructor.rating}</span>
              <span className="text-stone-400 text-sm">({instructor.reviews})</span>
            </div>
            <div>
              <span className="text-lg font-bold">£{instructor.price}</span>
              <span className="text-stone-500 text-sm">/{instructor.priceType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact card for homepage carousel
export const InstructorCardCompact = ({ instructor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg transition cursor-pointer group flex-shrink-0 w-72"
    >
      {/* Image */}
      <div
        className="h-32 relative"
        style={{ background: instructor.image }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
            <span key={s} className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full">
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
