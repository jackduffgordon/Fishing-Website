// ============================================
// LIST YOUR WATER MODAL COMPONENT
// 3-step submission wizard for fishery owners
// ============================================
import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ukRegions } from '../../data/regions';

export const ListWaterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'game',
    location: '',
    region: '',
    description: '',
    species: [],
    price: '',
    amenities: [],
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = () => {
    setSubmitted(true);
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
      price: '',
      amenities: [],
      contactName: '',
      contactEmail: '',
      contactPhone: ''
    });
  };

  // Success state
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Submission Received!</h2>
          <p className="text-stone-600 mb-6">
            Thank you for listing {formData.name}. Our team will review your
            submission and be in touch within 48 hours.
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
            <p className="text-stone-500 text-sm">Step {step} of 3</p>
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
          {[1, 2, 3].map((s) => (
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

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Day Ticket Price (£)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateForm('price', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="e.g. 45"
              />
            </div>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === 3 && (
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

            <div className="bg-brand-50 p-4 rounded-xl">
              <h4 className="font-medium text-brand-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-brand-700 space-y-1">
                <li>• We'll review your submission within 48 hours</li>
                <li>• Our team may contact you for additional details</li>
                <li>• Once approved, your water goes live on TightLines</li>
                <li>• You'll get a dashboard to manage bookings</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-6 pt-6 border-t border-stone-200">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 border border-stone-300 rounded-xl font-medium hover:bg-stone-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800"
            >
              Submit Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListWaterModal;
