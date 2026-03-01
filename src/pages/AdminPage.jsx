// ============================================
// ADMIN DASHBOARD - Manage waters, instructors, users
// ============================================
import { useState, useEffect } from 'react';
import {
  Fish, Users, Droplets, Clock, CheckCircle, XCircle, X,
  ChevronDown, ChevronUp, Loader, AlertTriangle, Eye, Trash2,
  BarChart3, RefreshCw, MapPin, Star, Mail, Phone, Award
} from 'lucide-react';
import { adminAPI, normalizeInstructor } from '../utils/api';
import { VenueDetailPage } from './VenueDetail';
import { InstructorDetailPage } from './InstructorDetail';

// --- Status Badge ---
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    removal_requested: 'bg-orange-100 text-orange-700'
  };
  const labels = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    removal_requested: 'removal requested'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-stone-100 text-stone-600'}`}>
      {labels[status] || status}
    </span>
  );
};

// --- Stats Card ---
const StatCard = ({ icon: Icon, label, value, color = 'brand' }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 bg-${color}-100 text-${color}-700 rounded-lg flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-900">{value}</p>
        <p className="text-stone-500 text-sm">{label}</p>
      </div>
    </div>
  </div>
);

// --- Pill Badge ---
const PillBadge = ({ text, color = 'stone' }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
    {text}
  </span>
);

