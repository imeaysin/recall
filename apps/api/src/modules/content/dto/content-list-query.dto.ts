import { ContentListQuerySchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class ContentListQueryDto extends createZodDto(ContentListQuerySchema) {}
