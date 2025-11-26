// motorcycleRouting.ts - OSRM + Haversine motorcycle routing without tolls

export type RoutingResult = {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry: string; // polyline for mapping (optional)
};

export type LatLng = { lat: number; lng: number };

// Fixed origin point (same as in nominatimClient)
const ORIGIN = {
  lat: -6.3838528,
  lng: 106.8420638,
} as const;

/**
 * Calculate motorcycle route distance and duration using OSRM with Haversine fallback
 * Optimized for motorcycle routing without toll roads
 */
export async function calculateMotorcycleRoute(
  origin: LatLng,
  destination: LatLng,
  options: {
    excludeTolls?: boolean;
    avoidFeatures?: string[];
  } = {}
): Promise<RoutingResult> {
  const { excludeTolls = true, avoidFeatures = [] } = options;

  try {
    console.log(`[MOTORCYCLE ROUTING] Calculating route from`, origin, `to`, destination);
    
    // Primary method: OSRM for road distance calculation
    const osrmDistance = await getOSRMDistance(origin, destination);
    if (osrmDistance > 0) {
      const estimatedDuration = estimateMotorcycleTime(osrmDistance);
      console.log(`[MOTORCYCLE ROUTING] Using OSRM: ${osrmDistance}km, ${estimatedDuration}min`);
      return {
        distance: osrmDistance,
        duration: estimatedDuration,
        geometry: ''
      };
    }
    
    throw new Error('OSRM calculation failed');

  } catch (error) {
    console.error('[MOTORCYCLE ROUTING] OSRM failed, using Haversine fallback:', error);
    
    // Final fallback to Haversine distance with estimated motorcycle time
    const haversineDistance = calculateHaversineDistance(origin, destination);
    const adjustedDistance = adjustDistanceForRoads(haversineDistance);
    const estimatedDuration = estimateMotorcycleTime(adjustedDistance);
    
    console.log(`[MOTORCYCLE ROUTING] Using Haversine fallback: ${haversineDistance}km → ${adjustedDistance}km, ${estimatedDuration}min`);
    
    return {
      distance: adjustedDistance,
      duration: estimatedDuration,
      geometry: ''
    };
  }
}

/**
 * Calculate Haversine distance as final fallback when OSRM fails
 * Provides straight-line distance with road factor adjustments
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
 * Estimate motorcycle travel time based on distance and Jakarta traffic conditions
 * Motorcycles can take more efficient routes than cars in Jakarta traffic
 */
function estimateMotorcycleTime(distanceKm: number): number {
  // Base motorcycle speed in Jakarta: 35-45 km/h depending on traffic
  let averageSpeedKmh;
  
  if (distanceKm <= 5) {
    // Short distances: more traffic lights and intersections
    averageSpeedKmh = 25;
  } else if (distanceKm <= 15) {
    // Medium distances: moderate traffic, some expressways
    averageSpeedKmh = 35;
  } else {
    // Longer distances: can use expressways, better average speed
    averageSpeedKmh = 45;
  }
  
  const baseTimeHours = distanceKm / averageSpeedKmh;
  
  // Traffic factor varies by time of day and distance
  // Short distances: more affected by traffic lights
  // Medium distances: moderate traffic impact
  // Long distances: less affected by local traffic
  let trafficFactor;
  if (distanceKm <= 5) {
    trafficFactor = 1.5; // Heavy traffic impact
  } else if (distanceKm <= 15) {
    trafficFactor = 1.3; // Moderate traffic impact
  } else {
    trafficFactor = 1.2; // Lighter traffic impact for longer routes
  }
  
  const adjustedTimeHours = baseTimeHours * trafficFactor;
  
  return Math.round(adjustedTimeHours * 60); // Convert to minutes
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
 * Get the fixed origin coordinates
 */
export function getOrigin(): LatLng {
  return ORIGIN;
}

/**
 * OSRM primary method for road distance calculation
 */
async function getOSRMDistance(origin: LatLng, destination: LatLng): Promise<number> {
  // Use motorcycle-appropriate routing profile (motorcycle routing is similar to car routing but allows more flexible paths)
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&geometries=polyline&steps=false`;
  
  // Try multiple CORS proxies with retry logic
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/'
  ];
  
  for (let i = 0; i < corsProxies.length; i++) {
    try {
      console.log(`[MOTORCYCLE ROUTING] Trying OSRM proxy ${i + 1}/${corsProxies.length}`);
      const proxyUrl = corsProxies[i] + encodeURIComponent(url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(proxyUrl, {
        headers: { 
          "User-Agent": "TinyBitty-Cookie/1.0",
          "Accept": "application/json"
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes?.[0]?.legs?.[0]?.distance) {
          const distanceKm = data.routes[0].legs[0].distance / 1000; // Convert to km
          console.log(`[MOTORCYCLE ROUTING] OSRM proxy ${i + 1} succeeded: ${distanceKm}km`);
          return distanceKm;
        } else {
          throw new Error('No route found in OSRM response');
        }
      } else {
        throw new Error(`OSRM proxy ${i + 1} failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`[MOTORCYCLE ROUTING] OSRM proxy ${i + 1} failed:`, error.message || error);
      if (i === corsProxies.length - 1) {
        throw new Error(`All OSRM proxies failed. Last error: ${error.message || error}`);
      }
    }
  }
  
  throw new Error('All OSRM proxies failed');
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}