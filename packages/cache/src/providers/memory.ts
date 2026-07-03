import type { CacheProvider } from "../types"

type Entry = {
  value: string
  expiresAt: number | null
}

export function createMemoryCache(): CacheProvider {
  const store = new Map<string, Entry>()

  function alive(entry: Entry): boolean {
    return entry.expiresAt === null || Date.now() <= entry.expiresAt
  }

  return {
    async get(key) {
      const entry = store.get(key)
      if (!entry || !alive(entry)) {
        store.delete(key)
        return null
      }
      return entry.value
    },

    async set(key, value, ttl) {
      const expiresAt =
        ttl !== undefined && ttl > 0 ? Date.now() + ttl * 1000 : null
      store.set(key, { value, expiresAt })
    },

    async delete(key) {
      store.delete(key)
    },

    async has(key) {
      const entry = store.get(key)
      if (!entry || !alive(entry)) {
        store.delete(key)
        return false
      }
      return true
    },

    async close() {
      store.clear()
    },
  }
}
