/**
 * Lightweight language hint for FR-2.12. Prefer "en" when Latin script dominates;
 * otherwise leave undefined for AI metadata to fill later.
 */
export function detectLanguageHint(text: string): string | undefined {
  const sample = text.slice(0, 2000)
  if (sample.trim().length === 0) return undefined

  const letters = sample.replace(/[^\p{L}]/gu, "")
  if (letters.length < 20) return undefined

  const latin = letters.replace(/[^\p{Script=Latin}]/gu, "").length
  const ratio = latin / letters.length
  if (ratio >= 0.85) return "en"
  return undefined
}
