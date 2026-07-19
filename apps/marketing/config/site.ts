import { productConfig } from "@workspace/config/public"

export const siteConfig = {
  name: productConfig.name,
  shortName: productConfig.shortName,
  legalName: productConfig.legalName,
  tagline: productConfig.tagline,
  description: productConfig.description,
  url: productConfig.siteUrl,
} as const
