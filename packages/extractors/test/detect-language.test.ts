import { describe, expect, it } from "vitest"
import { detectLanguageHint } from "../src/lib/detect-language"

describe("detectLanguageHint", () => {
  it("returns en for latin-heavy text", () => {
    const text = "The quick brown fox jumps over the lazy dog. ".repeat(10)
    expect(detectLanguageHint(text)).toBe("en")
  })

  it("returns undefined for short samples", () => {
    expect(detectLanguageHint("hi")).toBeUndefined()
  })
})
