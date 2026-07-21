import { describe, expect, it } from "vitest"
import {
  getSafeRedirectPath,
  withAuthRedirectQuery,
} from "@/routing/safe-redirect"
import { defaultAuthenticatedRoute, routes } from "@/config/routes"

describe("getSafeRedirectPath", () => {
  it("returns the fallback when redirect is missing", () => {
    expect(getSafeRedirectPath(null, defaultAuthenticatedRoute)).toBe(
      defaultAuthenticatedRoute
    )
  })

  it("allows same-app relative paths", () => {
    expect(getSafeRedirectPath(routes.library, defaultAuthenticatedRoute)).toBe(
      routes.library
    )
    expect(getSafeRedirectPath("/app/library", defaultAuthenticatedRoute)).toBe(
      "/app/library"
    )
  })

  it("rejects open redirects", () => {
    expect(
      getSafeRedirectPath("https://evil.example", defaultAuthenticatedRoute)
    ).toBe(defaultAuthenticatedRoute)
    expect(
      getSafeRedirectPath("//evil.example", defaultAuthenticatedRoute)
    ).toBe(defaultAuthenticatedRoute)
  })

  it("adds redirect query for auth cross-links", () => {
    expect(
      withAuthRedirectQuery("/auth/sign-in", {
        redirect: routes.library,
        fallback: defaultAuthenticatedRoute,
      })
    ).toBe("/auth/sign-in?redirect=%2Fapp%2Flibrary")
  })
})
