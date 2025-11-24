// motorcycleRouting.ts - OpenRouteService motorcycle routing without tolls

import { ORS_CONFIG } from './config';

export type RoutingResult = {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry: string; // polyline for mapping (optional)
};

export type LatLng = { lat: number; lng: number };

// OpenRouteService API configuration
const ORS_BASE_URL = ORS_CONFIG.BASE_URL;
let ORS_API_KEY = ORS_CONFIG.API_KEY;

// Use a demo API key if no real key is configured
if (ORS_API_KEY === 'YOUR_API_KEY_HERE') {
  console.warn('[MOTORCYCLE ROUTING] Using demo API key - distance accuracy may be limited');
  ORS_API_KEY = ORS_CONFIG.FALLBACK_API_KEY;
}

// Fixed origin point (same as in nominatimClient)
const ORIGIN = {
  lat: -6.3838528,
  lng: 106.8420638,
} as const;

/**
 * Calculate motorcycle route distance and duration using OpenRouteService
 * Excludes toll roads by default
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
  
  // Add tolls to avoid features if requested
  if (excludeTolls && !avoidFeatures.includes('tollways')) {
    avoidFeatures.push('tollways');
  }

  try {
    console.log(`[MOTORCYCLE ROUTING] Calculating route from`, origin, `to`, destination);
    
    const requestBody = {
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat]
      ],
      instructions: false,
      preference: 'recommended',
      options: {
        avoid_features: avoidFeatures,
        vehicle_type: 'motorcycle'
      }
    };

    const response = await fetch(`${ORS_BASE_URL}/directions/driving-motorcycle`, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/geo+json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenRouteService API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found between the specified locations');
    }

    const route = data.routes[0];
    const summary = route.summary;

    const result: RoutingResult = {
      distance: summary.distance / 1000, // Convert meters to kilometers
      duration: summary.duration / 60, // Convert seconds to minutes
      geometry: route.geometry
    };

    console.log(`[MOTORCYCLE ROUTING] Route calculated:`, result);
    return result;

  } catch (error) {
    console.error('[MOTORCYCLE ROUTING] Failed to calculate route:', error);
    
    // Enhanced fallback: try OSRM for road distance, then Haversine
    try {
      const osrmDistance = await getOSRMFallbackDistance(origin, destination);
      if (osrmDistance > 0) {
        const estimatedDuration = estimateMotorcycleTime(osrmDistance);
        console.log(`[MOTORCYCLE ROUTING] Using OSRM fallback: ${osrmDistance}km, ${estimatedDuration}min`);
        return {
          distance: osrmDistance,
          duration: estimatedDuration,
          geometry: ''
        };
      }
    } catch (osrmError) {
      console.log('[MOTORCYCLE ROUTING] OSRM fallback also failed:', osrmError);
    }
    
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
 * Estimate motorcycle travel time based on distance
 * Assumes average motorcycle speed of 40 km/h in Jakarta traffic
 */
function estimateMotorcycleTime(distanceKm: number): number {
  // Base speed: 40 km/h in Jakarta traffic
  const averageSpeedKmh = 40;
  const baseTimeHours = distanceKm / averageSpeedKmh;
  
  // Add traffic factor (Jakarta traffic can add 20-50% to travel time)
  const trafficFactor = 1.3;
  const adjustedTimeHours = baseTimeHours * trafficFactor;
  
  return Math.round(adjustedTimeHours * 60); // Convert to minutes
}

/**
 * Adjust distance for more realistic motorcycle routing
 * Haversine distance is straight line, but roads curve and loop
 * Typical road distance is 1.2-1.8x straight line distance
 */
function adjustDistanceForRoads(distanceKm: number): number {
  // For shorter distances (< 10km): minimal adjustment
  // For medium distances (10-30km): 1.4x multiplier
  // For longer distances (> 30km): 1.6x multiplier
  
  if (distanceKm < 10) {
    return distanceKm * 1.2;
  } else if (distanceKm < 30) {
    return distanceKm * 1.4;
  } else {
    return distanceKm * 1.6;
  }
}

/**
 * Get the fixed origin coordinates
 */
export function getOrigin(): LatLng {
  return ORIGIN;
}

/**
 * OSRM fallback for road distance when motorcycle API fails
 */
async function getOSRMFallbackDistance(origin: LatLng, destination: LatLng): Promise<number> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;
  
  // Try multiple CORS proxies
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  
  for (let i = 0; i < corsProxies.length; i++) {
    try {
      const proxyUrl = corsProxies[i] + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        headers: { "User-Agent": "TinyBitty-Cookie/1.0" }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes?.[0]?.legs?.[0]?.distance) {
          return data.routes[0].legs[0].distance / 1000; // Convert to km
        }
      }
    } catch (error) {
      console.log(`OSRM proxy ${i + 1} failed:`, error);
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