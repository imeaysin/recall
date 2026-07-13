import { describe, expect, it } from "vitest"
import { siteConfig } from "@/config/site"

describe("site config", () => {
  it("has a name and description", () => {
    expect(siteConfig.name).toBeTruthy()
    expect(siteConfig.description).toBeTruthy()
  })

  it("has a client URL", () => {
    expect(siteConfig.clientUrl).toMatch(/^https?:\/\//)
  })
})
