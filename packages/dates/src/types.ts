export interface DateProvider {
  formatDate(date: Date | string | number, pattern?: string): string
  relativeTime(date: Date | string | number): string
  isValid(date: Date | string | number): boolean
  parseISO(date: string): Date
}

export type DateFnsConfig = {
  provider: "date-fns"
}

export type NativeDateConfig = {
  provider: "native"
  locale?: string
}

export type DateConfig = DateFnsConfig | NativeDateConfig
