import { describe, expect, it } from "vitest"
import { relativeTime } from "@workspace/dates"

describe("relativeTime", () => {
  it("formats ISO dates", () => {
    const result = relativeTime("2020-01-01T00:00:00.000Z")
    expect(result).toMatch(/ago/)
  })
})
