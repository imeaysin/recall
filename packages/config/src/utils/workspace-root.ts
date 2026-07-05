import { existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

export function findWorkspaceRoot(startDir = process.cwd()): string {
  let currentDir = resolve(startDir)

  while (true) {
    if (
      existsSync(join(currentDir, "pnpm-workspace.yaml")) ||
      existsSync(join(currentDir, ".env"))
    ) {
      return currentDir
    }

    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) return resolve(startDir)
    currentDir = parentDir
  }
}
