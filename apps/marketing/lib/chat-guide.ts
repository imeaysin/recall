import type { ReactNode } from "react"
import type { GuidePageData } from "@workspace/ui/landing"
import { siteConfig } from "@/config/site"
import { marketingEnv } from "@/config/env"
import type { ChatPlatformConfig } from "@/data/chat-platforms"

export function toGuidePage(
  config: ChatPlatformConfig,
  icon: ReactNode,
  appUrl = marketingEnv.appUrl
): GuidePageData {
  return {
    backLink: { href: "/chat", label: "All platforms" },
    icon,
    title: config.name,
    description: config.description,
    steps: config.steps.map((step) => ({
      title: step.title,
      description: step.description,
      linkHref:
        step.href ??
        (config.slug === "whatsapp"
          ? `${appUrl}/apps?app=whatsapp`
          : undefined),
      linkLabel:
        step.href || config.slug === "whatsapp"
          ? `Open in ${siteConfig.name}`
          : undefined,
    })),
    lists: [
      {
        title: "Notifications",
        intro: "Once connected, you'll receive notifications for:",
        items: config.notifications,
        footer: `All notifications are on by default. To manage them, go to ${config.settingsPath} in ${siteConfig.name}.`,
      },
      {
        title: "What you can do",
        items: config.capabilities,
      },
    ],
  }
}
