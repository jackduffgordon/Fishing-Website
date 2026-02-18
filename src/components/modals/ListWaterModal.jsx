// ============================================
// LIST YOUR WATER MODAL COMPONENT
// 4-step submission wizard for fishery owners
// Now supports multiple booking options per water
// ============================================
import { useState } from 'react';
import { X, Check, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ukRegions } from '../../data/regions';
import { registerAPI } from '../../utils/api';

const OPTION_CATEGORIES = [
  { id: 'day-tickets', label: 'Day Tickets & Passes', description: 'Day ticket, half-day, evening, season ticket, syndicate membership' },
  { id: 'guided', label: 'Guided Experiences', description: 'Guided sessions, tuition, corporate days, group bookings' },
  { id: 'accommodation', label: 'Accommodation Packages', description: 'Lodge stays, camping, cabin + fishing combos' },
  { id: 'extras', label: 'Extras & Add-ons', description: 'Tackle hire, bait shop, boat hire, ghillie service' }
];

const OPTION_TEMPLATES = {
  'day-tickets': [
    { name: 'Day Ticket', description: 'Full day fishing access', suggestedPrice: '' },
    { name: 'Half-Day Ticket', description: 'Morning or afternoon session', suggestedPrice: '' },
    { name: 'Evening Ticket', description: 'Evening fishing session', suggestedPrice: '' },
    { name: 'Season Ticket', description: 'Full season access', suggestedPrice: '' },
    { name: 'Syndicate Membership', description: 'Annual membership with exclusive access', suggestedPrice: '' }
  ],
  'guided': [
    { name: 'Guided Session (Half Day)', description: 'Half-day with an expert guide', suggestedPrice: '' },
    { name: 'Guided Session (Full Day)', description: 'Full day with an expert guide', suggestedPrice: '' },
    { name: '1-to-1 Tuition', description: 'Private lesson with a qualified instructor', suggestedPrice: '' },
    { name: 'Group Booking', description: 'Guided session for groups', suggestedPrice: '' },
    { name: 'Corporate Day', description: 'Corporate entertainment package', suggestedPrice: '' }
  ],
  'accommodation': [
    { name: 'Lodge & Fishing', description: 'On-site lodge with fishing included', suggestedPrice: '' },
    { name: 'Cabin Stay', description: 'Lakeside cabin with fishing access', suggestedPrice: '' },
    { name: 'Camping & Fishing', description: 'Camping pitch with day ticket included', suggestedPrice: '' },
    { name: 'B&B Package', description: 'Nearby B&B with fishing package', suggestedPrice: '' }
  ],
  'extras': [
    { name: 'Tackle Hire', description: 'Rod, reel and basic tackle provided', suggestedPrice: '' },
    { name: 'Boat Hire', description: 'Rowing boat or punt for the day', suggestedPrice: '' },
    { name: 'Ghillie Service', description: 'Personal ghillie for the day', suggestedPrice: '' },
    { name: 'Bait Package', description: 'Selection of bait for the session', suggestedPrice: '' }
  ]
};

const emptyOption = () => ({
  id: Date.now() + Math.random(),
  category: 'day-tickets',
  name: '',
  description: '',
  price: '',
  priceType: 'day',
  bookingType: 'instant'
});

