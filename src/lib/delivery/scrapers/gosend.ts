// GoSend Instant scraper
// Uses: https://cek-ongkir.vercel.app/api/gosend?origin=depok%20sukmajaya&destination={address}

import { ScraperResult, ScrapingError } from '../types';
import { memoryCache, CACHE_KEYS } from '../cache/memoryCache';
import { calculateWeight } from '../types';

interface GoSendResponse {
  price?: number;
  eta?: string;
  data?: any;
  success?: boolean;
  error?: string;
}

export class GoSendScraper {
  private readonly baseUrl = 'https://cek-ongkir.vercel.app/api/gosend';
  private readonly origin = 'depok sukmajaya';
  private readonly maxRetries = 2;

  /**
   * Scrape GoSend Instant pricing
   */
  async scrapePrice(address: string, cart: any[] = []): Promise<ScraperResult> {
    const cacheKey = CACHE_KEYS.GOSEND(address);
    
    // Check cache first
    const cached = memoryCache.getCache(cacheKey);
    if (cached) {
      console.log(`[GoSend] Cache hit for ${address}`);
      return { ...cached, isLive: false };
    }

    try {
      // Build URL with parameters
      const destination = encodeURIComponent(address);
      const url = `${this.baseUrl}?origin=${encodeURIComponent(this.origin)}&destination=${destination}`;
      
      // Try up to maxRetries times
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`[GoSend] Attempt ${attempt}/${this.maxRetries} for ${address}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
              'Referer': 'https://cek-ongkir.vercel.app/'
            },
            // Add timeout
            signal: AbortSignal.timeout(10000) // 10 seconds timeout
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data: GoSendResponse = await response.json();
          
          // Parse the response
          const result = this.parseResponse(data, address);
          
          if (result) {
            // Cache the successful result
            memoryCache.setCache(cacheKey, result);
            console.log(`[GoSend] Successfully scraped ${address}: ${result.price}`);
            return result;
          }
          
          throw new Error('No valid price data received');

        } catch (error) {
          console.warn(`[GoSend] Attempt ${attempt} failed:`, error);
          
          if (attempt === this.maxRetries) {
            throw error;
          }
          
          // Wait before retry (exponential backoff)
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }

      throw new Error('All retry attempts failed');

    } catch (error) {
      console.error(`[GoSend] Scraping failed for ${address}:`, error);
      throw this.createError('gosend', address, error);
    }
  }

  /**
   * Parse GoSend API response
   */
  private parseResponse(data: GoSendResponse, address: string): ScraperResult | null {
    try {
      // Try different response formats
      let price: number | null = null;
      let eta: string = '1-2 jam';

      // Format 1: Direct price and eta
      if (data.price && typeof data.price === 'number') {
        price = data.price;
      }
      
      if (data.eta) {
        eta = data.eta;
      }

      // Format 2: Data object
      if (!price && data.data) {
        if (typeof data.data === 'number') {
          price = data.data;
        } else if (data.data.price) {
          price = parseFloat(data.data.price);
        } else if (data.data.cost) {
          price = parseFloat(data.data.cost);
        }
      }

      // Format 3: Look for price in nested objects
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
          }
        }
      }

      if (!price || isNaN(price) || price <= 0) {
        console.warn(`[GoSend] No valid price found in response for ${address}:`, data);
        return null;
      }

      // Ensure minimum price for short distance
      const minPrice = 15000;
      const finalPrice = Math.max(price, minPrice);

      return {
        price: Math.round(finalPrice),
        eta,
        provider: 'gosend',
        raw: data,
        isLive: true
      };

    } catch (error) {
      console.error('[GoSend] Error parsing response:', error, data);
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
export const goSendScraper = new GoSendScraper();