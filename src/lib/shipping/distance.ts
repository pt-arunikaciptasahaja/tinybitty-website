// Reliable Geocoding + Motorcycle Routing + Delivery Fee Module
// Uses motorcycle routing without tolls via OpenRouteService API

import { calculateMotorcycleRoute, getOrigin } from '../motorcycleRouting';

// In-memory cache for geocoding results
const geocodeCache = new Map<string, { lat: number; lon: number }>();

// Fixed origin coordinates (updated to match motorcycle routing)
const ORIGIN_LAT = -6.3838528;
const ORIGIN_LNG = 106.8420638;
const ORIGIN_ADDRESS = "Pesona Mungil, Pesona Khayangan, Mekar Jaya, Depok, West Java";

/**
 * Fetch data using JSONP technique (for APIs that support it)
 */
function fetchWithJSONP(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');
    
    // Create callback function
    (window as any)[callbackName] = function(data: any) {
      delete (window as any)[callbackName];
      document.head.removeChild(script);
      if (data && data.length > 0) {
        resolve(data);
      } else {
        reject(new Error('No data received'));
      }
    };
    
    // Set up error handling
    script.onerror = function() {
      delete (window as any)[callbackName];
      document.head.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    
    // Add callback parameter
    const separator = url.includes('?') ? '&' : '?';
    const jsonpUrl = url + separator + 'callback=' + callbackName;
    
    script.src = jsonpUrl;
    document.head.appendChild(script);
    
    // Set timeout
    setTimeout(() => {
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        reject(new Error('JSONP request timeout'));
      }
    }, 10000);
  });
}

/**
 * SAFEST Nomitatim geocoding with:
 * - user-agent (required)
 * - indonesia bounded search
 * - retry logic
 * - caching
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number }> {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address)!;
  }

  const encoded = encodeURIComponent(address);

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `format=json&limit=1&countrycodes=id&addressdetails=1&` +
    `bounded=1&` +
    `viewbox=105.0,-7.8,114.6,5.9&` + // Java island bounding box
    `q=${encoded}`;

  // More reliable CORS proxy options with different approaches
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    // JSONP approach for Nominatim
    null // null means JSONP approach
  ];

  // Try progressively simpler address versions for better geocoding success
  const addressVersions = [
    address, // Original full address
    // Extract subdistrict/city from address
    extractSubdistrictFromAddress(address),
    // Extract just the city/regency
    extractCityFromAddress(address),
    // Extract just the province
    extractProvinceFromAddress(address),
    // Fallback to Jakarta general
    "Jakarta, Indonesia"
  ];

  // Remove duplicates and empty strings
  const uniqueAddresses = [...new Set(addressVersions.filter(addr => addr && addr.trim()))];
  
  console.log(`[DISTANCE GEOCODE] Will try ${uniqueAddresses.length} address variations for: ${address}`);

  let attempt = 0;

  while (attempt < uniqueAddresses.length) {
    const currentAddress = uniqueAddresses[attempt];
    console.log(`[DISTANCE GEOCODE] Attempt ${attempt + 1}/${uniqueAddresses.length} with: ${currentAddress}`);
    
    try {
      const geocodeResult = await geocodeSingleAddress(currentAddress);
      if (geocodeResult) {
        console.log(`[DISTANCE GEOCODE] Success with simplified address: ${currentAddress}`);
        geocodeCache.set(address, geocodeResult);
        return geocodeResult;
      }
    } catch (err: any) {
      console.log(`[DISTANCE GEOCODE] Attempt ${attempt + 1} failed:`, err?.message);
    }
    
    attempt++;
  }

  throw new Error(`Failed to geocode address after trying ${uniqueAddresses.length} variations: ${address}`);
}

/**
 * Geocode a single address with CORS proxy handling
 */
