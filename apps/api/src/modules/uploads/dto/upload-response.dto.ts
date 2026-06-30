import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

/** OpenAPI shape — response validated with `@workspace/contracts`. */
export class UploadResponseDto {
  @ApiProperty({ example: "user-id/uuid-file.png" })
  path!: string

  @ApiProperty({
    example: "http://localhost:3000/uploads/user-id/uuid-file.png",
  })
  url!: string

  @ApiPropertyOptional()
  etag?: string

  @ApiPropertyOptional()
  contentLength?: number
}
