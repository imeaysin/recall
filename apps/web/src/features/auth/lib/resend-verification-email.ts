import { authClient } from "@workspace/auth/client"
import { routes } from "@/config/routes"
import { buildAuthCallback } from "@/features/auth/lib/auth-callback"

/** OAuth accounts are verified by the provider; this is a no-op compatibility shim. */
export async function resendVerificationEmail(_email: string): Promise<void> {
  await authClient.getSession()
  void buildAuthCallback(routes.signIn)
}
