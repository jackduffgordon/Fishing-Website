// ============================================
// HOMEPAGE - Streamlined v3
// Hero + Search, Featured Waters, How It Works, Testimonials
// Clean, conversion-focused, no bloat
// ============================================
import { useState, useRef } from 'react';
import {
  Search, MapPin, Star, ChevronLeft, ChevronRight, Fish, Calendar, Shield, Check, Quote, ArrowRight, TrendingUp, Heart
} from 'lucide-react';
import { FisheryCard } from '../components/cards/FisheryCard';
import { InstructorCardCompact } from '../components/cards/InstructorCard';
import { fisheries } from '../data/fisheries';
import { instructors } from '../data/instructors';
import { ukRegions, ukSpecies, testimonials } from '../data/regions';

// Search autocomplete component
const SearchAutocomplete = ({ value, onChange, suggestions, onSelectSuggestion }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = () => {
    if (value.length > 0) setShowSuggestions(true);
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.name.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="relative flex-1">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          <MapPin className="w-5 h-5" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="River, lake, or region..."
          className="w-full pl-10 pr-4 py-3.5 border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-base"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectSuggestion(suggestion);
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-stone-50 flex items-center gap-3 border-b border-stone-100 last:border-0"
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                  suggestion.type === 'water'
                    ? 'bg-blue-100 text-blue-700'
                    : suggestion.type === 'region'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {suggestion.type === 'water' ? '💧' : suggestion.type === 'region' ? '📍' : '🐟'}
              </span>
              <div>
                <p className="font-medium text-stone-800">{suggestion.name}</p>
                <p className="text-xs text-stone-500 capitalize">{suggestion.type}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const HomePage = ({
  onSearch, onSelectFishery, onSelectInstructor, onSelectRegion, onNavigate,
  favouriteWaters = [], onToggleFavouriteWater,
  favouriteInstructors = [], onToggleFavouriteInstructor
}) => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);
  const instructorCarouselRef = useRef(null);

  const featured = fisheries.filter((f) => f.featured);
  const allFisheries = fisheries.slice(0, 6);

  // Build search suggestions
  const searchSuggestions = [
    ...fisheries.map((f) => ({ type: 'water', name: f.name, id: f.id })),
    ...ukRegions.map((r) => ({ type: 'region', name: r.name, id: r.id })),
    ...ukSpecies.slice(0, 8).map((s) => ({ type: 'species', name: s.name }))
  ];

  const handleSuggestionSelect = (suggestion) => {
    // Just populate the search input, don't navigate
    if (suggestion.type === 'water') {
      setSearchLocation(suggestion.name);
    } else if (suggestion.type === 'region') {
      setSearchLocation(suggestion.name);
    } else {
      setSearchLocation(suggestion.name);
    }
  };

  const handleSearchClick = () => {
    onSearch();
  };

  const scrollInstructors = (direction) => {
    if (instructorCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      instructorCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl float" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-brand-400 rounded-full blur-3xl float"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Find & Book the Best Fishing in the UK
            </h1>
            <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto">
              From legendary salmon beats to specimen carp lakes. Search, compare, and book — all in one place.
            </p>
          </div>

          {/* Search Box - Streamlined */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-3 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <SearchAutocomplete
                  value={searchLocation}
                  onChange={setSearchLocation}
                  suggestions={searchSuggestions}
                  onSelectSuggestion={handleSuggestionSelect}
                />
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="px-4 py-3.5 border border-stone-200 rounded-xl text-stone-600 bg-white focus:ring-2 focus:ring-brand-500 md:w-40"
                >
                  <option value={5}>Within 5 miles</option>
                  <option value={10}>Within 10 miles</option>
                  <option value={25}>Within 25 miles</option>
                  <option value={50}>Within 50 miles</option>
                  <option value={100}>Within 100 miles</option>
                </select>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="px-4 py-3.5 border border-stone-200 rounded-xl text-stone-600 bg-white focus:ring-2 focus:ring-brand-500 md:w-44"
                >
                  <option value="">All Types</option>
                  <option value="game">Game</option>
                  <option value="coarse">Coarse</option>
                  <option value="sea">Sea</option>
                </select>
                <button
                  onClick={handleSearchClick}
                  className="px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Two key stats only */}
          <div className="flex justify-center gap-12 mt-10 text-center">
            <div>
              <span className="text-3xl font-bold">500+</span>
              <p className="text-brand-200 text-sm">Waters to Explore</p>
            </div>
            <div>
              <span className="text-3xl font-bold">12,000+</span>
              <p className="text-brand-200 text-sm">Bookings Made</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED WATERS ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Featured Waters</h2>
              <p className="text-stone-600 mt-1">Hand-picked fisheries offering exceptional sport</p>
            </div>
            <button
              onClick={onSearch}
              className="hidden md:flex items-center gap-1 text-brand-700 hover:text-brand-800 font-medium"
            >
              Browse all waters <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featured.length > 0 ? featured : allFisheries).map((f) => (
              <FisheryCard
                key={f.id}
                fishery={f}
                onClick={() => onSelectFishery(f)}
                isFavourite={favouriteWaters.includes(f.id)}
                onToggleFavourite={onToggleFavouriteWater}
              />
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <button
              onClick={onSearch}
              className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 font-medium"
            >
              Browse all waters <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-900 mb-12">How TightLines Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-6 h-6" />,
                step: '1',
                title: 'Search',
                desc: 'Browse 500+ waters across the UK. Filter by species, region, price, or fishing type.'
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                step: '2',
                title: 'Book',
                desc: 'Book day tickets instantly or send enquiries for premium beats. Transparent pricing, no hidden fees.'
              },
              {
                icon: <Fish className="w-6 h-6" />,
                step: '3',
                title: 'Fish',
                desc: 'Get your confirmation, check rules and facilities, and enjoy your day on the water.'
              }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED INSTRUCTORS (Compact) ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Fishing Guides & Instructors</h2>
              <p className="text-stone-600 mt-1">Learn from the UK's best</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => scrollInstructors('left')}
                  className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center hover:bg-stone-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollInstructors('right')}
                  className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center hover:bg-stone-200 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={instructorCarouselRef}
            className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide custom-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {instructors.map((i) => (
              <div key={i.id} style={{ scrollSnapAlign: 'start' }}>
                <InstructorCardCompact
                  instructor={i}
                  onClick={() => onSelectInstructor(i)}
                  isFavourite={favouriteInstructors.includes(i.id)}
                  onToggleFavourite={onToggleFavouriteInstructor}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => onSelectInstructor(null)}
              className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 font-medium"
            >
              View All Instructors <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-900 mb-10">What Anglers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-700 mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-medium text-stone-900">{t.name}</p>
                  <p className="text-stone-500 text-sm">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Fish className="w-6 h-6" />
                <span className="text-xl font-bold">TightLines</span>
              </div>
              <p className="text-sm leading-relaxed">
                The UK's premier fishing booking platform. Find and book your perfect day on the water.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Anglers</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={onSearch} className="hover:text-white transition">Search Waters</button></li>
                <li><button onClick={() => onSelectInstructor(null)} className="hover:text-white transition">Find Instructors</button></li>
                <li><button className="hover:text-white transition">Gift Vouchers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Fisheries</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate && onNavigate('about')} className="hover:text-white transition">List Your Water</button></li>
                <li><button className="hover:text-white transition">Pricing</button></li>
                <li><button className="hover:text-white transition">Success Stories</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate && onNavigate('about')} className="hover:text-white transition">About Us</button></li>
                <li><button onClick={() => onNavigate && onNavigate('contact')} className="hover:text-white transition">Contact</button></li>
                <li><button className="hover:text-white transition">Privacy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 text-sm text-center">
            © 2026 TightLines. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
