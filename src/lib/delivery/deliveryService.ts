// Main delivery service - entry point for the delivery cost engine
// Provides clean API for getting delivery costs with scraping + fallback

import { CartItem, DeliveryCalculation, DeliveryResult } from './types';
import { DeliveryCalculator } from './calculator';
import { validateAddress } from './zones/deliveryZones';

/**
 * Main service function to get delivery cost
 * This is the primary API that applications will use
 */
export async function getDeliveryCost(
  address: string,
  method: string,
  cart: CartItem[]
): Promise<DeliveryResult> {
  
  // Input validation
  if (!address || typeof address !== 'string' || address.trim().length < 3) {
    throw new Error('Address must be at least 3 characters long');
  }
  
  if (!method || typeof method !== 'string') {
    throw new Error('Delivery method is required');
  }
  
  if (!cart || !Array.isArray(cart)) {
    throw new Error('Cart must be an array');
  }

  // Normalize address
  const normalizedAddress = normalizeAddress(address);
  
  // Check if address is valid
  if (!validateAddress(normalizedAddress)) {
    throw new Error(`Address "${normalizedAddress}" is not in our delivery area`);
  }

  try {
    console.log(`[DeliveryService] Calculating cost for ${normalizedAddress} with ${method}`);
    
    // Use the calculator to get the cost
    const calculation = await DeliveryCalculator.calculate(
      normalizedAddress,
      method,
      cart
    );
    
    // Add metadata to the result
    const result = {
      ...calculation,
      address: normalizedAddress,
      timestamp: new Date(),
      source: calculation.isLive ? 'live' : 'fallback' as 'live' | 'fallback'
    };
    
    console.log(`[DeliveryService] Success: ${result.source} pricing for ${normalizedAddress}`);
    return result;
    
  } catch (error) {
    console.error(`[DeliveryService] Error calculating delivery for ${normalizedAddress}:`, error);
    throw error;
  }
}

/**
 * Get delivery cost with fallback to specific provider only
 */
export async function getDeliveryCostWithProvider(
  address: string,
  method: string,
  cart: CartItem[],
  provider: 'gosend' | 'grab' | 'paxel'
): Promise<DeliveryResult> {
  const normalizedAddress = normalizeAddress(address);
  
  try {
    console.log(`[DeliveryService] Calculating cost with forced provider ${provider} for ${normalizedAddress}`);
    
    const calculation = await DeliveryCalculator.calculate(
      normalizedAddress,
      method,
      cart,
      provider // Force specific provider
    );
    
    return {
      ...calculation,
      address: normalizedAddress,
      timestamp: new Date(),
      source: calculation.isLive ? 'live' : 'fallback' as 'live' | 'fallback'
    };
    
  } catch (error) {
    console.error(`[DeliveryService] Error with provider ${provider}:`, error);
    throw error;
  }
}

/**
 * Get batch delivery costs for multiple methods
 */
export async function getBatchDeliveryCosts(
  address: string,
  methods: string[],
  cart: CartItem[]
): Promise<Record<string, DeliveryResult>> {
  const normalizedAddress = normalizeAddress(address);
  
  if (!validateAddress(normalizedAddress)) {
    throw new Error(`Address "${normalizedAddress}" is not in our delivery area`);
  }

  try {
    console.log(`[DeliveryService] Batch calculating ${methods.length} methods for ${normalizedAddress}`);
    
    const results = await DeliveryCalculator.calculateBatch(
      normalizedAddress,
      methods,
      cart
    );
    
    // Add metadata to all results
    const enrichedResults: Record<string, DeliveryResult> = {};
    for (const [method, calculation] of Object.entries(results)) {
      enrichedResults[method] = {
        ...calculation,
        address: normalizedAddress,
        timestamp: new Date(),
        source: calculation.isLive ? 'live' : 'fallback' as 'live' | 'fallback'
      };
    }
    
    console.log(`[DeliveryService] Batch calculation complete for ${normalizedAddress}`);
    return enrichedResults;
    
  } catch (error) {
    console.error(`[DeliveryService] Batch calculation failed:`, error);
    throw error;
  }
}

/**
 * Get quick estimate without full calculation
 */
