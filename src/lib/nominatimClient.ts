// nominatimClient.ts - Reliable Nominatim API client for Indonesian geocoding

export type GeocodingResult = {
  lat: number;
  lng: number;
  label: string;         // nicely formatted string from display_name or assembled from address
  raw: any;              // original Nominatim item (optional, for debugging)
};

export type DistanceResult = {
  destination: GeocodingResult;
  distanceKm: number;
};

export type LatLng = { lat: number; lng: number };

// Fixed origin point from specification
const ORIGIN = {
  lat: -6.3838528,
  lng: 106.8420638,
} as const;

// Nominatim API base configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

// Rate limiting - maximum 1 request per second as per Nominatim usage policy
const RATE_LIMIT_DELAY = 1000; // 1 second
let lastRequestTime = 0;

// Debounce timer for input
let debounceTimer: NodeJS.Timeout | null = null;

/**
 * Calculate time to wait until next request is allowed
 */
const getTimeUntilNextRequest = (): number => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const remainingDelay = RATE_LIMIT_DELAY - timeSinceLastRequest;
  return Math.max(0, remainingDelay);
};

/**
 * Search locations using Nominatim API with proper rate limiting and error handling
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  // Validate input
  if (!query || query.trim().length < 3) {
    // console.log(`[NOMINATIM] Query too short (${query?.length} chars), skipping search`);
    return [];
  }

  const cleanQuery = query.trim();
  // console.log(`[NOMINATIM] Starting search for: "${cleanQuery}"`);

  try {
    // Wait for rate limit
    const waitTime = getTimeUntilNextRequest();
    if (waitTime > 0) {
      // console.log(`[NOMINATIM] Rate limiting - waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Update last request time
    lastRequestTime = Date.now();

    // Build search parameters according to specification
    const searchParams = new URLSearchParams({
      format: 'json',
      q: cleanQuery,
      countrycodes: 'id', // ONLY Indonesia
      addressdetails: '1',
      limit: '5', // only top 5 results
      // Java island bounding box: 105°E to 114.6°E, 5.9°S to 7.8°N
      bounded: '1',
      viewbox: '105,-5.2,115,-8.8'
    });

    const searchUrl = `${NOMINATIM_BASE_URL}?${searchParams}`;
    
    // console.log(`[NOMINATIM] Making API request to: ${searchUrl}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'tinybitty-location-search/1.0 (contact: your-email@example.com)',
        'Accept-Language': 'id,en',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log(`[NOMINATIM] Raw API response:`, data);

    // Filter and enhance results
    const enhancedResults: GeocodingResult[] = data
      .filter((item: any) => item.lat && item.lon && item.display_name)
      .map((item: any) => {
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          label: item.display_name, // Use the full display_name for better context
          raw: item
        };
      })
      .sort((a: GeocodingResult, b: GeocodingResult) => {
        // Sort by confidence score - prefer more complete addresses
        const scoreA = calculateConfidenceScore(a.raw);
        const scoreB = calculateConfidenceScore(b.raw);
        return scoreB - scoreA;
      });

    // console.log(`[NOMINATIM] Returning ${enhancedResults.length} enhanced results`);
    return enhancedResults;

  } catch (error) {
    console.error('[NOMINATIM] Search failed:', error);
    
    // Handle specific error types
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('[NOMINATIM] Network error - this might be a temporary connectivity issue');
    }
    
    // Return empty array on error - caller will handle gracefully
    return [];
  }
}

/**
 * Build a clean, readable label from address components
 */
function buildLocationLabel(address: any): string | null {
  if (!address) return null;

  const parts: string[] = [];
  
  // Add primary location (road, place, etc.)
  if (address.road || address.house_number) {
    const roadParts = [];
    if (address.house_number) roadParts.push(address.house_number);
    if (address.road) roadParts.push(address.road);
    if (roadParts.length > 0) {
      parts.push(roadParts.join(' '));
    }
  } else if (address.place || address.locality) {
    parts.push(address.place || address.locality);
  }
  
  // Add neighborhood/suburb
  if (address.suburb || address.neighbourhood || address.quarter) {
    parts.push(address.suburb || address.neighbourhood || address.quarter);
  }
  
  // Add city/regency
  if (address.city || address.town || address.village || address.regency) {
    parts.push(address.city || address.town || address.village || address.regency);
  }
  
  // Add province/state
  if (address.state) {
    parts.push(address.state);
  }
  
  // Add postal code if available
  if (address.postcode) {
    parts.push(address.postcode);
  }

  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Calculate confidence score for sorting results (higher = better)
 */
function calculateConfidenceScore(item: any): number {
  let score = 0;
  
  // Boost score for complete addresses
  if (item.address?.house_number) score += 10;
  if (item.address?.road) score += 8;
  if (item.address?.suburb || item.address?.neighbourhood) score += 6;
  if (item.address?.city || item.address?.town || item.address?.village) score += 4;
  if (item.address?.state) score += 2;
  
  // Boost for certain place types
  if (item.type === 'place' && item.class === 'place') score += 5;
  if (item.type === 'highway') score += 3;
  
  // Boost for populated areas (higher importance)
  if (item.importance && item.importance > 0.5) score += 3;
  
  return score;
}

/**
 * Calculate distance using Haversine formula
 */
export function calculateDistanceKm(origin: LatLng, destination: LatLng): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
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