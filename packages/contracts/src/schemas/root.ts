import { z } from "zod"
import { apiSuccessResponse } from "../api/envelopes"

export const ApiRootResponseSchema = z
  .object({
    name: z.string().describe("Application name"),
    status: z.literal("ok").describe("API status"),
    docs: z
      .string()
      .optional()
      .describe("Swagger UI path (non-production only)"),
    auth: z.string().describe("Better Auth base path"),
    health: z.string().describe("Health check path"),
  })
  .meta({
    id: "ApiRootResponseDto",
    title: "API root",
    description: "Entry-point metadata for the REST API.",
  })

export const ApiRootApiResponseSchema = apiSuccessResponse(
  ApiRootResponseSchema,
  {
    id: "ApiRootApiResponseDto",
    title: "API root response",
    description: "Standard API envelope containing API metadata.",
  }
)

export type ApiRootResponse = z.infer<typeof ApiRootResponseSchema>