// --- Water Row ---
const WaterRow = ({ water, onApprove, onReject, onPreview, onDelete, actionLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const bookingOptions = water.booking_options || water.bookingOptions || [];

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{
            background: water.images?.[0]
              ? `url(${water.images[0]}) center/cover`
              : 'linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)'
          }} />
          <div className="min-w-0">
            <h4 className="font-medium text-stone-900 truncate">{water.name}</h4>
            <p className="text-sm text-stone-500 truncate">
              {water.type} • {water.region} • {water.ownerEmail || water.owner_email || 'No email'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {water.last_edited_at && (Date.now() - new Date(water.last_edited_at).getTime()) < 7 * 86400000 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Edited</span>
          )}
          <StatusBadge status={water.status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-200 p-4 bg-stone-50 space-y-4">
          {/* Basic info grid */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-stone-500">Owner</p>
              <p className="font-medium">{water.ownerName || water.owner_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-stone-500">Email</p>
              <p className="font-medium">{water.ownerEmail || water.owner_email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-stone-500">Phone</p>
              <p className="font-medium">{water.ownerPhone || water.owner_phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-stone-500">Location</p>
              <p className="font-medium">{water.location || water.town_city || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-stone-500">Type</p>
              <p className="font-medium">{water.type || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-stone-500">Region</p>
              <p className="font-medium">{water.region || 'Not specified'}</p>
            </div>
          </div>

          {/* Description */}
          {water.description && (
            <div>
              <p className="text-stone-500 text-sm mb-1">Description</p>
              <p className="text-sm text-stone-700 whitespace-pre-line">{water.description}</p>
            </div>
          )}

          {/* Species */}
          {(water.species || []).length > 0 && (
            <div>
              <p className="text-stone-500 text-sm mb-1.5">Species</p>
              <div className="flex flex-wrap gap-1.5">
                {water.species.map(s => <PillBadge key={s} text={s} color="brand" />)}
              </div>
            </div>
          )}

          {/* Amenities */}
          {(water.amenities || water.facilities || []).length > 0 && (
            <div>
              <p className="text-stone-500 text-sm mb-1.5">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {(water.amenities || water.facilities || []).map(a => <PillBadge key={a} text={a} color="green" />)}
              </div>
            </div>
          )}

          {/* Booking Options */}
          {bookingOptions.length > 0 && (
            <div>
              <p className="text-stone-500 text-sm mb-1.5">Booking Options ({bookingOptions.length})</p>
              <div className="space-y-2">
                {bookingOptions.map((opt, i) => (
                  <div key={opt.id || i} className="bg-white border border-stone-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-900">{opt.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          opt.category === 'guided' ? 'bg-amber-100 text-amber-700' :
                          opt.category === 'accommodation' ? 'bg-purple-100 text-purple-700' :
                          opt.category === 'extras' ? 'bg-blue-100 text-blue-700' :
                          'bg-brand-50 text-brand-700'
                        }`}>
                          {opt.category || 'day-tickets'}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          (opt.booking_type || opt.bookingType) === 'instant'
                            ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {(opt.booking_type || opt.bookingType) === 'instant' ? 'Instant' : 'Enquiry'}
                        </span>
                      </div>
                      <span className="font-bold text-stone-900">
                        £{opt.price}{opt.price_type || opt.priceType ? '/' + (opt.price_type || opt.priceType) : ''}
                      </span>
                    </div>
                    {opt.description && (
                      <p className="text-stone-500 text-xs mt-1">{opt.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {(water.rules || []).length > 0 && (
            <div>
              <p className="text-stone-500 text-sm mb-1.5">Rules</p>
              <ol className="list-decimal list-inside text-sm text-stone-700 space-y-1">
                {water.rules.map((rule, i) => <li key={i}>{rule}</li>)}
              </ol>
            </div>
          )}

          {/* Images */}
          {(water.images || []).length > 0 && (
            <div>
              <p className="text-stone-500 text-sm mb-1.5">Images ({water.images.length})</p>
              <div className="flex gap-2 overflow-x-auto">
                {water.images.map((img, i) => (
                  <img key={i} src={img} alt={`${water.name} ${i + 1}`}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-stone-200" />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-stone-200">
            {onPreview && (
              <button
                onClick={() => onPreview(water)}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-100 transition"
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
            )}
            {water.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(water.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => onReject(water.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            {water.status === 'approved' && (
              <button
                onClick={() => onReject(water.id)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-300 disabled:opacity-50 transition"
              >
                <XCircle className="w-4 h-4" /> Unpublish
              </button>
            )}
            {water.status === 'rejected' && (
              <button
                onClick={() => onApprove(water.id)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            )}
            {water.status === 'removal_requested' && (
              <>
                <button
                  onClick={() => onDelete(water.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                >
                  <Trash2 className="w-4 h-4" /> Confirm Delete
                </button>
                <button
                  onClick={() => onApprove(water.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-300 disabled:opacity-50 transition"
                >
                  <CheckCircle className="w-4 h-4" /> Keep (Re-approve)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Instructor Row ---
const InstructorRow = ({ instructor, onApprove, onReject, onPreview, actionLoading }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-medium flex-shrink-0">
            {(instructor.name || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-stone-900 truncate">{instructor.name}</h4>
            <p className="text-sm text-stone-500 truncate">
              {(instructor.specialties || []).join(', ') || 'No specialties'} • {instructor.email || 'No email'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {instructor.last_edited_at && (Date.now() - new Date(instructor.last_edited_at).getTime()) < 7 * 86400000 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Edited</span>
          )}
          <StatusBadge status={instructor.status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-200 p-4 bg-stone-50 space-y-4">
          {/* Basic info grid */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-stone-500">Email</p>
              <p className="font-medium">{instructor.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-stone-500">Phone</p>
              <p className="font-medium">{instructor.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-stone-500">Region</p>
              <p className="font-medium">{instructor.location || instructor.region || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-stone-500">Price</p>
              <p className="font-medium">£{instructor.price || 0}</p>
            </div>
            <div>
              <p className="text-stone-500">Experience</p>
              <p className="font-medium">{instructor.experience ? `${instructor.experience} years` : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-stone-500">Availability</p>
              <p className="font-medium">{instructor.availability || 'Not specified'}</p>
            </div>
          </div>

          {/* Bio */}
          {instructor.bio && (
            <div>
              <p className="text-stone-500 text-sm mb-1">Bio</p>
              <p className="text-sm text-stone-700 whitespace-pre-line">{instructor.bio}</p>
            </div>
          )}

          {/* Specialties */}
          {(instructor.specialties || []).length > 0 && (
            <div>
              <p className="text-stone-500 text-sm mb-1.5">Specialties</p>
              <div className="flex flex-wrap gap-1.5">
                {instructor.specialties.map(s => <PillBadge key={s} text={s} color="brand" />)}
              </div>
            </div>
          )}

          {/* Certifications */}
          {(instructor.certifications || []).length > 0 && (
            <div>
              <p className="text-stone-500 text-sm mb-1.5">Certifications</p>
              <div className="flex flex-wrap gap-1.5">
                {instructor.certifications.map(c => <PillBadge key={c} text={c} color="amber" />)}
              </div>
            </div>
          )}

          {/* Images */}
          {(instructor.images || []).length > 0 && (
            <div>
              <p className="text-stone-500 text-sm mb-1.5">Images ({instructor.images.length})</p>
              <div className="flex gap-2 overflow-x-auto">
                {instructor.images.map((img, i) => (
                  <img key={i} src={img} alt={`${instructor.name} ${i + 1}`}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-stone-200" />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-stone-200">
            {onPreview && (
              <button
                onClick={() => onPreview(instructor)}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-100 transition"
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
            )}
            {instructor.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(instructor.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => onReject(instructor.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            {instructor.status === 'approved' && (
              <button
                onClick={() => onReject(instructor.id)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-300 disabled:opacity-50 transition"
              >
                <XCircle className="w-4 h-4" /> Unpublish
              </button>
            )}
            {instructor.status === 'rejected' && (
              <button
                onClick={() => onApprove(instructor.id)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Admin Page ---
export const AdminPage = ({ user }) => {
  const [tab, setTab] = useState('pending');
  const [stats, setStats] = useState(null);
  const [waters, setWaters] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewWater, setPreviewWater] = useState(null);
  const [previewInstructor, setPreviewInstructor] = useState(null);

  // Fetch all admin data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, watersRes, instructorsRes, usersRes] = await Promise.all([
        adminAPI.getStats().catch(() => null),
        adminAPI.getWaters().catch(() => ({ approved: [], pending: [] })),
        adminAPI.getInstructors().catch(() => ({ approved: [], pending: [] })),
        adminAPI.getUsers().catch(() => ({ users: [] }))
      ]);
      if (statsRes) setStats(statsRes);
      // Admin endpoint returns { approved: [], pending: [], removal_requested: [] }
      const allWaters = [
        ...(watersRes.pending || []).map(w => ({ ...w, status: w.status || 'pending' })),
        ...(watersRes.approved || []).map(w => ({ ...w, status: w.status || 'approved' })),
        ...(watersRes.removal_requested || []).map(w => ({ ...w, status: w.status || 'removal_requested' }))
      ];
      setWaters(allWaters);
      const allInstructors = [
        ...(instructorsRes.pending || []).map(i => ({ ...i, status: i.status || 'pending' })),
        ...(instructorsRes.approved || []).map(i => ({ ...i, status: i.status || 'approved' }))
      ];
      setInstructors(allInstructors);
      setUsers(usersRes.users || []);
    } catch (err) {
      setError('Failed to load admin data. Make sure you have admin permissions.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Actions
  const handleApproveWater = async (id) => {
    setActionLoading(true);
    try {
      await adminAPI.approveWater(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const handleRejectWater = async (id) => {
    setActionLoading(true);
    try {
      await adminAPI.rejectWater(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const handleApproveInstructor = async (id) => {
    setActionLoading(true);
    try {
      await adminAPI.approveInstructor(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const handleRejectInstructor = async (id) => {
    setActionLoading(true);
    try {
      await adminAPI.rejectInstructor(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const handleDeleteWater = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this water listing?')) return;
    setActionLoading(true);
    try {
      await adminAPI.deleteWater(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  // Filtered lists
  const pendingWaters = waters.filter(w => w.status === 'pending');
  const removalWaters = waters.filter(w => w.status === 'removal_requested');
  const pendingInstructors = instructors.filter(i => i.status === 'pending');
  const pendingCount = pendingWaters.length + pendingInstructors.length + removalWaters.length;

  const tabs = [
    { id: 'pending', label: 'Pending Review', count: pendingCount },
    { id: 'waters', label: 'All Waters', count: waters.length },
    { id: 'instructors', label: 'All Instructors', count: instructors.length },
    { id: 'users', label: 'Users', count: users.length }
  ];

  // Convert DB water to VenueDetailPage format
  const mapWaterToFishery = (w) => ({
    id: w.id,
    name: w.name,
    type: w.type,
    region: w.region,
    location: w.location || w.town_city || '',
    species: w.species || [],
    amenities: w.amenities || w.facilities || [],
    rules: w.rules || [],
    description: w.description || '',
    fullDescription: w.description || '',
    price: w.price || 0,
    priceType: w.price_type || w.priceType || '',
    bookingType: w.booking_type || w.bookingType || 'enquiry',
    image: w.images?.[0] || '',
    gallery: w.images || [],
    rating: 0,
    reviews: 0,
    bookingOptions: (w.booking_options || w.bookingOptions || []).map((opt, i) => ({
      ...opt,
      id: opt.id || `opt-${i}`,
      bookingType: opt.booking_type || opt.bookingType || 'enquiry',
      priceType: opt.price_type || opt.priceType || '',
    })),
    contact: {
      name: w.ownerName || w.owner_name || '',
      email: w.ownerEmail || w.owner_email || '',
      phone: w.ownerPhone || w.owner_phone || '',
    },
    coordinates: w.coordinates || null,
    rods: w.rods || 0,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-brand-600 mx-auto mb-3 animate-spin" />
          <p className="text-stone-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Preview Modal */}
      {previewWater && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
          <div className="sticky top-0 z-10 flex justify-end p-4">
            <button
              onClick={() => setPreviewWater(null)}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5 text-stone-700" />
            </button>
          </div>
          <div className="max-w-7xl mx-auto bg-stone-50 min-h-screen">
            <VenueDetailPage
              fishery={mapWaterToFishery(previewWater)}
              onBack={() => setPreviewWater(null)}
              user={null}
              onSignIn={() => {}}
            />
          </div>
        </div>
      )}

      {/* Instructor Preview Modal */}
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
      <div className="bg-stone-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-stone-400 text-sm">
                Manage waters, instructors, and users
              </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-sm transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Droplets} label="Total Waters" value={waters.length} />
          <StatCard icon={Users} label="Total Instructors" value={instructors.length} />
          <StatCard icon={Clock} label="Pending Review" value={pendingCount} color="amber" />
          <StatCard icon={Users} label="Users" value={users.length} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-stone-200 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                tab === t.id
                  ? 'bg-brand-700 text-white'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                tab === t.id ? 'bg-white/20' : 'bg-stone-100'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'pending' && (
          <div className="space-y-4">
            {pendingCount === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-700">All caught up!</h3>
                <p className="text-stone-500 text-sm">No items pending review.</p>
              </div>
            ) : (
              <>
                {pendingWaters.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-stone-700 mb-3">
                      Waters Pending ({pendingWaters.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingWaters.map(w => (
                        <WaterRow
                          key={w.id}
                          water={w}
                          onApprove={handleApproveWater}
                          onReject={handleRejectWater}
                          onPreview={setPreviewWater}
                          onDelete={handleDeleteWater}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {removalWaters.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <Trash2 className="w-5 h-5 text-orange-600" />
                      Removal Requests ({removalWaters.length})
                    </h3>
                    <div className="space-y-3">
                      {removalWaters.map(w => (
                        <WaterRow
                          key={w.id}
                          water={w}
                          onApprove={handleApproveWater}
                          onReject={handleRejectWater}
                          onPreview={setPreviewWater}
                          onDelete={handleDeleteWater}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {pendingInstructors.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-stone-700 mb-3">
                      Instructors Pending ({pendingInstructors.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingInstructors.map(i => (
                        <InstructorRow
                          key={i.id}
                          instructor={i}
                          onApprove={handleApproveInstructor}
                          onReject={handleRejectInstructor}
                          onPreview={setPreviewInstructor}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'waters' && (
          <div className="space-y-3">
            {waters.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Droplets className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">No waters in the database yet.</p>
              </div>
            ) : (
              waters.map(w => (
                <WaterRow
                  key={w.id}
                  water={w}
                  onApprove={handleApproveWater}
                  onReject={handleRejectWater}
                  onPreview={setPreviewWater}
                  onDelete={handleDeleteWater}
                  actionLoading={actionLoading}
                />
              ))
            )}
          </div>
        )}

        {tab === 'instructors' && (
          <div className="space-y-3">
            {instructors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">No instructors in the database yet.</p>
              </div>
            ) : (
              instructors.map(i => (
                <InstructorRow
                  key={i.id}
                  instructor={i}
                  onApprove={handleApproveInstructor}
                  onReject={handleRejectInstructor}
                  onPreview={setPreviewInstructor}
                  actionLoading={actionLoading}
                />
              ))
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">No users yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-stone-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={u.role} />
                      </td>
                      <td className="px-4 py-3 text-stone-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
