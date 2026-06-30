import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, mergeConfig } from "vitest/config"
import react from "@workspace/vitest-config/react"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default mergeConfig(
  react,
  defineConfig({
    resolve: {
      alias: {
        "@": rootDir,
      },
    },
    test: {
      include: ["**/*.test.ts", "**/*.test.tsx"],
    },
  })
)
