import { z } from "zod"
import { apiDataResponse } from "./http"

export const HealthResponseSchema = z
  .object({
    status: z.enum(["ok", "degraded"]).describe("Overall service status"),
    app: z.string().describe("Application name"),
    db: z.enum(["up", "down"]).describe("MongoDB connectivity"),
    timestamp: z.string().describe("ISO-8601 check timestamp"),
  })
  .meta({
    id: "HealthResponseDto",
    title: "Health check",
    description: "Liveness and dependency status.",
  })

export const HealthApiResponseSchema = apiDataResponse(HealthResponseSchema, {
  id: "HealthApiResponseDto",
  title: "Health check response",
  description: "Standard API envelope containing health status.",
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>
