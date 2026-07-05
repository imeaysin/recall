import { describe, expect, it } from "vitest"
import { createDateProvider } from "@workspace/dates"

describe("relativeTime", () => {
  it("formats ISO dates", () => {
    const dates = createDateProvider({ provider: "date-fns" })
    const result = dates.relativeTime("2020-01-01T00:00:00.000Z")
    expect(result).toMatch(/ago/)
  })
})
