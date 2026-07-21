import { Controller, Get } from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Session, type UserSession } from "@/common/decorators"
import { ApiAuthErrorResponses } from "@/common/decorators/api-error-responses.decorator"
import { UsersService } from "./users.service"
import { MeApiResponseDto } from "./dto"

@ApiTags("users")
@ApiAuthErrorResponses()
@Controller({ path: "users", version: "1" })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Current user context" })
  @ApiOkResponse({ type: MeApiResponseDto })
  getMe(@Session() session: UserSession) {
    return this.usersService.getCurrentUserContext({ session })
  }
}
