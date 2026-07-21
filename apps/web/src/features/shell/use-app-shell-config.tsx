import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArchiveIcon,
  Command,
  FolderIcon,
  InboxIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldIcon,
  TagsIcon,
  Trash2Icon,
  UserIcon,
  type LucideIcon,
} from "lucide-react"
import { useSession, signOut } from "@workspace/auth/client"
import {
  appNavigation,
  libraryTopicUrl,
  libraryViewUrl,
} from "@/config/app-navigation"
import { routes } from "@/config/routes"
import { site } from "@/config/site"
import { useChatList, useCreateChat } from "@/features/chat/hooks/use-chat"
import {
  useContentList,
  useContentTrashList,
} from "@/features/library/hooks/use-content"
import { useTopicList } from "@/features/topics/hooks/use-topics"
import type {
  AppSidebarBrand,
  AppSidebarNavItem,
  AppSidebarProject,
  AppSidebarSecondaryAction,
  AppSidebarSecondaryItem,
  AppSidebarTeam,
  AppSidebarUserMenuItem,
} from "@workspace/ui/components/app-sidebar"

const emptyTeams: readonly AppSidebarTeam[] = []

function toNavIcon(icon?: LucideIcon) {
  if (!icon) return undefined
  const Icon = icon
  return <Icon />
}

function isModeActive(pathname: string, modeUrl: string) {
  return pathname === modeUrl || pathname.startsWith(`${modeUrl}/`)
}

function buildLibrarySecondary(input: {
  pathname: string
  search: string
  totalCount: number
  untaggedCount: number
  archiveCount: number
  trashCount: number
  topics: readonly {
    id: string
    name: string
    contentCount: number
    isRoot: boolean
  }[]
}): AppSidebarSecondaryItem[] {
  const params = new URLSearchParams(input.search)
  const topic = params.get("topic")
  const status = params.get("status")
  const onLibrary = input.pathname === routes.library
  const onTrash = input.pathname === routes.libraryTrash

  const folders = input.topics
    .filter((entry) => !entry.isRoot)
    .map((entry) => ({
      title: entry.name,
      url: libraryTopicUrl(entry.id),
      icon: <FolderIcon />,
      count: entry.contentCount,
      isActive: onLibrary && topic === entry.id,
    }))

  return [
    {
      title: "All",
      url: routes.library,
      icon: <InboxIcon />,
      count: input.totalCount,
      isActive: onLibrary && !topic && status !== "ARCHIVE",
    },
    ...folders,
    {
      title: "Untagged Cards",
      url: libraryTopicUrl("untagged"),
      icon: <TagsIcon />,
      count: input.untaggedCount,
      isActive: onLibrary && topic === "untagged",
      emphasis: "muted",
    },
    {
      title: "Archive",
      url: libraryViewUrl("ARCHIVE"),
      icon: <ArchiveIcon />,
      count: input.archiveCount,
      isActive: onLibrary && status === "ARCHIVE",
    },
    {
      title: "Trash",
      url: routes.libraryTrash,
      icon: <Trash2Icon />,
      count: input.trashCount,
      isActive: onTrash,
      emphasis: "muted",
    },
  ]
}

function buildChatSecondary(input: {
  pathname: string
  chats: readonly { id: string; title: string }[]
}): AppSidebarSecondaryItem[] {
  return input.chats.map((chat) => ({
    title: chat.title,
    url: routes.chatDetail(chat.id),
    icon: <MessageSquareIcon />,
    isActive: input.pathname === routes.chatDetail(chat.id),
  }))
}

function buildTopicsSecondary(input: {
  topics: readonly {
    id: string
    name: string
    contentCount: number
    isRoot: boolean
  }[]
}): AppSidebarSecondaryItem[] {
  return input.topics
    .filter((topic) => !topic.isRoot)
    .map((topic) => ({
      title: topic.name,
      url: routes.topics,
      icon: <TagsIcon />,
      count: topic.contentCount,
    }))
}

