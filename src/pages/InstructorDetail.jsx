// ============================================
// INSTRUCTOR DETAIL PAGE
// Mirrors VenueDetail layout exactly — adapted for instructors
// ============================================
import { useState, useEffect } from 'react';
import {
  ChevronLeft, MapPin, Star, Check, Clock, Phone, Mail, Globe,
  Calendar, Heart, Shield, Award, Users
} from 'lucide-react';
import { PhotoCarousel } from '../components/common/PhotoCarousel';
import { DatePickerCalendar } from '../components/common/DatePickerCalendar';
import { CertificationBadgeList } from '../components/common/CertificationBadge';
import { TypicalDay } from '../components/sections/TypicalDay';
import { ReviewsList } from '../components/sections/ReviewsList';
import { ReviewForm } from '../components/forms/ReviewForm';

const specialtyColors = {
  'Atlantic Salmon': 'bg-cyan-50 text-cyan-700', 'Salmon': 'bg-cyan-50 text-cyan-700',
  'Spey Casting': 'bg-blue-50 text-blue-700', 'Fly Fishing': 'bg-blue-50 text-blue-700',
  'Trout': 'bg-green-50 text-green-700', 'Wild Brown Trout': 'bg-green-50 text-green-700',
  'Sea Fishing': 'bg-teal-50 text-teal-700', 'Sea Trout': 'bg-teal-50 text-teal-700',
  'Carp': 'bg-amber-50 text-amber-700', 'Pike': 'bg-amber-50 text-amber-700',
  'Coarse': 'bg-lime-50 text-lime-700', 'Stillwater': 'bg-sky-50 text-sky-700',
  'Beginners': 'bg-purple-50 text-purple-700', "Women's Courses": 'bg-pink-50 text-pink-700',
  'Dry Fly': 'bg-emerald-50 text-emerald-700', 'Tenkara': 'bg-orange-50 text-orange-700',
  'Scottish Rivers': 'bg-indigo-50 text-indigo-700', 'Small Streams': 'bg-teal-50 text-teal-700',
  'Bass': 'bg-sky-50 text-sky-700', 'Shore Fishing': 'bg-teal-50 text-teal-700',
  'Carp Fishing': 'bg-amber-50 text-amber-700', 'Fly Tying': 'bg-violet-50 text-violet-700',
  'Kids/Juniors': 'bg-orange-50 text-orange-700', 'Barbel': 'bg-amber-50 text-amber-700',
};

const verifiedCerts = ['AAPGAI', 'GAIA', 'SGAIC', 'Angling Trust'];
const isVerified = (inst) =>
  (inst.certifications || []).some(c => verifiedCerts.some(vc => c.includes(vc)));

const baseTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'learn', label: 'What You Learn' },
  { id: 'day', label: 'Typical Day' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'reviews', label: 'Reviews' }
];

