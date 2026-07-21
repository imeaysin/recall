import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { Command, SettingsIcon, type LucideIcon } from "lucide-react"
import { useSession, signOut } from "@workspace/auth/client"
import { appNavigation } from "@/config/app-navigation"
import { routes } from "@/config/routes"
import { site } from "@/config/site"
import type {
  AppSidebarBrand,
  AppSidebarNavItem,
  AppSidebarProject,
  AppSidebarTeam,
  AppSidebarUserMenuItem,
} from "@workspace/ui/components/app-sidebar"

const emptyTeams: readonly AppSidebarTeam[] = []

function toNavIcon(icon?: LucideIcon) {
  if (!icon) return undefined
  const Icon = icon
  return <Icon />
}

export function useAppShellConfig() {
  const location = useLocation()
  const pathname = location.pathname
  const { data: session } = useSession()

  const navMain = useMemo<AppSidebarNavItem[]>(() => {
    return appNavigation.navMain.map((item) => {
      const isUrlActive =
        pathname === item.url ||
        (Boolean(item.items) &&
          (item.items?.length ?? 0) === 0 &&
          pathname.startsWith(`${item.url}/`))

      const hasActiveSubItem = item.items?.some(
        (sub) => pathname === sub.url || pathname.startsWith(`${sub.url}/`)
      )

      return {
        title: item.title,
        url: item.url,
        icon: toNavIcon(item.icon),
        isActive: Boolean(isUrlActive || hasActiveSubItem),
        items: item.items?.map((sub) => ({
          title: sub.title,
          url: sub.url,
          isActive: pathname === sub.url || pathname.startsWith(`${sub.url}/`),
        })),
      }
    })
  }, [pathname])

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
