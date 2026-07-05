import type { CacheConfig, CacheProvider } from "./types"
import { MemoryCacheAdapter } from "./adapters/memory"
import { RedisCacheAdapter } from "./adapters/redis"

export function createCache(config: CacheConfig): CacheProvider {
  switch (config.provider) {
    case "memory":
      return new MemoryCacheAdapter()
    case "redis":
      return new RedisCacheAdapter(config)
    default: {
      const _exhaustive: never = config
      throw new Error(`Unknown cache provider: ${_exhaustive}`)
    }
  }
}
