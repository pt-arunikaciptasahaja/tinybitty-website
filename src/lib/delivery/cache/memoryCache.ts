// Simple in-memory cache with TTL support
// Cache duration = 24 hours by default

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get value from cache
   */
  getCache(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (this.isExpired(key)) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache with TTL
   */
  setCache(key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    this.cache.set(key, {
      value,
      timestamp,
      ttl
    });
  }

  /**
   * Check if cache key is expired
   */
  isExpired(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return true; // Treat non-existent as expired
    }

    const now = Date.now();
    const elapsed = now - entry.timestamp;
    
    return elapsed > entry.ttl;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries only
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { total: number; expired: number; keys: string[] } {
    const now = Date.now();
    let expired = 0;
    const keys: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      keys.push(key);
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      expired,
      keys
    };
  }

  /**
   * Remove specific key from cache
   */
  remove(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Export singleton instance
export const memoryCache = new MemoryCache();

// Cache key generators for consistent formatting
export const generateCacheKey = (provider: string, address: string, method?: string): string => {
  const cleanAddress = address.toLowerCase().trim();
  const cleanMethod = method ? `_${method}` : '';
  return `${provider}:${cleanAddress}${cleanMethod}`;
};

// Predefined cache keys for different providers
export const CACHE_KEYS = {
  GOSEND: (address: string) => `gosend:${address.toLowerCase().trim()}`,
  GRAB: (address: string) => `grab:${address.toLowerCase().trim()}`,
  PAXEL: (address: string) => `paxel:${address.toLowerCase().trim()}`,
  CALCULATION: (address: string, method: string) => `calc:${method}:${address.toLowerCase().trim()}`
};