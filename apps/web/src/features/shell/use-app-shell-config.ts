import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import {
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  type LucideIcon,
} from "lucide-react"
import { useSession, signOut, authClient } from "@workspace/auth/client"
import { appNavigation } from "@/config/app-navigation"
import { site } from "@/config/site"

type OrganizationSummary = {
  readonly name: string
  readonly slug?: string | null
}

type ShellTeam = {
  readonly name: string
  readonly logo: LucideIcon
  readonly plan: string
}

const TEAM_LOGOS = [GalleryVerticalEnd, AudioWaveform, Command] as const

function toShellTeams(
  organizations: readonly OrganizationSummary[] | null | undefined,
  activeOrganization: OrganizationSummary | null | undefined
): ShellTeam[] {
  if (!organizations || organizations.length === 0) {
    return [
      {
        name: activeOrganization?.name ?? "Personal Workspace",
        logo: GalleryVerticalEnd,
        plan: "Free",
      },
    ]
  }

  return organizations.map((org, index) => ({
    name: org.name,
    logo: TEAM_LOGOS[index % TEAM_LOGOS.length] ?? GalleryVerticalEnd,
    plan: org.slug ?? "Pro",
  }))
}

export function useAppShellConfig() {
  const location = useLocation()
  const pathname = location.pathname
  const { data: session } = useSession()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: organizations } = authClient.useListOrganizations()

  const navMain = useMemo(() => {
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
        ...item,
        isActive: Boolean(isUrlActive || hasActiveSubItem),
        items: item.items?.map((sub) => ({
          ...sub,
          isActive: pathname === sub.url || pathname.startsWith(`${sub.url}/`),
        })),
      }
    })
  }, [pathname])

  const projects = useMemo(() => {
    return appNavigation.projects.map((proj) => ({
      ...proj,
      isActive: pathname === proj.url || pathname.startsWith(`${proj.url}/`),
    }))
  }, [pathname])

  const teams = useMemo(
    () => toShellTeams(organizations, activeOrganization),
    [organizations, activeOrganization]
  )

  return {
    brandLabel: site.name,
    navMain,
    projects,
    user: {
      name: session?.user.name ?? "User",
      email: session?.user.email ?? "",
      avatar: session?.user.image ?? "",
    },
    teams,
    userMenuItems: [],
    onSignOut: () => {
      void signOut()
    },
  }
}
