import { Global, Module } from "@nestjs/common"
import { resolveStorageLocalPath, storageEnv } from "@workspace/config/storage"
import { createStorage, type StorageProvider } from "@workspace/storage"
import { STORAGE } from "./storage.constants"

function createStorageProvider(): StorageProvider {
  if (storageEnv.STORAGE_PROVIDER === "s3") {
    return createStorage({
      provider: "s3",
      bucket: storageEnv.STORAGE_S3_BUCKET,
      region: storageEnv.STORAGE_S3_REGION,
      endpoint: storageEnv.STORAGE_S3_ENDPOINT,
      accessKeyId: storageEnv.STORAGE_S3_ACCESS_KEY_ID,
      secretAccessKey: storageEnv.STORAGE_S3_SECRET_ACCESS_KEY,
      baseUrl: storageEnv.STORAGE_S3_BASE_URL,
    })
  }

  return createStorage({
    provider: "local",
    basePath: resolveStorageLocalPath(),
    baseUrl: storageEnv.STORAGE_LOCAL_URL,
  })
}

@Global()
@Module({
  providers: [{ provide: STORAGE, useFactory: createStorageProvider }],
  exports: [STORAGE],
})
export class StorageModule {}
