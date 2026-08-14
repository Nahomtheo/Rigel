export type Coordinates = {
  lat: number;
  lng: number;
};

export const ethiopiaCoordinates: Record<string, Coordinates> = {
  // Regions
  "Addis Ababa": { lat: 8.9806, lng: 38.7578 },
  "Oromia": { lat: 8.541, lng: 39.2695 },
  "Amhara": { lat: 11.6586, lng: 37.9667 },
  "Tigray": { lat: 13.5356, lng: 39.0275 },
  "Somali": { lat: 7.3414, lng: 42.8487 },
  "Afar": { lat: 11.7553, lng: 41.4344 },
  "Benishangul-Gumuz": { lat: 10.6647, lng: 35.4619 },
  "Gambela": { lat: 8.2487, lng: 34.5898 },
  "Harari": { lat: 9.312, lng: 42.117 },
  "Sidama": { lat: 7.0628, lng: 38.4759 },
  "Southern Nations, Nationalities, and Peoples": { lat: 6.6031, lng: 37.5148 },
  "Southern Nations, Nationalities, and Peoples (SNNP)": { lat: 6.6031, lng: 37.5148 },
  "SNNP": { lat: 6.6031, lng: 37.5148 },

  // Cities
  "Adama": { lat: 8.5488, lng: 39.2705 },
  "Jimma": { lat: 7.6651, lng: 36.8302 },
  "Bishoftu": { lat: 8.7523, lng: 38.9784 },
  "Nekemte": { lat: 9.0894, lng: 36.552 },
  "Ambo": { lat: 8.9846, lng: 37.8479 },
  "Shashamane": { lat: 7.2007, lng: 38.5968 },
  "Harar": { lat: 9.312, lng: 42.117 },
  "Bahir Dar": { lat: 11.599, lng: 37.39 },
  "Gondar": { lat: 12.6032, lng: 37.46 },
  "Dessie": { lat: 11.1333, lng: 39.6333 },
  "Debre Markos": { lat: 10.3333, lng: 37.7167 },
  "Kombolcha": { lat: 11.0875, lng: 39.7314 },
  "Mekelle": { lat: 13.4967, lng: 39.4753 },
  "Axum": { lat: 14.1211, lng: 38.7267 },
  "Adwa": { lat: 14.167, lng: 38.9 },
  "Shire": { lat: 14.1017, lng: 38.2875 },
  "Jijiga": { lat: 9.3397, lng: 42.7946 },
  "Dire Dawa": { lat: 9.5931, lng: 41.8661 },
  "Semera": { lat: 11.793, lng: 41.008 },
  "Asayita": { lat: 11.5678, lng: 41.438 },
  "Assosa": { lat: 10.0683, lng: 34.5331 },
  "Bambasi": { lat: 9.7861, lng: 34.625 },
  "Hawassa": { lat: 7.0628, lng: 38.4759 },
  "Dilla": { lat: 6.4094, lng: 38.3092 },
  "Arba Minch": { lat: 6.034, lng: 37.5531 },
  "Jinka": { lat: 5.649, lng: 36.64 },
  "Turmi": { lat: 4.9722, lng: 36.5311 },
  "Wolayita Sodo": { lat: 6.8987, lng: 37.7546 },
};

export const DEFAULT_COORDINATES: Coordinates = { lat: 8.9806, lng: 38.7578 };

type LocationLike = {
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
} | null | undefined;

export function getLocationCoordinates(location: LocationLike): Coordinates {
  if (!location) return DEFAULT_COORDINATES;

  if (
    typeof location.lat === "number" &&
    typeof location.lng === "number" &&
    isFinite(location.lat) &&
    isFinite(location.lng) &&
    Math.abs(location.lat) <= 90 &&
    Math.abs(location.lng) <= 180
  ) {
    return { lat: location.lat, lng: location.lng };
  }

  if (location.city) {
    const city = ethiopiaCoordinates[location.city];
    if (city) return city;
  }

  if (location.region) {
    const region = ethiopiaCoordinates[location.region];
    if (region) return region;
  }

  return DEFAULT_COORDINATES;
}
