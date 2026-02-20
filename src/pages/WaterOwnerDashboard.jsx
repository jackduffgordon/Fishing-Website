// ============================================
// WATER OWNER DASHBOARD - Manage waters and view inquiries
// ============================================
import { useState, useEffect } from 'react';
import {
  Droplets, ChevronLeft, Plus, Eye, Edit3, Loader, AlertTriangle,
  CheckCircle, Clock, XCircle, Mail, Phone, Calendar, MessageSquare,
  Save, X, Trash2, Upload, Image, BarChart3, TrendingUp, Heart, Star
} from 'lucide-react';
import { getToken, uploadImage as apiUploadImage, validateImageFile } from '../utils/api';
import { VenueDetailPage } from './VenueDetail';

const SPECIES = [
  'Brown Trout', 'Rainbow Trout', 'Salmon', 'Sea Trout', 'Grayling',
  'Carp', 'Pike', 'Perch', 'Roach', 'Tench', 'Barbel', 'Bream',
  'Chub', 'Bass', 'Cod', 'Mackerel'
];

const AMENITIES = [
  'Parking', 'Toilets', 'Cafe', 'Tackle Shop', 'Boat Hire',
  'Disabled Access', 'Night Fishing', 'Showers', 'Fishing Hut',
  'Ghillie', 'Lunch', 'Wading', 'Rod Room'
];

