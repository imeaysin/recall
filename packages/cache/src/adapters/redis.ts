import { createRedisClient } from "@workspace/redis"
import type { CacheProvider, RedisCacheConfig } from "../types"

const DEFAULT_KEY_PREFIX = "cache:"

export class RedisCacheAdapter implements CacheProvider {
  private readonly client: ReturnType<typeof createRedisClient>
  private readonly prefix: string

  constructor(config: RedisCacheConfig) {
    this.client = createRedisClient(config.redisUrl)
    this.prefix = config.keyPrefix ?? DEFAULT_KEY_PREFIX
  }

  private prefixKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(this.prefixKey(key))
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const k = this.prefixKey(key)
    if (ttl !== undefined && ttl > 0) {
      await this.client.setex(k, ttl, value)
    } else {
      await this.client.set(k, value)
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(this.prefixKey(key))
  }

  async has(key: string): Promise<boolean> {
    const result = await this.client.exists(this.prefixKey(key))
    return result === 1
  }

  async close(): Promise<void> {
    await this.client.quit()
  }
}
