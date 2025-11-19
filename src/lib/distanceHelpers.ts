// distanceHelpers.ts

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Returns distance in kilometers between two coordinates using Haversine formula.
 */
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius in km

  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const haversine =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  const distance = R * c;

  // Return distance with 2 decimal places
  return Number(distance.toFixed(2));
}