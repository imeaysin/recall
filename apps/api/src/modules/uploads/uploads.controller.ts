import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import type { JwtClaims } from "@workspace/auth/types"
import { UPLOAD_MAX_BYTES } from "@workspace/contracts"
import {
  CurrentOrganization,
  CurrentUser,
  RequireOrgPermission,
} from "@/common/decorators"
import { ApiAuthErrorResponses } from "@/common/decorators/api-error-responses.decorator"
import {
  UploadApiResponseDto,
  type FileMetadata,
} from "./dto/upload-responses.dto"
import { UploadsService } from "./uploads.service"

@ApiTags("uploads")
@ApiAuthErrorResponses()
@Controller({ path: "uploads", version: "1" })
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @RequireOrgPermission("content", "create")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Upload a file",
    description:
      "Uploads a single file (max 5 MB) for the authenticated user in the active workspace.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Multipart upload with a single `file` field.",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "File to upload (max 5 MB)",
        },
      },
      required: ["file"],
    },
  })
  @ApiCreatedResponse({ type: UploadApiResponseDto })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: UPLOAD_MAX_BYTES, files: 1 },
    })
  )
  upload(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: JwtClaims,
    @UploadedFile()
    file?: FileMetadata
  ) {
    if (!file) {
      throw new Error("File is required")
    }
    return this.uploadsService.uploadFile({
      organizationId,
      userId: user.id,
      file,
    })
  }
}
