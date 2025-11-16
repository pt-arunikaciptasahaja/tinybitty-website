// Geocode cache to reduce API load
const geocodeCache = new Map<string, { lat: number; lon: number }>();

const ORIGIN_ADDRESS = "Depok, Sukmajaya 16411";

// Pre-cache origin coordinates
let originCoords: { lat: number; lon: number } | null = null;

export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number }> {
  // Check cache first
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address)!;
  }

  const encodedAddress = encodeURIComponent(address);
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`);
  
  if (!response.ok) {
    throw new Error(`Geocoding failed for address: ${address}`);
  }

  const data = await response.json();
  
  if (!data || data.length === 0) {
    throw new Error(`No coordinates found for address: ${address}`);
  }

  const result = {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };

  // Cache the result
  geocodeCache.set(address, result);
  return result;
}

export async function getDistanceKm(origin: string, destination: string): Promise<number> {
  // Get origin coordinates
  if (origin === ORIGIN_ADDRESS) {
    if (!originCoords) {
      originCoords = await geocodeAddress(origin);
    }
  } else {
    originCoords = await geocodeAddress(origin);
  }

  // Get destination coordinates
  const destCoords = await geocodeAddress(destination);

  // Call OSRM for distance calculation
  const url = `http://router.project-osrm.org/route/v1/driving/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`OSRM routing failed for route from ${origin} to ${destination}`);
  }

  const data = await response.json();
  
  if (!data.routes || data.routes.length === 0) {
    throw new Error(`No route found from ${origin} to ${destination}`);
  }

  const distanceMeters = data.routes[0].distance;
  
  // Convert meters to kilometers
  const distanceKm = distanceMeters / 1000;
  
  return Math.round(distanceKm * 10) / 10; // Round to 1 decimal place
}

export function getOriginAddress(): string {
  return ORIGIN_ADDRESS;
}