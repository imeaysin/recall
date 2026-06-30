import { Inject, Injectable } from "@nestjs/common"
import type { StorageProvider, StorageUploadResult } from "@workspace/storage"
import { STORAGE } from "../../../common/storage/storage.module"

@Injectable()
export class StorageRepository {
  constructor(@Inject(STORAGE) private readonly storage: StorageProvider) {}

  upload(input: {
    path: string
    body: Buffer
    contentType: string
    contentLength: number
  }): Promise<StorageUploadResult> {
    return this.storage.upload(input)
  }
}
