// Cache utility for API calls - Optimized for Vercel deployment
import { isServer, serverApiUrl, serverFetchOptions } from './catalog.js';
import { apiFetch } from './apiFetch.js';

class APICache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Generate cache key
  generateKey(url) {
    return `api_${url}`;
  }

  // Get cached data
  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set cache data
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clear() {
    this.cache.clear();
  }

  // Clear expired cache entries
  clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // Fetch with cache - Optimized for Vercel serverless
  async fetchWithCache(url, options = {}) {
    // On the server, Next's data cache (1 day, tag-revalidated) is the cache.
    // This in-memory copy must be skipped there: a warm instance would otherwise
    // bake up-to-5-minute-old data into a page that was just revalidated.
    const onServer = isServer();
    const key = this.generateKey(url);
    const cached = onServer ? null : this.get(key);

    if (cached) {
      return cached;
    }

    try {
      // Add timeout for serverless environment
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await apiFetch(onServer ? serverApiUrl(url) : url, {
        ...(onServer ? serverFetchOptions() : {}),
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'SerlesBake-Frontend/1.0',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!onServer) this.set(key, data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      
      // Return fallback data for critical endpoints
      if (url.includes('/products')) {
        return { results: [], count: 0 };
      }
      if (url.includes('/categories')) {
        return { results: [], count: 0 };
      }
      if (url.includes('/tags')) {
        return { results: [], count: 0 };
      }
      
      throw error;
    }
  }

  // Fetch with retry logic for Vercel
  async fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetchWithCache(url, options);
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}

// Create singleton instance
const apiCache = new APICache();

// Clear expired cache entries periodically (only in development)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    apiCache.clearExpired();
  }, 60000); // Every minute
}

export default apiCache; 