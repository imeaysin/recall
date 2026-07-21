export function normalizeTopicName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
}

export function topicColor(normalizedName: string): string {
  const hash = [...normalizedName].reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0,
    0
  )
  return `hsl(${hash % 360} 55% 45%)`
}