async function geocodeSingleAddress(address: string): Promise<{ lat: number; lon: number }> {
  // More reliable CORS proxy options with different approaches
  const corsProxies = [
    'https://corsproxy.io/?', // More reliable proxy
    'https://api.allorigins.win/raw?url=',
    null // Will use JSONP approach
  ];

  const encoded = encodeURIComponent(address);

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `format=json&limit=1&countrycodes=id&addressdetails=1&` +
    `bounded=1&` +
    `viewbox=105.0,-7.8,114.6,5.9&` + // Java island bounding box
    `q=${encoded}`;

  for (let proxyIndex = 0; proxyIndex < corsProxies.length; proxyIndex++) {
    try {
      // Handle JSONP approach
      if (proxyIndex === 2 && corsProxies[2] === null) {
        console.log(`[DISTANCE GEOCODE] Trying JSONP approach...`);
        const jsonpResult = await fetchWithJSONP(url);
        if (jsonpResult) {
          const data = jsonpResult;
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          };
        } else {
          throw new Error('JSONP failed');
        }
      } else {
        const proxyUrl = corsProxies[proxyIndex] + encodeURIComponent(url);
        
        if (proxyIndex === 0) {
          console.log(`[DISTANCE GEOCODE] Using proxy ${proxyIndex + 1} for: ${address}`);
        }
        
        const response = await fetch(proxyUrl, {
          headers: {
            "User-Agent": "TinyBitty-Cookie/1.0"
          }
        });

        if (!response.ok) {
          throw new Error(`Proxy ${proxyIndex + 1} failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
          throw new Error(`No coordinates found for address: ${address}`);
        }

        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (proxyError) {
      console.log(`[DISTANCE GEOCODE] Method ${proxyIndex + 1} failed:`, proxyError);
      // Continue to next method
    }
  }

  throw new Error(`All geocoding methods failed for: ${address}`);
}

/**
 * Extract subdistrict from full address
 */
function extractSubdistrictFromAddress(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  
  // Common patterns for Indonesian addresses
  // Try to find subdistrict (kelurahan/desa) + district (kecamatan) + city
  
  for (let i = 0; i < parts.length - 1; i++) {
    const current = parts[i].toLowerCase();
    const next = parts[i + 1].toLowerCase();
    
    // If current contains kelurahan/desa and next contains kecamatan, combine them
    if ((current.includes('kelurahan') || current.includes('desa')) && 
        (next.includes('kecamatan') || next.includes('district'))) {
      return `${parts[i]}, ${parts[i + 1]}`;
    }
    
    // If it's just the area name, combine with city
    if (next.includes('jakarta') || next.includes('depok') || next.includes('bogor')) {
      return `${parts[i]}, ${parts[i + 1]}`;
    }
  }
  
  // Fallback: use first 2-3 parts that contain location info
  const locationParts = parts.filter(part => 
    part.toLowerCase().includes('jakarta') || 
    part.toLowerCase().includes('depok') || 
    part.toLowerCase().includes('bogor') ||
    part.toLowerCase().includes('kecamatan') ||
    part.toLowerCase().includes('kelurahan')
  );
  
  return locationParts.slice(0, 2).join(', ');
}

/**
 * Extract city from full address
 */
function extractCityFromAddress(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  
  // Look for Jakarta, Depok, Bogor, etc.
  const cityPart = parts.find(part => 
    part.toLowerCase().includes('jakarta') || 
    part.toLowerCase().includes('depok') || 
    part.toLowerCase().includes('bogor') ||
    part.toLowerCase().includes('tangerang') ||
    part.toLowerCase().includes('bekasi')
  );
  
  return cityPart || parts[parts.length - 1]; // Fallback to last part
}

/**
 * Extract province from full address
 */
function extractProvinceFromAddress(address: string): string {
  const addressLower = address.toLowerCase();
  
  if (addressLower.includes('jakarta') || addressLower.includes('depok') || addressLower.includes('bogor')) {
    return 'DKI Jakarta, Indonesia';
  }
  
  if (addressLower.includes('bandung')) {
    return 'Jawa Barat, Indonesia';
  }
  
  if (addressLower.includes('surabaya')) {
    return 'Jawa Timur, Indonesia';
  }
  
  return 'Indonesia';
}

/**
 * Get motorcycle distance without tolls
 */
export async function getDistanceKm(destination: string): Promise<number | null> {
  try {
    console.log(`[DISTANCE] Calculating motorcycle distance without tolls to: ${destination}`);
    const dest = await geocodeAddress(destination);

    // Use motorcycle routing instead of OSRM car routing
    const origin = getOriginCoordinates();
    const routingResult = await calculateMotorcycleRoute(
      { lat: origin.lat, lng: origin.lon },
      { lat: dest.lat, lng: dest.lon },
      { excludeTolls: true } // Ensure tolls are excluded
    );

    const result = Math.round(routingResult.distance * 10) / 10; // keep 1 decimal
    console.log(`[DISTANCE] Calculated motorcycle distance (no tolls): ${result}km`);
    return result;

  } catch (err: any) {
    console.error(`[DISTANCE] Error calculating motorcycle distance:`, err?.message);
    return null;
  }
}

// =============== DELIVERY FEE FORMULAS ======================

export function getGoSendInstantFee(distanceKm: number): number {
  // Tarif dasar: Rp 20.000 untuk 8 km pertama
  if (distanceKm <= 8) {
    return 20000;
  }
  
  // Untuk jarak 0–20 km: Rp 2.500 / km (setelah 8 km pertama)
  if (distanceKm <= 20) {
    return 20000 + ((distanceKm - 8) * 2500);
  }
  
  // Untuk jarak 20,01–40 km: Rp 3.000 / km
  if (distanceKm <= 40) {
    return 20000 + (12 * 2500) + ((distanceKm - 20) * 3000);
  }
  
  return 0; // Tidak melayani jarak > 40 km
}

export function getGoSendSameDayFee(distanceKm: number): number {
  // Jarak 0–3 km → ongkir Rp 12.000
  if (distanceKm <= 3) {
    return 12000;
  }
  
  // Jarak 3,01–15 km → ongkir Rp 18.000
  if (distanceKm <= 15) {
    return 18000;
  }
  
  // Jarak > 15 km → ongkir Rp 1.200 / km
  if (distanceKm <= 40) {
    return Math.round(distanceKm * 1200);
  }
  
  return 0; // Tidak melayani jarak > 40 km
}

export function getGrabExpressInstantFee(distanceKm: number): number {
  // Tarif minimum (base): Rp 20.000
  if (distanceKm <= 0) {
    return 20000;
  }
  
  // 0 – 5 km → Rp 2.900 / km
  if (distanceKm <= 5) {
    return Math.max(20000, distanceKm * 2900);
  }
  
  // 5 – 10 km → Rp 3.000 / km
  if (distanceKm <= 10) {
    return 5 * 2900 + ((distanceKm - 5) * 3000);
  }
  
  // 10 – 30 km → Rp 3.200 / km (instant maksimal 30 km)
  if (distanceKm <= 30) {
    return 5 * 2900 + 5 * 3000 + ((distanceKm - 10) * 3200);
  }
  
  return 0; // Tidak melayani jarak > 30 km untuk Instant
}

export function getGrabExpressSameDayFee(distanceKm: number): number {
  // Ongkir sama (flat) berdasarkan jarak untuk SameDay
  if (distanceKm <= 5) {
    return 15000;
  } else if (distanceKm <= 10) {
    return 18000;
  } else if (distanceKm <= 15) {
    return 18000;
  } else if (distanceKm <= 20) {
    return 21000;
  } else if (distanceKm <= 25) {
    return 25000;
  } else if (distanceKm <= 30) {
    return 33000;
  } else if (distanceKm <= 35) {
    return 39000;
  } else if (distanceKm <= 40) {
    return 49000;
  }
  
  return 0; // Tidak melayani jarak > 40 km untuk SameDay
}

// ========= MAIN PIPELINE: returns EXACT format required =========

export async function calculateDeliveryCosts(destination: string) {
  try {
    const distanceKm = await getDistanceKm(destination);

    if (!distanceKm) {
      return {
        distance_km: 0,
        gosend_instant: 0,
        gosend_same_day: 0,
        grabexpress_instant: 0
      };
    }

    return {
      distance_km: distanceKm,
      gosend_instant: getGoSendInstantFee(distanceKm),
      gosend_same_day: getGoSendSameDayFee(distanceKm),
      grabexpress_instant: getGrabExpressInstantFee(distanceKm)
    };

  } catch (err: any) {
    console.log(`[Delivery API] Fatal Error:`, err?.message);

    return {
      distance_km: 0,
      gosend_instant: 0,
      gosend_same_day: 0,
      grabexpress_instant: 0
    };
  }
}

// Accessors
export const getOriginAddress = () => ORIGIN_ADDRESS;
export const getOriginCoordinates = () => ({
  lat: ORIGIN_LAT,
  lon: ORIGIN_LNG
});
