"use client"

import {
  useAuthUiConfig,
  useListAccounts,
  useRequestPasswordReset,
  useAuthSession,
} from "@workspace/auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui-shadcn/components/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui-shadcn/components/form"
import { PasswordInput } from "@workspace/ui-shadcn/components/password-input"
import { Skeleton } from "@workspace/ui-shadcn/components/skeleton"
import { toast } from "@workspace/ui-shadcn/components/sonner"
import { cn } from "@workspace/ui-shadcn/lib/utils"

/**
 * @description Schema & types
 */

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

/**
 * @description Public types
 */

export type ChangePasswordProps = {
  className?: string
  onSubmit?: (values: ChangePasswordValues) => Promise<void> | void
  isPending?: boolean
}

// Kept for backward-compatible re-export only — consumers should use ChangePasswordProps.
export type ChangePasswordFormProps = ChangePasswordProps

/**
 * @description Public component — routes to SetPassword or ChangePasswordForm
 */

export function ChangePassword({
  className,
  onSubmit,
  isPending = false,
}: ChangePasswordProps) {
  const { data: session, isPending: isSessionPending } = useAuthSession()
  const { data: accounts, isPending: isAccountsPending } = useListAccounts()

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )

  if (!isAccountsPending && !hasCredentialAccount) {
    return <SetPassword className={className} />
  }

  return (
    <ChangePasswordForm
      className={className}
      onSubmit={onSubmit}
      isPending={isPending}
      hasSession={!isAccountsPending && !isSessionPending && !!session}
    />
  )
}

/**
 * @description SetPassword — shown when the user has no credential account (social only)
 */

function SetPassword({ className }: { className?: string }) {
  const config = useAuthUiConfig()
  const { data: session } = useAuthSession()
  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset()

  function handleSetPassword() {
    if (!session?.user.email) return
    requestPasswordReset(
      {
        email: session.user.email,
        redirectTo: config.absoluteAppUrl(config.routes.resetPassword),
      },
      {
        onSuccess: () => {
          toast.success("Password reset email sent", {
            description: "A reset link has been sent to your email.",
          })
        },
        onError: () => {
          toast.error("Could not send reset link", {
            description: "Please try again.",
          })
        },
      }
    )
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          You signed in with a social account. Set a password to also sign in
          with email.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm leading-tight font-medium">Set a password</p>
        </div>

        <Button
          className="shrink-0"
          disabled={!session?.user.email || isPending}
          onClick={handleSetPassword}
          size="sm"
          type="button"
        >
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          Send reset link
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * @description ChangePasswordForm — shown when the user already has a credential account
 */

function ChangePasswordForm({
  className,
  onSubmit,
  isPending = false,
  hasSession = false,
}: ChangePasswordProps & { hasSession?: boolean }) {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting || isPending

  async function handleSubmit(values: ChangePasswordValues) {
    await onSubmit?.(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className={cn(className)}>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  {hasSession ? (
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        placeholder="Enter your current password"
                      />
                    </FormControl>
                  ) : (
                    <Skeleton className="h-9 w-full rounded-md" />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  {hasSession ? (
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        placeholder="Enter a new password"
                      />
                    </FormControl>
                  ) : (
                    <Skeleton className="h-9 w-full rounded-md" />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  {hasSession ? (
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        placeholder="Confirm your new password"
                      />
                    </FormControl>
                  ) : (
                    <Skeleton className="h-9 w-full rounded-md" />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              disabled={!hasSession || !onSubmit || isSubmitting}
              size="sm"
              type="submit"
            >
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Update password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
