// roadRouting.ts - Road-based distance calculation for motorcycle delivery
// Uses OSRM (OpenStreetMap Routing Machine) for actual road distances

export type RoutingResult = {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry?: string; // polyline for mapping (optional)
};

export type LatLng = { lat: number; lng: number };

// Fixed origin point (same as in nominatimClient)
const ORIGIN = {
  lat: -6.3838528,
  lng: 106.8420638,
} as const;

/**
 * Calculate road-based distance using OSRM routing service
 * Optimized for motorcycle routing without toll roads
 */
export async function calculateRoadDistance(
  destination: LatLng,
  options: {
    excludeTolls?: boolean;
    fallbackToHaversine?: boolean;
  } = {}
): Promise<number | null> {
  const { excludeTolls = true, fallbackToHaversine = true } = options;

  try {
    // console.log(`[ROAD ROUTING] Calculating road distance to:`, destination);
    
    // Primary method: OSRM for road distance calculation
    const osrmDistance = await getOSRMRoadDistance(ORIGIN, destination, excludeTolls);
    if (osrmDistance > 0) {
      // console.log(`[ROAD ROUTING] OSRM distance: ${osrmDistance}km`);
      return osrmDistance;
    }
    
    if (fallbackToHaversine) {
      // console.log('[ROAD ROUTING] OSRM failed, falling back to Haversine');
      const haversineDistance = calculateHaversineDistance(ORIGIN, destination);
      const adjustedDistance = adjustDistanceForRoads(haversineDistance);
      // console.log(`[ROAD ROUTING] Using adjusted Haversine: ${adjustedDistance}km`);
      return adjustedDistance;
    }
    
    return null;

  } catch (error) {
    console.error('[ROAD ROUTING] Error calculating road distance:', error);
    
    if (fallbackToHaversine) {
      const haversineDistance = calculateHaversineDistance(ORIGIN, destination);
      const adjustedDistance = adjustDistanceForRoads(haversineDistance);
      // console.log(`[ROAD ROUTING] Error fallback - adjusted Haversine: ${adjustedDistance}km`);
      return adjustedDistance;
    }
    
    return null;
  }
}

/**
 * OSRM primary method for road distance calculation
 */
async function getOSRMRoadDistance(
  origin: LatLng, 
  destination: LatLng, 
  excludeTolls: boolean = true
): Promise<number> {
  // OSRM URL for motorcycle/car routing (motorcycles use similar routing to cars)
  const baseUrl = 'https://router.project-osrm.org/route/v1/driving';
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  
  // Build parameters
  const params = new URLSearchParams({
    overview: 'false',
    geometries: 'polyline',
    steps: 'false',
    // For motorcycles, we want to avoid toll roads when possible
    ...(excludeTolls && { exclude: 'tollways' })
  });
  
  const url = `${baseUrl}/${coordinates}?${params}`;
  // console.log(`[OSRM] Request URL: ${url}`);
  
  // Try multiple CORS proxies with retry logic
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/'
  ];
  
  for (let i = 0; i < corsProxies.length; i++) {
    try {
      const proxyUrl = corsProxies[i] + encodeURIComponent(url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(proxyUrl, {
        headers: { 
          'User-Agent': 'TinyBitty-Delivery/1.0',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes?.[0]?.legs?.[0]?.distance) {
          const distanceKm = data.routes[0].legs[0].distance / 1000; // Convert to km
          // console.log(`[OSRM] Success via proxy ${i + 1}: ${distanceKm}km`);
          return distanceKm;
        } else {
          throw new Error('No route found in OSRM response');
        }
      } else {
        throw new Error(`OSRM proxy ${i + 1} failed with status: ${response.status}`);
      }
    } catch (error) {
      // console.log(`[OSRM] Proxy ${i + 1} failed:`, error.message || error);
      if (i === corsProxies.length - 1) {
        throw new Error(`All OSRM proxies failed. Last error: ${error.message || error}`);
      }
    }
  }
  
  throw new Error('All OSRM proxies failed');
}

/**
 * Calculate Haversine distance as fallback
 */
function calculateHaversineDistance(origin: LatLng, destination: LatLng): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100;
}

/**
 * Adjust Haversine distance for realistic motorcycle routing
 * Motorcycles can take more efficient routes than cars due to size and maneuverability
 * Typical motorcycle road distance is 1.1-1.6x straight line distance
 */
function adjustDistanceForRoads(distanceKm: number): number {
  // Motorcycles are more agile than cars and can take shortcuts
  
  if (distanceKm < 5) {
    // Short distances: motorcycles can weave through traffic efficiently
    return distanceKm * 1.15;
  } else if (distanceKm < 15) {
    // Medium distances: still efficient but some complex routing
    return distanceKm * 1.25;
  } else if (distanceKm < 30) {
    // Longer distances: can use expressways and major roads efficiently
    return distanceKm * 1.35;
  } else {
    // Very long distances: primarily major roads, less deviation
    return distanceKm * 1.45;
  }
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get the fixed origin coordinates
 */
export function getOrigin(): LatLng {
  return ORIGIN;
}