// ============================================
// INSTRUCTOR DETAIL PAGE
// Enhanced instructor profile with gallery, badges, reviews, typical day
// Visual polish to match VenueDetail quality
// ============================================
import { useState } from 'react';
import {
  ChevronLeft, MapPin, Star, Check, Globe, Phone, Mail, Calendar,
  Award, Shield
} from 'lucide-react';
import { PhotoCarousel } from '../components/common/PhotoCarousel';
import { DatePickerCalendar } from '../components/common/DatePickerCalendar';
import { CertificationBadgeList } from '../components/common/CertificationBadge';
import { TypicalDay } from '../components/sections/TypicalDay';
import { ReviewsList } from '../components/sections/ReviewsList';
import { ReviewForm } from '../components/forms/ReviewForm';

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

const specialtyIcons = {
  'Atlantic Salmon': '🐟', 'Spey Casting': '🎣', 'Scottish Rivers': '🏔️',
  'Trout': '🐟', 'Stillwater': '🌊', 'Beginners': '👋',
  "Women's Courses": '👩', 'Carp': '🐟', 'Pike': '🐟',
  'Wild Brown Trout': '🐟', 'Small Streams': '🏞️', 'Dry Fly': '🪰', 'Tenkara': '🎋'
};

const verifiedCerts = ['AAPGAI', 'GAIA', 'SGAIC', 'Angling Trust'];
const isVerified = (inst) =>
  (inst.certifications || []).some(c => verifiedCerts.some(vc => c.includes(vc)));

