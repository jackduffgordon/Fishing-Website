// ============================================
// SEARCH RESULTS PAGE - API-powered with hardcoded fallback
// ============================================
import { useState, useEffect } from 'react';
import { ChevronLeft, Filter, Fish, Search, Loader } from 'lucide-react';
import { FisheryCard } from '../components/cards/FisheryCard';
import { AdvancedFilters, MobileFilterDrawer } from '../components/filters/AdvancedFilters';
import { fisheries as hardcodedFisheries } from '../data/fisheries';
import { ukRegions } from '../data/regions';
import { watersAPI, normalizeWater } from '../utils/api';

const defaultFilters = {
  priceRange: [10, 500],
  species: [],
  experienceLevel: 'any',
  facilities: [],
  weekendOnly: false,
  fishingType: '',
  region: ''
};

export const SearchResultsPage = ({ onSelectFishery, onBack, favouriteWaters = [], onToggleFavouriteWater }) => {
  const [allWaters, setAllWaters] = useState(hardcodedFisheries);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState('rating');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch waters from API on mount
  useEffect(() => {
    const fetchWaters = async () => {
      try {
        const apiWaters = await watersAPI.getAll();
        if (apiWaters && apiWaters.length > 0) {
          // Merge: API waters + hardcoded (with dedup by name)
          const apiNames = new Set(apiWaters.map(w => w.name.toLowerCase()));
          const uniqueHardcoded = hardcodedFisheries.filter(
            f => !apiNames.has(f.name.toLowerCase())
          );
          setAllWaters([...apiWaters, ...uniqueHardcoded]);
        }
        // If API returns empty, keep hardcoded data
      } catch (err) {
        console.log('API unavailable, using local data:', err.message);
        // Keep hardcoded data as fallback
      }
      setLoading(false);
    };
    fetchWaters();
  }, []);

  // Apply filters
  const filteredFisheries = allWaters
    .filter((f) => {
      if (filters.fishingType && f.type !== filters.fishingType) return false;
      if (filters.region && f.region !== filters.region) return false;
      if (f.price < filters.priceRange[0] || f.price > filters.priceRange[1]) return false;

      if (filters.species.length > 0) {
        const hasSpecies = filters.species.some((s) => f.species?.includes(s));
        if (!hasSpecies) return false;
      }

      if (filters.experienceLevel !== 'any' && f.experienceLevel !== filters.experienceLevel) {
        if (f.experienceLevel !== 'any') return false;
      }

      if (filters.facilities.length > 0) {
        const hasFacilities = filters.facilities.every((fac) =>
          f.facilities?.includes(fac) || f.amenities?.some((a) =>
            a.toLowerCase().includes(fac.replace('-', ' '))
          )
        );
        if (!hasFacilities) return false;
      }

      if (filters.weekendOnly && f.availability) {
        const today = new Date();
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);

        const satStr = saturday.toISOString().split('T')[0];
        const sunStr = sunday.toISOString().split('T')[0];

        const satAvailable = f.availability[satStr]?.status === 'available';
        const sunAvailable = f.availability[sunStr]?.status === 'available';

        if (!satAvailable && !sunAvailable) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'reviews':
          return (b.reviews || 0) - (a.reviews || 0);
        default:
          return 0;
      }
    });

  const clearFilters = () => setFilters(defaultFilters);

  const activeFilterCount = [
    filters.priceRange[0] !== 10 || filters.priceRange[1] !== 500,
    filters.species.length > 0,
    filters.experienceLevel !== 'any',
    filters.facilities.length > 0,
    filters.weekendOnly,
    filters.fishingType,
    filters.region
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Compact search header */}
      <div className="bg-white border-b border-stone-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center text-stone-500 hover:text-stone-700 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-stone-900">Find Your Perfect Water</h1>
              <p className="text-stone-500 text-sm">
                {loading ? 'Loading waters...' : `${filteredFisheries.length} waters found`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <AdvancedFilters
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
                regions={ukRegions}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results toolbar */}
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
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brand-600 hover:text-brand-800"
                  >
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
              </select>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Loader className="w-8 h-8 text-brand-600 mx-auto mb-3 animate-spin" />
                <p className="text-stone-500">Loading waters...</p>
              </div>
            ) : filteredFisheries.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {filteredFisheries.map((f) => (
                  <FisheryCard
                    key={f.id}
                    fishery={f}
                    onClick={() => onSelectFishery(f)}
                    isFavourite={favouriteWaters.includes(f.id)}
                    onToggleFavourite={onToggleFavouriteWater}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Fish className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-700 mb-2">No waters match your filters</h3>
                <p className="text-stone-500 mb-4">Try adjusting your search criteria</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-brand-700 hover:bg-brand-50 rounded-lg transition"
                >
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
        onApply={() => setMobileFiltersOpen(false)}
        regions={ukRegions}
      />
    </div>
  );
};

export default SearchResultsPage;
