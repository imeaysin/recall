export function initAnonymousUser() {}

export function identifyUser(
  _userId: string,
  _properties?: Record<string, unknown>
) {}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cap:analytics", {
        detail: { eventName, properties },
      })
    )
  }
}
