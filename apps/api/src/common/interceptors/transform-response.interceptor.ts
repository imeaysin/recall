import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import type { ApiSuccessResponse } from "@workspace/contracts"
import type { Response } from "express"
import { Observable, map } from "rxjs"

const DEFAULT_SUCCESS_MESSAGE = "Operation completed successfully"

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiSuccessResponse<unknown> | undefined> {
    if (context.getType() !== "http") return next.handle()

    const response = context.switchToHttp().getResponse<Response>()

    return next.handle().pipe(
      map((data) => {
        if (response.statusCode === 204) return undefined
        if (response.headersSent || response.writableEnded) return data

        return {
          success: true as const,
          statusCode: response.statusCode,
          message: DEFAULT_SUCCESS_MESSAGE,
          data,
          timestamp: new Date().toISOString(),
        }
      })
    )
  }
}
