import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UploadResponseSchema, type UploadResponse } from "@workspace/contracts"
import { FileErrorCode } from "@workspace/contracts"
import { apiBadRequest } from "@/common/exceptions/api.exception"
import { StorageRepository } from "../repositories/storage.repository"
import { UploadFileCommand } from "./upload-file.command"

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
  constructor(private readonly storageRepository: StorageRepository) {}

  async execute(command: UploadFileCommand): Promise<UploadResponse> {
    const { organizationId, userId, file } = command
    if (!file?.buffer?.length) {
      apiBadRequest("File is required", FileErrorCode.REQUIRED)
    }

    const result = await this.storageRepository.uploadUserFile({
      organizationId,
      userId,
      file,
    })

    return UploadResponseSchema.parse(result)
  }
}
