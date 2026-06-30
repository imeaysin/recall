import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { FileInterceptor } from "@nestjs/platform-express"
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import type { JWTClaims } from "@workspace/auth/types"
import { CurrentUser } from "../../common/decorators"
import { UploadFileCommand } from "./commands/upload-file.command"
import { UploadResponseDto } from "./dto/upload-response.dto"

const MAX_BYTES = 5 * 1024 * 1024

@ApiTags("uploads")
@Controller({ path: "uploads", version: "1" })
export class UploadsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Upload a file (max 5 MB)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"],
    },
  })
  @ApiCreatedResponse({ type: UploadResponseDto })
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: MAX_BYTES, files: 1 } })
  )
  upload(
    @CurrentUser() user: JWTClaims,
    @UploadedFile()
    file?: {
      buffer: Buffer
      originalname: string
      mimetype: string
      size: number
    }
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("File is required")
    }

    return this.commandBus.execute(new UploadFileCommand(user.id, file))
  }
}
