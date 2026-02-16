// ============================================
// INSTRUCTOR DETAIL PAGE
// Enhanced instructor profile with gallery, badges, reviews, typical day
// ============================================
import { useState } from 'react';
import {
  ChevronLeft, MapPin, Star, Check, Globe, Phone, Mail, Calendar
} from 'lucide-react';
import { PhotoCarousel } from '../components/common/PhotoCarousel';
import { DatePickerCalendar } from '../components/common/DatePickerCalendar';
import { CertificationBadgeList } from '../components/common/CertificationBadge';
import { TypicalDay } from '../components/sections/TypicalDay';
import { ReviewsList } from '../components/sections/ReviewsList';
import { ReviewForm } from '../components/forms/ReviewForm';

const tabs = [
  { id: 'about', label: 'About' },
  { id: 'learn', label: 'What You Learn' },
  { id: 'day', label: 'Typical Day' },
  { id: 'reviews', label: 'Reviews' }
];

// Specialty icons (could be expanded)
const specialtyIcons = {
  'Atlantic Salmon': '🐟',
  'Spey Casting': '🎣',
  'Scottish Rivers': '🏔️',
  'Trout': '🐟',
  'Stillwater': '🌊',
  'Beginners': '👋',
  "Women's Courses": '👩',
  'Carp': '🐟',
  'Pike': '🐟',
  'Wild Brown Trout': '🐟',
  'Small Streams': '🏞️',
  'Dry Fly': '🪰',
  'Tenkara': '🎋'
};

export const InstructorDetailPage = ({ instructor, onBack, user, onSignIn }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [message, setMessage] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDates: '',
    message: ''
  });

  const handleBooking = () => {
    if (!user) {
      onSignIn();
      return;
    }
    setBookingSubmitted(true);
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
      {/* Header */}
      <div className="bg-brand-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center text-brand-200 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Instructors</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Profile header with gallery */}
              <div className="flex flex-col">
                {/* Gallery */}
                {instructor.gallery && instructor.gallery.length > 1 ? (
                  <PhotoCarousel images={instructor.gallery} alt={instructor.name} />
                ) : (
                  <div
                    className="h-48 md:h-64"
                    style={{ background: instructor.image }}
                  />
                )}

                {/* Profile info */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-stone-900">{instructor.name}</h1>
                  <p className="text-brand-600 font-medium mb-2">{instructor.title}</p>

                  <div className="flex items-center text-stone-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{instructor.location}</span>
                  </div>

                  {/* Specialties with icons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {instructor.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 bg-brand-50 text-brand-700 text-sm rounded-full flex items-center gap-1"
                      >
                        {specialtyIcons[s] && <span>{specialtyIcons[s]}</span>}
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Rating and website */}
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{instructor.rating}</span>
                      <span className="text-stone-400">({instructor.reviews} reviews)</span>
                    </span>
                    {instructor.website && (
                      <a
                        href={`https://${instructor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-brand-600 hover:text-brand-800"
                      >
                        <Globe className="w-4 h-4" /> Website
                      </a>
                    )}
                  </div>
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
                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        About {instructor.name.split(' ')[0]}
                      </h3>
                      <p className="text-stone-600 whitespace-pre-line">{instructor.fullBio}</p>
                    </div>

                    {instructor.teachingPhilosophy && (
                      <div className="bg-brand-50 rounded-xl p-5 border-l-4 border-brand-500">
                        <h3 className="font-semibold text-brand-800 mb-2">Teaching Philosophy</h3>
                        <p className="text-brand-700 italic">"{instructor.teachingPhilosophy}"</p>
                      </div>
                    )}

                    {instructor.certifications && instructor.certifications.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Certifications</h3>
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
                              <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-4 h-4 text-brand-700" />
                              </div>
                              <span className="text-stone-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {instructor.equipmentProvided && instructor.equipmentProvided.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Equipment Provided</h3>
                        <div className="flex flex-wrap gap-2">
                          {instructor.equipmentProvided.map((e) => (
                            <span
                              key={e}
                              className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-full text-sm"
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
                    <ReviewForm instructorId={instructor.id} user={user} onSuccess={() => {
                      // Optionally refresh reviews here
                    }} />
                    <ReviewsList reviews={instructor.reviewsList || []} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">
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

                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate}
                    className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {user ? 'Request Booking' : 'Sign In to Book'}
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

                  <button
                    onClick={handleBooking}
                    className="w-full py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition"
                  >
                    Send Message
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
