import { z } from "zod"
import { apiDataResponse } from "./http"

const roleNameSchema = z
  .enum(["guest", "user", "manager", "admin"])
  .describe("Application role")

export const MeResponseSchema = z
  .object({
    id: z.string().describe("User id"),
    email: z.string().describe("Email address"),
    role: roleNameSchema,
    name: z.string().describe("Display name"),
    activeOrganizationId: z
      .string()
      .nullable()
      .optional()
      .describe("Active organization id, when set"),
    organizationRole: z
      .string()
      .nullable()
      .optional()
      .describe("Member role in the active organization"),
  })
  .meta({
    id: "MeResponseDto",
    title: "Current user",
    description: "JWT claims for the authenticated user.",
  })

export const MeApiResponseSchema = apiDataResponse(MeResponseSchema, {
  id: "MeApiResponseDto",
  title: "Current user response",
  description: "Standard API envelope containing the current user.",
})

export const UserResponseSchema = z
  .object({
    id: z.string().describe("User id"),
    name: z.string().describe("Display name"),
    email: z.string().describe("Email address"),
    image: z.string().nullable().describe("Avatar URL"),
    emailVerified: z.boolean().describe("Whether email is verified"),
    createdAt: z.string().describe("ISO-8601 account creation time"),
    updatedAt: z.string().describe("ISO-8601 last profile update time"),
  })
  .meta({
    id: "UserResponseDto",
    title: "User profile",
    description: "Public user profile fields.",
  })

export type MeResponse = z.infer<typeof MeResponseSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