export async function getQuickDeliveryEstimate(
  address: string,
  method: string,
  cart: CartItem[]
): Promise<DeliveryResult> {
  const normalizedAddress = normalizeAddress(address);
  
  try {
    const estimate = await DeliveryCalculator.getQuickEstimate(
      normalizedAddress,
      method,
      cart
    );
    
    return {
      ...estimate,
      address: normalizedAddress,
      timestamp: new Date(),
      source: 'estimate' as 'live' | 'fallback' | 'estimate'
    };
    
  } catch (error) {
    console.error(`[DeliveryService] Quick estimate failed:`, error);
    throw error;
  }
}

/**
 * Check if address is deliverable
 */
export function isDeliverableAddress(address: string): boolean {
  const normalizedAddress = normalizeAddress(address);
  return validateAddress(normalizedAddress);
}

/**
 * Get supported delivery methods
 */
export function getSupportedDeliveryMethods(): string[] {
  return [
    'gosendInstant',
    'gosendSameDay', 
    'grabExpress',
    'paxel'
  ];
}

/**
 * Get available providers for a specific address
 */
export async function getAvailableProviders(
  address: string,
  cart: CartItem[]
): Promise<{
  provider: 'gosend' | 'grab' | 'paxel';
  methods: string[];
  isLive: boolean;
  confidence: number;
}[]> {
  const normalizedAddress = normalizeAddress(address);
  
  if (!validateAddress(normalizedAddress)) {
    return [];
  }

  try {
    // Test each provider
    const providers = ['gosend', 'grab', 'paxel'] as const;
    const results = [];
    
    for (const provider of providers) {
      try {
        const calculation = await getDeliveryCostWithProvider(
          normalizedAddress,
          `${provider}Instant`,
          cart,
          provider
        );
        
        results.push({
          provider,
          methods: getMethodsForProvider(provider),
          isLive: calculation.isLive,
          confidence: calculation.isLive ? 0.8 : 0.6 // Estimated confidence
        });
      } catch (error) {
        console.warn(`[DeliveryService] Provider ${provider} not available:`, error);
        // Add provider with fallback confidence
        results.push({
          provider,
          methods: getMethodsForProvider(provider),
          isLive: false,
          confidence: 0.3
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error(`[DeliveryService] Error checking available providers:`, error);
    return [];
  }
}

/**
 * Get all supported delivery methods for a provider
 */
function getMethodsForProvider(provider: 'gosend' | 'grab' | 'paxel'): string[] {
  switch (provider) {
    case 'gosend':
      return ['gosendInstant', 'gosendSameDay'];
    case 'grab':
      return ['grabExpress'];
    case 'paxel':
      return ['paxel'];
    default:
      return [];
  }
}

/**
 * Normalize address for consistent processing
 */
function normalizeAddress(address: string): string {
  return address
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/,+/g, ',') // Replace multiple commas with single comma
    .toLowerCase();
}

/**
 * Format delivery cost for display
 */
export function formatDeliveryCost(calculation: DeliveryCalculation): {
  cost: string;
  provider: string;
  method: string;
  estimatedTime: string;
  isLive: boolean;
  source: string;
  breakdown: string;
} {
  const cost = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(calculation.cost);
  
  const providerName = getProviderDisplayName(calculation.provider);
  const methodName = getMethodDisplayName(calculation.provider);
  
  const breakdownParts = [
    `Base: ${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(calculation.breakdown.baseRate)}`
  ];
  
  if (calculation.breakdown.weightCharge > 0) {
    breakdownParts.push(`Weight: +${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(calculation.breakdown.weightCharge)}`);
  }
  
  if (calculation.breakdown.surcharges > 0) {
    breakdownParts.push(`Surcharges: +${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(calculation.breakdown.surcharges)}`);
  }

  return {
    cost,
    provider: providerName,
    method: methodName,
    estimatedTime: '1-3 jam', // Default estimate
    isLive: calculation.isLive,
    source: calculation.isLive ? 'Real-time' : 'Estimated',
    breakdown: breakdownParts.join(' + ')
  };
}

/**
 * Get human-readable provider name
 */
function getProviderDisplayName(provider: 'gosend' | 'grab' | 'paxel'): string {
  switch (provider) {
    case 'gosend':
      return 'GoSend';
    case 'grab':
      return 'GrabExpress';
    case 'paxel':
      return 'Paxel';
    default:
      return 'Unknown';
  }
}

/**
 * Get human-readable method name
 */
function getMethodDisplayName(provider: 'gosend' | 'grab' | 'paxel'): string {
  switch (provider) {
    case 'gosend':
      return 'GoSend Instant';
    case 'grab':
      return 'GrabExpress Instant';
    case 'paxel':
      return 'Paxel';
    default:
      return 'Unknown';
  }
}