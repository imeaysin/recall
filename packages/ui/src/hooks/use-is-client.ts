import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => undefined

/** True only after hydration — safe for theme-dependent UI. */
export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
