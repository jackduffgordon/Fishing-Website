// ============================================
// INSTRUCTOR DASHBOARD - Manage profile and view inquiries
// ============================================
import { useState, useEffect } from 'react';
import {
  User, ChevronLeft, Edit3, Loader, AlertTriangle, CheckCircle,
  Clock, XCircle, Mail, Phone, Calendar, MessageSquare, Award, Star
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

              {instructor.status === 'approved' && (
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

              {instructor.status === 'approved' && (
                <div className="mt-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
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
        {tab === 'overview' && (
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
