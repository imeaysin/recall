import { useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  TwoFactorInput,
} from "@workspace/contracts"
import { authClient } from "@/lib/auth"

export const authQueryKeys = {
  session: ["auth", "session"] as const,
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const { data, error } = await authClient.signIn.email(input)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
    },
  })
}

export function useSignUpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      const { data, error } = await authClient.signUp.email({
        email: input.email,
        password: input.password,
        name: input.name,
        callbackURL: `${window.location.origin}/auth/verify-email`,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut()
      if (error) throw error
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("__ba_jwt")
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
    },
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (input: ForgotPasswordInput) => {
      const { data, error } = await authClient.requestPasswordReset({
        email: input.email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      return data
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async ({
      input,
      token,
    }: {
      input: ResetPasswordInput
      token: string
    }) => {
      const { data, error } = await authClient.resetPassword({
        newPassword: input.password,
        token,
      })
      if (error) throw error
      return data
    },
  })
}

export function useVerifyTotpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TwoFactorInput) => {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: input.code,
        trustDevice: true,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
    },
  })
}

export function useSendVerificationEmailMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/auth/verify-email`,
      })
      if (error) throw error
      return data
    },
  })
}
