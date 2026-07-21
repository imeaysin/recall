import { routes } from "@/config/routes"

export type SignInFeedback = {
  readonly message: string
}

export function resolveSignInFeedback(error: {
  readonly code?: string
  readonly message?: string
}): SignInFeedback {
  if (error.code === "EMAIL_NOT_VERIFIED") {
    return {
      message: "Complete OAuth sign-in to verify your account.",
    }
  }

  return {
    message: error.message ?? "Sign-in failed. Try again.",
  }
}

export function buildVerifyEmailHref(_email: string): string {
  return routes.signIn
}
