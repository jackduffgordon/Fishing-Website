// ============================================
// INSTRUCTOR DASHBOARD - Manage instructor profile and view inquiries
// Mirrors WaterOwnerDashboard structure exactly
// ============================================
import { useState, useEffect } from 'react';
import {
  User, ChevronLeft, Plus, Eye, Edit3, Loader, AlertTriangle,
  CheckCircle, Clock, XCircle, Mail, Phone, Calendar, MessageSquare,
  Save, X, Trash2, Upload, Award
} from 'lucide-react';
import { getToken, normalizeInstructor } from '../utils/api';
import { InstructorDetailPage } from './InstructorDetail';

const SPECIALTIES = [
  'Fly Fishing', 'Salmon', 'Trout', 'Sea Fishing', 'Bass', 'Shore Fishing',
  'Carp Fishing', 'Coarse', 'Beginners', 'Fly Tying', "Women's Courses",
  'Kids/Juniors', 'Pike', 'Barbel'
];

const CERTIFICATIONS = [
  'AAPGAI', 'AAPGAI Master', 'GAIA', 'GAIA Advanced', 'SGAIC',
  'Angling Trust Level 2', 'Angling Trust Level 3', 'First Aid',
  'DBS Checked', 'River Rescue'
];

// --- Status Badge ---
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    removal_requested: 'bg-orange-100 text-orange-700 border-orange-200'
  };
  const icons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    removal_requested: Trash2
  };
  const Icon = icons[status] || Clock;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-stone-100 text-stone-600'}`}>
      <Icon className="w-3.5 h-3.5" />
      {status === 'pending' && 'Pending Approval'}
      {status === 'approved' && 'Live'}
      {status === 'rejected' && 'Rejected'}
      {status === 'removal_requested' && 'Removal Requested'}
    </span>
  );
};

