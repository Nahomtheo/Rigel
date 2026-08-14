'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { slugify } from '@/lib/slugify';
import { getLocationCoordinates, DEFAULT_COORDINATES } from '@/lib/ethiopia-locations';

type MapListing = {
  _id: string;
  title: string;
  price: number;
  isFeatured?: boolean;
  location?: {
    city?: string;
    region?: string;
    lat?: number;
    lng?: number;
  };
};

const markerIcon = (featured: boolean) =>
  L.divIcon({
    html: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${featured ? '#C9A227' : '#2563eb'}" stroke="#161204" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3" fill="#161204"/>
    </svg>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    popupAnchor: [0, -30],
  });

export default function MapView({
  listings,
  height = 'h-[420px]',
}: {
  listings: MapListing[];
  height?: string;
}) {
  const markers = listings.map((listing) => {
    const coords = getLocationCoordinates(listing.location);
    return { listing, coords };
  });

  const center: [number, number] =
    markers.length > 0
      ? [markers[0].coords.lat, markers[0].coords.lng]
      : [DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng];

  return (
    <MapContainer
      center={center}
      zoom={markers.length > 0 ? 5 : 6}
      className={`${height} w-full rounded-2xl z-0`}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(({ listing, coords }) => (
        <Marker
          key={listing._id}
          position={[coords.lat, coords.lng]}
          icon={markerIcon(Boolean(listing.isFeatured))}
        >
          <Popup>
            <Link
              href={`/listing/${slugify(listing.title)}-${listing._id}`}
              className="flex flex-col gap-1 text-sm font-semibold text-slate-900"
            >
              <span className="line-clamp-2">{listing.title}</span>
              <span className="text-amber-600 font-bold">
                {listing.price.toLocaleString()} ETB
              </span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
