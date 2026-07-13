import {
  clientDefaults,
  DEFAULT_APP_NAME,
  DEV_ALLOWED_ORIGINS,
} from "@workspace/config/client"
import { env } from "./env"

export const siteConfig = {
  name: env.appName ?? DEFAULT_APP_NAME,
  description:
    "Full-stack monorepo template with auth, API, web app, and mobile.",
  clientUrl: process.env.CLIENT_URL || clientDefaults.clientUrl,
  githubUrl: process.env.GITHUB_REPO_URL || "https://github.com",
  trialNote: "Start your free 14-day trial.",
  tagline: "The fastest way to build full-stack apps.",
  legalEntity: "Theo, Inc.",
  supportEmail: "support@example.com",
  dmcaEmail: "dmca@example.com",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || DEV_ALLOWED_ORIGINS).split(
    ","
  ),
} as const
