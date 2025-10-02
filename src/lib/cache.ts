import { Redis } from "@upstash/redis";

const TeamMember_TTL = 3600; // 1 hour in seconds
const TeamMembers_TTL = 7 * 24 * 60 * 60; // 1 week in seconds
const ExchangeRates_TTL = 24 * 60 * 60; // 24 hours in seconds

// Initialize Redis client
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

if (!redis) {
  console.warn(
    "[Cache] Redis not configured. Cache operations will fail gracefully."
  );
}

class TeamMemberCache {
  private readonly CACHE_TTL = TeamMember_TTL;

  private getCacheKey(userEmail: string): string {
    return `team-member:${userEmail}`;
  }

  async get<T>(userEmail: string): Promise<T | null> {
    if (!redis) {
      console.warn(`[Cache] Redis unavailable for get operation: ${userEmail}`);
      return null;
    }

    const cacheKey = this.getCacheKey(userEmail);

    try {
      const data = await redis.get(cacheKey);

      if (data) {
        console.log(`[Cache] Redis hit for user: ${userEmail}`);
        return data as T;
      }

      console.log(`[Cache] Miss for user: ${userEmail}`);
      return null;
    } catch (error) {
      console.error(`[Cache] Redis error for user ${userEmail}:`, error);
      return null;
    }
  }

  async set<T>(userEmail: string, value: T): Promise<void> {
    if (!redis) {
      console.warn(`[Cache] Redis unavailable for set operation: ${userEmail}`);
      return;
    }

    const cacheKey = this.getCacheKey(userEmail);

    try {
      await redis.setex(cacheKey, this.CACHE_TTL, value);
      console.log(
        `[Cache] Redis set for user: ${userEmail}, TTL: ${this.CACHE_TTL}s`
      );
    } catch (error) {
      console.error(
        `[Cache] Redis error setting cache for user ${userEmail}:`,
        error
      );
    }
  }

  async delete(userEmail: string): Promise<void> {
    if (!redis) {
      console.warn(
        `[Cache] Redis unavailable for delete operation: ${userEmail}`
      );
      return;
    }

    const cacheKey = this.getCacheKey(userEmail);

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

  // Utility method to check if Redis is available
  isRedisAvailable(): boolean {
    return redis !== null;
  }

  // Get cache status for debugging
  getStatus() {
    return {
      redis: this.isRedisAvailable(),
      ttl: this.CACHE_TTL,
    };
  }
}

class TeamMembersCache {
  private readonly CACHE_TTL = TeamMembers_TTL;

  private getCacheKey(): string {
    return `team-members`;
  }

  async get<T>(): Promise<T | null> {
    if (!redis) {
      console.warn(`[Cache] Redis unavailable for get operation`);
      return null;
    }

    const cacheKey = this.getCacheKey();

    try {
      const data = await redis.get(cacheKey);

      if (data) {
        console.log(`[Cache] Redis hit for team members`);
        return data as T;
      }

      console.log(`[Cache] Miss for team members`);
      return null;
    } catch (error) {
      console.error(`[Cache] Redis error for team members:`, error);
      return null;
    }
  }

  async set<T>(value: T): Promise<void> {
    if (!redis) {
      console.warn(`[Cache] Redis unavailable for set operation`);
      return;
    }

    const cacheKey = this.getCacheKey();

    try {
      await redis.setex(cacheKey, this.CACHE_TTL, value);
      console.log(
        `[Cache] Redis set for team members, TTL: ${this.CACHE_TTL}s`
      );
    } catch (error) {
      console.error(
        `[Cache] Redis error setting cache for team members:`,
        error
      );
    }
  }

  async delete(): Promise<void> {
    if (!redis) {
      console.warn(`[Cache] Redis unavailable for delete operation`);
      return;
    }

    const cacheKey = this.getCacheKey();

    try {
      await redis.del(cacheKey);
      console.log(`[Cache] Redis deleted for team members`);
    } catch (error) {
      console.error(
        `[Cache] Redis error deleting cache for team members:`,
        error
      );
    }
  }

  // Utility method to check if Redis is available
  isRedisAvailable(): boolean {
    return redis !== null;
  }

  // Get cache status for debugging
  getStatus() {
    return {
      redis: this.isRedisAvailable(),
      ttl: this.CACHE_TTL,
    };
  }
}

class ExchangeRatesCache {
  private readonly CACHE_TTL = ExchangeRates_TTL;

  private getCacheKey(): string {
    return "EXCHANGE_RATES";
  }

  async get<T>(): Promise<T | null> {
    if (!redis) {
      console.warn(
        `[Cache] Redis unavailable for get operation: exchange rates`
      );
      return null;
    }

    const cacheKey = this.getCacheKey();

    try {
      const data = await redis.get(cacheKey);

      if (data) {
        console.log(`[Cache] Redis hit for exchange rates`);
        return data as T;
      }

      console.log(`[Cache] Miss for exchange rates`);
      return null;
    } catch (error) {
      console.error(`[Cache] Redis error for exchange rates:`, error);
      return null;
    }
  }

  async set<T>(value: T): Promise<void> {
    if (!redis) {
      console.warn(
        `[Cache] Redis unavailable for set operation: exchange rates`
      );
      return;
    }

    const cacheKey = this.getCacheKey();

    try {
      await redis.setex(cacheKey, this.CACHE_TTL, value);
      console.log(
        `[Cache] Redis set for exchange rates, TTL: ${this.CACHE_TTL}s`
      );
    } catch (error) {
      console.error(
        `[Cache] Redis error setting cache for exchange rates:`,
        error
      );
    }
  }

  async delete(): Promise<void> {
    if (!redis) {
      console.warn(
        `[Cache] Redis unavailable for delete operation: exchange rates`
      );
      return;
    }

    const cacheKey = this.getCacheKey();

    try {
      await redis.del(cacheKey);
      console.log(`[Cache] Redis deleted for exchange rates`);
    } catch (error) {
      console.error(
        `[Cache] Redis error deleting cache for exchange rates:`,
        error
      );
    }
  }

  // Utility method to check if Redis is available
  isRedisAvailable(): boolean {
    return redis !== null;
  }

  // Get cache status for debugging
  getStatus() {
    return {
      redis: this.isRedisAvailable(),
      ttl: this.CACHE_TTL,
    };
  }
}

export const teamMemberCache = new TeamMemberCache();
export const teamMembersCache = new TeamMembersCache();
export const exchangeRatesCache = new ExchangeRatesCache();
