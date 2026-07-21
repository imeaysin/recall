import { isRootNormalizedName } from "./root"

export function computeIsOrphanFromNormalizedNames(
  normalizedNames: readonly string[]
): boolean {
  return !normalizedNames.some((name) => !isRootNormalizedName(name))
}

export function computeIsOrphanFromTopicIds(input: {
  readonly topicRefIds: readonly string[]
  readonly rootTopicId: string
}): boolean {
  const nonRoot = input.topicRefIds.filter((id) => id !== input.rootTopicId)
  return nonRoot.length === 0
}
