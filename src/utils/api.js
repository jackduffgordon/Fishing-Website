// ============================================
// API UTILITY - Centralized API calls + Auth Token Management
// ============================================

const API_BASE = '/api';

// --- Token Management ---
let authToken = null;

export const getToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('anglersnet_token');
  }
  return authToken;
};

export const setToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('anglersnet_token', token);
  } else {
    localStorage.removeItem('anglersnet_token');
  }
};

export const clearToken = () => setToken(null);

// --- Generic Fetch Helpers ---
// Timeout wrapper for fetch requests
const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};
const headers = (auth = false) => {
  const h = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

const handleResponse = async (res) => {
  try {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
};

// --- Data Normalization ---
// Converts API water data to the shape frontend components expect
const defaultGradients = [
  'linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)',
  'linear-gradient(135deg, #3d6a5a 0%, #2a4a40 100%)',
  'linear-gradient(135deg, #4a6a7a 0%, #2a4a5a 100%)',
  'linear-gradient(135deg, #5a6a5a 0%, #3a4a3a 100%)',
  'linear-gradient(135deg, #6a5a4a 0%, #4a3a2a 100%)',
  'linear-gradient(135deg, #4a5a6a 0%, #2a3a4a 100%)',
  'linear-gradient(135deg, #5a4a6a 0%, #3a2a4a 100%)'
];

const typeGradients = {
  game: 'linear-gradient(135deg, #2d5a4a 0%, #1a3a30 100%)',
  coarse: 'linear-gradient(135deg, #3a5a3a 0%, #2a4a2a 100%)',
  sea: 'linear-gradient(135deg, #2a4a5a 0%, #1a3a4a 100%)'
};

const instructorGradients = [
  'linear-gradient(135deg, #4a5a6a 0%, #2a3a4a 100%)',
  'linear-gradient(135deg, #5a6a5a 0%, #3a4a3a 100%)',
  'linear-gradient(135deg, #6a5a4a 0%, #4a3a2a 100%)',
  'linear-gradient(135deg, #4a6a6a 0%, #2a4a4a 100%)'
];

// Generate availability for 60 days (for waters that don't have it from DB)
const generateAvailability = (basePrice, weekendPremium = 10) => {
  const availability = {};
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isAvailable = Math.random() > 0.2;
    const isClosed = Math.random() < 0.05;
    if (isClosed) {
      availability[dateStr] = { status: 'closed' };
    } else if (!isAvailable) {
      availability[dateStr] = { status: 'booked' };
    } else {
      availability[dateStr] = {
        status: 'available',
        price: isWeekend ? basePrice + weekendPremium : basePrice
      };
    }
  }
  return availability;
};

// Region display names
const regionLabels = {
  'wales': 'Wales',
  'scotland': 'Scotland',
  'midlands': 'Midlands',
  'south-west': 'South West',
  'south-england': 'South England',
  'south-east': 'South East',
  'north-england': 'North England',
  'east': 'East England'
};

export const normalizeWater = (w, index = 0) => {
  // If it already has an `image` property (hardcoded data), return as-is
  if (w.image) return w;

  const gradient = typeGradients[w.type] || defaultGradients[index % defaultGradients.length];
  const hasRealImages = w.images && w.images.length > 0;

  return {
    ...w,
    // Card image: use first real image or gradient fallback
    image: hasRealImages ? `url(${w.images[0]})` : gradient,
    imageUrl: hasRealImages ? w.images[0] : null,
    // Gallery: use real images if available, otherwise generate gradients
    gallery: hasRealImages
      ? w.images
      : (w.gallery && w.gallery.length > 0
        ? w.gallery.map(g => typeof g === 'string' ? g : gradient)
        : [gradient, gradient, gradient]),
    // Text fields
    shortDescription: w.shortDescription || w.description || '',
    fullDescription: w.fullDescription || w.description || '',
    // Location display
    location: w.location || w.townCity || w.county || regionLabels[w.region] || w.region || '',
    region: regionLabels[w.region] || w.region || '',
    // Reviews count (hardcoded uses `reviews`, API uses `reviewCount`)
    reviews: w.reviews || w.reviewCount || 0,
    reviewCount: w.reviewCount || w.reviews || 0,
    // Price type display
    priceType: w.priceType || 'day',
    // Season info
    season: w.season || (w.seasonInfo ? { info: w.seasonInfo } : null),
    // Expectations
    expectations: w.expectations || {
      averageCatch: w.averageCatchRate || 'Data not available',
      recordFish: w.recordFish || 'Not recorded',
      blankRate: w.blankRate || 'N/A'
    },
    // Amenities (combine with facilities for display)
    amenities: w.amenities || (w.facilities || []).map(f =>
      f.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    ),
    // Contact info
    contact: w.contact || {
      name: w.ownerName || 'Fishery Manager',
      email: w.ownerEmail || '',
      phone: w.ownerPhone || ''
    },
    // Availability (generate if missing)
    availability: (w.availability && Object.keys(w.availability).length > 0)
      ? w.availability
      : generateAvailability(w.price || 0),
    // Reviews list
    reviewsList: w.reviewsList || [],
    // Nearby stays
    nearbyStays: w.nearbyStays || [],
    // Booking options
    bookingOptions: w.bookingOptions || [],
    // Rods
    rods: w.rods || 0,
    // Coordinates
    coordinates: w.coordinates || null,
    // Experience level
    experienceLevel: w.experienceLevel || 'any',
    // Water type label
    waterType: w.waterType || w.waterBodyType || (w.type === 'game' ? 'Game Water' : w.type === 'coarse' ? 'Coarse Water' : 'Sea Fishing')
  };
};

export const normalizeInstructor = (inst, index = 0) => {
  // If it already has an `image` property (hardcoded data), return as-is
  if (inst.image) return inst;

  const gradient = instructorGradients[index % instructorGradients.length];
  const hasRealImages = inst.images && inst.images.length > 0;

  return {
    ...inst,
    image: hasRealImages ? `url(${inst.images[0]})` : gradient,
    gallery: hasRealImages
      ? inst.images
      : [gradient, gradient, gradient],
    title: inst.title || (inst.certifications && inst.certifications.length > 0
      ? inst.certifications[0]
      : 'Fishing Instructor'),
    location: inst.location || regionLabels[inst.region] || inst.region || '',
    priceType: inst.priceType || 'full day',
    reviews: inst.reviews || inst.reviewCount || 0,
    reviewCount: inst.reviewCount || inst.reviews || 0,
    bio: inst.bio || '',
    fullBio: inst.fullBio || inst.bio || '',
    specialties: inst.specialties || [],
    certifications: inst.certifications || [],
    hasCalendar: inst.hasCalendar || false,
    availability: inst.availability || [],
    typicalDay: inst.typicalDay || inst.typical_day || [],
    reviewsList: inst.reviewsList || inst.reviews_list || [],
    whatYouLearn: (() => {
      const raw = inst.whatYouLearn || inst.what_you_learn || [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string' && raw.trim()) return raw.split('\n').map(s => s.trim()).filter(Boolean);
      return [];
    })(),
    equipmentProvided: (() => {
      const raw = inst.equipmentProvided || inst.equipment_provided || [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string' && raw.trim()) return raw.split('\n').map(s => s.trim()).filter(Boolean);
      return [];
    })(),
    teachingPhilosophy: inst.teachingPhilosophy || inst.teaching_philosophy || '',
    bookingOptions: inst.bookingOptions || inst.booking_options || [],
    experience: inst.experience || '',
    website: inst.website || ''
  };
};

// --- AUTH API ---
export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    setToken(data.token);
    return data;
  },

  register: async (email, password, name) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password, name })
    });
    const data = await handleResponse(res);
    setToken(data.token);
    return data;
  },

  me: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/me`, { headers: headers(true) }, 10000);
    return handleResponse(res);
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: headers(true),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  logout: () => {
    clearToken();
  }
};

// --- WATERS API ---
export const watersAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/waters?${query}` : `${API_BASE}/waters`;
    const res = await fetch(url, { headers: headers(true) });
    const data = await handleResponse(res);
    return (data.waters || []).map((w, i) => normalizeWater(w, i));
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/waters/${id}`, { headers: headers() });
    const data = await handleResponse(res);
    return normalizeWater(data.water);
  }
};

// --- INSTRUCTORS API ---
export const instructorsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/instructors?${query}` : `${API_BASE}/instructors`;
    const res = await fetch(url, { headers: headers(true) });
    const data = await handleResponse(res);
    return (data.instructors || []).map((inst, i) => normalizeInstructor(inst, i));
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/instructors/${id}`, { headers: headers() });
    const data = await handleResponse(res);
    return normalizeInstructor(data.instructor);
  }
};

// --- BOOKINGS API ---
export const bookingsAPI = {
  create: async (bookingData) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify(bookingData)
    });
    return handleResponse(res);
  },

  createEnquiry: async (enquiryData) => {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(enquiryData)
    });
    return handleResponse(res);
  }
};

// --- REGISTRATION API ---
export const registerAPI = {
  water: async (waterData) => {
    const res = await fetch(`${API_BASE}/register/water`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(waterData)
    });
    return handleResponse(res);
  },

  instructor: async (instructorData) => {
    const res = await fetch(`${API_BASE}/register/instructor`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(instructorData)
    });
    return handleResponse(res);
  }
};

// --- ADMIN API ---
export const adminAPI = {
  getStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: headers(true) });
    return handleResponse(res);
  },

  getPending: async () => {
    const res = await fetch(`${API_BASE}/admin/pending`, { headers: headers(true) });
    return handleResponse(res);
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: headers(true) });
    return handleResponse(res);
  },

  getWaters: async () => {
    const res = await fetch(`${API_BASE}/admin/waters`, { headers: headers(true) });
    return handleResponse(res);
  },

  getInstructors: async () => {
    const res = await fetch(`${API_BASE}/admin/instructors`, { headers: headers(true) });
    return handleResponse(res);
  },

  approveWater: async (id) => {
    const res = await fetch(`${API_BASE}/admin/approve/water/${id}`, {
      method: 'POST',
      headers: headers(true)
    });
    return handleResponse(res);
  },

  rejectWater: async (id) => {
    const res = await fetch(`${API_BASE}/admin/reject/water/${id}`, {
      method: 'POST',
      headers: headers(true)
    });
    return handleResponse(res);
  },

  approveInstructor: async (id) => {
    const res = await fetch(`${API_BASE}/admin/approve/instructor/${id}`, {
      method: 'POST',
      headers: headers(true)
    });
    return handleResponse(res);
  },

  rejectInstructor: async (id) => {
    const res = await fetch(`${API_BASE}/admin/reject/instructor/${id}`, {
      method: 'POST',
      headers: headers(true)
    });
    return handleResponse(res);
  },

  updateWater: async (id, data) => {
    const res = await fetch(`${API_BASE}/admin/waters/${id}`, {
      method: 'PUT',
      headers: headers(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteWater: async (id) => {
    const res = await fetch(`${API_BASE}/admin/waters/${id}`, {
      method: 'DELETE',
      headers: headers(true)
    });
    return handleResponse(res);
  }
};

// --- IMAGE UPLOAD ---
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const COMPRESS_ABOVE = 1 * 1024 * 1024; // Compress images over 1MB

// Client-side image compression using canvas
const compressImage = (file, maxWidth = 1600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/gif') {
      resolve(file); // Don't compress GIFs
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
};

// Validate file before upload
export const validateImageFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid file type "${file.type}". Allowed: JPG, PNG, WebP, GIF`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB`;
  }
  return null;
};

export const uploadImage = async (file, type = 'water') => {
  // Validate
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  // Compress if needed
  let processedFile = file;
  if (file.size > COMPRESS_ABOVE && file.type !== 'image/gif') {
    try {
      processedFile = await compressImage(file);
    } catch {
      // Fall back to original if compression fails
      processedFile = file;
    }
  }

  // Read as base64 and upload
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageData: reader.result,
            fileName: processedFile.name,
            type
          })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Upload failed');
        }
        const data = await res.json();
        resolve(data.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(processedFile);
  });
};
