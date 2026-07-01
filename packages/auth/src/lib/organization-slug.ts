export function sanitizeOrganizationSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildOrganizationSlug(name: string, userId: string) {
  const base = sanitizeOrganizationSlug(name) || "workspace"
  return `${base}-${userId.slice(0, 8)}`
}
