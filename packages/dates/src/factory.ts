import type { DateConfig, DateProvider } from "./types"
import { DateFnsAdapter } from "./adapters/date-fns"
import { NativeDateAdapter } from "./adapters/native"

export function createDateProvider(config: DateConfig): DateProvider {
  switch (config.provider) {
    case "date-fns":
      return new DateFnsAdapter()
    case "native":
      return new NativeDateAdapter(config.locale)
    default: {
      const _exhaustive: never = config
      throw new Error(`Unknown date provider: ${_exhaustive}`)
    }
  }
}
