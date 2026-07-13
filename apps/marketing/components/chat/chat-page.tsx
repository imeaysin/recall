"use client"

import { DirectorySection } from "@/components/landing"
import { Icons } from "@workspace/ui-shadcn/components/icons"
import { siteConfig } from "@/config/site"

const chatItems = [
  {
    href: "/chat/imessage",
    label: "iMessage",
    description: `Set up iMessage with ${siteConfig.name}`,
    icon: <Icons.IMessage className="size-10" />,
  },
  {
    href: "/chat/slack",
    label: "Slack",
    description: `Set up Slack with ${siteConfig.name}`,
    icon: <Icons.Slack className="size-10" />,
  },
  {
    href: "/chat/whatsapp",
    label: "WhatsApp",
    description: `Set up WhatsApp with ${siteConfig.name}`,
    icon: <Icons.WhatsApp className="size-10 text-[#25D366]" />,
    iconClassName: "hover:text-[#25D366]",
  },
  {
    href: "/chat/telegram",
    label: "Telegram",
    description: `Set up Telegram with ${siteConfig.name}`,
    icon: <Icons.Telegram className="size-10" />,
  },
]

export function ChatPage() {
  return (
    <DirectorySection
      description={`Get invoices paid, track time, manage expenses — right from the messaging apps you already use with ${siteConfig.name}.`}
      eyebrow="Chat"
      items={chatItems}
      title="Run your business from iMessage, WhatsApp, Slack & Telegram"
    />
  )
}
