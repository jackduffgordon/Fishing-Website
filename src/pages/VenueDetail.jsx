// ============================================
// VENUE DETAIL PAGE
// Enhanced fishery detail page with 6 tabs, map, booking variants
// Now supports multiple booking options as selectable tiles
// ============================================
import { useState } from 'react';
import {
  ChevronLeft, MapPin, Star, Check, Clock, Phone, Mail, ExternalLink,
  Car, Coffee, Fish, Accessibility, Moon, Users, Home, Calendar, Tag, Heart
} from 'lucide-react';
import { PhotoCarousel } from '../components/common/PhotoCarousel';
import { DatePickerCalendar, DateRangePicker } from '../components/common/DatePickerCalendar';
import { WhatToExpect } from '../components/sections/WhatToExpect';
import { ReviewsList } from '../components/sections/ReviewsList';
import { ReviewForm } from '../components/forms/ReviewForm';
import { CatchReportForm } from '../components/forms/CatchReportForm';
import { CatchesList } from '../components/sections/CatchesList';
import { NearbyStaysMap, MapLegend } from '../components/maps/NearbyStaysMap';
import { AccommodationCard } from '../components/cards/AccommodationCard';

// Facility icons mapping
const facilityIcons = {
  'parking': Car,
  'toilets': Home,
  'cafe': Coffee,
  'tackle-shop': Fish,
  'boat-hire': Fish,
  'disabled-access': Accessibility,
  'night-fishing': Moon,
  'showers': Home,
  'fishing-hut': Home,
  'ghillie': Users,
  'lunch': Coffee,
  'wading': Fish,
  'rod-room': Home
};

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'species', label: 'Species & Records' },
  { id: 'catches', label: 'Recent Catches' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'rules', label: 'Rules' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'nearby', label: 'Nearby Stays' }
];

