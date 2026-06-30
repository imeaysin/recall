import { describe, expect, it } from "vitest"
import { ApiError } from "@/lib/api"

describe("ApiError", () => {
  it("stores status code", () => {
    const error = new ApiError("Not found", 404)
    expect(error.message).toBe("Not found")
    expect(error.status).toBe(404)
    expect(error.name).toBe("ApiError")
  })
})
