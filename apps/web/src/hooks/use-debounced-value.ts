import { useDebouncedValue as usePacerDebouncedValue } from "@tanstack/react-pacer"

export const DEFAULT_DEBOUNCE_WAIT_MS = 300 as const

type UseDebouncedValueOptions = {
  readonly wait?: number
}

/**
 * Debounces a rapidly changing value using TanStack Pacer.
 * @see https://tanstack.com/pacer/latest/docs/framework/react/reference/functions/useDebouncedValue
 */
export function useDebouncedValue<TValue>(
  value: TValue,
  options: UseDebouncedValueOptions = {}
): TValue {
  const wait = options.wait ?? DEFAULT_DEBOUNCE_WAIT_MS
  const [debouncedValue] = usePacerDebouncedValue(value, { wait })
  return debouncedValue
}
