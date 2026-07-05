import {
  format,
  parseISO as dateFnsParseISO,
  isValid as dateFnsIsValid,
  formatDistanceToNow,
} from "date-fns"
import type { DateProvider } from "../types"

export const DATE_FORMATS = {
  FULL: "PPP",
  SHORT: "P",
  DATETIME: "PPPp",
  ISO: "yyyy-MM-dd",
} as const

function toDate(date: Date | string | number): Date {
  return typeof date === "string" ? dateFnsParseISO(date) : new Date(date)
}

// ── Standalone helpers (re-exported from index.ts for consumers) ──────────────

export function formatDate(
  date: Date | string | number,
  pattern: string = DATE_FORMATS.FULL
): string {
  const dateObj = toDate(date)
  if (!isValid(dateObj)) return "Invalid Date"
  return format(dateObj, pattern)
}

export function relativeTime(date: Date | string | number): string {
  const dateObj = toDate(date)
  if (!isValid(dateObj)) return "Invalid Date"
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function isValid(date: Date | string | number): boolean {
  return dateFnsIsValid(toDate(date))
}

export function parseISO(date: string): Date {
  return dateFnsParseISO(date)
}

// ── Adapter class (uses the helpers above) ────────────────────────────────────

export class DateFnsAdapter implements DateProvider {
  formatDate(date: Date | string | number, pattern?: string): string {
    return formatDate(date, pattern as string)
  }

  relativeTime(date: Date | string | number): string {
    return relativeTime(date)
  }

  isValid(date: Date | string | number): boolean {
    return isValid(date)
  }

  parseISO(date: string): Date {
    return parseISO(date)
  }
}
