import { describe, expect, it, vi } from "vitest"
import { InlineJobQueueAdapter } from "../src/adapters/inline"

describe("InlineJobQueueAdapter", () => {
  it("runs registered handlers asynchronously", async () => {
    const queue = new InlineJobQueueAdapter()
    const handler = vi.fn()

    queue.register("ping", handler)
    queue.enqueue("ping", { value: 1 })

    expect(handler).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(handler).toHaveBeenCalledWith({ value: 1 })
  })

  it("swallows handler errors without throwing from enqueue", async () => {
    const queue = new InlineJobQueueAdapter()

    queue.register("fail", () => {
      throw new Error("boom")
    })

    expect(() => queue.enqueue("fail", {})).not.toThrow()

    await new Promise((resolve) => setTimeout(resolve, 0))
  })
})

describe("InlineJobQueueAdapter factory", () => {
  it("returns inline provider by default", () => {
    const queue = new InlineJobQueueAdapter()
    expect(queue).toHaveProperty("enqueue")
    expect(queue).toHaveProperty("register")
    expect(queue).toHaveProperty("close")
  })
})
