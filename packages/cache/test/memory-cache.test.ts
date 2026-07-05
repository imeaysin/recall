import { describe, expect, it, vi } from "vitest"
import { createCache } from "../src/index"
import { MemoryCacheAdapter } from "../src/adapters/memory"

describe("MemoryCacheAdapter", () => {
  it("returns null for missing keys", async () => {
    const cache = new MemoryCacheAdapter()
    expect(await cache.get("missing")).toBeNull()
  })

  it("stores and retrieves values", async () => {
    const cache = new MemoryCacheAdapter()
    await cache.set("key", "value")
    expect(await cache.get("key")).toBe("value")
  })

  it("overwrites existing values", async () => {
    const cache = new MemoryCacheAdapter()
    await cache.set("key", "first")
    await cache.set("key", "second")
    expect(await cache.get("key")).toBe("second")
  })

  it("deletes keys", async () => {
    const cache = new MemoryCacheAdapter()
    await cache.set("key", "value")
    await cache.delete("key")
    expect(await cache.get("key")).toBeNull()
  })

  it("checks existence with has()", async () => {
    const cache = new MemoryCacheAdapter()
    expect(await cache.has("key")).toBe(false)
    await cache.set("key", "value")
    expect(await cache.has("key")).toBe(true)
  })

  it("expires entries after TTL", async () => {
    vi.useFakeTimers()
    const cache = new MemoryCacheAdapter()

    await cache.set("key", "value", 5)
    expect(await cache.get("key")).toBe("value")

    vi.advanceTimersByTime(4_000)
    expect(await cache.get("key")).toBe("value")

    vi.advanceTimersByTime(2_000)
    expect(await cache.get("key")).toBeNull()

    vi.useRealTimers()
  })

  it("has() returns false for expired entries", async () => {
    vi.useFakeTimers()
    const cache = new MemoryCacheAdapter()

    await cache.set("key", "value", 1)
    vi.advanceTimersByTime(2_000)
    expect(await cache.has("key")).toBe(false)

    vi.useRealTimers()
  })

  it("stores indefinitely when TTL is omitted", async () => {
    vi.useFakeTimers()
    const cache = new MemoryCacheAdapter()

    await cache.set("key", "value")
    vi.advanceTimersByTime(1_000_000_000)
    expect(await cache.get("key")).toBe("value")

    vi.useRealTimers()
  })

  it("clears all entries on close()", async () => {
    const cache = new MemoryCacheAdapter()
    await cache.set("a", "1")
    await cache.set("b", "2")
    await cache.close()
    expect(await cache.get("a")).toBeNull()
    expect(await cache.get("b")).toBeNull()
  })
})

describe("createCache", () => {
  it("returns memory provider for 'memory' config", () => {
    const cache = createCache({ provider: "memory" })
    expect(cache).toHaveProperty("get")
    expect(cache).toHaveProperty("set")
    expect(cache).toHaveProperty("delete")
    expect(cache).toHaveProperty("has")
    expect(cache).toHaveProperty("close")
  })
})
