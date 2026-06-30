import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadEnvConfig } from "@next/env"
import type { NextConfig } from "next"

const rootDir = path.dirname(fileURLToPath(import.meta.url))
loadEnvConfig(path.join(rootDir, "../.."))

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
