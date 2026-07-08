import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"

const { auth } = routeSegments

export const authRoutes: RouteObject[] = [
  {
    path: auth.signIn,
    async lazy() {
      const { SignInPage } = await import("@/features/auth/pages/sign-in-page")
      return { Component: SignInPage }
    },
  },
  {
    path: auth.signUp,
    async lazy() {
      const { SignUpPage } = await import("@/features/auth/pages/sign-up-page")
      return { Component: SignUpPage }
    },
  },
  {
    path: auth.signOut,
    async lazy() {
      const { SignOutPage } =
        await import("@/features/auth/pages/sign-out-page")
      return { Component: SignOutPage }
    },
  },
  {
    path: auth.forgotPassword,
    async lazy() {
      const { ForgotPasswordPage } =
        await import("@/features/auth/pages/forgot-password-page")
      return { Component: ForgotPasswordPage }
    },
  },
  {
    path: auth.resetPassword,
    async lazy() {
      const { ResetPasswordPage } =
        await import("@/features/auth/pages/reset-password-page")
      return { Component: ResetPasswordPage }
    },
  },
  {
    path: auth.verifyEmail,
    async lazy() {
      const { VerifyEmailPage } =
        await import("@/features/auth/pages/verify-email-page")
      return { Component: VerifyEmailPage }
    },
  },
  {
    path: auth.twoFactor,
    async lazy() {
      const { TwoFactorPage } =
        await import("@/features/auth/pages/two-factor-page")
      return { Component: TwoFactorPage }
    },
  },
]
