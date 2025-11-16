// Paxel scraper
// Uses: POST request to https://www.paxel.co/price-estimation
// Payload: origin: 'Depok, Sukmajaya, 16411', destination: address, weight: auto-detected

import { ScraperResult, ScrapingError, CartItem } from '../types';
import { memoryCache, CACHE_KEYS } from '../cache/memoryCache';
import { calculateWeight } from '../types';

interface PaxelResponse {
  price?: number;
  eta?: string;
  data?: any;
  success?: boolean;
  error?: string;
  result?: {
    price?: number;
    eta?: string;
    amount?: number;
  };
}

export class PaxelScraper {
  private readonly baseUrl = 'https://www.paxel.co/price-estimation';
  private readonly origin = 'Depok, Sukmajaya, 16411';
  private readonly maxRetries = 2;

  /**
   * Scrape Paxel pricing
   */
  async scrapePrice(address: string, cart: CartItem[] = []): Promise<ScraperResult> {
    const cacheKey = CACHE_KEYS.PAXEL(address);
    
    // Check cache first
    const cached = memoryCache.getCache(cacheKey);
    if (cached) {
      console.log(`[Paxel] Cache hit for ${address}`);
      return { ...cached, isLive: false };
    }

    try {
      // Auto-detect weight from cart
      const weight = this.calculateWeightFromCart(cart);
      
      // Try up to maxRetries times
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`[Paxel] Attempt ${attempt}/${this.maxRetries} for ${address} (weight: ${weight}kg)`);
          
          const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/json, text/html, */*',
              'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
              'Referer': 'https://www.paxel.co/',
              'Origin': 'https://www.paxel.co'
            },
            // Add timeout
            signal: AbortSignal.timeout(15000), // 15 seconds timeout for POST
            body: new URLSearchParams({
              origin: this.origin,
              destination: address,
              weight: weight.toString()
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data: PaxelResponse = await response.json();
          
          // Parse the response
          const result = this.parseResponse(data, address);
          
          if (result) {
            // Cache the successful result
            memoryCache.setCache(cacheKey, result);
            console.log(`[Paxel] Successfully scraped ${address}: ${result.price}`);
            return result;
          }
          
          throw new Error('No valid price data received');

        } catch (error) {
          console.warn(`[Paxel] Attempt ${attempt} failed:`, error);
          
          if (attempt === this.maxRetries) {
            throw error;
          }
          
          // Wait before retry (exponential backoff)
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }

      throw new Error('All retry attempts failed');

    } catch (error) {
      console.error(`[Paxel] Scraping failed for ${address}:`, error);
      throw this.createError('paxel', address, error);
    }
  }

  /**
   * Calculate weight from cart items
   */
  private calculateWeightFromCart(cart: CartItem[]): number {
    return calculateWeight(cart);
  }

  /**
   * Parse Paxel API response
   */
  private parseResponse(data: PaxelResponse, address: string): ScraperResult | null {
    try {
      // Try different response formats
      let price: number | null = null;
      let eta: string = '2-6 jam'; // Updated to match new method-based ETA

      // Format 1: Direct price and eta
      if (data.price && typeof data.price === 'number') {
        price = data.price;
      }
      
      if (data.eta) {
        eta = data.eta;
      }

      // Format 2: Result object
      if (!price && data.result) {
        if (typeof data.result.price === 'number') {
          price = data.result.price;
        } else if (data.result.amount !== undefined) {
          price = typeof data.result.amount === 'number' ? data.result.amount : parseFloat(String(data.result.amount));
        }
        if (data.result.eta) {
          eta = data.result.eta;
        }
      }

      // Format 3: Data object
      if (!price && data.data) {
        if (typeof data.data === 'number') {
          price = data.data;
        } else if (data.data.price) {
          price = parseFloat(data.data.price);
        } else if (data.data.cost) {
          price = parseFloat(data.data.cost);
        } else if (data.data.amount) {
          price = parseFloat(data.data.amount);
        }
      }

      // Format 4: Look for price in nested objects
      if (!price && data && typeof data === 'object') {
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'object' && value !== null) {
            if (value.price) {
              price = parseFloat(String(value.price));
              break;
            }
            if (value.cost) {
              price = parseFloat(String(value.cost));
              break;
            }
            if (value.amount) {
              price = parseFloat(String(value.amount));
              break;
            }
          }
        }
      }

      if (!price || isNaN(price) || price <= 0) {
        console.warn(`[Paxel] No valid price found in response for ${address}:`, data);
        return null;
      }

      // Ensure minimum price for short distance
      const minPrice = 12000;
      let finalPrice = Math.max(price, minPrice);

      // Check for weight surcharge (weight > 3kg)
      const weight = this.calculateWeightFromCart([]); // Use empty cart for default
      if (weight > 3) {
        const weightSurcharge = (weight - 3) * 5000; // Rp 5,000 per kg over 3kg
        finalPrice += weightSurcharge;
        console.log(`[Paxel] Applied weight surcharge: +${weightSurcharge} for ${weight}kg`);
      }

      return {
        price: Math.round(finalPrice),
        eta,
        provider: 'paxel',
        raw: data,
        isLive: true
      };

    } catch (error) {
      console.error('[Paxel] Error parsing response:', error, data);
      return null;
    }
  }

  /**
   * Create standardized scraping error
   */
  private createError(provider: string, address: string, error: any): ScrapingError {
    const scrapingError = new Error(`Failed to scrape ${provider} for ${address}: ${error?.message || error}`) as ScrapingError;
    scrapingError.provider = provider;
    scrapingError.address = address;
    scrapingError.timestamp = new Date();
    scrapingError.originalError = error instanceof Error ? error : undefined;
    return scrapingError;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const paxelScraper = new PaxelScraper();