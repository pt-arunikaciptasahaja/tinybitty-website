import { getDistanceKm, getOriginAddress } from './distance';
import { ShippingRates, ShippingResult, ShippingAvailable, ShippingUnavailable } from './types';

export async function calculateShipping(destination: string): Promise<ShippingRates> {
  // Get distance from origin to destination
  const origin = getOriginAddress();
  const distanceKm = await getDistanceKm(origin, destination);

  // Calculate rates for each courier service
  const gosendInstant = calculateGoSendInstant(distanceKm);
  const gosendSameDay = calculateGoSendSameDay(distanceKm);
  const grabExpressInstant = calculateGrabExpressInstant(distanceKm);

  return {
    distance_km: distanceKm,
    gosend_instant: gosendInstant,
    gosend_same_day: gosendSameDay,
    grabexpress_instant: grabExpressInstant,
  };
}

// GoSend Instant: Rp 2.500 / km, Minimum Rp 20.000, Max 20km
function calculateGoSendInstant(distanceKm: number): ShippingResult {
  const maxDistance = 20;
  
  if (distanceKm > maxDistance) {
    return {
      available: false,
      reason: "Distance exceeds 20 km limit"
    };
  }

  const basePrice = distanceKm * 2500;
  const price = Math.max(20000, basePrice);

  return {
    available: true,
    price: price
  };
}

// GoSend Same Day: Base Rp 13.000 + Rp 2.000 / km, Min Rp 20.000, Max 40km
function calculateGoSendSameDay(distanceKm: number): ShippingResult {
  const maxDistance = 40;
  
  if (distanceKm > maxDistance) {
    return {
      available: false,
      reason: "Distance exceeds 40 km limit"
    };
  }

  const basePrice = 13000;
  const additionalPrice = distanceKm * 2000;
  const totalPrice = basePrice + additionalPrice;
  const price = Math.max(20000, totalPrice);

  return {
    available: true,
    price: price
  };
}

// GrabExpress Instant: Base Rp 10.000 + Rp 2.700 / km, Min Rp 20.000, Max 30km
function calculateGrabExpressInstant(distanceKm: number): ShippingResult {
  const maxDistance = 30;
  
  if (distanceKm > maxDistance) {
    return {
      available: false,
      reason: "Distance exceeds 30 km limit"
    };
  }

  const basePrice = 10000;
  const perKmPrice = distanceKm * 2700;
  const totalPrice = basePrice + perKmPrice;
  const price = Math.max(20000, totalPrice);

  return {
    available: true,
    price: price
  };
}