import type { StorageConfig, StorageProvider } from "./types"
import { LocalStorageAdapter } from "./adapters/local"
import { S3StorageAdapter } from "./adapters/s3"

export function createStorage(config: StorageConfig): StorageProvider {
  switch (config.provider) {
    case "local":
      return new LocalStorageAdapter(config)
    case "s3":
      return new S3StorageAdapter(config)
    default: {
      const _exhaustive: never = config
      throw new Error(`Unknown storage provider: ${_exhaustive}`)
    }
  }
}
