import { Injectable } from "@nestjs/common"
import { UploadResponseSchema, type UploadResponse } from "@workspace/contracts"
import { UploadCommandRepository, type UploadUserFileInput } from "./repository"
import {
  UploadForbiddenException,
  UploadBadRequestException,
} from "./domain/exceptions"

@Injectable()
export class UploadsService {
  constructor(private readonly uploadRepo: UploadCommandRepository) {}

  async uploadFile(input: UploadUserFileInput): Promise<UploadResponse> {
    if (input.file.size > 10 * 1024 * 1024) {
      throw new UploadForbiddenException("File too large")
    }

    if (!input.file?.buffer?.length) {
      throw new UploadBadRequestException("File is required")
    }

    const result = await this.uploadRepo.uploadUserFile(input)

    return UploadResponseSchema.parse(result)
  }
}
