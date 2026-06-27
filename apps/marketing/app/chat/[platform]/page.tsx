import type { Metadata } from "next"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { GuideSection } from "@workspace/ui/landing"
import { Icons } from "@workspace/ui/components/icons"
import { siteConfig } from "@/config/site"
import {
  chatPlatformSlugs,
  chatPlatforms,
  type ChatPlatformSlug,
} from "@/data/chat-platforms"
import { toGuidePage } from "@/lib/chat-guide"
import { createMarketingMetadata } from "@/lib/metadata"

interface PageProps {
  params: Promise<{ platform: string }>
}

const platformIcons: Record<ChatPlatformSlug, ReactNode> = {
  imessage: <Icons.IMessage className="size-10" />,
  slack: <Icons.Slack className="size-10" />,
  whatsapp: <Icons.WhatsApp className="size-10 text-[#25D366]" />,
  telegram: <Icons.Telegram className="size-10" />,
}

export function generateStaticParams() {
  return chatPlatformSlugs.map((platform) => ({ platform }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { platform } = await params
  const config = chatPlatforms[platform as ChatPlatformSlug]
  if (!config) return {}

  return createMarketingMetadata({
    title: `${siteConfig.name} for ${config.name}`,
    description: config.description,
    path: `/chat/${platform}`,
    og: {
      title: `${siteConfig.name} for ${config.name}`,
      description: `Your business, right in ${config.name}`,
    },
  })
}

export default async function ChatPlatformPage({ params }: PageProps) {
  const { platform } = await params
  const config = chatPlatforms[platform as ChatPlatformSlug]
  if (!config) notFound()

  return (
    <GuideSection
      page={toGuidePage(config, platformIcons[platform as ChatPlatformSlug])}
    />
  )
}
