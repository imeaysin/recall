import { ApiProperty } from "@nestjs/swagger"

/** OpenAPI shape — validation uses `@workspace/contracts`. */
export class BulkDeleteNotesDto {
  @ApiProperty({
    example: ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"],
    type: [String],
  })
  ids!: string[]
}
