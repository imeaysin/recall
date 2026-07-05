import type { FileMetadata } from "../uploads.dto"
export class UploadFileCommand {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly file?: FileMetadata
  ) {}
}
