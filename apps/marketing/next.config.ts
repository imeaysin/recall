import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadEnvConfig } from "@next/env"
import type { NextConfig } from "next"

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(rootDir, "../..")

loadEnvConfig(monorepoRoot)

const nextConfig: NextConfig = {
  // Monorepo: trace files from the workspace root when deploying (Next.js + Turborepo).
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
