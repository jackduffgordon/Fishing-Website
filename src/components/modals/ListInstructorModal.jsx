// ============================================
// LIST YOUR INSTRUCTOR PROFILE MODAL COMPONENT
// 3-step submission wizard for instructors
// ============================================
import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ukRegions } from '../../data/regions';
import { registerAPI } from '../../utils/api';

const SPECIALTIES = [
  'Fly Fishing',
  'Salmon',
  'Trout',
  'Sea Fishing',
  'Bass',
  'Shore Fishing',
  'Carp Fishing',
  'Coarse',
  'Beginners',
  'Fly Tying',
  "Women's Courses",
  'Kids/Juniors',
  'Pike',
  'Barbel'
];

const CERTIFICATIONS = [
  'AAPGAI',
  'AAPGAI Master',
  'GAIA',
  'GAIA Advanced',
  'SGAIC',
  'Angling Trust Level 2',
  'Angling Trust Level 3',
  'First Aid',
  'DBS Checked',
  'River Rescue'
];

const AVAILABILITY_OPTIONS = [
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'evenings', label: 'Evenings' }
];

export const ListInstructorModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    experience: '',
    specialties: [],
    certifications: [],
    availability: [],
    price: '',
    bio: '',
    whatYouLearn: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const updateForm = (field, value) => setFormData({ ...formData, [field]: value });

  const toggleSpecialty = (specialty) => {
    if (formData.specialties.includes(specialty)) {
      updateForm('specialties', formData.specialties.filter(s => s !== specialty));
    } else {
      updateForm('specialties', [...formData.specialties, specialty]);
    }
  };

  const toggleCertification = (cert) => {
    if (formData.certifications.includes(cert)) {
      updateForm('certifications', formData.certifications.filter(c => c !== cert));
    } else {
      updateForm('certifications', [...formData.certifications, cert]);
    }
  };

  const toggleAvailability = (id) => {
    if (formData.availability.includes(id)) {
      updateForm('availability', formData.availability.filter(a => a !== id));
    } else {
      updateForm('availability', [...formData.availability, id]);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        region: formData.region,
        experience: formData.experience,
        specialties: formData.specialties,
        certifications: formData.certifications,
        availability: formData.availability,
        price: formData.price ? parseFloat(formData.price) : null,
        bio: formData.bio,
        whatYouLearn: formData.whatYouLearn
      };

      await registerAPI.instructor(payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSubmitted(false);
    setStep(1);
    setError(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      region: '',
      experience: '',
      specialties: [],
      certifications: [],
      availability: [],
      price: '',
      bio: '',
      whatYouLearn: ''
    });
  };

  // Validation for each step
  const canProceedStep1 = formData.name.trim() && formData.email.trim();
  const canProceedStep2 = formData.specialties.length > 0;

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
            Thank you for registering as an instructor on TightLines. Our team will review your
            profile and be in touch within 48 hours.
          </p>
          <p className="text-stone-500 text-sm mb-6">
            A confirmation email has been sent to {formData.email}.
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
            <h2 className="text-xl font-bold">Register as an Instructor</h2>
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

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateForm('name', e.target.value)}
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
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
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
                value={formData.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="07123 456789"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Region
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

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => updateForm('experience', e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                  placeholder="10"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Expertise */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Your Expertise</h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Specialties (select all that apply) *
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleSpecialty(specialty)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      formData.specialties.includes(specialty)
                        ? 'bg-brand-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Certifications (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCertification(cert)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      formData.certifications.includes(cert)
                        ? 'bg-brand-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Availability
              </label>
              <div className="space-y-2">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.availability.includes(option.id)}
                      onChange={() => toggleAvailability(option.id)}
                      className="w-4 h-4 rounded border-stone-300 text-brand-600"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Price per Day (£)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateForm('price', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="150"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        {/* Step 3: About You */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">About You</h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Bio
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => updateForm('bio', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="Describe your teaching style, background, and what makes you unique..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                What Students Will Learn
              </label>
              <textarea
                rows={4}
                value={formData.whatYouLearn}
                onChange={(e) => updateForm('whatYouLearn', e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl"
                placeholder="Outline the key skills and knowledge your students will gain from your courses..."
              />
            </div>

            {/* Summary of profile */}
            <div className="bg-brand-50 p-4 rounded-xl">
              <h4 className="font-medium text-brand-800 mb-2">Profile Summary</h4>
              <div className="text-sm text-brand-700 space-y-1">
                <p>• {formData.name} — {ukRegions.find(r => r.id === formData.region)?.name || 'No region'}</p>
                <p>• {formData.experience} years experience</p>
                <p>• {formData.specialties.length} specialt{formData.specialties.length !== 1 ? 'ies' : 'y'}</p>
                <p>• £{formData.price || '0'} per day</p>
                {formData.certifications.length > 0 && (
                  <p>• {formData.certifications.length} certification{formData.certifications.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl">
              <h4 className="font-medium text-stone-700 mb-2">What Happens Next?</h4>
              <ul className="text-sm text-stone-600 space-y-1">
                <li>• We'll review your profile within 48 hours</li>
                <li>• Our team may contact you for additional details</li>
                <li>• Once approved, your profile goes live on TightLines</li>
                <li>• You'll get a dashboard to manage bookings and availability</li>
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
              disabled={step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : false}
              className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListInstructorModal;
