import { Inject, Injectable } from "@nestjs/common"
import type { StorageProvider, StorageUploadResult } from "@workspace/storage"
import { randomUUID } from "node:crypto"
import { STORAGE } from "../../../common/storage/storage.module"

export type UploadUserFileInput = {
  organizationId: string
  userId: string
  file: {
    buffer: Buffer
    originalname: string
    mimetype: string
    size: number
  }
}

@Injectable()
export class StorageRepository {
  constructor(@Inject(STORAGE) private readonly storage: StorageProvider) {}

  uploadUserFile(input: UploadUserFileInput): Promise<StorageUploadResult> {
    const { organizationId, userId, file } = input
    const safeName = file.originalname.replace(/[^\w.-]+/g, "_").slice(0, 120)
    const path = `${organizationId}/${userId}/${randomUUID()}-${safeName}`

    return this.storage.upload({
      path,
      body: file.buffer,
      contentType: file.mimetype || "application/octet-stream",
      contentLength: file.size,
    })
  }
}
