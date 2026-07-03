import { createMemoryCache } from "./providers/memory"
import { createRedisCache } from "./providers/redis"
import type { CacheConfig, CacheProvider } from "./types"

export { createMemoryCache } from "./providers/memory"
export { createRedisCache } from "./providers/redis"
export type {
  CacheConfig,
  CacheProvider,
  MemoryCacheConfig,
  RedisCacheConfig,
} from "./types"

export function createCache(config: CacheConfig): CacheProvider {
  switch (config.provider) {
    case "memory":
      return createMemoryCache()
    case "redis":
      return createRedisCache(config)
    default: {
      const _exhaustive: never = config
      throw new Error(`Unknown cache provider: ${_exhaustive}`)
    }
  }
}
