# TightLines - UK Fishing Booking Platform Prototype

A modern, responsive prototype for a UK-wide fishing booking platform, inspired by FishingBooker but designed specifically for British anglers.

## Features

### Core Pages
- **Homepage** - Hero search with regions grid, species cards, featured waters, testimonials, and trust signals
- **Search Results** - Filterable grid with fishing type, region, and sorting options
- **Venue Detail Pages** - Comprehensive fishery information with tabbed interface (overview, details, rules)
- **Instructors Page** - Browse certified fishing instructors by specialty
- **Instructor Detail Pages** - Full profile with booking request flow

### Functional Features
- **Sign In / Register** - Modal with form validation and mode switching
- **List Your Water** - 3-step submission wizard for fishery owners
- **Instant Booking** - For day tickets at commercial fisheries
- **Enquiry System** - For premium beats with limited rod availability

## How to Run

### Option 1: Open directly in browser
Simply open `index.html` in your web browser. The prototype loads React and Tailwind from CDN.

### Option 2: Use a local server (recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have npx)
npx serve .

# Using VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then navigate to `http://localhost:8000` (or the port shown).

## Project Structure

```
tightlines-prototype/
├── index.html      # Main HTML with Tailwind config and CDN links
├── app.js          # Complete React application (~1300 lines)
└── README.md       # This file
```

## Tech Stack

- **React 18** (via CDN with Babel standalone)
- **Tailwind CSS** (via CDN with custom brand colours)
- **Google Fonts** (Inter)

## Design System

### Colour Palette
- **Primary**: Teal (brand-700: #0f766e) - clean, water-inspired
- **Neutral**: Stone greys - warm, natural feel
- **Accents**: Amber for ratings, blue/green/cyan for fishing type badges

### UK Fishing Terminology
- **Beat**: Section of river (typically for game fishing)
- **Stillwater**: Lakes and reservoirs
- **Rod**: Fishing spot allocation
- **Ghillie**: Scottish/Irish fishing guide
- **Day ticket**: Open access daily permit
- **Syndicate water**: Members-only fishing

## Data Structure

### Fisheries (6 sample venues)
- River Wye - Letton Beat (salmon, enquiry)
- Chew Valley Lake (trout, instant book)
- Linear Fisheries - Manor Farm (carp, instant book)
- River Tweed - Junction Beat (salmon, enquiry)
- River Test - Broadlands (chalk stream trout, enquiry)
- Grafham Water (reservoir trout, instant book)

### Instructors (4 profiles)
- James MacPherson - Spey casting, salmon
- Sarah Thornton - Stillwater, beginners, women's courses
- Tom Ashworth - Specimen carp, pike
- Emily Ward - Wild trout, tenkara, small streams

### UK Regions (8)
Scotland, Wales, South West, South, South East, Midlands, North, East Anglia

### Species (12)
Atlantic Salmon, Brown Trout, Rainbow Trout, Grayling, Carp, Pike, Tench, Barbel, Perch, Bream, Bass, Cod

## Customisation

Edit the data arrays at the top of `app.js` to:
- Add more fisheries
- Add more instructors
- Modify regions or species
- Update testimonials

## Next Steps for Production

1. Set up a proper React build with Vite or Next.js
2. Connect to a backend API for real data
3. Add user authentication (Firebase, Auth0, etc.)
4. Integrate payment processing (Stripe)
5. Add a proper calendar/availability system
6. Implement real-time messaging between anglers and fisheries
7. Add review/rating submission
8. Build fishery owner dashboard
9. Add email notifications