// --- Instructor Card ---
const InstructorCard = ({ instructor, onView, onEdit, onRequestRemoval }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition">
      <div className="flex items-start gap-4 p-4">
        <div
          className="w-20 h-20 rounded-lg flex-shrink-0"
          style={{
            background: instructor.images?.[0]
              ? `url(${instructor.images[0]}) center/cover`
              : 'linear-gradient(135deg, #4a5a6a 0%, #2a3a4a 100%)'
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-900 truncate">{instructor.name}</h3>
              <p className="text-sm text-stone-500">
                {(instructor.specialties || []).slice(0, 2).join(' • ')} • {instructor.region || 'No region'}
              </p>
            </div>
            <StatusBadge status={instructor.status} />
          </div>

          {instructor.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Awaiting admin approval. You'll be notified once your profile is reviewed.
              </p>
            </div>
          )}

          {instructor.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                This submission was not approved. Please contact support for details.
              </p>
            </div>
          )}

          {instructor.status === 'removal_requested' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Removal requested. An admin will process this shortly.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <p className="text-stone-500">Specialties</p>
              <p className="font-medium text-stone-900">
                {(instructor.specialties || []).slice(0, 2).join(', ') || 'None listed'}
                {instructor.specialties?.length > 2 && ` +${instructor.specialties.length - 2}`}
              </p>
            </div>
            <div>
              <p className="text-stone-500">Rating</p>
              <p className="font-medium text-stone-900">
                ⭐ {instructor.rating || 0} ({instructor.review_count || 0} reviews)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(instructor)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition"
            >
              <Eye className="w-4 h-4" /> View Details
            </button>
            {onEdit && instructor.status !== 'removal_requested' && (
              <button
                onClick={() => onEdit(instructor)}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            )}
            {onRequestRemoval && instructor.status !== 'removal_requested' && instructor.status !== 'rejected' && (
              <button
                onClick={() => onRequestRemoval(instructor)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4" /> Request Removal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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
export const InstructorDashboard = ({ user, onBack, onListInstructor }) => {
  const [tab, setTab] = useState('instructors');
  const [instructors, setInstructors] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewInstructor, setPreviewInstructor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();

      // Fetch instructor profile(s)
      const profileRes = await fetch('/api/instructor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        // Wrap single instructor in array for consistency with water dashboard
        setInstructors(profileData.instructor ? [profileData.instructor] : []);
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

  const startEditInstructor = (instructor) => {
    setEditData({
      name: instructor.name || '',
      bio: instructor.bio || '',
      price: instructor.price || '',
      phone: instructor.phone || '',
      region: instructor.region || '',
      experience: instructor.experience || '',
      specialties: instructor.specialties || [],
      certifications: instructor.certifications || [],
      images: instructor.images || [],
      booking_options: (instructor.booking_options || []).map(opt => ({
        name: opt.name || '',
        price: opt.price || '',
        priceType: opt.priceType || opt.price_type || 'session',
        description: opt.description || '',
      })),
      what_you_learn: instructor.what_you_learn || '',
      teaching_philosophy: instructor.teaching_philosophy || '',
      equipment_provided: instructor.equipment_provided || '',
    });
    setEditingInstructor(instructor);
    setTab('edit');
  };

  const saveEditInstructor = async () => {
    setSaving(true);
    setError('');
    try {
      const token = getToken();
      const payload = {
        name: editData.name,
        bio: editData.bio,
        price: parseFloat(editData.price) || 0,
        phone: editData.phone,
        region: editData.region,
        experience: editData.experience,
        specialties: editData.specialties,
        certifications: editData.certifications,
        images: editData.images || [],
        booking_options: (editData.booking_options || []).filter(o => o.name && o.price),
        what_you_learn: editData.what_you_learn || '',
        teaching_philosophy: editData.teaching_philosophy || '',
        equipment_provided: editData.equipment_provided || '',
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
      await fetchData();
      setEditingInstructor(null);
      setTab('instructors');
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const toggleArrayItem = (field, item) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(x => x !== item)
        : [...prev[field], item]
    }));
  };

  const updateBookingOption = (index, key, value) => {
    setEditData(prev => {
      const opts = [...prev.booking_options];
      opts[index] = { ...opts[index], [key]: value };
      return { ...prev, booking_options: opts };
    });
  };

  const addBookingOption = () => {
    setEditData(prev => ({
      ...prev,
      booking_options: [...prev.booking_options, {
        name: '', price: '', priceType: 'session', description: ''
      }]
    }));
  };

  const removeBookingOption = (index) => {
    setEditData(prev => ({
      ...prev,
      booking_options: prev.booking_options.filter((_, i) => i !== index)
    }));
  };

  const requestRemoval = async (instructor) => {
    if (!window.confirm(`Are you sure you want to request removal of your instructor profile? This will be reviewed by an admin.`)) return;
    try {
      const token = getToken();
      const res = await fetch(`/api/instructor/profile/request-removal`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      await fetchData();
    } catch (err) {
      setError('Failed to request removal');
    }
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

  const pendingInstructors = instructors.filter(i => i.status === 'pending');
  const approvedInstructors = instructors.filter(i => i.status === 'approved');
  const rejectedInstructors = instructors.filter(i => i.status === 'rejected');
  const removalInstructors = instructors.filter(i => i.status === 'removal_requested');

  const tabsList = [
    { id: 'instructors', label: 'My Profile', count: instructors.length },
    { id: 'inquiries', label: 'Inquiries', count: inquiries.length },
    ...(editingInstructor ? [{ id: 'edit', label: `Edit: ${editingInstructor.name}` }] : [])
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

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Preview Modal */}
      {previewInstructor && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
          <div className="sticky top-0 z-10 flex justify-end p-4">
            <button
              onClick={() => setPreviewInstructor(null)}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5 text-stone-700" />
            </button>
          </div>
          <div className="max-w-7xl mx-auto bg-stone-50 min-h-screen">
            <InstructorDetailPage
              instructor={normalizeInstructor(previewInstructor)}
              onBack={() => setPreviewInstructor(null)}
              user={null}
              onSignIn={() => {}}
            />
          </div>
        </div>
      )}

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
            <h1 className="text-2xl font-bold text-stone-900">My Instructor Dashboard</h1>
            {onListInstructor && (
              <button
                onClick={onListInstructor}
                className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Register</span>
              </button>
            )}
            {!onListInstructor && <div className="w-24" />}
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Total Profiles</p>
                <p className="text-4xl font-bold text-stone-900 mt-2">{instructors.length}</p>
              </div>
              <User className="w-10 h-10 text-brand-700 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Live</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{approvedInstructors.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold text-amber-600 mt-2">{pendingInstructors.length}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Inquiries</p>
                <p className="text-4xl font-bold text-brand-700 mt-2">{inquiries.length}</p>
              </div>
              <Mail className="w-10 h-10 text-brand-700 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-stone-200">
          {tabsList.map(t => (
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

        {/* Instructors Tab */}
        {tab === 'instructors' && (
          <div className="space-y-4">
            {instructors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <User className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-700 mb-2">No instructor profile yet</h3>
                <p className="text-stone-500 text-sm mb-4">Register as an instructor to start receiving bookings</p>
                {onListInstructor && (
                  <button
                    onClick={onListInstructor}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Register as Instructor
                  </button>
                )}
              </div>
            ) : (
              <>
                {pendingInstructors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      Pending Approval ({pendingInstructors.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingInstructors.map(i => <InstructorCard key={i.id} instructor={i} onView={setPreviewInstructor} onEdit={startEditInstructor} onRequestRemoval={requestRemoval} />)}
                    </div>
                  </div>
                )}

                {approvedInstructors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Live ({approvedInstructors.length})
                    </h3>
                    <div className="space-y-3">
                      {approvedInstructors.map(i => <InstructorCard key={i.id} instructor={i} onView={setPreviewInstructor} onEdit={startEditInstructor} onRequestRemoval={requestRemoval} />)}
                    </div>
                  </div>
                )}

                {removalInstructors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <Trash2 className="w-5 h-5 text-orange-600" />
                      Removal Requested ({removalInstructors.length})
                    </h3>
                    <div className="space-y-3">
                      {removalInstructors.map(i => <InstructorCard key={i.id} instructor={i} onView={setPreviewInstructor} onEdit={startEditInstructor} onRequestRemoval={requestRemoval} />)}
                    </div>
                  </div>
                )}

                {rejectedInstructors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Rejected ({rejectedInstructors.length})
                    </h3>
                    <div className="space-y-3">
                      {rejectedInstructors.map(i => <InstructorCard key={i.id} instructor={i} onView={setPreviewInstructor} onEdit={startEditInstructor} onRequestRemoval={requestRemoval} />)}
                    </div>
                  </div>
                )}
              </>
            )}
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

        {/* Edit Instructor Tab */}
        {tab === 'edit' && editingInstructor && (
          <div className="space-y-6">
            {/* Save / Cancel bar */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-stone-200 p-4">
              <h3 className="font-semibold text-stone-900">Editing: {editingInstructor.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={saveEditInstructor}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setEditingInstructor(null); setTab('instructors'); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>

            {/* Basic Details */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-4">Basic Details</h4>
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
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
                <textarea
                  rows={4}
                  value={editData.bio}
                  onChange={e => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Tell potential students about yourself..."
                />
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleArrayItem('specialties', s)}
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

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleArrayItem('certifications', c)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      editData.certifications.includes(c)
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Teaching Philosophy */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Teaching Philosophy</h4>
              <textarea
                rows={3}
                value={editData.teaching_philosophy}
                onChange={e => setEditData({ ...editData, teaching_philosophy: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Describe your approach to teaching..."
              />
            </div>

            {/* What You'll Learn */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">What Students Will Learn</h4>
              <textarea
                rows={4}
                value={editData.what_you_learn}
                onChange={e => setEditData({ ...editData, what_you_learn: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="List what students will learn (one per line)..."
              />
            </div>

            {/* Equipment Provided */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Equipment Provided</h4>
              <textarea
                rows={3}
                value={editData.equipment_provided}
                onChange={e => setEditData({ ...editData, equipment_provided: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="List equipment you provide (one per line)..."
              />
            </div>

            {/* Booking Options */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Booking Options</h4>
              <div className="space-y-4">
                {editData.booking_options.map((opt, i) => (
                  <div key={i} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-stone-700">Option {i + 1}</span>
                      <button
                        onClick={() => removeBookingOption(i)}
                        className="p-1 text-stone-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Session Name</label>
                        <input
                          type="text"
                          value={opt.name}
                          onChange={e => updateBookingOption(i, 'name', e.target.value)}
                          placeholder="e.g. Half Day Session"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Price (£)</label>
                        <input
                          type="number"
                          value={opt.price}
                          onChange={e => updateBookingOption(i, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Price Type</label>
                        <select
                          value={opt.priceType}
                          onChange={e => updateBookingOption(i, 'priceType', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="session">Per Session</option>
                          <option value="day">Per Day</option>
                          <option value="hour">Per Hour</option>
                          <option value="person">Per Person</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Description</label>
                        <input
                          type="text"
                          value={opt.description}
                          onChange={e => updateBookingOption(i, 'description', e.target.value)}
                          placeholder="Brief description"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addBookingOption}
                  className="w-full py-2.5 border-2 border-dashed border-stone-300 rounded-lg text-sm font-medium text-stone-600 hover:border-brand-400 hover:text-brand-700 transition"
                >
                  + Add Booking Option
                </button>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Photos</h4>
              <div className="flex flex-wrap gap-3 mb-4">
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

            {/* Bottom save bar */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditingInstructor(null); setTab('instructors'); }}
                className="px-6 py-2.5 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEditInstructor}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-800 disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
