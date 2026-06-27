export const paths = {
  home: "/",
  dashboard: "/dashboard",
  admin: "/admin",
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    signOut: "/auth/sign-out",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
    twoFactor: "/auth/two-factor",
    settings: "/auth/settings",
  },
} as const
