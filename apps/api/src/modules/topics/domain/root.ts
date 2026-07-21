export const ROOT_TOPIC_NORMALIZED_NAME = "__root__" as const
export const ROOT_TOPIC_DISPLAY_NAME = "Library" as const

export function isRootNormalizedName(normalizedName: string): boolean {
  return normalizedName === ROOT_TOPIC_NORMALIZED_NAME
}
