import { createHash } from "node:crypto"

export const TRACKING_QUERY_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "igshid",
  "si",
] as const

const TRACKING_PARAM_SET = new Set<string>(TRACKING_QUERY_PARAMS)

export function normalizeUrl(raw: string): string {
  const url = new URL(raw.trim())
  url.hash = ""
  url.hostname = url.hostname.toLowerCase()
  url.protocol = url.protocol.toLowerCase()
  stripTrackingParams(url)

  let href = url.toString()
  if (href.endsWith("/") && url.pathname !== "/") {
    href = href.slice(0, -1)
  }
  return href.toLowerCase()
}

function stripTrackingParams(url: URL): void {
  for (const key of [...url.searchParams.keys()]) {
    const lower = key.toLowerCase()
    if (TRACKING_PARAM_SET.has(lower) || lower.startsWith("utm_")) {
      url.searchParams.delete(key)
    }
  }
}

export function detectYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")
    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null
    }
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      return parsed.searchParams.get("v")
    }
  } catch {
    return null
  }
  return null
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}
