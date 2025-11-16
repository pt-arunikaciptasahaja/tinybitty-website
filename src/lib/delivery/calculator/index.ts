// Main delivery calculator that coordinates scrapers and fallback
// Implements the core workflow: validate address → try scrapers → fallback if needed

import { ScraperResult, DeliveryCalculation } from '../types';
import { goSendScraper } from '../scrapers/gosend';
import { grabExpressScraper } from '../scrapers/grab';
import { paxelScraper } from '../scrapers/paxel';
import { DeliveryParser } from './parser';
import { fallbackCost, FallbackResult } from './fallback';
import { validateAddress } from '../zones/deliveryZones';

export class DeliveryCalculator {
  /**
   * Main calculation workflow
   * 1. Validate address
   * 2. Try scrapers in priority order
   * 3. Use fallback if scrapers fail
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

    // Step 2: Try to get live pricing from scrapers
    const liveResult = await this.tryScrapers(address, method, cart, forceProvider);
    
    if (liveResult) {
      return liveResult;
    }

    // Step 3: Fallback to zone-based calculation
    console.log(`[Calculator] Using fallback for ${address} with ${method}`);
    return this.calculateFallback(address, method, cart);
  }

  /**
   * Try scrapers in priority order
   */
  private static async tryScrapers(
    address: string,
    method: string,
    cart: any[],
    forceProvider?: 'gosend' | 'grab' | 'paxel'
  ): Promise<DeliveryCalculation | null> {
    
    const providers = this.getProviderPriority(method, forceProvider);
    
    for (const provider of providers) {
      try {
        console.log(`[Calculator] Trying ${provider} for ${address}`);
        
        const scraperResult = await this.getScraperResult(provider, address, cart);
        
        if (scraperResult) {
          // Parse and validate result
          const parsed = DeliveryParser.parseScraperResult(scraperResult, address, cart);
          const validation = DeliveryParser.validateResult(parsed, address);
          
          if (validation.isValid && parsed.confidence >= 0.5) {
            console.log(`[Calculator] ${provider} succeeded with ${Math.round(parsed.confidence * 100)}% confidence`);
            
            return {
              cost: parsed.price,
              provider: scraperResult.provider,
              zone: {} as any, // Will be populated by fallback if needed
              isLive: true,
              estimated: false,
              breakdown: {
                baseRate: parsed.adjustments.basePrice,
                distanceMultiplier: 1,
                weightCharge: parsed.adjustments.weightCharge || 0,
                surcharges: parsed.adjustments.surcharge || 0
              }
            };
          } else {
            console.warn(`[Calculator] ${provider} result invalid or low confidence:`, validation.issues);
          }
        }
        
      } catch (error) {
        console.warn(`[Calculator] ${provider} failed:`, error);
        continue; // Try next provider
      }
    }
    
    return null; // All scrapers failed
  }

  /**
   * Get scraper result for specific provider
   */
  private static async getScraperResult(
    provider: 'gosend' | 'grab' | 'paxel',
    address: string,
    cart: any[]
  ): Promise<ScraperResult | null> {
    
    try {
      switch (provider) {
        case 'gosend':
          return await goSendScraper.scrapePrice(address, cart);
        case 'grab':
          return await grabExpressScraper.scrapePrice(address, cart);
        case 'paxel':
          return await paxelScraper.scrapePrice(address, cart);
        default:
          return null;
      }
    } catch (error) {
      console.error(`[Calculator] ${provider} scraper error:`, error);
      return null;
    }
  }

  /**
   * Calculate using fallback zones
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
      isLive: false,
      estimated: true,
      breakdown: fallbackResult.breakdown
    };
  }

  /**
   * Get provider priority based on method and user preference
   */
  private static getProviderPriority(
    method: string,
    forceProvider?: 'gosend' | 'grab' | 'paxel'
  ): ('gosend' | 'grab' | 'paxel')[] {
    
    // If user has forced a provider, only try that one
    if (forceProvider) {
      return [forceProvider];
    }
    
    // Default priority based on method
    switch (method.toLowerCase()) {
      case 'gosendinstant':
      case 'gosend':
        return ['gosend', 'grab', 'paxel'];
      case 'grabexpress':
      case 'grab':
        return ['grab', 'gosend', 'paxel'];
      case 'paxel':
        return ['paxel', 'gosend', 'grab'];
      default:
        return ['gosend', 'grab', 'paxel'];
    }
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
      // Try cached result first or quick scrape
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
        cost: 50000, // Default 50k
        provider: this.getProviderFromMethod(method),
        zone: {
          name: 'Unknown',
          cities: [],
          districts: [],
          baseRates: { gosendInstant: 50000, grab: 55000, paxel: 45000 },
          distance: 'medium'
        },
        isLive: false,
        estimated: true,
        breakdown: {
          baseRate: 50000,
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