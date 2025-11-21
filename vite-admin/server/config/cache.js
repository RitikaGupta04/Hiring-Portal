// config/cache.js
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis (serverless, free tier: 10k requests/day)
// Sign up at: https://console.upstash.com/
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback in-memory cache if Redis not configured
const memoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 100;
const MEMORY_CACHE_TTL = 60 * 1000; // 1 minute

class CacheService {
  constructor() {
    this.useRedis = !!redis;
    if (!this.useRedis) {
      console.warn('⚠️  Redis not configured. Using in-memory cache (not suitable for production with multiple instances)');
    }
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      if (this.useRedis) {
        const value = await redis.get(key);
        return value;
      } else {
        // Memory cache
        const cached = memoryCache.get(key);
        if (cached && Date.now() < cached.expiry) {
          return cached.value;
        }
        memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = 300) {
    try {
      if (this.useRedis) {
        await redis.setex(key, ttl, JSON.stringify(value));
      } else {
        // Memory cache with size limit
        if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
          const firstKey = memoryCache.keys().next().value;
          memoryCache.delete(firstKey);
        }
        memoryCache.set(key, {
          value,
          expiry: Date.now() + (ttl * 1000)
        });
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached value
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      if (this.useRedis) {
        await redis.del(key);
      } else {
        memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete all keys matching pattern
   * @param {string} pattern - Pattern to match (e.g., 'applications:*')
   */
  async delPattern(pattern) {
    try {
      if (this.useRedis) {
        const keys = await redis.keys(pattern);
        if (keys && keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // Memory cache: delete keys that start with pattern prefix
        const prefix = pattern.replace('*', '');
        for (const key of memoryCache.keys()) {
          if (key.startsWith(prefix)) {
            memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Middleware to cache GET requests
   * @param {number} ttl - Cache TTL in seconds
   * @returns {Function} Express middleware
   */
  middleware(ttl = 300) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = `req:${req.originalUrl || req.url}`;
      
      try {
        const cached = await this.get(cacheKey);
        if (cached) {
          const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
          res.set('X-Cache', 'HIT');
          return res.json(parsed);
        }
      } catch (error) {
        console.error('Cache middleware error:', error);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache response
      res.json = (data) => {
        // Cache the response
        this.set(cacheKey, data, ttl).catch(err => 
          console.error('Failed to cache response:', err)
        );
        res.set('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    };
  }
}

export default new CacheService();
