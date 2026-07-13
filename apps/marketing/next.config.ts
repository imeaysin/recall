import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadEnvConfig } from "@next/env"
import type { NextConfig } from "next"

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(rootDir, "../..")

loadEnvConfig(monorepoRoot)

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@workspace/ui-shadcn"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.midday.ai",
      },
    ],
  },
}

export default nextConfig
