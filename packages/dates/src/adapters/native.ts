import type { DateProvider } from "../types"

const DEFAULT_LOCALE = "en-US"

function toDate(date: Date | string | number): Date {
  return date instanceof Date ? date : new Date(date)
}

export class NativeDateAdapter implements DateProvider {
  private readonly locale: string

  constructor(locale: string = DEFAULT_LOCALE) {
    this.locale = locale
  }

  formatDate(date: Date | string | number, _pattern?: string): string {
    const d = toDate(date)
    if (!this.isValid(d)) return "Invalid Date"
    return new Intl.DateTimeFormat(this.locale, { dateStyle: "long" }).format(d)
  }

  relativeTime(date: Date | string | number): string {
    const d = toDate(date)
    if (!this.isValid(d)) return "Invalid Date"

    const diffMs = d.getTime() - Date.now()
    const diffSec = Math.round(diffMs / 1000)
    const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: "auto" })

    const abs = Math.abs(diffSec)
    if (abs < 60) return rtf.format(diffSec, "second")
    const diffMin = Math.round(diffSec / 60)
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute")
    const diffHour = Math.round(diffMin / 60)
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour")
    const diffDay = Math.round(diffHour / 24)
    if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day")
    const diffMonth = Math.round(diffDay / 30)
    if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month")
    return rtf.format(Math.round(diffMonth / 12), "year")
  }

  isValid(date: Date | string | number): boolean {
    return !Number.isNaN(toDate(date).getTime())
  }

  parseISO(date: string): Date {
    // ISO 8601 strings are valid Date constructor input
    return new Date(date)
  }
}