export const InstructorDetailPage = ({ instructor, onBack, user, onSignIn }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [message, setMessage] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', preferredDates: '', message: ''
  });

  const verified = isVerified(instructor);

  // Dynamic tabs — add Gallery if multiple images
  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'learn', label: 'What You Learn' },
    { id: 'day', label: 'Typical Day' },
    { id: 'reviews', label: 'Reviews' },
    ...(instructor.gallery && instructor.gallery.length > 1
      ? [{ id: 'gallery', label: 'Gallery' }]
      : [])
  ];

  const handleBooking = async () => {
    if (!user) { onSignIn(); return; }
    setBookingLoading(true);
    setBookingError('');
    try {
      const token = localStorage.getItem('tightlines_token');
      const msgParts = [];
      if (experienceLevel) msgParts.push(`Experience: ${experienceLevel}`);
      if (message) msgParts.push(message);
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
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800"
          >
            Back to Instructors
          </button>
        </div>
      </div>
    );
  }

  // Convert availability array to object for DatePicker
  const availabilityObject = {};
  if (instructor.availability) {
    instructor.availability.forEach(date => {
      availabilityObject[date] = { status: 'available', price: instructor.price };
    });
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Gallery */}
      <div className="relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-2 text-stone-700 hover:bg-white transition shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        {instructor.gallery && instructor.gallery.length > 1 ? (
          <PhotoCarousel images={instructor.gallery} alt={instructor.name} />
        ) : (
          <div
            className="h-56 md:h-72 relative"
            style={{ background: instructor.image }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 pb-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Profile info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h1 className="text-2xl font-bold text-stone-900">{instructor.name}</h1>
                    <p className="text-brand-600 font-medium">{instructor.title}</p>
                  </div>
                  {verified && (
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1 flex-shrink-0">
                      <Shield className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center text-stone-500 mb-4 mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{instructor.location}</span>
                  {instructor.website && (
                    <>
                      <span className="mx-2 text-stone-300">·</span>
                      <a
                        href={`https://${instructor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-brand-600 hover:text-brand-800"
                      >
                        <Globe className="w-4 h-4" /> Website
                      </a>
                    </>
                  )}
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-stone-200 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-900 flex items-center justify-center gap-1">
                      {instructor.rating}
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="text-xs text-stone-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-900">{instructor.reviews}</div>
                    <div className="text-xs text-stone-500">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-900">{instructor.certifications?.length || 0}</div>
                    <div className="text-xs text-stone-500 flex items-center justify-center gap-1">
                      <Award className="w-3 h-3" /> Credentials
                    </div>
                  </div>
                </div>

                {/* Color-coded specialties */}
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((s) => {
                    const colorClass = specialtyColors[s] || 'bg-brand-50 text-brand-700';
                    return (
                      <span
                        key={s}
                        className={`px-3 py-1.5 ${colorClass} text-sm rounded-full flex items-center gap-1`}
                      >
                        {specialtyIcons[s] && <span>{specialtyIcons[s]}</span>}
                        {s}
                      </span>
                    );
                  })}
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
                    {tab.id === 'reviews' && instructor.reviewsList && (
                      <span className="ml-1 text-stone-400">({instructor.reviewsList.length})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {/* Quick info cards */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                        <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-brand-700" />
                        </div>
                        <div>
                          <div className="text-xs text-stone-500">Location</div>
                          <div className="text-sm font-medium text-stone-900">{instructor.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                        <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-brand-700" />
                        </div>
                        <div>
                          <div className="text-xs text-stone-500">Booking</div>
                          <div className="text-sm font-medium text-stone-900">
                            {instructor.hasCalendar ? 'Calendar booking available' : 'Contact for availability'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        About {instructor.name.split(' ')[0]}
                      </h3>
                      <p className="text-stone-600 whitespace-pre-line leading-relaxed">{instructor.fullBio}</p>
                    </div>

                    {instructor.teachingPhilosophy && (
                      <div className="bg-brand-50 rounded-xl p-5 border-l-4 border-brand-500">
                        <h3 className="font-semibold text-brand-800 mb-2">Teaching Philosophy</h3>
                        <p className="text-brand-700 italic">"{instructor.teachingPhilosophy}"</p>
                      </div>
                    )}

                    {instructor.certifications && instructor.certifications.length > 0 && (
                      <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5" /> Qualifications & Certifications
                        </h3>
                        <CertificationBadgeList certifications={instructor.certifications} />
                      </div>
                    )}
                  </div>
                )}

                {/* What You Learn Tab */}
                {activeTab === 'learn' && (
                  <div className="space-y-6">
                    {instructor.whatYouLearn && instructor.whatYouLearn.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-4">What You'll Learn</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {instructor.whatYouLearn.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-4 h-4 text-green-700" />
                              </div>
                              <span className="text-stone-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {instructor.equipmentProvided && instructor.equipmentProvided.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-3">Equipment Provided</h3>
                        <div className="flex flex-wrap gap-2">
                          {instructor.equipmentProvided.map((e) => (
                            <span
                              key={e}
                              className="px-3 py-1.5 bg-white text-blue-700 rounded-full text-sm border border-blue-200"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Typical Day Tab */}
                {activeTab === 'day' && (
                  <div>
                    {instructor.typicalDay && instructor.typicalDay.length > 0 ? (
                      <TypicalDay itinerary={instructor.typicalDay} />
                    ) : (
                      <p className="text-stone-500">
                        Contact {instructor.name.split(' ')[0]} to discuss the structure of your session.
                      </p>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <ReviewForm instructorId={instructor.id} user={user} onSuccess={() => {}} />
                    <ReviewsList reviews={instructor.reviewsList || []} />
                  </div>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && instructor.gallery && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {instructor.gallery.map((img, i) => (
                        <div
                          key={i}
                          className="aspect-[4/3] rounded-xl overflow-hidden"
                          style={{ background: img, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">
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

              {/* Calendar-based booking */}
              {instructor.hasCalendar ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Select Date
                    </label>
                    <DatePickerCalendar
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      availability={availabilityObject}
                      placeholder="Choose your session date"
                      showPrice={false}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Your Experience Level
                    </label>
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
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                      placeholder="Tell them what you'd like to focus on..."
                    />
                  </div>

                  {bookingError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                      {bookingError}
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate || bookingLoading}
                    className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {bookingLoading ? 'Sending...' : user ? 'Request Booking' : 'Sign In to Book'}
                  </button>
                  <p className="text-center text-sm text-stone-500">
                    You won't be charged yet
                  </p>
                </div>
              ) : (
                /* Contact-only form */
                <div className="space-y-4">
                  <p className="text-sm text-stone-600 text-center mb-4">
                    Contact {instructor.name.split(' ')[0]} to discuss availability and book your session.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                      placeholder="07123 456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Preferred Dates
                    </label>
                    <input
                      type="text"
                      value={contactForm.preferredDates}
                      onChange={(e) => setContactForm({ ...contactForm, preferredDates: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                      placeholder="e.g. Weekends in March"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                      placeholder="Tell them about your experience level and what you'd like to learn..."
                    />
                  </div>

                  {bookingError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                      {bookingError}
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 transition"
                  >
                    {bookingLoading ? 'Sending...' : 'Send Message'}
                  </button>
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
