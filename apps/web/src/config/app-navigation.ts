import { Library, MessageSquare, Settings, Tags } from "lucide-react"
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
      title: "Library",
      url: routes.library,
      icon: Library,
      isActive: true,
    },
    {
      title: "Chat",
      url: routes.chat,
      icon: MessageSquare,
    },
    {
      title: "Topics",
      url: routes.topics,
      icon: Tags,
    },
    {
      title: "Settings",
      url: routes.settings,
      icon: Settings,
    },
  ] satisfies readonly NavItem[],
  projects: emptyProjects,
}

export const libraryViews = {
  queue: "QUEUE",
  archive: "ARCHIVE",
} as const

export type LibraryView = (typeof libraryViews)[keyof typeof libraryViews]

export function libraryViewUrl(view: LibraryView) {
  return `${routes.library}?status=${view}`
}

export function libraryTopicUrl(topicId: string) {
  return `${routes.library}?topic=${encodeURIComponent(topicId)}`
}