// Booking option category colors (matches VenueDetail)
const categoryColors = {
  'session': { bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200', activeBg: 'bg-brand-100', activeBorder: 'border-brand-500' },
  'day': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', activeBg: 'bg-amber-100', activeBorder: 'border-amber-500' },
  'hour': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', activeBg: 'bg-blue-100', activeBorder: 'border-blue-500' },
  'person': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', activeBg: 'bg-purple-100', activeBorder: 'border-purple-500' },
};

export const InstructorDetailPage = ({ instructor, onBack, user, onSignIn, isFavourite, onToggleFavourite }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', preferredDates: '', message: ''
  });
  const [hasBooking, setHasBooking] = useState(false);

  // Check if user has a confirmed booking with this instructor
  useEffect(() => {
    if (!user || !instructor.id) return;
    const token = localStorage.getItem('anglersnet_token');
    if (!token) return;
    fetch('/api/inquiries/user', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.inquiries) {
          const match = data.inquiries.some(i => i.instructorId === instructor.id && i.status === 'confirmed');
          setHasBooking(match);
        }
      })
      .catch(() => {});
  }, [user, instructor.id]);

  const verified = isVerified(instructor);
  const hasGallery = instructor.gallery && instructor.gallery.length > 1;
  const tabs = hasGallery
    ? [...baseTabs.slice(0, 4), { id: 'gallery', label: 'Gallery' }, baseTabs[4]]
    : baseTabs;
  const hasBookingOptions = instructor.bookingOptions && instructor.bookingOptions.length > 0;
  const activeOption = hasBookingOptions
    ? instructor.bookingOptions.find(o => o.id === selectedOption) || instructor.bookingOptions[0]
    : null;

  const getLowestPrice = () => {
    if (!hasBookingOptions) return instructor.price;
    const prices = instructor.bookingOptions.map(o => parseInt(o.price)).filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.min(...prices) : instructor.price;
  };

  const handleBooking = async () => {
    if (!user) { onSignIn(); return; }
    setBookingLoading(true);
    setBookingError('');
    try {
      const token = localStorage.getItem('anglersnet_token');
      const msgParts = [];
      if (experienceLevel) msgParts.push(`Experience: ${experienceLevel}`);
      if (enquiryMessage) msgParts.push(enquiryMessage);
      if (contactForm.message) msgParts.push(contactForm.message);
      if (contactForm.preferredDates) msgParts.push(`Preferred dates: ${contactForm.preferredDates}`);

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          instructorId: instructor.id,
          bookingOptionId: activeOption?.id || null,
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : contactForm.preferredDates || new Date().toISOString().split('T')[0],
          startDate: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
          numberOfDays: 1,
          anglerName: contactForm.name || user.fullName || user.name || user.email,
          anglerEmail: contactForm.email || user.email,
          anglerPhone: contactForm.phone || user.phone || '',
          message: msgParts.join('. '),
          type: instructor.hasCalendar ? 'booking' : 'enquiry'
        })
      });
      if (res.ok) {
        setBookingSubmitted(true);
      } else {
        const data = await res.json();
        setBookingError(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setBookingError('Failed to submit. Please check your connection and try again.');
    }
    setBookingLoading(false);
  };

  // Success state
  if (bookingSubmitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {instructor.hasCalendar ? 'Booking Request Sent!' : 'Message Sent!'}
          </h2>
          <p className="text-stone-600 mb-6">
            {instructor.name} will review your request and get back to you within 24-48 hours.
          </p>
          <button onClick={onBack} className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800">
            Back to Instructors
          </button>
        </div>
      </div>
    );
  }

  // Convert availability array to object for DatePicker
  const availabilityObject = {};
  if (instructor.availability && Array.isArray(instructor.availability)) {
    instructor.availability.forEach(date => {
      if (typeof date === 'string' && date.match(/^\d{4}-/)) {
        availabilityObject[date] = { status: 'available', price: instructor.price };
      }
    });
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Image / Carousel — exact same as VenueDetail */}
      <div className="relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/90 rounded-lg flex items-center gap-2 text-stone-700 hover:bg-white transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {onToggleFavourite && (
          <button
            onClick={() => onToggleFavourite(instructor.id)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition shadow-sm"
          >
            <Heart className={`w-5 h-5 transition ${isFavourite ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} />
          </button>
        )}
        <PhotoCarousel images={instructor.gallery || [instructor.image]} alt={instructor.name} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Header — matches VenueDetail */}
              <div className="p-6 border-b border-stone-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{instructor.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center text-stone-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {instructor.location}
                      </span>
                      {(instructor.rating > 0 || instructor.reviews > 0) ? (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{instructor.rating}</span>
                          <span className="text-stone-400">({instructor.reviews} reviews)</span>
                        </span>
                      ) : (
                        <span className="text-stone-400 text-sm">New listing</span>
                      )}
                      {verified && (
                        <span className="flex items-center gap-1 text-green-700 text-sm font-medium">
                          <Shield className="w-4 h-4" /> Verified
                        </span>
                      )}
                      {instructor.website && (
                        <a
                          href={`https://${instructor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-600 hover:text-brand-800 text-sm"
                        >
                          <Globe className="w-4 h-4" /> Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {/* Specialties — like species pills on VenueDetail */}
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((s) => (
                    <span key={s} className={`px-3 py-1 ${specialtyColors[s] || 'bg-brand-50 text-brand-700'} rounded-full text-sm`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tabs — exact same pattern as VenueDetail */}
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
                    {tab.id === 'reviews' && instructor.reviewsList && (
                      <span className="ml-1 text-stone-400">({instructor.reviewsList.length})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab — like VenueDetail overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">About {instructor.name.split(' ')[0]}</h3>
                      <p className="text-stone-600 whitespace-pre-line">{instructor.fullBio || instructor.bio}</p>
                    </div>

                    {instructor.teachingPhilosophy && (
                      <div className="bg-brand-50 rounded-xl p-5 border-l-4 border-brand-500">
                        <h3 className="font-semibold text-brand-800 mb-2">Teaching Philosophy</h3>
                        <p className="text-brand-700 italic">"{instructor.teachingPhilosophy}"</p>
                      </div>
                    )}

                    {/* Quick info grid — like VenueDetail season info */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">At a Glance</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-brand-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-stone-900 text-sm">Location</h4>
                            <p className="text-sm text-stone-500">{instructor.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-brand-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-stone-900 text-sm">Booking</h4>
                            <p className="text-sm text-stone-500">
                              {instructor.hasCalendar ? 'Calendar booking available' : 'Contact for availability'}
                            </p>
                          </div>
                        </div>
                        {instructor.experience && (
                          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <Award className="w-5 h-5 text-amber-700" />
                            </div>
                            <div>
                              <h4 className="font-medium text-stone-900 text-sm">Experience</h4>
                              <p className="text-sm text-stone-500">{instructor.experience} years</p>
                            </div>
                          </div>
                        )}
                        {instructor.certifications?.length > 0 && (
                          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                              <Shield className="w-5 h-5 text-green-700" />
                            </div>
                            <div>
                              <h4 className="font-medium text-stone-900 text-sm">Credentials</h4>
                              <p className="text-sm text-stone-500">{instructor.certifications.length} certification{instructor.certifications.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* What You Learn Tab — like Species & Records */}
                {activeTab === 'learn' && (
                  <div className="space-y-6">
                    {instructor.whatYouLearn && instructor.whatYouLearn.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">What You'll Learn</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {instructor.whatYouLearn.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Check className="w-5 h-5 text-green-700" />
                              </div>
                              <div>
                                <p className="text-stone-700">{item}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {instructor.equipmentProvided && instructor.equipmentProvided.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Equipment Provided</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {instructor.equipmentProvided.map((e) => (
                            <div key={e} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Check className="w-4 h-4 text-blue-700" />
                              </div>
                              <span className="text-stone-700">{e}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!instructor.whatYouLearn || instructor.whatYouLearn.length === 0) &&
                     (!instructor.equipmentProvided || instructor.equipmentProvided.length === 0) && (
                      <p className="text-stone-500">Contact {instructor.name.split(' ')[0]} to learn more about what's covered in sessions.</p>
                    )}
                  </div>
                )}

                {/* Typical Day Tab — like Facilities */}
                {activeTab === 'day' && (
                  <div>
                    {instructor.typicalDay && instructor.typicalDay.length > 0 ? (
                      <TypicalDay itinerary={instructor.typicalDay} />
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-stone-700 mb-2">Session Structure</h3>
                        <p className="text-stone-500">
                          Contact {instructor.name.split(' ')[0]} to discuss the structure of your session.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Credentials Tab — like Rules tab */}
                {activeTab === 'credentials' && (
                  <div className="space-y-6">
                    {instructor.certifications && instructor.certifications.length > 0 ? (
                      <div>
                        <h3 className="font-semibold text-lg mb-4">Qualifications & Certifications</h3>
                        <CertificationBadgeList certifications={instructor.certifications} />
                      </div>
                    ) : (
                      <p className="text-stone-500">No certifications listed yet.</p>
                    )}

                    {instructor.experience && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <h4 className="font-semibold text-amber-800 mb-1">Teaching Experience</h4>
                        <p className="text-amber-700">{instructor.experience} years of professional instructing experience</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Gallery Tab — only shown if multiple images */}
                {activeTab === 'gallery' && hasGallery && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {instructor.gallery.map((img, i) => (
                        <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                          <img
                            src={img}
                            alt={`${instructor.name} - Photo ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Tab — exact same as VenueDetail */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <ReviewForm instructorId={instructor.id} user={user} hasBooking={hasBooking} onSuccess={() => {}} />
                    <ReviewsList reviews={instructor.reviewsList || []} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar — mirrors VenueDetail structure */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">

              {/* Multi-option booking (if instructor has booking_options) */}
              {hasBookingOptions ? (
                <div className="space-y-4">
                  {/* Header price */}
                  <div className="text-center mb-2">
                    <span className="text-sm text-stone-500">From</span>
                    <span className="text-3xl font-bold text-stone-900 ml-2">£{getLowestPrice()}</span>
                    <span className="text-stone-500 ml-1">
                      /{instructor.bookingOptions.find(o => parseInt(o.price) === getLowestPrice())?.priceType || 'session'}
                    </span>
                  </div>

                  {verified && (
                    <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg border border-green-200">
                      <Shield className="w-4 h-4 text-green-700" />
                      <span className="text-sm font-medium text-green-700">Verified Instructor</span>
                    </div>
                  )}

                  {/* Option tiles — same pattern as VenueDetail */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-stone-700">Choose a session:</p>
                    {instructor.bookingOptions.map((opt) => {
                      const colors = categoryColors[opt.priceType] || categoryColors['session'];
                      const isSelected = selectedOption === opt.id ||
                        (!selectedOption && instructor.bookingOptions[0]?.id === opt.id);

                      return (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedOption(opt.id)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `${colors.activeBg} ${colors.activeBorder} shadow-sm`
                              : `bg-white border-stone-200 hover:border-stone-300`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-stone-900 text-sm">{opt.name}</span>
                              {opt.description && (
                                <p className="text-xs text-stone-500 mt-0.5 truncate">{opt.description}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <span className="font-bold text-stone-900">£{opt.price}</span>
                              <span className="text-stone-500 text-xs ml-0.5">/{opt.priceType || 'session'}</span>
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
                    })}
                  </div>

                  {/* Calendar & booking form */}
                  {activeOption && (
                    <div className="space-y-3 pt-2">
                      {instructor.hasCalendar && (
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Select Date</label>
                          <DatePickerCalendar
                            selected={selectedDate}
                            onChange={setSelectedDate}
                            availability={availabilityObject}
                            placeholder="Choose your session date"
                            showPrice={false}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Experience Level</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                        >
                          <option value="">Select level</option>
                          <option value="beginner">Complete Beginner</option>
                          <option value="some">Some Experience</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Message (optional)</label>
                        <textarea
                          rows={3}
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                          placeholder="What would you like to focus on?"
                        />
                      </div>

                      {bookingError && <p className="text-red-600 text-sm">{bookingError}</p>}
                      <button
                        onClick={handleBooking}
                        disabled={bookingLoading || (instructor.hasCalendar && !selectedDate)}
                        className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {bookingLoading ? 'Submitting...' : !user ? 'Sign In to Book' : `Book ${activeOption.name}`}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Single price / contact form — fallback */
                <>
                  {/* Verified badge */}
                  {verified && (
                    <div className="flex items-center justify-center gap-2 mb-4 py-2.5 bg-green-50 rounded-xl border border-green-200">
                      <Shield className="w-4 h-4 text-green-700" />
                      <span className="text-sm font-medium text-green-700">Verified Instructor</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-stone-900">£{instructor.price}</span>
                    <span className="text-stone-500 ml-1">/{instructor.priceType}</span>
                  </div>

                  {/* Calendar booking */}
                  {instructor.hasCalendar ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Select Date</label>
                        <DatePickerCalendar
                          selected={selectedDate}
                          onChange={setSelectedDate}
                          availability={availabilityObject}
                          placeholder="Choose your session date"
                          showPrice={false}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Experience Level</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                        >
                          <option value="">Select level</option>
                          <option value="beginner">Complete Beginner</option>
                          <option value="some">Some Experience</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Message (optional)</label>
                        <textarea
                          rows={3}
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                          placeholder="What would you like to focus on?"
                        />
                      </div>

                      {bookingError && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{bookingError}</div>}
                      <button
                        onClick={handleBooking}
                        disabled={!selectedDate || bookingLoading}
                        className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {bookingLoading ? 'Sending...' : user ? 'Request Booking' : 'Sign In to Book'}
                      </button>
                      <p className="text-center text-sm text-stone-500">You won't be charged yet</p>
                    </div>
                  ) : (
                    /* Contact-only form */
                    <div className="space-y-4">
                      <p className="text-sm text-stone-600 text-center">
                        Contact {instructor.name.split(' ')[0]} to discuss availability and book your session.
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Your Name *</label>
                        <input type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="John Smith" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Email *</label>
                        <input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                        <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="07123 456789" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Preferred Dates</label>
                        <input type="text" value={contactForm.preferredDates} onChange={(e) => setContactForm({ ...contactForm, preferredDates: e.target.value })} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="e.g. Weekends in March" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Message *</label>
                        <textarea rows={3} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl" placeholder="Tell them about your experience level and what you'd like to learn..." />
                      </div>

                      {bookingError && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{bookingError}</div>}
                      <button
                        onClick={handleBooking}
                        disabled={bookingLoading}
                        className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 transition"
                      >
                        {bookingLoading ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Contact info */}
              {(instructor.email || instructor.phone) && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <p className="text-sm text-stone-500 mb-2">Questions? Contact</p>
                  <p className="font-medium text-stone-800">{instructor.name}</p>
                  {instructor.email && (
                    <a href={`mailto:${instructor.email}`} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 mt-1">
                      <Mail className="w-4 h-4" /> {instructor.email}
                    </a>
                  )}
                  {instructor.phone && (
                    <a href={`tel:${instructor.phone}`} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 mt-1">
                      <Phone className="w-4 h-4" /> {instructor.phone}
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

export default InstructorDetailPage;
