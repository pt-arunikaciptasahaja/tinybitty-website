// Main delivery calculator using custom zone-based formula
// Implements the core workflow: validate address → use custom zone-based calculation

import { DeliveryCalculation } from '../types';
import { fallbackCost, FallbackResult } from './fallback';
import { validateAddress } from '../zones/deliveryZones';

export class DeliveryCalculator {
  /**
   * Main calculation workflow
   * 1. Validate address
   * 2. Use custom zone-based formula
   */
  static async calculate(
    address: string,
    method: string,
    cart: any[] = [],
    forceProvider?: 'gosend' | 'grab' | 'paxel'
  ): Promise<DeliveryCalculation> {
    
    // Step 1: Validate address
    if (!validateAddress(address)) {
      throw new Error('Invalid address: unable to identify delivery zone');
    }

    // Step 2: Use our custom zone-based formula directly
    console.log(`[Calculator] Using custom formula for ${address} with ${method}`);
    return this.calculateFallback(address, method, cart);
  }

  /**
   * Calculate using custom zone-based formula
   */
  private static calculateFallback(
    address: string,
    method: string,
    cart: any[]
  ): DeliveryCalculation {
    
    const fallbackResult = fallbackCost(method, address, cart);
    
    return {
      cost: fallbackResult.cost,
      provider: this.getProviderFromMethod(method),
      zone: fallbackResult.zone,
      isLive: false, // Using our custom formula, not live data
      estimated: true,
      breakdown: fallbackResult.breakdown
    };
  }

  /**
   * Extract provider from delivery method
   */
  private static getProviderFromMethod(method: string): 'gosend' | 'grab' | 'paxel' {
    const methodLower = method.toLowerCase();
    
    if (methodLower.includes('gosend') || methodLower.includes('gojek')) {
      return 'gosend';
    } else if (methodLower.includes('grab')) {
      return 'grab';
    } else if (methodLower.includes('paxel')) {
      return 'paxel';
    }
    
    // Default fallback
    return 'gosend';
  }

  /**
   * Batch calculate for multiple methods
   */
  static async calculateBatch(
    address: string,
    methods: string[],
    cart: any[] = []
  ): Promise<Record<string, DeliveryCalculation>> {
    
    const results: Record<string, DeliveryCalculation> = {};
    
    // Process methods in parallel but limit concurrency
    const concurrency = 2;
    const batches = this.chunkArray(methods, concurrency);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (method) => {
        try {
          const result = await this.calculate(address, method, cart);
          return { method, result };
        } catch (error) {
          console.error(`[Calculator] Batch calculation failed for ${method}:`, error);
          return {
            method,
            result: await this.createErrorResult(address, method, error)
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ method, result }) => {
        results[method] = result;
      });
    }
    
    return results;
  }

  /**
   * Get delivery estimate for a specific method without full calculation
   */
  static async getQuickEstimate(
    address: string,
    method: string,
    cart: any[] = []
  ): Promise<DeliveryCalculation> {
    
    try {
      return await this.calculate(address, method, cart);
    } catch (error) {
      // If calculation fails, create a basic estimate
      return this.createErrorResult(address, method, error);
    }
  }

  /**
   * Create error result for failed calculations
   */
  private static async createErrorResult(
    address: string,
    method: string,
    error: any
  ): Promise<DeliveryCalculation> {
    
    try {
      // Use fallback as error result
      const fallbackResult = fallbackCost(method, address, []);
      
      return {
        cost: Math.round(fallbackResult.cost * 1.1), // Add 10% error margin
        provider: this.getProviderFromMethod(method),
        zone: fallbackResult.zone,
        isLive: false,
        estimated: true,
        breakdown: {
          ...fallbackResult.breakdown,
          surcharges: fallbackResult.breakdown.surcharges + (fallbackResult.breakdown.baseRate * 0.1)
        }
      };
    } catch {
      // Ultimate fallback
      return {
        cost: 65000, // Default 50k + 30%
        provider: this.getProviderFromMethod(method),
        zone: {
          name: 'Unknown',
          cities: [],
          districts: [],
          baseRates: { gosendInstant: 65000, gosendSameDay: 45500, grab: 71500, paxel: 58500 },
          distance: 'medium'
        },
        isLive: false,
        estimated: true,
        breakdown: {
          baseRate: 65000,
          distanceMultiplier: 1,
          weightCharge: 0,
          surcharges: 0
        }
      };
    }
  }

  /**
   * Utility: Split array into chunks
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}