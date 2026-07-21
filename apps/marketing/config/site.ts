import { productConfig } from "@workspace/config/public"
import { env } from "@/config/env"

export const siteConfig = {
  name: env.appName,
  shortName: productConfig.shortName,
  legalName: productConfig.legalName,
  tagline: productConfig.tagline,
  description: productConfig.description,
  url: productConfig.siteUrl,
  apiUrl: env.apiUrl,
  authUrl: env.authUrl,
} as const
