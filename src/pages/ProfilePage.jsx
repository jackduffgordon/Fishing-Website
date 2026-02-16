import React, { useState } from 'react';
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
} from 'lucide-react';
import { getToken } from '../utils/api';

const ProfilePage = ({
  user,
  setUser,
  onBack,
  onSignOut,
  favouriteWaters = [],
  favouriteInstructors = [],
  onNavigateToWater,
  onNavigateToInstructor,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

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

  const handleRemoveFavouriteWater = (waterId) => {
    showMessage(`Removed water #${waterId} from favourites`);
  };

  const handleRemoveFavouriteInstructor = (instructorId) => {
    showMessage(`Removed instructor #${instructorId} from favourites`);
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
            <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium">
                      Total Bookings
                    </p>
                    <p className="text-4xl font-bold text-stone-900 mt-2">
                      {user?.totalBookings || 0}
                    </p>
                  </div>
                  <Calendar className="w-10 h-10 text-brand-700 opacity-20" />
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
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium">
                      Member Since
                    </p>
                    <p className="text-lg font-bold text-stone-900 mt-2">
                      {getMemberSinceDate()}
                    </p>
                  </div>
                  <Star className="w-10 h-10 text-brand-700 opacity-20" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-4">
                Recent Activity
              </h3>
              <p className="text-stone-600">
                No recent activity yet. Start by browsing waters!
              </p>
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
                  {favouriteWaters.map((waterId) => (
                    <div
                      key={waterId}
                      className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold text-stone-900">
                          Water #{waterId}
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
                          Region: TBD
                        </p>
                        <p className="text-sm text-stone-600">
                          Price: £0.00 per day
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigateToWater?.(waterId)}
                        className="w-full text-center py-2 px-4 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium"
                      >
                        View Water
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-stone-100 text-center">
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
                  {favouriteInstructors.map((instructorId) => (
                    <div
                      key={instructorId}
                      className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold text-stone-900">
                          Instructor #{instructorId}
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
                          Location: TBD
                        </p>
                        <p className="text-sm text-stone-600">
                          Specialties: TBD
                        </p>
                        <p className="text-sm text-stone-600">
                          Price: £0.00 per hour
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigateToInstructor?.(instructorId)}
                        className="w-full text-center py-2 px-4 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium"
                      >
                        View Instructor
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-stone-100 text-center">
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
    </div>
  );
};

export { ProfilePage };
export default ProfilePage;
