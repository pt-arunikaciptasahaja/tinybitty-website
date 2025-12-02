// Delivery fee calculation functions
// Moved from distance.ts to avoid circular dependencies

// Fixed origin coordinates (same as in nominatimClient)
export const ORIGIN_LAT = -6.3838528;
export const ORIGIN_LNG = 106.8420638;
export const ORIGIN_ADDRESS = "Pesona Mungil, Pesona Khayangan, Mekar Jaya, Depok, West Java";

/**
 * Add perkiraan buffer to make estimation range
 * Returns range like "baseCost - baseCost + 10000"
 */
export function addPerkiraanBuffer(baseCost: number): number {
  return baseCost + 10000; // Add Rp 10,000 buffer for perkiraan
}

// Accessors
export const getOriginAddress = () => ORIGIN_ADDRESS;
export const getOriginCoordinates = () => ({
  lat: ORIGIN_LAT,
  lon: ORIGIN_LNG
});

// =============== DELIVERY FEE FORMULAS ======================

export function getGoSendInstantFee(distanceKm: number): number {
  // Tarif dasar: Rp 20.000 untuk 8 km pertama
  if (distanceKm <= 8) {
    return addPerkiraanBuffer(20000);
  }
  
  // Untuk jarak 0–20 km: Rp 2.500 / km (setelah 8 km pertama)
  if (distanceKm <= 20) {
    const baseCost = 20000 + ((distanceKm - 8) * 2500);
    return addPerkiraanBuffer(baseCost);
  }
  
  // Untuk jarak 20,01–40 km: Rp 3.000 / km
  if (distanceKm <= 40) {
    const baseCost = 20000 + (12 * 2500) + ((distanceKm - 20) * 3000);
    return addPerkiraanBuffer(baseCost);
  }
  
  return 0; // Tidak melayani jarak > 40 km
}

export function getGoSendSameDayFee(distanceKm: number): number {
  // Jarak 0–3 km → ongkir Rp 12.000
  if (distanceKm <= 3) {
    return addPerkiraanBuffer(12000);
  }
  
  // Jarak 3,01–15 km → ongkir Rp 18.000
  if (distanceKm <= 15) {
    return addPerkiraanBuffer(18000);
  }
  
  // Jarak > 15 km → ongkir Rp 1.200 / km
  if (distanceKm <= 40) {
    const baseCost = Math.round(distanceKm * 1200);
    return addPerkiraanBuffer(baseCost);
  }
  
  return 0; // Tidak melayani jarak > 40 km
}

export function getGrabExpressInstantFee(distanceKm: number): number {
  // Tarif minimum (base): Rp 20.000
  if (distanceKm <= 0) {
    return addPerkiraanBuffer(20000);
  }
  
  // 0 – 5 km → Rp 2.900 / km
  if (distanceKm <= 5) {
    const baseCost = Math.max(20000, distanceKm * 2900);
    return addPerkiraanBuffer(baseCost);
  }
  
  // 5 – 10 km → Rp 3.000 / km
  if (distanceKm <= 10) {
    const baseCost = 5 * 2900 + ((distanceKm - 5) * 3000);
    return addPerkiraanBuffer(baseCost);
  }
  
  // 10 – 30 km → Rp 3.200 / km (instant maksimal 30 km)
  if (distanceKm <= 30) {
    const baseCost = 5 * 2900 + 5 * 3000 + ((distanceKm - 10) * 3200);
    return addPerkiraanBuffer(baseCost);
  }
  
  return 0; // Tidak melayani jarak > 30 km untuk Instant
}

export function getGrabExpressSameDayFee(distanceKm: number): number {
  // Ongkir sama (flat) berdasarkan jarak untuk SameDay
  if (distanceKm <= 5) {
    return addPerkiraanBuffer(15000);
  } else if (distanceKm <= 10) {
    return addPerkiraanBuffer(18000);
  } else if (distanceKm <= 15) {
    return addPerkiraanBuffer(18000);
  } else if (distanceKm <= 20) {
    return addPerkiraanBuffer(21000);
  } else if (distanceKm <= 25) {
    return addPerkiraanBuffer(25000);
  } else if (distanceKm <= 30) {
    return addPerkiraanBuffer(33000);
  } else if (distanceKm <= 35) {
    return addPerkiraanBuffer(39000);
  } else if (distanceKm <= 40) {
    return addPerkiraanBuffer(49000);
  }
  
  return 0; // Tidak melayani jarak > 40 km untuk SameDay
}