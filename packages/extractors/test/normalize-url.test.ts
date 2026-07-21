import { describe, expect, it } from "vitest"
import { normalizeUrl, detectYoutubeVideoId } from "../src/normalize-url"

describe("normalizeUrl", () => {
  it("strips tracking params and trailing slash", () => {
    expect(
      normalizeUrl("https://Example.com/Path/?utm_source=x&fbclid=1")
    ).toBe("https://example.com/path")
  })
})

describe("detectYoutubeVideoId", () => {
  it("parses watch and short urls", () => {
    expect(
      detectYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBe("dQw4w9WgXcQ")
    expect(detectYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    )
  })
})
