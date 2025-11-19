// Reliable Geocoding + OSRM + Delivery Fee Module
// Fully rewritten for stability and proper OSRM parsing

// In-memory cache for geocoding results
const geocodeCache = new Map<string, { lat: number; lon: number }>();

// Fixed origin coordinates
const ORIGIN_LAT = -6.3812283;
const ORIGIN_LNG = 106.8430274;
const ORIGIN_ADDRESS = "Pesona Mungil, Pesona Khayangan, Mekar Jaya, Depok, West Java";

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
    `viewbox=95,-11,141,6&` + // Indonesia bounding box
    `q=${encoded}`;

  let attempt = 0;

  while (attempt < 3) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "YourAppName/1.0 (Contact: your-email@example.com)"
        }
      });

      if (response.status === 429) {
        await new Promise(res => setTimeout(res, 500)); // retry delay
        attempt++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Nominatim failed with ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error(`No coordinates found for address: ${address}`);
      }

      const result = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };

      geocodeCache.set(address, result);
      return result;

    } catch (err: any) {
      console.log(`[Geocode] Attempt ${attempt + 1} failed:`, err?.message);
      attempt++;
      await new Promise(res => setTimeout(res, 300));
    }
  }

  throw new Error(`Failed to geocode address after retries: ${address}`);
}

/**
 * Get driving distance via OSRM
 */
export async function getDistanceKm(destination: string): Promise<number | null> {
  try {
    const dest = await geocodeAddress(destination);

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${ORIGIN_LNG},${ORIGIN_LAT};${dest.lon},${dest.lat}?overview=false`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes?.[0]?.legs?.[0]?.distance) {
      throw new Error(`OSRM: no valid route`);
    }

    const meters = data.routes[0].legs[0].distance;
    const km = meters / 1000;

    return Math.round(km * 10) / 10; // keep 1 decimal

  } catch (err: any) {
    console.log(`[Distance] Error:`, err?.message);
    return null;
  }
}

// =============== DELIVERY FEE FORMULAS ======================

export function getGoSendInstantFee(distanceKm: number): number {
  return Math.max(14000, distanceKm * 4000);
}

export function getGoSendSameDayFee(distanceKm: number): number {
  return Math.max(10000, distanceKm * 3000);
}

export function getGrabExpressInstantFee(distanceKm: number): number {
  return Math.max(15000, distanceKm * 4200);
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
