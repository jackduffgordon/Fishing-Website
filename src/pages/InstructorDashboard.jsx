// ============================================
// INSTRUCTOR DASHBOARD - Manage profile and view inquiries
// ============================================
import { useState, useEffect } from 'react';
import {
  User, ChevronLeft, Edit3, Loader, AlertTriangle, CheckCircle,
  Clock, XCircle, Mail, Phone, Calendar, MessageSquare, Award, Star, Save, X,
  Upload, Trash2
} from 'lucide-react';
import { getToken } from '../utils/api';

const SPECIALTIES = [
  'Fly Fishing', 'Salmon', 'Trout', 'Sea Fishing', 'Bass', 'Shore Fishing',
  'Carp Fishing', 'Coarse', 'Beginners', 'Fly Tying', "Women's Courses",
  'Kids/Juniors', 'Pike', 'Barbel'
];

// --- Status Badge ---
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200'
  };
  const icons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle
  };
  const Icon = icons[status] || Clock;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-stone-100 text-stone-600'}`}>
      <Icon className="w-3.5 h-3.5" />
      {status === 'pending' && 'Pending Approval'}
      {status === 'approved' && 'Active'}
      {status === 'rejected' && 'Rejected'}
    </span>
  );
};

// --- Inquiry Card ---
const InquiryCard = ({ inquiry }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-stone-900">{inquiry.userName || 'Guest'}</h4>
          <p className="text-sm text-stone-500">
            {new Date(inquiry.createdAt).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          inquiry.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {inquiry.status}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-3">
        {inquiry.userEmail && (
          <div className="flex items-center gap-2 text-stone-600">
            <Mail className="w-4 h-4" />
            <a href={`mailto:${inquiry.userEmail}`} className="hover:text-brand-700">
              {inquiry.userEmail}
            </a>
          </div>
        )}
        {inquiry.userPhone && (
          <div className="flex items-center gap-2 text-stone-600">
            <Phone className="w-4 h-4" />
            <a href={`tel:${inquiry.userPhone}`} className="hover:text-brand-700">
              {inquiry.userPhone}
            </a>
          </div>
        )}
        {inquiry.date && (
          <div className="flex items-center gap-2 text-stone-600">
            <Calendar className="w-4 h-4" />
            Requested date: {new Date(inquiry.date).toLocaleDateString('en-GB')}
          </div>
        )}
      </div>

      {inquiry.message && (
        <div className="bg-stone-50 rounded-lg p-3 text-sm text-stone-700">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
            <p>{inquiry.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Dashboard ---
export const InstructorDashboard = ({ user, onBack }) => {
  const [tab, setTab] = useState('overview');
  const [instructor, setInstructor] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();

      // Fetch instructor profile
      const profileRes = await fetch('/api/instructor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setInstructor(profileData.instructor);
      }

      // Fetch inquiries
      const inquiriesRes = await fetch('/api/instructor/inquiries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json();
        setInquiries(inquiriesData.inquiries || []);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    }
    setLoading(false);
  };

  const startEdit = () => {
    setEditData({
      name: instructor.name || '',
      bio: instructor.bio || '',
      price: instructor.price || '',
      phone: instructor.phone || '',
      region: instructor.region || instructor.location || '',
      specialties: instructor.specialties || [],
      certifications: (instructor.certifications || []).join(', '),
      experience: instructor.experience || '',
      images: instructor.images || [],
      booking_options: instructor.booking_options || [],
      what_you_learn: instructor.what_you_learn || '',
    });
    setEditing(true);
  };

  const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const token = getToken();
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              imageData: reader.result,
              fileName: file.name,
              type: 'instructors'
            })
          });
          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSaving(true);
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f)));
      setEditData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
    } catch (err) {
      setError('Failed to upload image(s)');
    }
    setSaving(false);
  };

  const removeImage = (index) => {
    setEditData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const saveEdit = async () => {
    setSaving(true);
    setError('');
    try {
      const token = getToken();
      const payload = {
        ...editData,
        price: parseFloat(editData.price) || 0,
        certifications: editData.certifications
          ? editData.certifications.split(',').map(c => c.trim()).filter(Boolean)
          : [],
        images: editData.images || [],
        booking_options: (editData.booking_options || []).filter(o => o.name && o.price),
        what_you_learn: editData.what_you_learn || '',
      };
      const res = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setInstructor(data.instructor);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const toggleSpecialty = (s) => {
    setEditData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s]
    }));
  };

  const addBookingOption = () => {
    setEditData(prev => ({
      ...prev,
      booking_options: [...(prev.booking_options || []), { name: '', price: '', priceType: 'session', description: '' }]
    }));
  };

  const updateBookingOption = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      booking_options: prev.booking_options.map((opt, i) => i === index ? { ...opt, [field]: value } : opt)
    }));
  };

  const removeBookingOption = (index) => {
    setEditData(prev => ({
      ...prev,
      booking_options: prev.booking_options.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'inquiries', label: 'Inquiries', count: inquiries.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-brand-600 mx-auto mb-3 animate-spin" />
          <p className="text-stone-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-900 mb-2">No Instructor Profile Found</h2>
          <p className="text-stone-500">Your instructor profile is still being set up.</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-stone-900">Instructor Dashboard</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Profile Status Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-medium flex-shrink-0 text-2xl">
              {instructor.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">{instructor.name}</h2>
                  <p className="text-stone-600 mt-1">
                    {(instructor.specialties || []).join(' • ')}
                  </p>
                </div>
                <StatusBadge status={instructor.status} />
              </div>

              {instructor.status === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Your instructor profile is pending approval. You'll be notified once it's reviewed by our team.
                  </p>
                </div>
              )}

              {instructor.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-red-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Your profile was not approved. Please contact support for more details.
                  </p>
                </div>
              )}

              {(instructor.status === 'approved' || instructor.status === 'pending') && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-stone-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-stone-600 mb-1">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-stone-900">
                      {instructor.rating || 0} ⭐
                    </p>
                    <p className="text-xs text-stone-500">{instructor.reviewCount || 0} reviews</p>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-stone-600 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">Experience</span>
                    </div>
                    <p className="text-2xl font-bold text-stone-900">{instructor.experience || 'N/A'}</p>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-stone-600 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Inquiries</span>
                    </div>
                    <p className="text-2xl font-bold text-stone-900">{inquiries.length}</p>
                  </div>
                </div>
              )}

              {!editing && (
                <div className="mt-4">
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              )}
              {editing && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 disabled:opacity-50 transition"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-stone-200">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition flex-1 ${
                tab === t.id
                  ? 'bg-brand-700 text-white'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  tab === t.id ? 'bg-white/20' : 'bg-stone-100'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && !editing && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-900 mb-4">Profile Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone-500 mb-1">Email</p>
                  <p className="font-medium text-stone-900">{instructor.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500 mb-1">Phone</p>
                  <p className="font-medium text-stone-900">{instructor.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500 mb-1">Location</p>
                  <p className="font-medium text-stone-900">{instructor.location || instructor.region || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500 mb-1">Price</p>
                  <p className="font-medium text-stone-900">£{instructor.price || 0}/day</p>
                </div>
              </div>

              {instructor.bio && (
                <div className="mt-6">
                  <p className="text-sm text-stone-500 mb-2">Bio</p>
                  <p className="text-stone-700">{instructor.bio}</p>
                </div>
              )}

              {instructor.certifications && instructor.certifications.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-stone-500 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {instructor.certifications.map((cert, i) => (
                      <span key={i} className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(instructor.images || []).length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-stone-500 mb-2">Photos</p>
                  <div className="flex flex-wrap gap-3">
                    {instructor.images.map((img, i) => (
                      <img key={i} src={img} alt={`Photo ${i + 1}`} className="w-24 h-24 rounded-lg object-cover border border-stone-200" />
                    ))}
                  </div>
                </div>
              )}

              {instructor.what_you_learn && (
                <div className="mt-6">
                  <p className="text-sm text-stone-500 mb-2">What You'll Learn</p>
                  <p className="text-stone-700">{instructor.what_you_learn}</p>
                </div>
              )}

              {(instructor.booking_options || []).length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-stone-500 mb-3">Booking Options</p>
                  <div className="grid gap-3">
                    {instructor.booking_options.map((opt, i) => (
                      <div key={i} className="flex items-center justify-between bg-stone-50 rounded-lg p-3 border border-stone-200">
                        <div>
                          <p className="font-medium text-stone-900">{opt.name}</p>
                          {opt.description && <p className="text-sm text-stone-500 mt-0.5">{opt.description}</p>}
                        </div>
                        <span className="font-semibold text-brand-700">£{opt.price}/{opt.priceType || 'session'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Form */}
        {tab === 'overview' && editing && (
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Edit Profile</h3>
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={editData.region}
                    onChange={e => setEditData({ ...editData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price (£/day)</label>
                  <input
                    type="number"
                    value={editData.price}
                    onChange={e => setEditData({ ...editData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Experience (years)</label>
                  <input
                    type="text"
                    value={editData.experience}
                    onChange={e => setEditData({ ...editData, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Certifications</label>
                  <input
                    type="text"
                    value={editData.certifications}
                    onChange={e => setEditData({ ...editData, certifications: e.target.value })}
                    placeholder="AAPGAI, Level 2 Coach (comma separated)"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
                <textarea
                  rows={4}
                  value={editData.bio}
                  onChange={e => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Tell potential students about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                        editData.specialties.includes(s)
                          ? 'bg-brand-100 text-brand-700 border-brand-300'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(editData.images || []).map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt={`Photo ${i + 1}`} className="w-24 h-24 rounded-lg object-cover border border-stone-200" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition">
                    <Upload className="w-5 h-5 text-stone-400 mb-1" />
                    <span className="text-xs text-stone-500">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-stone-500">Upload photos of yourself or your sessions. JPG, PNG or WebP.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">What You'll Learn</label>
                <textarea
                  rows={3}
                  value={editData.what_you_learn}
                  onChange={e => setEditData({ ...editData, what_you_learn: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Describe what students will learn in your sessions..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-stone-700">Booking Options</label>
                  <button
                    type="button"
                    onClick={addBookingOption}
                    className="text-sm text-brand-700 hover:text-brand-800 font-medium"
                  >
                    + Add Option
                  </button>
                </div>
                {(editData.booking_options || []).length === 0 && (
                  <p className="text-sm text-stone-500 italic">No booking options yet. Add one to let students book specific sessions.</p>
                )}
                <div className="space-y-3">
                  {(editData.booking_options || []).map((opt, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-stone-600">Option {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeBookingOption(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={e => updateBookingOption(i, 'name', e.target.value)}
                            placeholder="e.g. Half Day Session"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={opt.price}
                            onChange={e => updateBookingOption(i, 'price', e.target.value)}
                            placeholder="Price"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          />
                          <select
                            value={opt.priceType || 'session'}
                            onChange={e => updateBookingOption(i, 'priceType', e.target.value)}
                            className="px-2 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          >
                            <option value="session">/session</option>
                            <option value="hour">/hour</option>
                            <option value="day">/day</option>
                            <option value="person">/person</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={opt.description || ''}
                        onChange={e => updateBookingOption(i, 'description', e.target.value)}
                        placeholder="Brief description of this option..."
                        className="w-full mt-3 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inquiries Tab */}
        {tab === 'inquiries' && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Mail className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-700 mb-2">No inquiries yet</h3>
                <p className="text-stone-500 text-sm">When students contact you, their inquiries will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map(inq => <InquiryCard key={inq.id} inquiry={inq} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
