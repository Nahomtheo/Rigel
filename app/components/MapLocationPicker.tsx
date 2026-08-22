'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet';
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

function Recenter({ position, zoom }: { position: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1], zoom, map]);

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
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';
  const position: [number, number] = hasCoords
    ? [lat as number, lng as number]
    : [DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng];
  const zoom = hasCoords ? 16 : 13;

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      className="h-64 w-full rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
        url="https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
        subdomains={['0', '1', '2', '3']}
        maxZoom={20}
      />
      <ClickHandler
        onSelect={(lat, lng) => {
          onChange(lat, lng);
        }}
      />
      <Recenter position={position} zoom={zoom} />
      <Marker position={position} icon={pickerIcon}>
        <Popup>
          {hasCoords
            ? `${lat!.toFixed(5)}, ${lng!.toFixed(5)}`
            : 'Click the map to set the location'}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
