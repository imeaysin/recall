import { routeSegments } from "@/config/routes"
import { SignInPage } from "@/features/auth/pages/sign-in-page"
import { SignOutPage } from "@/features/auth/pages/sign-out-page"

export const authRoutes = [
  { path: routeSegments.auth.signIn, element: <SignInPage /> },
  { path: routeSegments.auth.signOut, element: <SignOutPage /> },
]
