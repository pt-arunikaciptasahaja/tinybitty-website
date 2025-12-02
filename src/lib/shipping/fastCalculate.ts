// Fast delivery cost calculation using direct distance (no API calls)
// This bypasses the slow geocoding/routing API when distance is already known

import { ShippingRates, ShippingResult } from './types';
import {
  getGoSendInstantFee,
  getGoSendSameDayFee,
  getGrabExpressInstantFee,
  getGrabExpressSameDayFee
} from './deliveryFees';

/**
 * Fast delivery cost calculation using direct distance
 * This is much faster than calculateShipping() because it skips all API calls
 */
export async function calculateShippingWithDistance(distanceKm: number): Promise<ShippingRates> {
  // Handle invalid distance
  if (!distanceKm || distanceKm <= 0) {
    return {
      distance_km: 0,
      gosend_instant: {
        available: false,
        reason: "Invalid distance"
      },
      gosend_same_day: {
        available: false,
        reason: "Invalid distance"
      },
      grabexpress_instant: {
        available: false,
        reason: "Invalid distance"
      },
      grabexpress_same_day: {
        available: false,
        reason: "Invalid distance"
      }
    };
  }

  // Check service availability based on distance limits
  const gosendInstantAvailable = distanceKm <= 40;
  const gosendSameDayAvailable = distanceKm <= 40;
  const grabExpressInstantAvailable = distanceKm <= 30; // Instant has lower limit
  const grabExpressSameDayAvailable = distanceKm <= 40;

  // Calculate costs using the same formulas as the API-based version
  const gosendInstantPrice = gosendInstantAvailable ? getGoSendInstantFee(distanceKm) : 0;
  const gosendSameDayPrice = gosendSameDayAvailable ? getGoSendSameDayFee(distanceKm) : 0;
  const grabExpressInstantPrice = grabExpressInstantAvailable ? getGrabExpressInstantFee(distanceKm) : 0;
  const grabExpressSameDayPrice = grabExpressSameDayAvailable ? getGrabExpressSameDayFee(distanceKm) : 0;

  return {
    distance_km: distanceKm,
    gosend_instant: {
      available: gosendInstantAvailable,
      price: gosendInstantPrice,
      reason: gosendInstantAvailable ? undefined : "Distance exceeds 40km limit"
    },
    gosend_same_day: {
      available: gosendSameDayAvailable,
      price: gosendSameDayPrice,
      reason: gosendSameDayAvailable ? undefined : "Distance exceeds 40km limit"
    },
    grabexpress_instant: {
      available: grabExpressInstantAvailable,
      price: grabExpressInstantPrice,
      reason: grabExpressInstantAvailable ? undefined : "Distance exceeds 30km limit for instant delivery"
    },
    grabexpress_same_day: {
      available: grabExpressSameDayAvailable,
      price: grabExpressSameDayPrice,
      reason: grabExpressSameDayAvailable ? undefined : "Distance exceeds 40km limit"
    }
  };
}

/**
 * Quick delivery cost calculation for a specific method
 * Returns the same format as calculateShippingCost but without API calls
 */
export async function calculateDeliveryCostWithDistance(
  distanceKm: number,
  method: string
): Promise<{
  cost: number;
  baseCost: number;
  bufferCost: number;
  zone: { name: string };
  method: string;
  estimatedTime: string;
  breakdown: {
    baseRate: number;
    distanceMultiplier: number;
  };
  isValidAddress: boolean;
}> {
  const rates = await calculateShippingWithDistance(distanceKm);
  
  let selectedRate: ShippingResult;
  let estimatedTime: string;
  
  switch (method) {
    case 'gosend':
    case 'gosendinstant':
      selectedRate = rates.gosend_instant;
      estimatedTime = '1-3 jam';
      break;
    case 'grab':
      selectedRate = rates.grabexpress_instant;
      estimatedTime = '1-4 jam';
      break;
    case 'grabsameday':
      selectedRate = rates.grabexpress_same_day;
      estimatedTime = '3-6 jam';
      break;
    case 'paxel':
      // Paxel uses GoSend Same Day pricing as fallback
      selectedRate = rates.gosend_same_day;
      estimatedTime = '2-6 jam';
      break;
    case 'gosendsameday':
      selectedRate = rates.gosend_same_day;
      estimatedTime = '3-6 jam';
      break;
    default:
      selectedRate = rates.gosend_instant;
      estimatedTime = '1-3 jam';
  }
  
  // If service is unavailable
  if (!selectedRate.available) {
    return {
      cost: 0,
      baseCost: 0,
      bufferCost: 0,
      zone: { name: 'Service unavailable' },
      method,
      estimatedTime: 'N/A',
      breakdown: {
        baseRate: 0,
        distanceMultiplier: 1,
      },
      isValidAddress: false
    };
  }
  
  const finalCost = selectedRate.price;
  const baseCost = finalCost - 10000; // Remove the buffer to get original cost
  const bufferCost = finalCost;
  
  return {
    cost: finalCost,
    baseCost: Math.max(0, baseCost),
    bufferCost: bufferCost,
    zone: {
      name: `${distanceKm.toFixed(1)} km`
    },
    method,
    estimatedTime,
    breakdown: {
      baseRate: finalCost,
      distanceMultiplier: 1,
    },
    isValidAddress: true
  };
}