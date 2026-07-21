import { Library, Settings } from "lucide-react"
import { routes } from "@/config/routes"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  readonly title: string
  readonly url: string
  readonly icon?: LucideIcon
  readonly isActive?: boolean
  readonly items?: readonly NavItem[]
}

export type NavProject = {
  readonly name: string
  readonly url: string
  readonly icon: LucideIcon
}

const emptyProjects: readonly NavProject[] = []

export const appNavigation = {
  navMain: [
    {
      title: "CogniVault",
      url: routes.library,
      icon: Library,
      isActive: true,
      items: [{ title: "Library", url: routes.library }],
    },
    {
      title: "Settings",
      url: routes.settings,
      icon: Settings,
      items: [
        { title: "Account", url: routes.settingsAccount },
        { title: "Security", url: routes.settingsSecurity },
      ],
    },
  ] satisfies readonly NavItem[],
  projects: emptyProjects,
}
