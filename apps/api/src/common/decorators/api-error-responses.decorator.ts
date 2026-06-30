import { applyDecorators } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { ApiErrorResponseDto } from "../dto/api-error.dto"

/** Standard error responses for authenticated endpoints. */
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

/** Standard error responses for public endpoints. */
export function ApiPublicErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ApiErrorResponseDto,
      description: "Validation failed or malformed data",
    }),
    ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  )
}
