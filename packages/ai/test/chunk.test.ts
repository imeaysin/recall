import { describe, expect, it } from "vitest"
import { chunkText } from "../src/chunk"

describe("chunkText", () => {
  it("returns empty for blank input", () => {
    expect(chunkText("")).toEqual([])
    expect(chunkText("   ")).toEqual([])
  })

  it("returns a single chunk for short text", () => {
    expect(chunkText("hello world")).toEqual(["hello world"])
  })

  it("splits long text with overlap", () => {
    const text = "a".repeat(3000)
    const chunks = chunkText(text, { targetTokens: 100, overlapTokens: 10 })
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0]?.length).toBeLessThanOrEqual(400)
  })
})
