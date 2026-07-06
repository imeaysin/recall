import { applyDecorators } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { ApiErrorResponseDto } from "@/common/dto/api-error.dto"

export function ApiAuthErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ApiErrorResponseDto,
      description: "Validation failed or malformed data",
    }),
    ApiUnauthorizedResponse({ type: ApiErrorResponseDto }),
    ApiForbiddenResponse({ type: ApiErrorResponseDto }),
    ApiNotFoundResponse({ type: ApiErrorResponseDto }),
    ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  )
}

export function ApiPublicErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ApiErrorResponseDto,
      description: "Validation failed or malformed data",
    }),
    ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  )
}