const categoryColors = {
  'day-tickets': { bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200', activeBg: 'bg-brand-100', activeBorder: 'border-brand-500' },
  'guided': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', activeBg: 'bg-amber-100', activeBorder: 'border-amber-500' },
  'accommodation': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', activeBg: 'bg-purple-100', activeBorder: 'border-purple-500' },
  'extras': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', activeBg: 'bg-blue-100', activeBorder: 'border-blue-500' }
};

const categoryLabels = {
  'day-tickets': 'Day Tickets & Passes',
  'guided': 'Guided Experiences',
  'accommodation': 'Accommodation',
  'extras': 'Extras & Add-ons'
};

export const VenueDetailPage = ({ fishery, onBack, user, onSignIn, isFavourite, onToggleFavourite }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);

  // Determine if this fishery uses the new multi-option system
  const hasBookingOptions = fishery.bookingOptions && fishery.bookingOptions.length > 0;

  // Group booking options by category
  const groupedOptions = hasBookingOptions
    ? fishery.bookingOptions.reduce((acc, opt) => {
        const cat = opt.category || 'day-tickets';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(opt);
        return acc;
      }, {})
    : {};

  // Get the currently selected primary option's details
  const activeOption = hasBookingOptions
    ? fishery.bookingOptions.find(o => o.id === selectedPrimary) || fishery.bookingOptions[0]
    : null;

  const handleBooking = () => {
    if (!user) {
      onSignIn();
      return;
    }
    setBookingSubmitted(true);
  };

  // Success state
  if (bookingSubmitted) {
    const isInstant = hasBookingOptions
      ? activeOption?.bookingType === 'instant'
      : fishery.bookingType === 'instant';

    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isInstant ? 'Booking Confirmed!' : 'Enquiry Sent!'}
          </h2>
          <p className="text-stone-600 mb-2">
            {isInstant
              ? `Your booking for ${fishery.name} has been confirmed. Check your email for details.`
              : `Your enquiry has been sent to ${fishery.name}. They'll respond within 24-48 hours.`}
          </p>
          {hasBookingOptions && activeOption && (
            <p className="text-stone-500 text-sm mb-4">
              Option: {activeOption.name} — £{activeOption.price}/{activeOption.priceType}
            </p>
          )}
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  // Get selected price from availability
  const getSelectedPrice = () => {
    if (hasBookingOptions && activeOption) return activeOption.price;
    if (!selectedDate || !fishery.availability) return fishery.price;
    const dateStr = selectedDate.toISOString().split('T')[0];
    return fishery.availability[dateStr]?.price || fishery.price;
  };

  // Get the cheapest option price for display
  const getLowestPrice = () => {
    if (!hasBookingOptions) return fishery.price;
    const prices = fishery.bookingOptions.map(o => parseInt(o.price)).filter(p => !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : fishery.price;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Image / Carousel */}
      <div className="relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/90 rounded-lg flex items-center gap-2 text-stone-700 hover:bg-white transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {onToggleFavourite && (
          <button
            onClick={() => onToggleFavourite(fishery.id)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition shadow-sm"
          >
            <Heart className={`w-5 h-5 transition ${isFavourite ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} />
          </button>
        )}
        <PhotoCarousel images={fishery.gallery || [fishery.image]} alt={fishery.name} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-stone-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{fishery.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center text-stone-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {fishery.location}, {fishery.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{fishery.rating}</span>
                        <span className="text-stone-400">({fishery.reviews} reviews)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fishery.species.map((s) => (
                    <span key={s} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-stone-200 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium capitalize transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-brand-700 border-b-2 border-brand-700'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'reviews' && fishery.reviewsList && (
                      <span className="ml-1 text-stone-400">({fishery.reviewsList.length})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">About This Water</h3>
                      <p className="text-stone-600 whitespace-pre-line">{fishery.fullDescription}</p>
                    </div>

                    {fishery.season && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Season</h3>
                        <div className="flex items-center gap-2 text-stone-600 mb-2">
                          <Calendar className="w-5 h-5 text-brand-600" />
                          <span>Opens: <strong>{fishery.season.opens}</strong></span>
                          <span className="mx-2">•</span>
                          <span>Closes: <strong>{fishery.season.closes}</strong></span>
                        </div>
                        {fishery.season.bestMonths && (
                          <p className="text-stone-600">
                            Best months: <strong>{fishery.season.bestMonths.join(', ')}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    <WhatToExpect fishery={fishery} />
                  </div>
                )}

                {/* Species & Records Tab */}
                {activeTab === 'species' && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg mb-3">Target Species</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {fishery.species.map((species) => (
                        <div key={species} className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                            <Fish className="w-6 h-6 text-brand-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-stone-900">{species}</h4>
                            <p className="text-sm text-stone-500">Available year-round</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {fishery.expectations?.recordFish && (
                      <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <h4 className="font-semibold text-amber-800 mb-1">Record Fish</h4>
                        <p className="text-amber-700">{fishery.expectations.recordFish}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Facilities Tab */}
                {activeTab === 'facilities' && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                    {fishery.amenities && fishery.amenities.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {fishery.amenities.map((amenity) => {
                          const iconKey = amenity.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
                          const Icon = facilityIcons[iconKey] || Check;
                          return (
                            <div key={amenity} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Icon className="w-4 h-4 text-green-700" />
                              </div>
                              <span className="text-stone-700">{amenity}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-stone-500">Contact the fishery for facility information.</p>
                    )}

                    {fishery.rods && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-2">Rod Allocation</h4>
                        <p className="text-stone-600">{fishery.rods} rods available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Rules Tab */}
                {activeTab === 'rules' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Fishery Rules</h3>
                    {fishery.rules && fishery.rules.length > 0 ? (
                      <ul className="space-y-3">
                        {fishery.rules.map((rule, i) => (
                          <li key={i} className="flex items-start gap-3 text-stone-600">
                            <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-brand-700 text-sm font-medium">{i + 1}</span>
                            </span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-stone-500">Contact the fishery for specific rules.</p>
                    )}
                  </div>
                )}

                {/* Catches Tab */}
                {activeTab === 'catches' && (
                  <div className="space-y-8">
                    <CatchReportForm
                      waterId={fishery.id}
                      waterName={fishery.name}
                      user={user}
                      onSuccess={() => {
                        // Optionally refresh catches here
                      }}
                    />
                    <CatchesList waterId={fishery.id} />
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <ReviewForm waterId={fishery.id} user={user} onSuccess={() => {
                      // Optionally refresh reviews here
                    }} />
                    <ReviewsList reviews={fishery.reviewsList || []} />
                  </div>
                )}

                {/* Nearby Stays Tab */}
                {activeTab === 'nearby' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Nearby Accommodation</h3>
                      <p className="text-stone-600 mb-4">
                        Find places to stay within 10 miles of {fishery.name}.
                      </p>

                      {fishery.coordinates && (
                        <>
                          <NearbyStaysMap
                            waterCoordinates={fishery.coordinates}
                            waterName={fishery.name}
                            nearbyStays={fishery.nearbyStays || []}
                          />
                          <MapLegend />
                        </>
                      )}
                    </div>

                    {fishery.nearbyStays && fishery.nearbyStays.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-4">Featured Stays</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fishery.nearbyStays.map((stay) => (
                            <AccommodationCard key={stay.id} accommodation={stay} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">

              {/* ============================================ */}
              {/* NEW: Multi-option booking tiles */}
              {/* ============================================ */}
              {hasBookingOptions ? (
                <div className="space-y-4">
                  {/* Header price */}
                  <div className="text-center mb-2">
                    <span className="text-sm text-stone-500">From</span>
                    <span className="text-3xl font-bold text-stone-900 ml-2">
                      £{getLowestPrice()}
                    </span>
                    <span className="text-stone-500 ml-1">
                      /{fishery.bookingOptions.find(o => parseInt(o.price) === getLowestPrice())?.priceType || 'day'}
                    </span>
                  </div>

                  {/* Option tiles grouped by category */}
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-stone-700">Choose an option:</p>

                    {Object.entries(groupedOptions).map(([catId, options]) => {
                      const isExtrasCategory = catId === 'extras';

                      return (
                        <div key={catId}>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${(categoryColors[catId] || categoryColors['day-tickets']).text}`}>
                            {categoryLabels[catId] || catId}
                          </p>
                          <div className="space-y-2">
                            {options.map((opt) => {
                              const colors = categoryColors[opt.category] || categoryColors['day-tickets'];

                              if (isExtrasCategory) {
                                // Extras: multi-select checkbox style
                                const isSelected = selectedExtras.includes(opt.id);
                                return (
                                  <button
                                    key={opt.id}
                                    onClick={() => {
                                      setSelectedExtras(
                                        isSelected
                                          ? selectedExtras.filter(id => id !== opt.id)
                                          : [...selectedExtras, opt.id]
                                      );
                                    }}
                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                                      isSelected
                                        ? `${colors.activeBg} ${colors.activeBorder} shadow-sm`
                                        : `bg-white border-stone-200 hover:${colors.bg} hover:border-stone-300`
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-stone-900 text-sm">{opt.name}</span>
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            opt.bookingType === 'instant'
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-amber-100 text-amber-700'
                                          }`}>
                                            {opt.bookingType === 'instant' ? 'Book' : 'Enquire'}
                                          </span>
                                        </div>
                                        {opt.description && (
                                          <p className="text-xs text-stone-500 mt-0.5 truncate">{opt.description}</p>
                                        )}
                                      </div>
                                      <div className="text-right flex-shrink-0 ml-3">
                                        <span className="font-bold text-stone-900">£{opt.price}</span>
                                        <span className="text-stone-500 text-xs ml-0.5">/{opt.priceType}</span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="mt-1 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5 text-brand-600" />
                                        <span className="text-xs text-brand-600 font-medium">Added</span>
                                      </div>
                                    )}
                                  </button>
                                );
                              } else {
                                // Primary categories (day-tickets, guided, accommodation): radio style
                                const isSelected = selectedPrimary === opt.id ||
                                  (!selectedPrimary && fishery.bookingOptions[0]?.id === opt.id);

                                return (
                                  <button
                                    key={opt.id}
                                    onClick={() => setSelectedPrimary(opt.id)}
                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                                      isSelected
                                        ? `${colors.activeBg} ${colors.activeBorder} shadow-sm`
                                        : `bg-white border-stone-200 hover:${colors.bg} hover:border-stone-300`
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-stone-900 text-sm">{opt.name}</span>
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            opt.bookingType === 'instant'
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-amber-100 text-amber-700'
                                          }`}>
                                            {opt.bookingType === 'instant' ? 'Book' : 'Enquire'}
                                          </span>
                                        </div>
                                        {opt.description && (
                                          <p className="text-xs text-stone-500 mt-0.5 truncate">{opt.description}</p>
                                        )}
                                      </div>
                                      <div className="text-right flex-shrink-0 ml-3">
                                        <span className="font-bold text-stone-900">£{opt.price}</span>
                                        <span className="text-stone-500 text-xs ml-0.5">/{opt.priceType}</span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="mt-1 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5 text-brand-600" />
                                        <span className="text-xs text-brand-600 font-medium">Selected</span>
                                      </div>
                                    )}
                                  </button>
                                );
                              }
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price summary with extras total */}
                  {(selectedPrimary || activeOption) && selectedExtras.length > 0 && (
                    <div className="pt-3 border-t border-stone-200">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-stone-600">
                          <span>Primary option:</span>
                          <span className="font-medium">£{activeOption?.price || 0}</span>
                        </div>
                        {selectedExtras.map(extraId => {
                          const extra = fishery.bookingOptions.find(o => o.id === extraId);
                          return (
                            <div key={extraId} className="flex justify-between text-stone-600">
                              <span className="ml-2">{extra?.name}:</span>
                              <span className="font-medium">£{extra?.price || 0}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between font-semibold text-stone-900 pt-2 border-t border-stone-200">
                          <span>Total:</span>
                          <span>
                            £{
                              (activeOption?.price || 0) +
                              selectedExtras.reduce((sum, id) => {
                                const extra = fishery.bookingOptions.find(o => o.id === id);
                                return sum + (parseInt(extra?.price) || 0);
                              }, 0)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking action based on selected option's type */}
                  {activeOption && activeOption.bookingType === 'instant' && (
                    <div className="space-y-3 pt-2">
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <label className="block text-sm font-medium text-stone-700 mb-3">
                          Select Date
                        </label>
                        <DatePickerCalendar
                          selected={selectedDate}
                          onChange={setSelectedDate}
                          availability={fishery.availability || {}}
                          placeholder="Choose your fishing date"
                        />
                        <div className="mt-3 pt-3 border-t border-stone-300 space-y-1.5 text-xs text-stone-600">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            <span>Booked</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <span>Closed</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleBooking}
                        disabled={!selectedDate}
                        className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {user ? `Book ${activeOption.name}` : 'Sign In to Book'}
                      </button>
                      <p className="text-center text-sm text-stone-500">
                        <Check className="w-4 h-4 inline mr-1" />
                        Instant confirmation
                      </p>
                    </div>
                  )}

                  {activeOption && activeOption.bookingType === 'enquiry' && (
                    <div className="space-y-3 pt-2">
                      <p className="text-sm text-stone-600 text-center">
                        Send an enquiry to check availability for {activeOption.name}.
                      </p>
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Preferred Date(s)
                          </label>
                          <DateRangePicker
                            startDate={dateRange[0]}
                            endDate={dateRange[1]}
                            onChange={(dates) => setDateRange(dates)}
                            placeholder="Select preferred dates"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            Message
                          </label>
                          <textarea
                            rows={3}
                            value={enquiryMessage}
                            onChange={(e) => setEnquiryMessage(e.target.value)}
                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl bg-white"
                            placeholder="Tell them about your experience, number in party, etc."
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleBooking}
                        className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition"
                      >
                        {user ? `Enquire About ${activeOption.name}` : 'Sign In to Enquire'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ============================================ */
                /* LEGACY: Single booking type (backward compat) */
                /* ============================================ */
                <>
                  {/* Price */}
                  <div className="text-center mb-6">
                    {fishery.price === 0 ? (
                      <span className="text-3xl font-bold text-green-600">Free Access</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-stone-900">
                          £{selectedDate ? getSelectedPrice() : fishery.price}
                        </span>
                        <span className="text-stone-500 ml-1">/{fishery.priceType}</span>
                      </>
                    )}
                  </div>

                  {/* Booking form based on type */}
                  {fishery.bookingType === 'instant' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Select Date
                        </label>
                        <DatePickerCalendar
                          selected={selectedDate}
                          onChange={setSelectedDate}
                          availability={fishery.availability || {}}
                          placeholder="Choose your fishing date"
                        />
                      </div>
                      <button
                        onClick={handleBooking}
                        disabled={!selectedDate}
                        className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {user ? 'Book Now' : 'Sign In to Book'}
                      </button>
                      <p className="text-center text-sm text-stone-500">
                        <Check className="w-4 h-4 inline mr-1" />
                        Instant confirmation
                      </p>
                    </div>
                  )}

                  {fishery.bookingType === 'enquiry' && (
                    <div className="space-y-4">
                      <p className="text-sm text-stone-600 text-center">
                        This is a premium beat with limited availability. Send an enquiry to check dates.
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Preferred Date(s)
                        </label>
                        <DateRangePicker
                          startDate={dateRange[0]}
                          endDate={dateRange[1]}
                          onChange={(dates) => setDateRange(dates)}
                          placeholder="Select preferred dates"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          Message
                        </label>
                        <textarea
                          rows={3}
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                          placeholder="Tell them about your experience, number in party, etc."
                        />
                      </div>
                      <button
                        onClick={handleBooking}
                        className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition"
                      >
                        {user ? 'Send Enquiry' : 'Sign In to Enquire'}
                      </button>
                    </div>
                  )}

                  {fishery.bookingType === 'free' && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-green-800 mb-1">No Booking Required</h4>
                        <p className="text-sm text-green-700">
                          This water is freely accessible with a valid EA rod licence.
                        </p>
                      </div>
                      {fishery.openingHours && (
                        <div className="text-sm text-stone-600">
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <strong>Opening times:</strong>
                          </p>
                          <p className="ml-6">Weekdays: {fishery.openingHours.weekday}</p>
                          <p className="ml-6">Weekends: {fishery.openingHours.weekend}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Contact info */}
              {fishery.contact && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <p className="text-sm text-stone-500 mb-2">Questions? Contact</p>
                  <p className="font-medium text-stone-800">{fishery.contact.name}</p>
                  {fishery.contact.email && (
                    <a
                      href={`mailto:${fishery.contact.email}`}
                      className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 mt-1"
                    >
                      <Mail className="w-4 h-4" />
                      {fishery.contact.email}
                    </a>
                  )}
                  {fishery.contact.phone && (
                    <a
                      href={`tel:${fishery.contact.phone}`}
                      className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 mt-1"
                    >
                      <Phone className="w-4 h-4" />
                      {fishery.contact.phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;
