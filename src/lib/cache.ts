import { Redis } from "@upstash/redis";

const TeamMember_TTL = 3600; // 1 hour in seconds
const TeamMembers_TTL = 7 * 24 * 60 * 60; // 1 week in seconds
const ExchangeRates_TTL = 24 * 60 * 60; // 24 hours in seconds
const Holidays_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

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

/**
 * Base cache class that handles all common Redis operations.
 * Subclasses only need to define TTL, cache key generation, and cache name.
 */
abstract class BaseCache {
  protected abstract readonly CACHE_TTL: number;
  protected abstract getCacheName(): string;
  protected abstract getCacheKey(...args: any[]): string;
  protected abstract getLogContext(...args: any[]): string;

  protected async getInternal<T>(...args: any[]): Promise<T | null> {
    if (!redis) {
      const context = this.getLogContext(...args);
      console.warn(
        `[Cache] Redis unavailable for get operation: ${this.getCacheName()}${context ? ` ${context}` : ""}`
      );
      return null;
    }

    const cacheKey = this.getCacheKey(...args);

    try {
      const data = await redis.get(cacheKey);

      if (data) {
        return data as T;
      }

      return null;
    } catch (error) {
      const context = this.getLogContext(...args);
      console.error(
        `[Cache] Redis error for ${this.getCacheName()}${context ? ` ${context}` : ""}:`,
        error
      );
      return null;
    }
  }

  protected async setInternal<T>(value: T, ...args: any[]): Promise<void> {
    if (!redis) {
      const context = this.getLogContext(...args);
      console.warn(
        `[Cache] Redis unavailable for set operation: ${this.getCacheName()}${context ? ` ${context}` : ""}`
      );
      return;
    }

    const cacheKey = this.getCacheKey(...args);

    try {
      await redis.setex(cacheKey, this.CACHE_TTL, value);
    } catch (error) {
      const context = this.getLogContext(...args);
      console.error(
        `[Cache] Redis error setting cache for ${this.getCacheName()}${context ? ` ${context}` : ""}:`,
        error
      );
    }
  }

  protected async deleteInternal(...args: any[]): Promise<void> {
    if (!redis) {
      const context = this.getLogContext(...args);
      console.warn(
        `[Cache] Redis unavailable for delete operation: ${this.getCacheName()}${context ? ` ${context}` : ""}`
      );
      return;
    }

    const cacheKey = this.getCacheKey(...args);

    try {
      await redis.del(cacheKey);
    } catch (error) {
      const context = this.getLogContext(...args);
      console.error(
        `[Cache] Redis error deleting cache for ${this.getCacheName()}${context ? ` ${context}` : ""}:`,
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

class TeamMemberCache extends BaseCache {
  protected readonly CACHE_TTL = TeamMember_TTL;

  protected getCacheName(): string {
    return "team member";
  }

  protected getCacheKey(userEmail: string): string {
    return `team-member:${userEmail}`;
  }

  protected getLogContext(userEmail: string): string {
    return `for user ${userEmail}`;
  }

  // Type-safe public methods
  async get<T>(userEmail: string): Promise<T | null> {
    return this.getInternal<T>(userEmail);
  }

  async set<T>(userEmail: string, value: T): Promise<void> {
    return this.setInternal<T>(value, userEmail);
  }

  async delete(userEmail: string): Promise<void> {
    return this.deleteInternal(userEmail);
  }
}

class TeamMembersCache extends BaseCache {
  protected readonly CACHE_TTL = TeamMembers_TTL;

  protected getCacheName(): string {
    return "team members";
  }

  protected getCacheKey(): string {
    return `team-members`;
  }

  protected getLogContext(): string {
    return "";
  }

  // Type-safe public methods
  async get<T>(): Promise<T | null> {
    return this.getInternal<T>();
  }

  async set<T>(value: T): Promise<void> {
    return this.setInternal<T>(value);
  }

  async delete(): Promise<void> {
    return this.deleteInternal();
  }
}

class ExchangeRatesCache extends BaseCache {
  protected readonly CACHE_TTL = ExchangeRates_TTL;

  protected getCacheName(): string {
    return "exchange rates";
  }

  protected getCacheKey(): string {
    return "EXCHANGE_RATES";
  }

  protected getLogContext(): string {
    return "";
  }

  // Type-safe public methods
  async get<T>(): Promise<T | null> {
    return this.getInternal<T>();
  }

  async set<T>(value: T): Promise<void> {
    return this.setInternal<T>(value);
  }

  async delete(): Promise<void> {
    return this.deleteInternal();
  }
}

class HolidaysCache extends BaseCache {
  protected readonly CACHE_TTL = Holidays_TTL;

  protected getCacheName(): string {
    return "holidays";
  }

  protected getCacheKey(countryAcronym: string): string {
    return `HOLIDAYS:${countryAcronym}`;
  }

  protected getLogContext(countryAcronym: string): string {
    return `for ${countryAcronym}`;
  }

  // Type-safe public methods
  async get<T>(countryAcronym: string): Promise<T | null> {
    return this.getInternal<T>(countryAcronym);
  }

  async set<T>(countryAcronym: string, value: T): Promise<void> {
    return this.setInternal<T>(value, countryAcronym);
  }

  async delete(countryAcronym: string): Promise<void> {
    return this.deleteInternal(countryAcronym);
  }
}

export const teamMemberCache = new TeamMemberCache();
export const teamMembersCache = new TeamMembersCache();
export const exchangeRatesCache = new ExchangeRatesCache();
export const holidaysCache = new HolidaysCache();
