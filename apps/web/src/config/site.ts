import { env } from "@/config/env"

export const site = {
  name: env.appName,
  description: "Theo web application",
} as const
