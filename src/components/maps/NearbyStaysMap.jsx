// ============================================
// NEARBY STAYS MAP COMPONENT
// Leaflet/OpenStreetMap integration for nearby accommodations
// ============================================
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, ExternalLink } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const waterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const accommodationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);

  return null;
};

export const NearbyStaysMap = ({
  waterCoordinates,
  waterName,
  nearbyStays = [],
  height = '400px'
}) => {
  // Calculate bounds to show all markers
  const allCoordinates = [
    [waterCoordinates.lat, waterCoordinates.lng],
    ...nearbyStays.map(stay => [stay.coordinates.lat, stay.coordinates.lng])
  ];

  return (
    <div className="rounded-xl overflow-hidden border border-stone-200" style={{ height }}>
      <MapContainer
        center={[waterCoordinates.lat, waterCoordinates.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds bounds={allCoordinates} />

        {/* Water marker (blue) */}
        <Marker
          position={[waterCoordinates.lat, waterCoordinates.lng]}
          icon={waterIcon}
        >
          <Popup>
            <div className="font-medium text-brand-700">{waterName}</div>
            <div className="text-sm text-stone-500">Fishing location</div>
          </Popup>
        </Marker>

        {/* Accommodation markers (orange) */}
        {nearbyStays.map((stay) => (
          <Marker
            key={stay.id}
            position={[stay.coordinates.lat, stay.coordinates.lng]}
            icon={accommodationIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h4 className="font-semibold text-stone-900 mb-1">{stay.name}</h4>
                <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
                  <span>{stay.type}</span>
                  <span>•</span>
                  <span>{stay.distance}</span>
                </div>
                <div className="flex items-center gap-1 text-sm mb-2">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{stay.rating}</span>
                  <span className="text-stone-400">({stay.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-700">{stay.priceRange}</span>
                  <a
                    href={stay.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800"
                  >
                    Book <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Map legend
export const MapLegend = () => (
  <div className="flex items-center gap-6 text-sm text-stone-600 mt-3">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-blue-500 rounded-full" />
      <span>Fishing location</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-orange-500 rounded-full" />
      <span>Accommodation</span>
    </div>
  </div>
);

export default NearbyStaysMap;
