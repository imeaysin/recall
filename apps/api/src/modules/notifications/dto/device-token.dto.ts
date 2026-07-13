import {
  RegisterDeviceTokenSchema,
  UnregisterDeviceTokenSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class RegisterDeviceTokenDto extends createZodDto(
  RegisterDeviceTokenSchema
) {}

export class UnregisterDeviceTokenDto extends createZodDto(
  UnregisterDeviceTokenSchema
) {}
