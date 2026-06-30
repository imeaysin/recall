import { Controller, Get } from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Public } from "../../common/decorators"
import { ApiPublicErrorResponses } from "../../common/decorators/api-error-responses.decorator"
import { isDbConnected } from "@workspace/db"
import { env } from "@workspace/config"
import { HealthApiResponseDto } from "./health.dto"

@ApiTags("health")
@ApiPublicErrorResponses()
@Controller({ path: "health", version: "1" })
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({
    summary: "Health check",
    description: "Liveness probe and MongoDB connectivity status.",
  })
  @ApiOkResponse({ type: HealthApiResponseDto })
  check() {
    const dbUp = isDbConnected()

    return {
      status: dbUp ? "ok" : "degraded",
      app: env.APP_NAME,
      db: dbUp ? "up" : "down",
      timestamp: new Date().toISOString(),
    }
  }
}