function buildSettingsSecondary(pathname: string): AppSidebarSecondaryItem[] {
  return [
    {
      title: "Account",
      url: routes.settingsAccount,
      icon: <UserIcon />,
      isActive:
        pathname === routes.settings || pathname === routes.settingsAccount,
    },
    {
      title: "Security",
      url: routes.settingsSecurity,
      icon: <ShieldIcon />,
      isActive: pathname === routes.settingsSecurity,
    },
  ]
}

export function useAppShellConfig() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const search = location.search
  const { data: session } = useSession()

  const queueList = useContentList({ libraryStatus: "QUEUE" })
  const archiveList = useContentList({ libraryStatus: "ARCHIVE" })
  const trashList = useContentTrashList()
  const chats = useChatList()
  const topics = useTopicList(true)
  const createChat = useCreateChat()

  const navMain = useMemo<AppSidebarNavItem[]>(() => {
    const queueItems = queueList.data?.items ?? []
    const archiveItems = archiveList.data?.items ?? []
    const trashItems = trashList.data?.items ?? []
    const chatItems = chats.data?.items ?? []
    const topicItems = topics.data?.items ?? []
    const allActive = [...queueItems, ...archiveItems]
    const untaggedCount = allActive.filter(
      (item) => item.isOrphan || item.topicSnapshot.length === 0
    ).length

    return appNavigation.navMain.map((item) => {
      const active = isModeActive(pathname, item.url)
      let items: AppSidebarSecondaryItem[] = []

      if (item.title === "Library") {
        items = buildLibrarySecondary({
          pathname,
          search,
          totalCount: allActive.length,
          untaggedCount,
          archiveCount: archiveItems.length,
          trashCount: trashItems.length,
          topics: topicItems,
        })
      } else if (item.title === "Chat") {
        items = buildChatSecondary({ pathname, chats: chatItems })
      } else if (item.title === "Topics") {
        items = buildTopicsSecondary({ topics: topicItems })
      } else if (item.title === "Settings") {
        items = buildSettingsSecondary(pathname)
      }

      return {
        title: item.title,
        url: item.url,
        icon: toNavIcon(item.icon),
        isActive: active,
        items,
      }
    })
  }, [
    pathname,
    search,
    queueList.data,
    archiveList.data,
    trashList.data,
    chats.data,
    topics.data,
  ])

  const projects = useMemo<AppSidebarProject[]>(() => {
    return appNavigation.projects.map((proj) => ({
      name: proj.name,
      url: proj.url,
      icon: toNavIcon(proj.icon) ?? <Command />,
      isActive: pathname === proj.url || pathname.startsWith(`${proj.url}/`),
    }))
  }, [pathname])

  const userMenuItems = useMemo<AppSidebarUserMenuItem[]>(
    () => [
      {
        label: "Settings",
        href: routes.settingsAccount,
        icon: <SettingsIcon />,
      },
    ],
    []
  )

  const activeMode = navMain.find((item) => item.isActive)

  const secondaryAction = useMemo<AppSidebarSecondaryAction | undefined>(() => {
    if (activeMode?.title === "Library" || activeMode?.title === "Topics") {
      return {
        label: "New topic",
        href: routes.topics,
      }
    }
    if (activeMode?.title === "Chat") {
      return {
        label: "New chat",
        disabled: createChat.isPending,
        onClick: () => {
          createChat.mutate(undefined, {
            onSuccess: (chat) => navigate(routes.chatDetail(chat.id)),
          })
        },
      }
    }
    return undefined
  }, [activeMode?.title, createChat, navigate])

  const brand: AppSidebarBrand = {
    name: site.name,
    plan: "Personal",
    logo: <Command className="size-4" />,
  }

  return {
    brandLabel: site.name,
    brand,
    navMain,
    projects,
    secondaryAction,
    user: {
      name: session?.user.name ?? "User",
      email: session?.user.email ?? "",
      avatar: session?.user.image ?? "",
    },
    teams: [...emptyTeams],
    userMenuItems,
    onSignOut: () => {
      void signOut()
    },
  }
}
