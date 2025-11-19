// ongkirHelpers.ts

// Supported services (Jabodetabek only)
export type OngkirService =
  | 'GOSEND_INSTANT'
  | 'GOSEND_SAMEDAY'
  | 'GRAB_INSTANT'
  | 'GRAB_SAMEDAY';

export interface OngkirResult {
  service: OngkirService;
  distanceKm: number;
  estimatedCost: number; // in IDR
  currency: 'IDR';
  warnings: string[];
}

// Small UI note (show this under your price)
export const ONGKIR_NOTE =
  'Perkiraan ongkir. Ongkir final mengikuti aplikasi GoSend/GrabExpress (belum termasuk tol/parkir/tip).';

// Generic warning for exceeded distance
const MAX_DISTANCE_WARNING =
  'Jarak pengiriman melebihi batas maksimum untuk layanan ini di area Jabodetabek.';

// -------------------------
// Internal rate constants
// -------------------------

// GoSend – JABODETABEK (motor)
const GOSEND_MIN_FARE_IDR = 13_000; // You can bump to 20_000 if you want to be conservative
const GOSEND_INSTANT_MAX_DISTANCE_KM = 40;
const GOSEND_SAMEDAY_MAX_DISTANCE_KM = 40;

// GrabExpress – JABODETABEK (bike)
const GRAB_INSTANT_MIN_FARE_IDR = 20_000;
const GRAB_INSTANT_MAX_DISTANCE_KM = 40; // practical app limit often 30–40 km
const GRAB_SAMEDAY_MAX_DISTANCE_KM = 40;

// -------------------------
// Core calculators (pure)
// -------------------------

function calcGoSendInstant(distanceKm: number): OngkirResult {
  const warnings: string[] = [];
  const d = Math.max(0, distanceKm);

  if (d === 0) {
    return {
      service: 'GOSEND_INSTANT',
      distanceKm: d,
      estimatedCost: 0,
      currency: 'IDR',
      warnings: ['Distance is zero or invalid.'],
    };
  }

  if (d > GOSEND_INSTANT_MAX_DISTANCE_KM) {
    warnings.push(MAX_DISTANCE_WARNING);
    return {
      service: 'GOSEND_INSTANT',
      distanceKm: d,
      estimatedCost: 0,
      currency: 'IDR',
      warnings,
    };
  }

  let costRaw: number;

  if (d <= 10) {
    // 0–10 km: 2.815 / km
    costRaw = d * 2_815;
  } else {
    // >10–40 km: 10 km * 2.815 + (d - 10) * 3.000
    costRaw = 10 * 2_815 + (d - 10) * 3_000;
  }

  const cost = Math.max(Math.round(costRaw), GOSEND_MIN_FARE_IDR);

  return {
    service: 'GOSEND_INSTANT',
    distanceKm: d,
    estimatedCost: cost,
    currency: 'IDR',
    warnings,
  };
}

function calcGoSendSameDay(distanceKm: number): OngkirResult {
  const warnings: string[] = [];
  const d = Math.max(0, distanceKm);

  if (d === 0) {
    return {
      service: 'GOSEND_SAMEDAY',
      distanceKm: d,
      estimatedCost: 0,
      currency: 'IDR',
      warnings: ['Distance is zero or invalid.'],
    };
  }

  if (d > GOSEND_SAMEDAY_MAX_DISTANCE_KM) {
    warnings.push(MAX_DISTANCE_WARNING);
    return {
      service: 'GOSEND_SAMEDAY',
      distanceKm: d,
      estimatedCost: 0,
      currency: 'IDR',
      warnings,
    };
  }

  let cost: number;

  if (d <= 6) {
    // 0–6 km: 2.815 / km, min 13.000
    const costRaw = d * 2_815;
    cost = Math.max(Math.round(costRaw), 13_000);
  } else {
    // 6–40 km: approx flat 18.000 (simplified Same Day Jabo model)
    cost = 18_000;
  }

  return {
    service: 'GOSEND_SAMEDAY',
    distanceKm: d,
    estimatedCost: cost,
    currency: 'IDR',
    warnings,
  };
}

function calcGrabInstant(distanceKm: number): OngkirResult {
  const warnings: string[] = [];
  const d = Math.max(0, distanceKm);

  if (d === 0) {
    return {
      service: 'GRAB_INSTANT',
      distanceKm: d,
      estimatedCost: 0,
      currency: 'IDR',
      warnings: ['Distance is zero or invalid.'],
    };
  }

  if (d > GRAB_INSTANT_MAX_DISTANCE_KM) {
    warnings.push(MAX_DISTANCE_WARNING);
    return {
      service: 'GRAB_INSTANT',
      distanceKm: d,
      estimatedCost: 0,
      currency: 'IDR',
      warnings,
    };
  }

  // Segmented per-km style (like transport tariffs)
  let costRaw: number;

  if (d <= 5) {
    // 0–5 km: 2.900 / km
    costRaw = d * 2_900;
  } else if (d <= 10) {
    // 5–10 km: 3.000 / km
    costRaw = 5 * 2_900 + (d - 5) * 3_000;
  } else {
    // 10–40 km: 3.200 / km (table officially 10–30, we extend as approximation)
    costRaw = 5 * 2_900 + 5 * 3_000 + (d - 10) * 3_200;
  }

  const cost = Math.max(Math.round(costRaw), GRAB_INSTANT_MIN_FARE_IDR);

  return {
    service: 'GRAB_INSTANT',
    distanceKm: d,
    estimatedCost: cost,
    currency: 'IDR',
    warnings,
  };
}

function calcGrabSameDay(distanceKm: number): OngkirResult {
  const warnings: string[] = [];
  const d = Math.max(0, distanceKm);

  if (d === 0) {
    return {
      service: 'GRAB_SAMEDAY',
      distanceKm: d,
      estimatedCost: 0,
      currency: 'IDR',
      warnings: ['Distance is zero or invalid.'],
    };
  }

  if (d > GRAB_SAMEDAY_MAX_DISTANCE_KM) {
    warnings.push(MAX_DISTANCE_WARNING);
    return {
      service: 'GRAB_SAMEDAY',
      distanceKm: d,
      estimatedCost: 0,
      currency: 'IDR',
      warnings,
    };
  }

  let cost: number;

  if (d <= 5) cost = 15_000;
  else if (d <= 10) cost = 18_000;
  else if (d <= 15) cost = 20_000;
  else if (d <= 20) cost = 21_000;
  else if (d <= 25) cost = 25_000;
  else if (d <= 30) cost = 33_000;
  else if (d <= 35) cost = 39_000;
  else /* d <= 40 */ cost = 49_000;

  return {
    service: 'GRAB_SAMEDAY',
    distanceKm: d,
    estimatedCost: cost,
    currency: 'IDR',
    warnings,
  };
}

// -------------------------
// Public API
// -------------------------

export function calculateOngkir(
  service: OngkirService,
  distanceKm: number
): OngkirResult {
  switch (service) {
    case 'GOSEND_INSTANT':
      return calcGoSendInstant(distanceKm);
    case 'GOSEND_SAMEDAY':
      return calcGoSendSameDay(distanceKm);
    case 'GRAB_INSTANT':
      return calcGrabInstant(distanceKm);
    case 'GRAB_SAMEDAY':
      return calcGrabSameDay(distanceKm);
    default:
      return {
        service,
        distanceKm,
        estimatedCost: 0,
        currency: 'IDR',
        warnings: ['Unsupported service.'],
      };
  }
}
