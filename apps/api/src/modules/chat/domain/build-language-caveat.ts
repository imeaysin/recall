import { LANGUAGE_CAVEAT_TEMPLATE } from "./constants"

export function buildLanguageCaveat(
  languages: readonly (string | undefined)[]
): string | undefined {
  const nonEnglish = languages.find(
    (language) =>
      language !== undefined && language.length > 0 && language !== "en"
  )
  if (!nonEnglish) return undefined
  return LANGUAGE_CAVEAT_TEMPLATE.replace("{language}", nonEnglish)
}
