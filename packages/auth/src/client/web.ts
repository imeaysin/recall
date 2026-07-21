import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import {
  getClientPublicEnvSource,
  parseClientPublicEnv,
} from "@workspace/config/client"

const clientEnv = parseClientPublicEnv(getClientPublicEnvSource())

export const authClient = createAuthClient({
  baseURL: clientEnv.authUrl,
  plugins: [adminClient()],
})

export const { useSession, signIn, signOut, signUp } = authClient
