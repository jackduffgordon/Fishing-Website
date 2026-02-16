// ============================================
// WATER OWNER DASHBOARD - Manage waters and view inquiries
// ============================================
import { useState, useEffect } from 'react';
import {
  Droplets, ChevronLeft, Plus, Eye, Edit3, Loader, AlertTriangle,
  CheckCircle, Clock, XCircle, Mail, Phone, Calendar, MessageSquare
} from 'lucide-react';
import { getToken } from '../utils/api';

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
      {status === 'approved' && 'Live'}
      {status === 'rejected' && 'Rejected'}
    </span>
  );
};

// --- Water Card ---
const WaterCard = ({ water, onView }) => {
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

          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
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
            {water.status === 'approved' && (
              <button
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition"
              >
                <Edit3 className="w-4 h-4" /> Edit
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

  const pendingWaters = waters.filter(w => w.status === 'pending');
  const approvedWaters = waters.filter(w => w.status === 'approved');
  const rejectedWaters = waters.filter(w => w.status === 'rejected');

  const tabs = [
    { id: 'waters', label: 'My Waters', count: waters.length },
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
            <h1 className="text-2xl font-bold text-stone-900">Water Owner Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                      {pendingWaters.map(w => <WaterCard key={w.id} water={w} onView={() => {}} />)}
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
                      {approvedWaters.map(w => <WaterCard key={w.id} water={w} onView={() => {}} />)}
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
                      {rejectedWaters.map(w => <WaterCard key={w.id} water={w} onView={() => {}} />)}
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
      </div>
    </div>
  );
};

export default WaterOwnerDashboard;
