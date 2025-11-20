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
