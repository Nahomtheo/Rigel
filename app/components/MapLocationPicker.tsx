'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_COORDINATES } from '@/lib/ethiopia-locations';

const pickerIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#C9A227" stroke="#161204" stroke-width="1.5"/>
    <circle cx="12" cy="9" r="3" fill="#161204"/>
  </svg>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

function ClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapLocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const position: [number, number] =
    typeof lat === 'number' && typeof lng === 'number'
      ? [lat, lng]
      : [DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng];

  return (
    <MapContainer
      center={position}
      zoom={6}
      className="h-64 w-full rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler
        onSelect={(lat, lng) => {
          onChange(lat, lng);
        }}
      />
      <Marker position={position} icon={pickerIcon}>
        <Popup>
          {lat && lng
            ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            : 'Click the map to set the location'}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
