import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

function findWorkspaceEnvFile(startDir: string): string | null {
  let currentDir = resolve(startDir)

  while (true) {
    const envPath = join(currentDir, ".env")
    if (existsSync(envPath)) return envPath

    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) return null

    currentDir = parentDir
  }
}

function unquoteEnvValue(value: string): string {
  const trimmed = value.trim()
  const quote = trimmed[0]
  const isQuoted =
    (quote === '"' || quote === "'") && trimmed[trimmed.length - 1] === quote

  return isQuoted ? trimmed.slice(1, -1) : trimmed
}

/** Loads the workspace root `.env` into `process.env` (does not override existing vars). */
export function loadRootEnvFile() {
  const envPath =
    findWorkspaceEnvFile(process.cwd()) ?? findWorkspaceEnvFile(__dirname)
  if (!envPath) return

  const envFile = readFileSync(envPath, "utf8")
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    if (!key || process.env[key] !== undefined) continue

    process.env[key] = unquoteEnvValue(trimmed.slice(separatorIndex + 1))
  }
}
