# TightLines v2.0 - Enhanced UK Fishing Booking Platform

## What's New in v2.0

### Advanced Filtering System
- Price range slider (£10-£500)
- Fish species multi-select checkboxes
- Experience level radio buttons
- Facilities checkboxes (parking, cafe, toilets, disabled access, night fishing)
- "Available this weekend" toggle
- Collapsible filter panel on mobile

### Enhanced Waters Detail Page
- Photo carousel (3-5 images per water with lightbox)
- 6-tab interface: Overview | Species & Records | Facilities | Rules | Reviews | Nearby Stays
- "What to Expect" section with icons
- Nearby Accommodations tab with interactive map
- Variable booking system:
  - Day ticket waters: Instant booking calendar
  - Premium beats: "Request availability" form
  - Free access: "No booking required" with opening times

### Enhanced Instructor Detail Page
- Photo gallery (3-5 action shots)
- Certification badges (GAIA, AAPGAI, etc.)
- Specialty tags with icons
- Customer reviews with 5-star ratings
- "Typical Day" itinerary timeline
- Dual booking paths:
  - Instructors with availability: Calendar picker + instant booking
  - Contact-only instructors: Contact form

### Calendar Date Pickers
- Visual calendar dropdown
- Color-coded availability (green=available, red=booked, grey=closed)
- Date range selection for enquiries
- Price display for selected dates

### Homepage Enhancements
- "Featured Fishing Guides" carousel
- Hero search with autocomplete suggestions

### Map Integration
- OpenStreetMap/Leaflet integration
- Blue markers for fishing locations
- Orange markers for nearby accommodations

## Project Structure (v2.0)

```
tightlines-prototype/
├── index.html                 # Entry point (CDN or Vite)
├── app.js                     # Legacy CDN version
├── package.json               # Vite dependencies
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── src/
    ├── main.jsx               # Vite entry point
    ├── index.css              # Tailwind + custom styles
    ├── App.jsx                # Main app component
    ├── components/
    │   ├── common/
    │   │   ├── Icons.jsx
    │   │   ├── PhotoCarousel.jsx
    │   │   ├── DatePickerCalendar.jsx
    │   │   ├── StarRating.jsx
    │   │   ├── PriceRangeSlider.jsx
    │   │   └── CertificationBadge.jsx
    │   ├── cards/
    │   │   ├── FisheryCard.jsx
    │   │   ├── InstructorCard.jsx
    │   │   └── AccommodationCard.jsx
    │   ├── filters/
    │   │   └── AdvancedFilters.jsx
    │   ├── maps/
    │   │   └── NearbyStaysMap.jsx
    │   ├── sections/
    │   │   ├── WhatToExpect.jsx
    │   │   ├── ReviewsList.jsx
    │   │   └── TypicalDay.jsx
    │   ├── modals/
    │   │   ├── SignInModal.jsx
    │   │   └── ListWaterModal.jsx
    │   └── Nav.jsx
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── SearchResults.jsx
    │   ├── VenueDetail.jsx
    │   ├── InstructorsPage.jsx
    │   └── InstructorDetail.jsx
    └── data/
        ├── regions.js
        ├── fisheries.js
        └── instructors.js
```

## Running with Vite (Recommended)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Running with CDN (Fallback)

If npm is unavailable, use the legacy CDN version:
1. Open `index-cdn.html` in your browser
2. Or run a local server: `python -m http.server 8000`

## Key Dependencies

- React 18
- Tailwind CSS 3.4
- react-datepicker (calendar)
- leaflet + react-leaflet (maps)
- rc-slider (price range)
- lucide-react (icons)

## Data Structure Changes

### Fisheries (Enhanced)
- Added `coordinates` for map integration
- Added `reviewsList` with detailed reviews
- Added `nearbyStays` for accommodation
- Added `availability` with date-based pricing
- Added `experienceLevel`, `typicalSessionHours`, `bestTimeOfDay`
- Added `facilities` array with standardized IDs

### Instructors (Enhanced)
- Added `gallery` for multiple photos
- Added `hasCalendar` for booking type
- Added `availability` dates
- Added `typicalDay` itinerary
- Added `reviewsList` with detailed reviews

## UK Fishing Terminology

- **Beat**: Section of river (typically for game fishing)
- **Stillwater**: Lakes and reservoirs
- **Rod**: Fishing spot allocation
- **Ghillie**: Scottish/Irish fishing guide
- **Day ticket**: Open access daily permit
- **Syndicate water**: Members-only fishing
- **AAPGAI**: Association of Advanced Professional Game Angling Instructors
- **GAIA**: Game Angling Instructors' Association

## Color Scheme

- Primary: Teal (brand-700: #0f766e)
- Neutral: Stone greys
- Game fishing: Blue badges
- Coarse fishing: Green badges
- Sea fishing: Cyan badges
- Ratings: Amber stars
