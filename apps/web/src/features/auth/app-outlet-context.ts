import { useOutletContext } from "react-router-dom"

export interface AppOutletContext {
  openCreateOrganization: () => void
}

export function useAppOutletContext() {
  return useOutletContext<AppOutletContext>()
}
