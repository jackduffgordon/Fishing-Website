import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  Shield,
  Settings,
  Edit3,
  Star,
  MapPin,
  Fish,
  ChevronLeft,
  Save,
  LogOut,
  Key,
  Bell,
  Mail,
  Award,
  Bookmark,
  Calendar,
  Trash2,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  X,
  Plus,
} from 'lucide-react';
import { getToken } from '../utils/api';
import { CatchReportForm } from '../components/forms/CatchReportForm';

const ProfilePage = ({
  user,
  setUser,
  onBack,
  onSignOut,
  favouriteWaters = [],
  favouriteInstructors = [],
  onToggleFavouriteWater,
  onToggleFavouriteInstructor,
  onNavigateToWater,
  onNavigateToInstructor,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [showCatchReportModal, setShowCatchReportModal] = useState(false);
  const [expandedCatchId, setExpandedCatchId] = useState(null);

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    favouriteFishSpecies: user?.favouriteFishSpecies || '',
    experienceLevel: user?.experienceLevel || 'beginner',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailConfirmations: true,
    emailMarketing: false,
    newWaterAlerts: true,
    units: 'metric',
  });

  // Activity data
  const [catches, setCatches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState({ waters: [], instructors: [] });
  const [activityLoading, setActivityLoading] = useState(true);

  // Review edit/delete
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewData, setEditReviewData] = useState({ rating: 0, title: '', text: '' });
  const [reviewSaving, setReviewSaving] = useState(false);

  const handleEditReview = (review) => {
    setEditingReview(review.id);
    setEditReviewData({ rating: review.rating, title: review.title || '', text: review.text || '' });
  };

  const handleSaveReview = async (reviewId) => {
    setReviewSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editReviewData)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...editReviewData } : r));
      setEditingReview(null);
      showMessage('Review updated');
    } catch (err) {
      showMessage(err.message, 'error');
    }
    setReviewSaving(false);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = getToken();
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showMessage('Review deleted');
    } catch (err) {
      showMessage('Failed to delete review', 'error');
    }
  };

  // Favourites detail data
  const [favWaterDetails, setFavWaterDetails] = useState({});
  const [favInstructorDetails, setFavInstructorDetails] = useState({});

  // Fetch favourite water/instructor details — only fetch individual items, not all
  useEffect(() => {
    const fetchFavDetails = async () => {
      if (favouriteWaters?.length > 0) {
        try {
          const results = await Promise.allSettled(
            favouriteWaters.map(id =>
              fetch(`/api/waters/${id}`).then(r => r.ok ? r.json() : null)
            )
          );
          const map = {};
          results.forEach(r => {
            if (r.status === 'fulfilled' && r.value?.water) {
              map[r.value.water.id] = r.value.water;
            }
          });
          setFavWaterDetails(map);
        } catch (err) { /* ignore */ }
      }
      if (favouriteInstructors?.length > 0) {
        try {
          const results = await Promise.allSettled(
            favouriteInstructors.map(id =>
              fetch(`/api/instructors/${id}`).then(r => r.ok ? r.json() : null)
            )
          );
          const map = {};
          results.forEach(r => {
            if (r.status === 'fulfilled' && r.value?.instructor) {
              map[r.value.instructor.id] = r.value.instructor;
            }
          });
          setFavInstructorDetails(map);
        } catch (err) { /* ignore */ }
      }
    };
    fetchFavDetails();
  }, [favouriteWaters, favouriteInstructors]);

  const handleDeleteCatch = async (e, catchId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this catch report?')) return;
    try {
      const token = localStorage.getItem('tightlines_token');
      const res = await fetch(`/api/catches/${catchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCatches(prev => prev.filter(c => c.id !== catchId));
        showMessage('Catch report deleted');
      } else {
        showMessage('Failed to delete catch');
      }
    } catch (err) {
      console.error('Error deleting catch:', err);
      showMessage('Failed to delete catch');
    }
  };

  // Fetch user activity data - each fetch is independent so one failure doesn't block others
  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user) return;
      setActivityLoading(true);
      const token = getToken();
      const authHeaders = { 'Authorization': `Bearer ${token}` };

      // Fetch all in parallel, each with its own error handling
      const [catchesResult, reviewsResult, bookingsResult, appsResult] = await Promise.allSettled([
        fetch('/api/catches/user', { headers: authHeaders }).then(r => r.ok ? r.json() : null),
        fetch('/api/reviews/user', { headers: authHeaders }).then(r => r.ok ? r.json() : null),
        fetch('/api/inquiries/user', { headers: authHeaders }).then(r => r.ok ? r.json() : null),
        fetch('/api/user/applications', { headers: authHeaders }).then(r => r.ok ? r.json() : null)
      ]);

      if (catchesResult.status === 'fulfilled' && catchesResult.value) {
        setCatches(catchesResult.value.catches || []);
      }
      if (reviewsResult.status === 'fulfilled' && reviewsResult.value) {
        setReviews(reviewsResult.value.reviews || []);
      }
      if (bookingsResult.status === 'fulfilled' && bookingsResult.value) {
        setBookings(bookingsResult.value.inquiries || []);
      }
      if (appsResult.status === 'fulfilled' && appsResult.value) {
        setApplications({ waters: appsResult.value.waters || [], instructors: appsResult.value.instructors || [] });
      }

      setActivityLoading(false);
    };

    fetchUserActivity();
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessageType(type);
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (e) => {
    const { name, type, value, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      showMessage('Profile updated successfully');
    } catch (error) {
      showMessage(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showMessage('Password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      showMessage('Password changed successfully');
    } catch (error) {
      showMessage(error.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavouriteWater = async (waterId) => {
    if (onToggleFavouriteWater) {
      await onToggleFavouriteWater(waterId);
      showMessage('Removed from favourites');
    }
  };

  const handleRemoveFavouriteInstructor = async (instructorId) => {
    if (onToggleFavouriteInstructor) {
      await onToggleFavouriteInstructor(instructorId);
      showMessage('Removed from favourites');
    }
  };

  const getMemberSinceDate = () => {
    if (!user?.createdAt) return 'Recently';
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getInitial = () => {
    return (user?.fullName || user?.email || 'U')[0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-stone-900">My Account</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Toast Messages */}
      {message && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition ${
            messageType === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-stone-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'favourites', label: 'My Favourites', icon: Heart },
            { id: 'edit', label: 'Edit Profile', icon: Edit3 },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? 'text-brand-700 border-brand-700'
                    : 'text-stone-600 border-transparent hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Profile Header Banner */}
            <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-6 md:p-8 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-3xl md:text-5xl font-bold text-white">
                    {getInitial()}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {user?.fullName || 'User Account'}
                  </h2>
                  <p className="text-white text-opacity-90">
                    {user?.email}
                  </p>
                  <p className="text-white text-opacity-75 text-sm mt-2">
                    Member since {getMemberSinceDate()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium">
                      Catches Reported
                    </p>
                    <p className="text-4xl font-bold text-stone-900 mt-2">
                      {catches.length}
                    </p>
                  </div>
                  <Fish className="w-10 h-10 text-brand-700 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium">
                      Reviews Written
                    </p>
                    <p className="text-4xl font-bold text-stone-900 mt-2">
                      {reviews.length}
                    </p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-brand-700 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium">
                      Favourite Waters
                    </p>
                    <p className="text-4xl font-bold text-stone-900 mt-2">
                      {favouriteWaters?.length || 0}
                    </p>
                  </div>
                  <Bookmark className="w-10 h-10 text-brand-700 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium">
                      Favourite Instructors
                    </p>
                    <p className="text-4xl font-bold text-stone-900 mt-2">
                      {favouriteInstructors?.length || 0}
                    </p>
                  </div>
                  <Award className="w-10 h-10 text-brand-700 opacity-20" />
                </div>
              </div>
            </div>

            {/* Recent Catches */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Fish className="w-5 h-5 text-brand-700" />
                  Recent Catches ({catches.length})
                </h3>
                <button
                  onClick={() => setShowCatchReportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Report Catch
                </button>
              </div>
              {activityLoading ? (
                <p className="text-stone-500">Loading...</p>
              ) : catches.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {catches.slice(0, 4).map((catchReport) => {
                    const isExpanded = expandedCatchId === catchReport.id;
                    return (
                      <div
                        key={catchReport.id}
                        className="bg-stone-50 rounded-lg p-4 border border-stone-200 cursor-pointer hover:border-brand-700 transition"
                        onClick={() => setExpandedCatchId(isExpanded ? null : catchReport.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Fish className="w-5 h-5 text-brand-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-stone-900">
                                {catchReport.species}
                              </h4>
                              {catchReport.verified && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                                  Verified
                                </span>
                              )}
                              {!catchReport.isPublic && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-stone-300 text-stone-700 rounded">
                                  Private
                                </span>
                              )}
                            </div>
                            {catchReport.weight && (
                              <p className="text-sm text-stone-600">
                                {catchReport.weight} lbs
                              </p>
                            )}
                            <p className="text-xs text-stone-500 mt-1">
                              {new Date(catchReport.createdAt).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>

                            {/* Expanded details */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-stone-300 space-y-2">
                                {catchReport.method && (
                                  <div>
                                    <span className="text-xs font-semibold text-stone-700">Method: </span>
                                    <span className="text-xs text-stone-600">{catchReport.method}</span>
                                  </div>
                                )}
                                {catchReport.comment && (
                                  <div>
                                    <span className="text-xs font-semibold text-stone-700 block mb-1">Comment:</span>
                                    <p className="text-sm text-stone-600 bg-white rounded p-2">
                                      {catchReport.comment}
                                    </p>
                                  </div>
                                )}
                                <button
                                  onClick={(e) => handleDeleteCatch(e, catchReport.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition mt-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete Catch
                                </button>
                              </div>
                            )}

                            {!isExpanded && (catchReport.method || catchReport.comment) && (
                              <p className="text-xs text-brand-700 mt-2">
                                Click to view details →
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-stone-600">
                  No catches reported yet. Report your catches to track your success!
                </p>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-700" />
                Recent Reviews ({reviews.length})
              </h3>
              {activityLoading ? (
                <p className="text-stone-500">Loading...</p>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="bg-stone-50 rounded-lg p-4 border border-stone-200"
                    >
                      {editingReview === review.id ? (
                        /* Edit mode */
                        <div className="space-y-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditReviewData(d => ({ ...d, rating: star }))}
                                className="cursor-pointer hover:scale-110 transition"
                              >
                                <Star className={`w-5 h-5 ${star <= editReviewData.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`} />
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={editReviewData.title}
                            onChange={e => setEditReviewData(d => ({ ...d, title: e.target.value }))}
                            placeholder="Review title (optional)"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                          />
                          <textarea
                            rows={3}
                            value={editReviewData.text}
                            onChange={e => setEditReviewData(d => ({ ...d, text: e.target.value }))}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveReview(review.id)}
                              disabled={reviewSaving}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {reviewSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingReview(null)}
                              className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display mode */
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-stone-200 text-stone-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              {review.verified && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Verified
                                </span>
                              )}
                              <button
                                onClick={() => handleEditReview(review)}
                                className="p-1 text-stone-400 hover:text-brand-700 transition"
                                title="Edit review"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="p-1 text-stone-400 hover:text-red-500 transition"
                                title="Delete review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-stone-900 mb-1">{review.title}</h4>
                          )}
                          <p className="text-sm text-stone-600 mb-2">{review.text}</p>
                          <p className="text-xs text-stone-400">
                            {new Date(review.createdAt).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-600">
                  No reviews written yet. Share your experiences with the community!
                </p>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-700" />
                Recent Bookings ({bookings.length})
              </h3>
              {activityLoading ? (
                <p className="text-stone-500">Loading...</p>
              ) : bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-stone-50 rounded-lg p-4 border border-stone-200 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-stone-900">
                            {booking.waterName || booking.instructorName || 'Booking'}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-stone-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(booking.preferredDate || booking.createdAt).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {booking.numberOfPeople && (
                            <span>{booking.numberOfPeople} people</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-600">
                  No bookings yet. Explore waters and instructors to make your first booking!
                </p>
              )}
            </div>

            {/* My Applications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-5 h-5 text-brand-700" />
                <h3 className="text-lg font-bold text-stone-900">
                  My Applications ({applications.waters.length + applications.instructors.length})
                </h3>
              </div>

              {/* Water Applications */}
              {applications.waters.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-stone-700 mb-2">Water Listings</h4>
                  <div className="space-y-2">
                    {applications.waters.map((water) => (
                      <div key={water.id} className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-stone-900">{water.name}</h5>
                            <p className="text-xs text-stone-500">{water.type} &middot; {water.region}</p>
                            {water.email && <p className="text-xs text-stone-400 mt-0.5">Submitted as: {water.email}</p>}
                            <p className="text-xs text-stone-400">
                              {new Date(water.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            water.status === 'approved' ? 'bg-green-100 text-green-700' :
                            water.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {water.status === 'approved' ? 'Approved' : water.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Applications */}
              {applications.instructors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-stone-700 mb-2">Instructor Profiles</h4>
                  <div className="space-y-2">
                    {applications.instructors.map((inst) => (
                      <div key={inst.id} className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-stone-900">{inst.name}</h5>
                            <p className="text-xs text-stone-500">{inst.region}</p>
                            {inst.email && <p className="text-xs text-stone-400 mt-0.5">Submitted as: {inst.email}</p>}
                            <p className="text-xs text-stone-400">
                              {new Date(inst.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            inst.status === 'approved' ? 'bg-green-100 text-green-700' :
                            inst.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {inst.status === 'approved' ? 'Approved' : inst.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {applications.waters.length === 0 && applications.instructors.length === 0 && (
                <p className="text-stone-500 text-sm">
                  No applications yet. List a water or register as an instructor to see your submissions here.
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => onNavigateToWater?.()}
                className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 hover:border-brand-700 hover:shadow-md transition text-center"
              >
                <MapPin className="w-8 h-8 text-brand-700 mx-auto mb-3" />
                <p className="font-semibold text-stone-900">Find Waters</p>
                <p className="text-sm text-stone-600 mt-1">
                  Explore fishing locations
                </p>
              </button>
              <button
                onClick={() => onNavigateToInstructor?.()}
                className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 hover:border-brand-700 hover:shadow-md transition text-center"
              >
                <Award className="w-8 h-8 text-brand-700 mx-auto mb-3" />
                <p className="font-semibold text-stone-900">Find Instructors</p>
                <p className="text-sm text-stone-600 mt-1">
                  Book expert guidance
                </p>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 hover:border-brand-700 hover:shadow-md transition text-center"
              >
                <Edit3 className="w-8 h-8 text-brand-700 mx-auto mb-3" />
                <p className="font-semibold text-stone-900">Edit Profile</p>
                <p className="text-sm text-stone-600 mt-1">
                  Update your details
                </p>
              </button>
            </div>
          </div>
        )}

        {/* My Favourites Tab */}
        {activeTab === 'favourites' && (
          <div className="space-y-8">
            {/* Favourite Waters */}
            <div>
              <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-brand-700" />
                Favourite Waters
              </h3>
              {favouriteWaters && favouriteWaters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favouriteWaters.map((waterId) => {
                    const w = favWaterDetails[waterId];
                    return (
                      <div
                        key={waterId}
                        className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-stone-900">
                            {w?.name || 'Loading...'}
                          </h4>
                          <button
                            onClick={() => handleRemoveFavouriteWater(waterId)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-stone-600">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            {w?.region || w?.location || 'Unknown region'}
                          </p>
                          <p className="text-sm text-stone-600">
                            {w?.type ? w.type.charAt(0).toUpperCase() + w.type.slice(1) + ' fishing' : ''}
                          </p>
                          {w?.price > 0 && (
                            <p className="text-sm font-medium text-brand-700">
                              From £{w.price}/day
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onNavigateToWater?.(waterId)}
                          className="w-full text-center py-2 px-4 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium"
                        >
                          View Water
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 md:p-12 shadow-sm border border-stone-100 text-center">
                  <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600 mb-4">
                    No favourite waters yet
                  </p>
                  <button
                    onClick={() => onNavigateToWater?.()}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition"
                  >
                    <MapPin className="w-4 h-4" />
                    Start Exploring
                  </button>
                </div>
              )}
            </div>

            {/* Favourite Instructors */}
            <div>
              <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-700" />
                Favourite Instructors
              </h3>
              {favouriteInstructors && favouriteInstructors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favouriteInstructors.map((instructorId) => {
                    const inst = favInstructorDetails[instructorId];
                    return (
                      <div
                        key={instructorId}
                        className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-stone-900">
                            {inst?.name || 'Loading...'}
                          </h4>
                          <button
                            onClick={() =>
                              handleRemoveFavouriteInstructor(instructorId)
                            }
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-stone-600">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            {inst?.region || inst?.location || 'Unknown location'}
                          </p>
                          {(inst?.specialties || []).length > 0 && (
                            <p className="text-sm text-stone-600">
                              {inst.specialties.slice(0, 3).join(', ')}
                            </p>
                          )}
                          {inst?.price > 0 && (
                            <p className="text-sm font-medium text-brand-700">
                              From £{inst.price}/session
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onNavigateToInstructor?.(instructorId)}
                          className="w-full text-center py-2 px-4 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium"
                        >
                          View Instructor
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 md:p-12 shadow-sm border border-stone-100 text-center">
                  <Award className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600 mb-4">
                    No favourite instructors yet
                  </p>
                  <button
                    onClick={() => onNavigateToInstructor?.()}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition"
                  >
                    <Award className="w-4 h-4" />
                    Find Instructors
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'edit' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                    placeholder="+44 (0) 20 7946 0958"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                    placeholder="City, Region"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditFormChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself and your fishing experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    <Fish className="w-4 h-4 inline mr-2" />
                    Favourite Fish Species
                  </label>
                  <input
                    type="text"
                    name="favouriteFishSpecies"
                    value={editForm.favouriteFishSpecies}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                    placeholder="e.g. Trout, Pike, Salmon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={editForm.experienceLevel}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-6">
            {/* Email Display */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <div className="flex items-center gap-4">
                <Mail className="w-8 h-8 text-brand-700" />
                <div className="flex-1">
                  <p className="text-sm text-stone-600 mb-1">Email Address</p>
                  <p className="font-semibold text-stone-900">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Key className="w-5 h-5 text-brand-700" />
                Change Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-stone-600 mt-2">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Key className="w-5 h-5" />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            {/* Notification Preferences */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-700" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailConfirmations"
                    checked={preferences.emailConfirmations}
                    onChange={handlePreferenceChange}
                    className="w-5 h-5 border-stone-300 rounded focus:ring-2 focus:ring-brand-700 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">
                      Booking Confirmations
                    </p>
                    <p className="text-sm text-stone-600">
                      Email confirmation for each booking
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailMarketing"
                    checked={preferences.emailMarketing}
                    onChange={handlePreferenceChange}
                    className="w-5 h-5 border-stone-300 rounded focus:ring-2 focus:ring-brand-700 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">
                      Marketing Emails
                    </p>
                    <p className="text-sm text-stone-600">
                      Special offers and promotions
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="newWaterAlerts"
                    checked={preferences.newWaterAlerts}
                    onChange={handlePreferenceChange}
                    className="w-5 h-5 border-stone-300 rounded focus:ring-2 focus:ring-brand-700 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">
                      New Water Alerts
                    </p>
                    <p className="text-sm text-stone-600">
                      Notifications when new waters are added
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Display Preferences */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-6">
                Display Preferences
              </h3>

              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">
                  Measurement Units
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="units"
                      value="metric"
                      checked={preferences.units === 'metric'}
                      onChange={handlePreferenceChange}
                      className="w-4 h-4 border-stone-300 cursor-pointer"
                    />
                    <span className="text-stone-700">Metric (m, km)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="units"
                      value="imperial"
                      checked={preferences.units === 'imperial'}
                      onChange={handlePreferenceChange}
                      className="w-4 h-4 border-stone-300 cursor-pointer"
                    />
                    <span className="text-stone-700">Imperial (ft, mi)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100 space-y-4">
              <button
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>

              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-stone-200 text-stone-600 rounded-lg cursor-not-allowed font-semibold"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
              <p className="text-xs text-stone-600 text-center">
                To delete your account, please contact support
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Catch Report Modal */}
      {showCatchReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CatchReportForm
              user={user}
              onClose={() => setShowCatchReportModal(false)}
              onSuccess={() => {
                setShowCatchReportModal(false);
                showMessage('Catch reported successfully!');
                // Refresh catches
                const fetchCatches = async () => {
                  try {
                    const token = getToken();
                    const res = await fetch('/api/catches/user', {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setCatches(data.catches || []);
                    }
                  } catch (err) {
                    console.log('Failed to refresh catches:', err);
                  }
                };
                fetchCatches();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { ProfilePage };
export default ProfilePage;
