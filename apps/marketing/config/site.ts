import { env } from "@workspace/config"
import { clientDefaults, DEFAULT_APP_NAME } from "@workspace/config/client"

export const site = {
  name: env.APP_NAME ?? DEFAULT_APP_NAME,
  description:
    "Full-stack monorepo template with auth, API, web app, and mobile.",
  clientUrl: env.CLIENT_URL ?? clientDefaults.clientUrl,
  githubUrl: process.env.GITHUB_REPO_URL,
} as const
