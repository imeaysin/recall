import { describe, expect, it } from "vitest"
import { ContentErrorCode } from "@workspace/contracts"
import { ApiError } from "@/lib/api"

describe("ApiError", () => {
  it("stores status code and machine-readable code", () => {
    const error = new ApiError({
      message: "Not found",
      status: 404,
      code: ContentErrorCode.CONTENT_NOT_FOUND,
    })
    expect(error.message).toBe("Not found")
    expect(error.status).toBe(404)
    expect(error.code).toBe(ContentErrorCode.CONTENT_NOT_FOUND)
    expect(error.name).toBe("ApiError")
  })
})
