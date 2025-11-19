// Shipping Service using the new distance-based calculation engine
import { calculateShipping } from './shipping/calculate';
import { ShippingRates, ShippingResult } from './shipping/types';

// Adapt the new shipping engine to work with existing interface
export interface LegacyDeliveryCalculation {
  cost: number;
  zone: { name: string };
  method: string;
  estimatedTime: string;
  breakdown: {
    baseRate: number;
    distanceMultiplier: number;
    surcharges?: number;
  };
  isValidAddress: boolean;
}

export interface LegacyCartItem {
  productName: string;
  quantity: number;
  variant: {
    size: string;
    price: number;
  };
}

/**
 * Calculate shipping cost using the new distance-based engine
 * This provides more accurate pricing based on actual distance
 */
export async function calculateShippingCost(
  destination: string,
  method: string,
  cart: LegacyCartItem[] = []
): Promise<LegacyDeliveryCalculation> {
  try {
    console.log(`[ShippingService] Calculating costs for: ${destination}`);
    
    // Get rates from the new shipping engine
    const shippingRates: ShippingRates = await calculateShipping(destination);
    
    // Map the delivery method to the appropriate rate
    let selectedRate: ShippingResult;
    let estimatedTime;
    
    switch (method) {
      case 'gosend':
      case 'gosendInstant':
        selectedRate = shippingRates.gosend_instant;
        estimatedTime = '1-3 jam';
        break;
      case 'grab':
        selectedRate = shippingRates.grabexpress_instant;
        estimatedTime = '1-3 jam';
        break;
      case 'paxel':
        // Paxel doesn't have real-time calculation in the new engine
        // Use GoSend Same Day as fallback with distance-based pricing
        selectedRate = shippingRates.gosend_same_day;
        estimatedTime = '1-3 jam';
        break;
      case 'gosendSameDay':
        selectedRate = shippingRates.gosend_same_day;
        estimatedTime = '3-6 jam'; // Same Day takes longer but costs less
        break;
      default:
        selectedRate = shippingRates.gosend_instant;
        estimatedTime = '1-3 jam';
    }
    
    // If service is unavailable
    if (!selectedRate.available) {
      return {
        cost: 0,
        zone: { name: 'Out of service area' },
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
    
    return {
      cost: finalCost,
      zone: {
        name: `${shippingRates.distance_km.toFixed(1)} km`
      },
      method,
      estimatedTime,
      breakdown: {
        baseRate: selectedRate.price,
        distanceMultiplier: 1,
      },
      isValidAddress: true
    };
    
  } catch (error) {
    console.error('[ShippingService] Error calculating shipping:', error);
    
    // Return fallback with basic estimation if geocoding fails
    return {
      cost: 25000, // Basic delivery cost estimate
      zone: {
        name: '~15.0 km' // Estimated distance fallback
      },
      method,
      estimatedTime: '1-3 jam',
      breakdown: {
        baseRate: 25000,
        distanceMultiplier: 1,
      },
      isValidAddress: true // Allow order to proceed
    };
  }
}

/**
 * Get all available shipping options for a destination
 */
export async function getAllShippingOptions(destination: string): Promise<ShippingRates> {
  return calculateShipping(destination);
}

/**
 * Quick estimate for real-time updates
 */
export async function getQuickShippingEstimate(destination: string): Promise<{
  isAvailable: boolean;
  nearestOption: string;
  estimatedCost: number;
  distance: number;
}> {
  try {
    const rates = await calculateShipping(destination);
    
    // Find the cheapest available option
    const availableOptions = [
      { name: 'GoSend Instant', rate: rates.gosend_instant },
      { name: 'GoSend Same Day', rate: rates.gosend_same_day },
      { name: 'GrabExpress', rate: rates.grabexpress_instant }
    ].filter(option => option.rate.available);
    
    if (availableOptions.length === 0) {
      return {
        isAvailable: false,
        nearestOption: 'None available',
        estimatedCost: 0,
        distance: rates.distance_km
      };
    }
    
    // Type-safe way to find cheapest option
    let cheapest = availableOptions[0];
    for (let i = 1; i < availableOptions.length; i++) {
      const current = availableOptions[i];
      const currentPrice = (current.rate as any).price;
      const cheapestPrice = (cheapest.rate as any).price;
      
      if (currentPrice < cheapestPrice) {
        cheapest = current;
      }
    }
    
    return {
      isAvailable: true,
      nearestOption: cheapest.name,
      estimatedCost: (cheapest.rate as any).price,
      distance: rates.distance_km
    };
    
  } catch (error) {
    console.error('[ShippingService] Quick estimate failed:', error);
    return {
      isAvailable: false,
      nearestOption: 'Error',
      estimatedCost: 0,
      distance: 0
    };
  }
}

/**
 * Get cookie weight by size (realistic estimates)
 */
function getCookieWeight(size: string): number {
  if (size.toLowerCase().includes('small') || size === 'S') return 0.15; // 150g
  if (size.toLowerCase().includes('medium') || size === 'M') return 0.25; // 250g
  if (size.toLowerCase().includes('large') || size === 'L') return 0.35; // 350g
  if (size.toLowerCase().includes('family') || size === 'F') return 0.5; // 500g
  return 0.2; // Default 200g
}

/**
 * Get product weight by size
 */
function getProductWeight(size: string): number {
  if (size.toLowerCase().includes('small') || size === 'S') return 0.2;
  if (size.toLowerCase().includes('medium') || size === 'M') return 0.35;
  if (size.toLowerCase().includes('large') || size === 'L') return 0.5;
  return 0.25; // Default
}