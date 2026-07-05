import type { CacheProvider } from "../types"

type Entry = {
  value: string
  expiresAt: number | null
}

export class MemoryCacheAdapter implements CacheProvider {
  private readonly store = new Map<string, Entry>()

  private alive(entry: Entry): boolean {
    return entry.expiresAt === null || Date.now() <= entry.expiresAt
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry || !this.alive(entry)) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiresAt =
      ttl !== undefined && ttl > 0 ? Date.now() + ttl * 1000 : null
    this.store.set(key, { value, expiresAt })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key)
    if (!entry || !this.alive(entry)) {
      this.store.delete(key)
      return false
    }
    return true
  }

  async close(): Promise<void> {
    this.store.clear()
  }
}