export const ListWaterModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'game',
    location: '',
    region: '',
    description: '',
    species: [],
    amenities: [],
    bookingOptions: [],
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOption, setExpandedOption] = useState(null);
  const [showTemplates, setShowTemplates] = useState(null);
  const [validationMsg, setValidationMsg] = useState(null);

  if (!isOpen) return null;

  const updateForm = (field, value) => setFormData({ ...formData, [field]: value });

  const toggleSpecies = (s) => {
    if (formData.species.includes(s)) {
      updateForm('species', formData.species.filter(x => x !== s));
    } else {
      updateForm('species', [...formData.species, s]);
    }
  };

  const toggleAmenity = (a) => {
    if (formData.amenities.includes(a)) {
      updateForm('amenities', formData.amenities.filter(x => x !== a));
    } else {
      updateForm('amenities', [...formData.amenities, a]);
    }
  };

  // Booking options management
  const addOption = () => {
    const newOption = emptyOption();
    setFormData({
      ...formData,
      bookingOptions: [...formData.bookingOptions, newOption]
    });
    setExpandedOption(newOption.id);
  };

  const addFromTemplate = (category, template) => {
    const newOption = {
      ...emptyOption(),
      category,
      name: template.name,
      description: template.description,
      price: template.suggestedPrice
    };
    setFormData({
      ...formData,
      bookingOptions: [...formData.bookingOptions, newOption]
    });
    setExpandedOption(newOption.id);
    setShowTemplates(null);
  };

  const updateOption = (id, field, value) => {
    setFormData({
      ...formData,
      bookingOptions: formData.bookingOptions.map(opt =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    });
  };

  const removeOption = (id) => {
    setFormData({
      ...formData,
      bookingOptions: formData.bookingOptions.filter(opt => opt.id !== id)
    });
    if (expandedOption === id) setExpandedOption(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ownerName: formData.contactName,
        ownerEmail: formData.contactEmail,
        ownerPhone: formData.contactPhone,
        waterName: formData.name,
        waterType: formData.type,
        region: formData.region,
        description: formData.description,
        species: formData.species,
        facilities: formData.amenities,
        bookingOptions: formData.bookingOptions.map(opt => ({
          category: opt.category,
          name: opt.name,
          description: opt.description || '',
          price: opt.price,
          priceType: opt.priceType,
          bookingType: opt.bookingType || 'enquiry'
        }))
      };

      await registerAPI.water(payload);
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit listing');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSubmitted(false);
    setStep(1);
    setFormData({
      name: '',
      type: 'game',
      location: '',
      region: '',
      description: '',
      species: [],
      amenities: [],
      bookingOptions: [],
      contactName: '',
      contactEmail: '',
      contactPhone: ''
    });
    setExpandedOption(null);
    setShowTemplates(null);
  };

  const canProceedStep3 = formData.bookingOptions.length > 0 &&
    formData.bookingOptions.every(opt => opt.name && opt.price);

  // Success state
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Submission Received!</h2>
          <p className="text-stone-600 mb-2">
            Thank you for listing {formData.name}. Our team will review your
            submission and be in touch within 48 hours.
          </p>
          <p className="text-stone-500 text-sm mb-6">
            {formData.bookingOptions.length} booking option{formData.bookingOptions.length !== 1 ? 's' : ''} submitted.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">List Your Water</h2>
            <p className="text-stone-500 text-sm">Step {step} of 4</p>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? 'bg-brand-600' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Water Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="e.g. River Test - Manor Beat"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => updateForm('type', e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                >
                  <option value="game">Game Fishing</option>
                  <option value="coarse">Coarse Fishing</option>
                  <option value="sea">Sea Fishing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Region *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => updateForm('region', e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                >
                  <option value="">Select region</option>
                  {ukRegions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Location / Nearest Town *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateForm('location', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="e.g. Stockbridge, Hampshire"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Description *
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => updateForm('description', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="Describe your water, what makes it special, what anglers can expect..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Species & Facilities */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Species & Facilities</h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Species Available (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Atlantic Salmon', 'Brown Trout', 'Rainbow Trout', 'Grayling',
                  'Carp', 'Pike', 'Tench', 'Barbel', 'Perch', 'Bream', 'Roach', 'Chub'
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecies(s)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      formData.species.includes(s)
                        ? 'bg-brand-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Amenities (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Parking', 'Toilets', 'Fishing hut', 'Café/Lodge', 'Tackle shop',
                  'Boat hire', 'Ghillie/Guide', 'Night fishing', 'Disabled access', 'Dog friendly'
                ].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      formData.amenities.includes(a)
                        ? 'bg-brand-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Booking Options */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">What Can Anglers Book?</h3>
              <p className="text-stone-500 text-sm mt-1">
                Add all the different things anglers can book or enquire about. You need at least one option.
              </p>
            </div>

            {/* Existing options */}
            {formData.bookingOptions.length > 0 && (
              <div className="space-y-3">
                {formData.bookingOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="border border-stone-200 rounded-xl overflow-hidden"
                  >
                    {/* Option header - always visible */}
                    <div
                      className="flex items-center justify-between p-3 bg-stone-50 cursor-pointer hover:bg-stone-100 transition"
                      onClick={() => setExpandedOption(expandedOption === opt.id ? null : opt.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          opt.category === 'day-tickets' ? 'bg-brand-100 text-brand-700' :
                          opt.category === 'guided' ? 'bg-amber-100 text-amber-700' :
                          opt.category === 'accommodation' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {OPTION_CATEGORIES.find(c => c.id === opt.category)?.label || opt.category}
                        </span>
                        <span className="font-medium text-stone-800">
                          {opt.name || 'Untitled option'}
                        </span>
                        {opt.price && (
                          <span className="text-stone-500 text-sm">
                            £{opt.price}/{opt.priceType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          opt.bookingType === 'instant'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {opt.bookingType === 'instant' ? 'Instant Book' : 'Enquiry'}
                        </span>
                        {expandedOption === opt.id ? (
                          <ChevronUp className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded edit form */}
                    {expandedOption === opt.id && (
                      <div className="p-4 space-y-3 border-t border-stone-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Category</label>
                            <select
                              value={opt.category}
                              onChange={(e) => updateOption(opt.id, 'category', e.target.value)}
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                            >
                              {OPTION_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Booking Type</label>
                            <select
                              value={opt.bookingType}
                              onChange={(e) => updateOption(opt.id, 'bookingType', e.target.value)}
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                            >
                              <option value="instant">Instant Book</option>
                              <option value="enquiry">Enquiry Only</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Option Name *</label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updateOption(opt.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                            placeholder="e.g. Day Ticket, Guided Session, Lodge Stay"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={opt.description}
                            onChange={(e) => updateOption(opt.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                            placeholder="What's included in this option?"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Price (£) *</label>
                            <input
                              type="number"
                              value={opt.price}
                              onChange={(e) => updateOption(opt.id, 'price', e.target.value)}
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                              placeholder="45"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Price Per</label>
                            <select
                              value={opt.priceType}
                              onChange={(e) => updateOption(opt.id, 'priceType', e.target.value)}
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                            >
                              <option value="day">Per Day</option>
                              <option value="half-day">Per Half Day</option>
                              <option value="session">Per Session</option>
                              <option value="night">Per Night</option>
                              <option value="person">Per Person</option>
                              <option value="season">Per Season</option>
                              <option value="year">Per Year</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => removeOption(opt.id)}
                          className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 transition mt-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove this option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add option buttons */}
            <div className="space-y-2">
              {/* Quick-add from template */}
              <div className="grid grid-cols-2 gap-2">
                {OPTION_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTemplates(showTemplates === cat.id ? null : cat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition ${
                        showTemplates === cat.id
                          ? 'border-brand-300 bg-brand-50 text-brand-700'
                          : 'border-stone-200 hover:border-brand-300 hover:bg-brand-50 text-stone-700'
                      }`}
                    >
                      <span className="font-medium block">{cat.label}</span>
                      <span className="text-xs text-stone-500 block mt-0.5">{cat.description}</span>
                    </button>

                    {/* Template dropdown */}
                    {showTemplates === cat.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-10 overflow-hidden">
                        {OPTION_TEMPLATES[cat.id].map((tmpl, i) => {
                          const alreadyAdded = formData.bookingOptions.some(
                            o => o.name === tmpl.name && o.category === cat.id
                          );
                          return (
                            <button
                              key={i}
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => addFromTemplate(cat.id, tmpl)}
                              className={`w-full text-left px-3 py-2 text-sm border-b border-stone-100 last:border-0 ${
                                alreadyAdded
                                  ? 'text-stone-400 bg-stone-50 cursor-not-allowed'
                                  : 'hover:bg-brand-50 text-stone-700'
                              }`}
                            >
                              <span className="font-medium">{tmpl.name}</span>
                              {alreadyAdded && <span className="text-xs ml-2 text-stone-400">(added)</span>}
                              <span className="block text-xs text-stone-500">{tmpl.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom option button */}
              <button
                type="button"
                onClick={addOption}
                className="w-full py-2.5 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:border-brand-400 hover:text-brand-600 transition flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Custom Option
              </button>
            </div>

            {formData.bookingOptions.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                Choose from the categories above or add a custom option. You need at least one booking option to continue.
              </div>
            )}
          </div>
        )}

        {/* Step 4: Contact Details */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Details</h3>
            <p className="text-stone-500 text-sm">
              We'll use these details to contact you about your listing.
            </p>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => updateForm('contactName', e.target.value)}
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
                value={formData.contactEmail}
                onChange={(e) => updateForm('contactEmail', e.target.value)}
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
                value={formData.contactPhone}
                onChange={(e) => updateForm('contactPhone', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="07123 456789"
              />
            </div>

            {/* Summary of what they've added */}
            <div className="bg-brand-50 p-4 rounded-xl">
              <h4 className="font-medium text-brand-800 mb-2">Listing Summary</h4>
              <div className="text-sm text-brand-700 space-y-1">
                <p>• {formData.name} — {formData.region}</p>
                <p>• {formData.bookingOptions.length} booking option{formData.bookingOptions.length !== 1 ? 's' : ''}</p>
                {formData.bookingOptions.map((opt, i) => (
                  <p key={i} className="ml-4 text-brand-600">
                    {opt.name} — £{opt.price}/{opt.priceType} ({opt.bookingType})
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl">
              <h4 className="font-medium text-stone-700 mb-2">What happens next?</h4>
              <ul className="text-sm text-stone-600 space-y-1">
                <li>• We'll review your submission within 48 hours</li>
                <li>• Our team may contact you for additional details</li>
                <li>• Once approved, your water goes live on TightLines</li>
                <li>• You'll get a dashboard to manage bookings</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-6 pt-6 border-t border-stone-200">
          {step > 1 ? (
            <button
              onClick={() => { setStep(step - 1); setShowTemplates(null); }}
              className="px-6 py-2.5 border border-stone-300 rounded-xl font-medium hover:bg-stone-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <div className="flex flex-col items-end gap-1">
              {validationMsg && <p className="text-xs text-red-600">{validationMsg}</p>}
              <button
                onClick={() => {
                  if (step === 1 && (!formData.name.trim() || !formData.region)) {
                    setValidationMsg('Please fill in the water name and region.');
                    return;
                  }
                  if (step === 3 && !canProceedStep3) {
                    setValidationMsg('Please add at least one booking option with a name and price.');
                    return;
                  }
                  setValidationMsg(null);
                  setStep(step + 1);
                  setShowTemplates(null);
                }}
                className={`px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800 ${
                  (step === 3 && !canProceedStep3) ? 'opacity-70' : ''
                }`}
              >
                Continue
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListWaterModal;
