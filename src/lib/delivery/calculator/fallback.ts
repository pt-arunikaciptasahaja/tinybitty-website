// Fallback delivery cost calculator when scrapers fail
// Uses hardcoded zones and rates with weight calculation

import { DeliveryZone, CartItem, calculateWeight } from '../types';
import { deliveryZones, findDeliveryZone, validateAddress, getEstimatedTime } from '../zones/deliveryZones';

export interface FallbackResult {
  cost: number;
  zone: DeliveryZone;
  breakdown: {
    baseRate: number;
    distanceMultiplier: number;
    weightCharge: number;
    surcharges: number;
  };
  confidence: number; // 0-1, confidence in fallback calculation
}

/**
 * Calculate delivery cost using fallback zones method
 */
export function fallbackCost(
  method: string,
  address: string,
  cart: CartItem[] = []
): FallbackResult {
  
  // Validate address
  if (!validateAddress(address)) {
    throw new Error('Invalid address: unable to identify delivery zone');
  }

  // Find delivery zone
  const zone = findDeliveryZone(address);
  
  // Get base rate for method
  const baseRate = getBaseRate(zone, method);
  
  // Calculate weight and charges
  const totalWeight = calculateWeight(cart);
  const weightCharge = calculateWeightCharge(totalWeight);
  
  // Calculate time-based surcharges
  const timeSurcharge = calculateTimeSurcharge(baseRate);
  
  // Calculate final cost
  const breakdown = {
    baseRate,
    distanceMultiplier: 1, // Base rates already account for distance
    weightCharge,
    surcharges: timeSurcharge
  };
  
  const cost = Math.round((baseRate + weightCharge + timeSurcharge) * 1.3);
  
  // Calculate confidence based on address matching
  const confidence = calculateFallbackConfidence(zone, address);
  
  return {
    cost: Math.round(cost),
    zone,
    breakdown,
    confidence
  };
}

/**
 * Get base rate for specific method and zone
 */
function getBaseRate(zone: DeliveryZone, method: string): number {
  const baseRates = zone.baseRates;
  
  switch (method.toLowerCase()) {
    case 'gosendinstant':
    case 'gosend':
      return baseRates.gosendInstant;
    case 'gosendsameday':
      return baseRates.gosendSameDay;
    case 'grabexpress':
    case 'grab':
      return baseRates.grab;
    case 'paxel':
      return baseRates.paxel;
    default:
      // Default to GoSend Instant if method not recognized
      return baseRates.gosendInstant;
  }
}

/**
 * Calculate weight surcharge
 */
function calculateWeightCharge(totalWeight: number): number {
  if (totalWeight <= 2) {
    return 0;
  }
  
  // Rp 10,000 per kg over 2kg (more reasonable rates)
  return (totalWeight - 2) * 10000;
}

/**
 * Calculate time-based surcharges (peak hours)
 */
function calculateTimeSurcharge(baseRate: number): number {
  const currentHour = new Date().getHours();
  
  // Peak hours: 6-8 PM (18:00-20:00)
  if (currentHour >= 18 && currentHour <= 20) {
    return baseRate * 0.05; // 5% peak surcharge (more reasonable)
  }
  
  return 0;
}

/**
 * Calculate confidence level for fallback calculation
 */
function calculateFallbackConfidence(zone: DeliveryZone, address: string): number {
  let confidence = 0.7; // Base confidence for fallback method
  
  // Boost confidence based on zone matching quality
  const addressLower = address.toLowerCase();
  let matchCount = 0;
  
  // Count city matches
  for (const city of zone.cities) {
    if (addressLower.includes(city.toLowerCase())) {
      matchCount++;
    }
  }
  
  // Count district matches
  for (const district of zone.districts) {
    if (addressLower.includes(district.toLowerCase())) {
      matchCount++;
    }
  }
  
  // Adjust confidence based on matches
  if (matchCount >= 3) {
    confidence += 0.2; // Strong match
  } else if (matchCount >= 1) {
    confidence += 0.1; // Good match
  } else {
    confidence -= 0.3; // Weak match
  }
  
  // Reduce confidence for remote areas (far distance)
  if (zone.distance === 'far') {
    confidence -= 0.1;
  }
  
  return Math.max(0.3, Math.min(0.9, confidence));
}

/**
 * Enhanced fallback with multiple calculation attempts
 */
export function enhancedFallback(
  method: string,
  address: string,
  cart: CartItem[] = []
): FallbackResult {
  try {
    // Try primary calculation
    return fallbackCost(method, address, cart);
  } catch (error) {
    console.warn('[Fallback] Primary calculation failed, using emergency rates:', error);
    
    // Use emergency fallback with basic zone detection
    return emergencyFallback(method, address, cart);
  }
}

/**
 * Emergency fallback with minimal requirements
 */
function emergencyFallback(
  method: string,
  address: string,
  cart: CartItem[]
): FallbackResult {
  // Use closest zone (Depok area) as emergency
  const emergencyZone = deliveryZones[0]; // "Depok & Immediate Area"
  
  let baseRate = emergencyZone.baseRates.gosendInstant;
  
  // Adjust based on method
  switch (method.toLowerCase()) {
    case 'gosendsameday':
      baseRate = emergencyZone.baseRates.gosendSameDay;
      break;
    case 'grabexpress':
    case 'grab':
      baseRate = emergencyZone.baseRates.grab;
      break;
    case 'paxel':
      baseRate = emergencyZone.baseRates.paxel;
      break;
    default:
      baseRate = emergencyZone.baseRates.gosendInstant;
  }
  
  // Simple weight calculation
  const totalWeight = calculateWeight(cart);
  const weightCharge = totalWeight > 3 ? (totalWeight - 3) * 10000 : 0; // Lower rate for emergency
  
  const cost = Math.round((baseRate + weightCharge) * 1.3);
  
  return {
    cost,
    zone: emergencyZone,
    breakdown: {
      baseRate,
      distanceMultiplier: 1,
      weightCharge,
      surcharges: 0
    },
    confidence: 0.4 // Low confidence for emergency fallback
  };
}

/**
 * Format fallback result for display
 */
export function formatFallbackResult(result: FallbackResult): {
  formatted: string;
  confidence: string;
  breakdown: string;
} {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(result.cost);
  
  const confidence = `${Math.round(result.confidence * 100)}%`;
  
  const breakdownParts = [
    `Base: ${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(result.breakdown.baseRate)}`
  ];
  
  if (result.breakdown.weightCharge > 0) {
    breakdownParts.push(`Weight: +${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(result.breakdown.weightCharge)}`);
  }
  
  if (result.breakdown.surcharges > 0) {
    breakdownParts.push(`Peak: +${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(result.breakdown.surcharges)}`);
  }
  
  return {
    formatted,
    confidence,
    breakdown: breakdownParts.join(' + ')
  };
}