import { format, parseISO, isValid, formatDistanceToNow } from "date-fns"

/**
 * Standard date formatting options.
 */
export const DATE_FORMATS = {
  FULL: "PPP",
  SHORT: "P",
  DATETIME: "PPPp",
  ISO: "yyyy-MM-dd",
} as const

function toDate(date: Date | string | number): Date {
  return typeof date === "string" ? parseISO(date) : new Date(date)
}

/**
 * Formats a date string or Date object using a specified pattern.
 */
export function formatDate(
  date: Date | string | number,
  pattern: string = DATE_FORMATS.FULL
): string {
  const dateObj = toDate(date)

  if (!isValid(dateObj)) return "Invalid Date"

  return format(dateObj, pattern)
}

/**
 * Returns a human-readable relative time string (e.g., "3 days ago").
 */
export function relativeTime(date: Date | string | number): string {
  const dateObj = toDate(date)

  if (!isValid(dateObj)) return "Invalid Date"

  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Re-export useful functions from date-fns
 */
export { isValid, parseISO } from "date-fns"