const REGIONS = [
  'Scottish Highlands', 'Scottish Lowlands', 'North East England',
  'North West England', 'Yorkshire', 'East Midlands', 'West Midlands',
  'East of England', 'South East England', 'South West England',
  'Wales', 'Northern Ireland', 'Ireland'
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

// --- Water Card ---
const WaterCard = ({ water, onView, onEdit, onRequestRemoval }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition">
      <div className="flex items-start gap-4 p-4">
        <div
          className="w-20 h-20 rounded-lg flex-shrink-0"
          style={{
            background: water.images?.[0]
              ? `url(${water.images[0]}) center/cover`
              : 'linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)'
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-900 truncate">{water.name}</h3>
              <p className="text-sm text-stone-500">
                {water.type} • {water.region} • £{water.price}/{water.priceType || 'day'}
              </p>
            </div>
            <StatusBadge status={water.status} />
          </div>

          {water.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Awaiting admin approval. You'll be notified once your water is reviewed.
              </p>
            </div>
          )}

          {water.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                This submission was not approved. Please contact support for details.
              </p>
            </div>
          )}

          {water.status === 'removal_requested' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Removal requested. An admin will process this shortly.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <p className="text-stone-500">Species</p>
              <p className="font-medium text-stone-900">
                {(water.species || []).slice(0, 2).join(', ') || 'None listed'}
                {water.species?.length > 2 && ` +${water.species.length - 2}`}
              </p>
            </div>
            <div>
              <p className="text-stone-500">Rating</p>
              <p className="font-medium text-stone-900">
                ⭐ {water.rating || 0} ({water.reviewCount || 0} reviews)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(water)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition"
            >
              <Eye className="w-4 h-4" /> View Details
            </button>
            {onEdit && water.status !== 'removal_requested' && (
              <button
                onClick={() => onEdit(water)}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            )}
            {onRequestRemoval && water.status !== 'removal_requested' && water.status !== 'rejected' && (
              <button
                onClick={() => onRequestRemoval(water)}
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
export const WaterOwnerDashboard = ({ user, onBack, onListWater }) => {
  const [tab, setTab] = useState('waters');
  const [waters, setWaters] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingWater, setEditingWater] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewWater, setPreviewWater] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

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
    priceType: w.price_type || w.priceType || 'day',
    bookingType: w.booking_type || w.bookingType || 'enquiry',
    image: w.images?.[0] || '',
    gallery: w.images || [],
    rating: 0,
    reviews: 0,
    bookingOptions: (w.booking_options || w.bookingOptions || []).map((opt, i) => ({
      ...opt,
      id: opt.id || `opt-${i}`,
      bookingType: opt.booking_type || opt.bookingType || 'enquiry',
      priceType: opt.price_type || opt.priceType || 'day',
    })),
    contact: {
      name: w.owner_name || '',
      email: w.owner_email || '',
      phone: w.owner_phone || '',
    },
    coordinates: w.coordinates || null,
    rods: w.rods || 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();

      // Fetch owner's waters
      const watersRes = await fetch('/api/owner/waters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (watersRes.ok) {
        const watersData = await watersRes.json();
        setWaters(watersData.waters || []);
      }

      // Fetch inquiries
      const inquiriesRes = await fetch('/api/owner/inquiries', {
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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/owner/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
    setAnalyticsLoading(false);
  };

  const startEditWater = (water) => {
    setEditData({
      name: water.name || '',
      description: water.description || '',
      type: water.type || '',
      region: water.region || '',
      species: water.species || [],
      amenities: water.amenities || water.facilities || [],
      rules: water.rules || [],
      images: water.images || [],
      booking_options: (water.booking_options || water.bookingOptions || []).map(opt => ({
        name: opt.name || '',
        price: opt.price || '',
        priceType: opt.price_type || opt.priceType || 'day',
        category: opt.category || 'day-tickets',
        bookingType: opt.booking_type || opt.bookingType || 'enquiry',
        description: opt.description || '',
      })),
    });
    setEditingWater(water);
    setTab('edit');
  };

  const saveEditWater = async () => {
    setSaving(true);
    setError('');
    try {
      const token = getToken();
      const payload = {
        name: editData.name,
        description: editData.description,
        type: editData.type,
        region: editData.region,
        species: editData.species,
        amenities: editData.amenities,
        rules: editData.rules.filter(r => r.trim()),
        images: editData.images || [],
        booking_options: editData.booking_options,
      };
      const res = await fetch(`/api/owner/waters/${editingWater.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      await fetchData();
      setEditingWater(null);
      setTab('waters');
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
        name: '', price: '', priceType: 'day', category: 'day-tickets', bookingType: 'enquiry', description: ''
      }]
    }));
  };

  const removeBookingOption = (index) => {
    setEditData(prev => ({
      ...prev,
      booking_options: prev.booking_options.filter((_, i) => i !== index)
    }));
  };

  const requestRemoval = async (water) => {
    if (!window.confirm(`Are you sure you want to request removal of "${water.name}"? This will be reviewed by an admin.`)) return;
    try {
      const token = getToken();
      const res = await fetch(`/api/owner/waters/${water.id}/request-removal`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      await fetchData();
    } catch (err) {
      setError('Failed to request removal');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate all files first
    for (const file of files) {
      const err = validateImageFile(file);
      if (err) { setError(err); return; }
    }

    setSaving(true);
    try {
      const urls = await Promise.all(files.map(f => apiUploadImage(f, 'waters')));
      setEditData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
    } catch (err) {
      setError(err.message || 'Failed to upload image(s)');
    }
    setSaving(false);
  };

  const removeImage = (index) => {
    setEditData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const pendingWaters = waters.filter(w => w.status === 'pending');
  const approvedWaters = waters.filter(w => w.status === 'approved');
  const rejectedWaters = waters.filter(w => w.status === 'rejected');
  const removalWaters = waters.filter(w => w.status === 'removal_requested');

  const tabsList = [
    { id: 'waters', label: 'My Waters', count: waters.length },
    { id: 'inquiries', label: 'Inquiries', count: inquiries.length },
    { id: 'analytics', label: 'Analytics' },
    ...(editingWater ? [{ id: 'edit', label: `Edit: ${editingWater.name}` }] : [])
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
            <h1 className="text-2xl font-bold text-stone-900">My Waters Dashboard</h1>
            <button
              onClick={onListWater}
              className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">List Water</span>
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
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Total Waters</p>
                <p className="text-4xl font-bold text-stone-900 mt-2">{waters.length}</p>
              </div>
              <Droplets className="w-10 h-10 text-brand-700 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Live</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{approvedWaters.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold text-amber-600 mt-2">{pendingWaters.length}</p>
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
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                tab === t.id ? 'bg-white/20' : 'bg-stone-100'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Waters Tab */}
        {tab === 'waters' && (
          <div className="space-y-4">
            {waters.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Droplets className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-700 mb-2">No waters listed yet</h3>
                <p className="text-stone-500 text-sm mb-4">List your first water to start receiving bookings</p>
                <button
                  onClick={onListWater}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition"
                >
                  <Plus className="w-4 h-4" />
                  List Your Water
                </button>
              </div>
            ) : (
              <>
                {pendingWaters.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      Pending Approval ({pendingWaters.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingWaters.map(w => <WaterCard key={w.id} water={w} onView={setPreviewWater} onEdit={startEditWater} onRequestRemoval={requestRemoval} />)}
                    </div>
                  </div>
                )}

                {approvedWaters.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Live Waters ({approvedWaters.length})
                    </h3>
                    <div className="space-y-3">
                      {approvedWaters.map(w => <WaterCard key={w.id} water={w} onView={setPreviewWater} onEdit={startEditWater} onRequestRemoval={requestRemoval} />)}
                    </div>
                  </div>
                )}

                {removalWaters.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <Trash2 className="w-5 h-5 text-orange-600" />
                      Removal Requested ({removalWaters.length})
                    </h3>
                    <div className="space-y-3">
                      {removalWaters.map(w => <WaterCard key={w.id} water={w} onView={setPreviewWater} onEdit={startEditWater} onRequestRemoval={requestRemoval} />)}
                    </div>
                  </div>
                )}

                {rejectedWaters.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Rejected ({rejectedWaters.length})
                    </h3>
                    <div className="space-y-3">
                      {rejectedWaters.map(w => <WaterCard key={w.id} water={w} onView={setPreviewWater} onEdit={startEditWater} onRequestRemoval={requestRemoval} />)}
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
                <p className="text-stone-500 text-sm">When anglers contact you, their inquiries will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map(inq => <InquiryCard key={inq.id} inquiry={inq} />)}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            {!analytics && !analyticsLoading && (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <BarChart3 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-700 mb-2">View your analytics</h3>
                <p className="text-stone-500 text-sm mb-4">See how your waters are performing over the last 30 days</p>
                <button
                  onClick={fetchAnalytics}
                  className="px-6 py-2.5 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800 transition"
                >
                  Load Analytics
                </button>
              </div>
            )}

            {analyticsLoading && (
              <div className="text-center py-16">
                <Loader className="w-8 h-8 text-brand-600 mx-auto mb-3 animate-spin" />
                <p className="text-stone-500">Loading analytics...</p>
              </div>
            )}

            {analytics && !analyticsLoading && (
              <>
                {/* Totals Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-stone-900">{analytics.totals.views}</p>
                        <p className="text-stone-500 text-sm">Views (30d)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-stone-900">{analytics.totals.inquiries}</p>
                        <p className="text-stone-500 text-sm">Inquiries</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-stone-900">{analytics.totals.bookings}</p>
                        <p className="text-stone-500 text-sm">Bookings</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 text-red-700 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-stone-900">{analytics.totals.favourites}</p>
                        <p className="text-stone-500 text-sm">Favourites</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Views Chart (simple bar chart) */}
                {analytics.dailyViews && analytics.dailyViews.length > 0 && (
                  <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-stone-900">Page Views — Last 30 Days</h3>
                      <button
                        onClick={fetchAnalytics}
                        className="text-sm text-brand-700 hover:text-brand-800 font-medium"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="flex items-end gap-0.5 h-32">
                      {analytics.dailyViews.map((d, i) => {
                        const maxCount = Math.max(...analytics.dailyViews.map(v => v.count), 1);
                        const height = d.count > 0 ? Math.max((d.count / maxCount) * 100, 4) : 2;
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-t group relative"
                            style={{ height: `${height}%`, backgroundColor: d.count > 0 ? '#0f766e' : '#e7e5e4' }}
                            title={`${d.date}: ${d.count} views`}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                              {d.count} views
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-stone-400">
                      <span>{analytics.dailyViews[0]?.date?.slice(5)}</span>
                      <span>{analytics.dailyViews[analytics.dailyViews.length - 1]?.date?.slice(5)}</span>
                    </div>
                  </div>
                )}

                {/* Per-Water Breakdown */}
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="p-4 border-b border-stone-200">
                    <h3 className="font-semibold text-stone-900">Performance by Water</h3>
                  </div>
                  {analytics.waters.length === 0 ? (
                    <div className="p-8 text-center text-stone-500">No waters to show analytics for</div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {analytics.waters.map(w => (
                        <div key={w.id} className="p-4 hover:bg-stone-50">
                          <h4 className="font-medium text-stone-900 mb-2">{w.name}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                            <div>
                              <p className="text-stone-500">Views</p>
                              <p className="font-semibold text-stone-900">{w.views}</p>
                            </div>
                            <div>
                              <p className="text-stone-500">Inquiries</p>
                              <p className="font-semibold text-stone-900">{w.inquiries}</p>
                            </div>
                            <div>
                              <p className="text-stone-500">Bookings</p>
                              <p className="font-semibold text-stone-900">{w.bookings}</p>
                            </div>
                            <div>
                              <p className="text-stone-500">Favourites</p>
                              <p className="font-semibold text-stone-900">{w.favourites}</p>
                            </div>
                            <div>
                              <p className="text-stone-500">Rating</p>
                              <p className="font-semibold text-stone-900 flex items-center gap-1">
                                {w.avgRating ? (
                                  <>
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    {w.avgRating} ({w.reviewCount})
                                  </>
                                ) : (
                                  <span className="text-stone-400">No reviews</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Edit Water Tab */}
        {tab === 'edit' && editingWater && (
          <div className="space-y-6">
            {/* Save / Cancel bar */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-stone-200 p-4">
              <h3 className="font-semibold text-stone-900">Editing: {editingWater.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={saveEditWater}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setEditingWater(null); setTab('waters'); }}
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
                  <label className="block text-sm font-medium text-stone-700 mb-1">Water Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Type</label>
                  <select
                    value={editData.type}
                    onChange={e => setEditData({ ...editData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">Select type</option>
                    <option value="River">River</option>
                    <option value="Lake">Lake</option>
                    <option value="Reservoir">Reservoir</option>
                    <option value="Loch">Loch</option>
                    <option value="Canal">Canal</option>
                    <option value="Pond">Pond</option>
                    <option value="Coastal">Coastal</option>
                    <option value="Chalk Stream">Chalk Stream</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Region</label>
                  <select
                    value={editData.region}
                    onChange={e => setEditData({ ...editData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Describe your water..."
                />
              </div>
            </div>

            {/* Species */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Species</h4>
              <div className="flex flex-wrap gap-2">
                {SPECIES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleArrayItem('species', s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      editData.species.includes(s)
                        ? 'bg-brand-100 text-brand-700 border-brand-300'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleArrayItem('amenities', a)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      editData.amenities.includes(a)
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-3">Rules</h4>
              <div className="space-y-2">
                {editData.rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-stone-400 text-sm w-6">{i + 1}.</span>
                    <input
                      type="text"
                      value={rule}
                      onChange={e => {
                        const newRules = [...editData.rules];
                        newRules[i] = e.target.value;
                        setEditData({ ...editData, rules: newRules });
                      }}
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    />
                    <button
                      onClick={() => setEditData({ ...editData, rules: editData.rules.filter((_, j) => j !== i) })}
                      className="p-1.5 text-stone-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setEditData({ ...editData, rules: [...editData.rules, ''] })}
                  className="text-sm text-brand-700 hover:text-brand-800 font-medium"
                >
                  + Add Rule
                </button>
              </div>
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
                        <label className="block text-xs text-stone-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={opt.name}
                          onChange={e => updateBookingOption(i, 'name', e.target.value)}
                          placeholder="e.g. Full Day Ticket"
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
                        <label className="block text-xs text-stone-500 mb-1">Category</label>
                        <select
                          value={opt.category}
                          onChange={e => updateBookingOption(i, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="day-tickets">Day Tickets</option>
                          <option value="guided">Guided</option>
                          <option value="accommodation">Accommodation</option>
                          <option value="extras">Extras</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Booking Type</label>
                        <select
                          value={opt.bookingType}
                          onChange={e => updateBookingOption(i, 'bookingType', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="instant">Instant Book</option>
                          <option value="enquiry">Enquiry</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Price Type</label>
                        <select
                          value={opt.priceType}
                          onChange={e => updateBookingOption(i, 'priceType', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="day">Per Day</option>
                          <option value="session">Per Session</option>
                          <option value="rod">Per Rod</option>
                          <option value="night">Per Night</option>
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
              <p className="text-xs text-stone-500">Upload photos of your water. JPG, PNG or WebP.</p>
            </div>

            {/* Bottom save bar */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditingWater(null); setTab('waters'); }}
                className="px-6 py-2.5 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEditWater}
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

export default WaterOwnerDashboard;
