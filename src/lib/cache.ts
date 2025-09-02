import { Redis } from "@upstash/redis";

const TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 3600;

interface CacheItem<T> {
  key: string;
  value: T;
  expiresAt: number;
}

// In-memory fallback cache for development
const memoryCache = new Map<string, CacheItem<unknown>>();

// Initialize Redis client
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

class TeamMemberCache {
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly CACHE_TTL = TTL; // 1 hour in seconds for Redis

  private getCacheKey(userEmail: string): string {
    return `team-member:${userEmail}`;
  }

  async get<T>(userEmail: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(userEmail);

    // Try Redis first if available
    if (redis) {
      try {
        const data = await redis.get(cacheKey);

        if (data) {
          const cacheItem = data as CacheItem<T>;

          // Check if cache has expired (extra safety check)
          if (Date.now() > cacheItem.expiresAt) {
            console.log(`[Cache] Redis expired for user: ${userEmail}`);
            await this.delete(userEmail);
            return null;
          }

          console.log(`[Cache] Redis hit for user: ${userEmail}`);
          return cacheItem.value;
        }
      } catch (error) {
        console.error(`[Cache] Redis error for user ${userEmail}:`, error);
        // Fall through to memory cache
      }
    }

    // Fall back to in-memory cache
    const memoryCacheItem = memoryCache.get(cacheKey);
    if (memoryCacheItem) {
      // Check if memory cache has expired
      if (Date.now() > memoryCacheItem.expiresAt) {
        console.log(`[Cache] Memory expired for user: ${userEmail}`);
        memoryCache.delete(cacheKey);
        return null;
      }

      console.log(`[Cache] Memory hit for user: ${userEmail}`);
      return memoryCacheItem.value as T;
    }

    console.log(`[Cache] Miss for user: ${userEmail}`);
    return null;
  }

  async set<T>(userEmail: string, value: T): Promise<void> {
    const cacheKey = this.getCacheKey(userEmail);
    const expiresAt = Date.now() + this.CACHE_DURATION;

    const cacheItem: CacheItem<T> = {
      key: cacheKey,
      value,
      expiresAt,
    };

    // Try storing in Redis first if available
    if (redis) {
      try {
        await redis.setex(cacheKey, this.CACHE_TTL, cacheItem);
        console.log(
          `[Cache] Redis set for user: ${userEmail}, expires at: ${new Date(expiresAt).toISOString()}`
        );
        return;
      } catch (error) {
        console.error(
          `[Cache] Redis error setting cache for user ${userEmail}:`,
          error
        );
        // Fall through to memory cache
      }
    }

    // Fall back to in-memory cache
    memoryCache.set(cacheKey, cacheItem);
    console.log(
      `[Cache] Memory set for user: ${userEmail}, expires at: ${new Date(expiresAt).toISOString()}`
    );
  }

  async delete(userEmail: string): Promise<void> {
    const cacheKey = this.getCacheKey(userEmail);

    // Try deleting from Redis if available
    if (redis) {
      try {
        await redis.del(cacheKey);
        console.log(`[Cache] Redis deleted for user: ${userEmail}`);
      } catch (error) {
        console.error(
          `[Cache] Redis error deleting cache for user ${userEmail}:`,
          error
        );
      }
    }

    // Always clear from memory cache as well
    memoryCache.delete(cacheKey);
    console.log(`[Cache] Memory deleted for user: ${userEmail}`);
  }

  async clearExpired(): Promise<void> {
    const now = Date.now();
    let redisDeletedCount = 0;
    let memoryDeletedCount = 0;

    // Try to clear expired entries from Redis
    if (redis) {
      try {
        const keys = await redis.keys("team-member:*");

        for (const key of keys) {
          try {
            const data = await redis.get(key);

            if (data) {
              const cacheItem = data as CacheItem<unknown>;

              if (now > cacheItem.expiresAt) {
                await redis.del(key);
                redisDeletedCount++;
              }
            }
          } catch (error) {
            console.error(
              `[Cache] Error checking/deleting expired Redis key ${key}:`,
              error
            );
          }
        }

        console.log(
          `[Cache] Redis cleanup completed. Deleted ${redisDeletedCount} expired entries.`
        );
      } catch (error) {
        console.error("[Cache] Error during Redis cleanup:", error);
      }
    }

    // Always clean up memory cache
    for (const [key, item] of memoryCache.entries()) {
      if (now > item.expiresAt) {
        memoryCache.delete(key);
        memoryDeletedCount++;
      }
    }

    console.log(
      `[Cache] Memory cleanup completed. Deleted ${memoryDeletedCount} expired entries.`
    );
    console.log(
      `[Cache] Total cleanup: Redis(${redisDeletedCount}) + Memory(${memoryDeletedCount}) expired entries deleted.`
    );
  }

  // Utility method to check if Redis is available
  isRedisAvailable(): boolean {
    return redis !== null;
  }

  // Get cache status for debugging
  getStatus() {
    return {
      redis: this.isRedisAvailable(),
      memoryKeys: Array.from(memoryCache.keys()),
      memorySize: memoryCache.size,
    };
  }
}

export const teamMemberCache = new TeamMemberCache();
