// ============================================
// INSTRUCTORS PAGE - Advanced filters matching waters style
// ============================================
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Filter, Loader, Users, SlidersHorizontal, X, MapPin, Search } from 'lucide-react';
import { InstructorCard } from '../components/cards/InstructorCard';
import { instructors as hardcodedInstructors } from '../data/instructors';
import { instructorsAPI } from '../utils/api';
import { ukRegions } from '../data/regions';

const allSpecialties = [
  'Fly Fishing', 'Salmon', 'Trout', 'Sea Fishing', 'Bass', 'Shore Fishing',
  'Carp Fishing', 'Coarse', 'Beginners', 'Fly Tying', "Women's Courses",
  'Kids/Juniors', 'Pike', 'Barbel'
];

const defaultFilters = {
  specialties: [],
  region: '',
  priceRange: [0, 500],
  rating: 0,
  availability: ''
};

// Collapsible filter section
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medium text-stone-800 mb-3"
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>
      {isOpen && children}
    </div>
  );
};

// Instructor filter sidebar
const InstructorFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const activeCount = [
    filters.specialties.length > 0,
    filters.region,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500,
    filters.rating > 0,
    filters.availability
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-brand-600" />
          Filters
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button onClick={onClearFilters} className="text-sm text-brand-600 hover:text-brand-800">
            Clear all
          </button>
        )}
      </div>

      {/* Specialties */}
      <FilterSection title="Specialties">
        <div className="flex flex-wrap gap-1.5">
          {allSpecialties.map(s => (
            <button
              key={s}
              onClick={() => {
                const newSpecs = filters.specialties.includes(s)
                  ? filters.specialties.filter(x => x !== s)
                  : [...filters.specialties, s];
                onFilterChange({ ...filters, specialties: newSpecs });
              }}
              className={`px-2.5 py-1 rounded-full text-xs transition ${
                filters.specialties.includes(s)
                  ? 'bg-brand-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Region */}
      <FilterSection title="Region">
        <select
          value={filters.region}
          onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
        >
          <option value="">All Regions</option>
          {ukRegions.map(r => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-stone-500 mb-1 block">Min (£)</label>
              <input
                type="number"
                min={0}
                max={filters.priceRange[1]}
                value={filters.priceRange[0]}
                onChange={(e) => onFilterChange({ ...filters, priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
              />
            </div>
            <span className="text-stone-400 mt-4">—</span>
            <div className="flex-1">
              <label className="text-xs text-stone-500 mb-1 block">Max (£)</label>
              <input
                type="number"
                min={filters.priceRange[0]}
                value={filters.priceRange[1]}
                onChange={(e) => onFilterChange({ ...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value) || 500] })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-stone-400">£{filters.priceRange[0]} — £{filters.priceRange[1]} per day</p>
        </div>
      </FilterSection>

      {/* Minimum Rating */}
      <FilterSection title="Minimum Rating" defaultOpen={false}>
        <div className="flex gap-2">
          {[0, 4, 4.5, 4.8].map(r => (
            <button
              key={r}
              onClick={() => onFilterChange({ ...filters, rating: r })}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                filters.rating === r
                  ? 'bg-brand-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {r === 0 ? 'Any' : `${r}+`}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <div className="space-y-2">
          {['', 'Weekdays', 'Weekends', 'Evenings'].map(a => (
            <label key={a || 'any'} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                checked={filters.availability === a}
                onChange={() => onFilterChange({ ...filters, availability: a })}
                className="w-4 h-4 border-stone-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-stone-600">{a || 'Any'}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

// Mobile filter drawer
const MobileFilterDrawer = ({ isOpen, onClose, filters, onFilterChange, onClearFilters }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filters
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <InstructorFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />
        </div>
        <div className="p-4 border-t border-stone-200 flex gap-3">
          <button onClick={onClearFilters} className="flex-1 py-3 border border-stone-300 rounded-xl font-medium hover:bg-stone-50">
            Clear All
          </button>
          <button onClick={onClose} className="flex-1 py-3 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800">
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
};

export const InstructorsPage = ({ onSelectInstructor, onBack, favouriteInstructors = [], onToggleFavouriteInstructor }) => {
  const [allInstructors, setAllInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState('rating');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const apiInstructors = await instructorsAPI.getAll();
        if (apiInstructors && apiInstructors.length > 0) {
          setAllInstructors(apiInstructors);
        } else {
          setAllInstructors(hardcodedInstructors);
        }
      } catch (err) {
        console.log('API unavailable, using local data:', err.message);
        setAllInstructors(hardcodedInstructors);
      }
      setLoading(false);
    };
    fetchInstructors();
  }, []);

  // Apply filters
  const filteredInstructors = allInstructors
    .filter(i => {
      // Text search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (i.name || '').toLowerCase().includes(q);
        const matchLocation = (i.location || i.region || '').toLowerCase().includes(q);
        const matchSpecialties = (i.specialties || []).some(s => s.toLowerCase().includes(q));
        const matchTitle = (i.title || '').toLowerCase().includes(q);
        if (!matchName && !matchLocation && !matchSpecialties && !matchTitle) return false;
      }
      if (filters.specialties.length > 0) {
        const hasMatch = filters.specialties.some(s => (i.specialties || []).includes(s));
        if (!hasMatch) return false;
      }
      if (filters.region) {
        const iRegion = (i.region || i.location || '').toLowerCase();
        if (!iRegion.includes(filters.region.toLowerCase())) return false;
      }
      if (i.price < filters.priceRange[0] || i.price > filters.priceRange[1]) return false;
      if (filters.rating > 0 && (i.rating || 0) < filters.rating) return false;
      if (filters.availability) {
        const avail = i.availability || [];
        if (!avail.includes(filters.availability)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'price-low': return (a.price || 0) - (b.price || 0);
        case 'price-high': return (b.price || 0) - (a.price || 0);
        case 'reviews': return (b.reviews || 0) - (a.reviews || 0);
        case 'newest': return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'name-az': return (a.name || '').localeCompare(b.name || '');
        default: return 0;
      }
    });

  const clearFilters = () => setFilters(defaultFilters);

  const activeFilterCount = [
    filters.specialties.length > 0,
    filters.region,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500,
    filters.rating > 0,
    filters.availability
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header with search bar */}
      <div className="bg-white border-b border-stone-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={onBack} className="flex items-center text-stone-500 hover:text-stone-700 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-stone-900">Find a Fishing Instructor</h1>
              <p className="text-stone-500 text-sm">
                {loading ? 'Loading instructors...' : `${filteredInstructors.length} instructors found`}
              </p>
            </div>
          </div>
          {/* Search bar with radius */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, or specialty..."
                className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm bg-white sm:w-40"
            >
              <option value={5}>Within 5 miles</option>
              <option value={10}>Within 10 miles</option>
              <option value={25}>Within 25 miles</option>
              <option value={50}>Within 50 miles</option>
              <option value={100}>Within 100 miles</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <InstructorFilters
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 text-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-brand-600 hover:text-brand-800">
                    Clear filters
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
              >
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="reviews">Most Reviews</option>
                <option value="newest">Newest</option>
                <option value="name-az">Name: A-Z</option>
              </select>
            </div>

            {/* Results list */}
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Loader className="w-8 h-8 text-brand-600 mx-auto mb-3 animate-spin" />
                <p className="text-stone-500">Loading instructors...</p>
              </div>
            ) : filteredInstructors.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {filteredInstructors.map(i => (
                  <InstructorCard
                    key={i.id}
                    instructor={i}
                    onClick={() => onSelectInstructor(i)}
                    isFavourite={favouriteInstructors.includes(i.id)}
                    onToggleFavourite={onToggleFavouriteInstructor}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-700 mb-2">No instructors match your filters</h3>
                <p className="text-stone-500 mb-4">Try adjusting your search criteria</p>
                <button onClick={clearFilters} className="px-4 py-2 text-brand-700 hover:bg-brand-50 rounded-lg transition">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
};

export default InstructorsPage;
