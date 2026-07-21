import { describe, expect, it } from "vitest"
import { UploadResponseSchema } from "../src/index"

describe("UploadResponseSchema", () => {
  it("accepts upload result shape", () => {
    const result = UploadResponseSchema.parse({
      path: "user/file.png",
      url: "http://localhost/uploads/user/file.png",
    })
    expect(result.path).toBe("user/file.png")
  })
})
