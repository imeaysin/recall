"use client"

import { useAuthSession, useAuthUiConfig } from "@workspace/auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui-shadcn/components/form"
import { Input } from "@workspace/ui-shadcn/components/input"
import { AuthBrandLogo } from "../auth-brand-logo"
import { DefaultAuthLink, type AuthLinkComponent } from "../auth-shell"
import { AuthPageBody } from "../auth-form"
import { AuthPageHeader } from "../auth-page-header"
import { AuthUserView } from "../auth-user-view"

/**
 * @description Schema & types
 */

const workspaceOnboardingSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required.")
    .max(100, "Workspace name must be 100 characters or fewer."),
})

type WorkspaceOnboardingValues = z.infer<typeof workspaceOnboardingSchema>

/**
 * @description Public types
 */

export type WorkspaceOnboardingProps = {
  onSubmit: (values: WorkspaceOnboardingValues) => Promise<void> | void
  onSignOut?: () => void
  homeHref?: string
  linkComponent?: AuthLinkComponent
  title?: string
  description?: string
  submitLabel?: string
}

/**
 * @description WorkspaceOnboarding
 */

export function WorkspaceOnboarding({
  onSubmit,
  onSignOut,
  homeHref = "/",
  linkComponent: Link = DefaultAuthLink,
  title = "Create your workspace",
  description = "Pick a name to get started. You can invite teammates later.",
  submitLabel = "Continue",
}: WorkspaceOnboardingProps) {
  const config = useAuthUiConfig()
  const { data: session } = useAuthSession()

  const form = useForm<WorkspaceOnboardingValues>({
    resolver: zodResolver(workspaceOnboardingSchema),
    defaultValues: { name: "" },
  })

  const isSubmitting = form.formState.isSubmitting

  function handleSignOut() {
    if (onSignOut) {
      onSignOut()
      return
    }
    config.navigate(config.routes.signOut)
  }

  async function handleSubmit(values: WorkspaceOnboardingValues) {
    await onSubmit(values)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 md:px-6">
        <Link
          className="flex items-center transition-opacity hover:opacity-80"
          href={homeHref}
        >
          <AuthBrandLogo />
        </Link>
        <Button
          className="text-muted-foreground"
          onClick={handleSignOut}
          type="button"
          variant="ghost"
        >
          Sign out
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-sm">
          <AuthPageBody
            footer={
              session?.user?.email ? (
                <p className="text-xs text-muted-foreground">
                  Signed in as {session.user.email}.{" "}
                  <Button
                    className="h-auto p-0 text-xs"
                    onClick={handleSignOut}
                    type="button"
                    variant="link"
                  >
                    Use a different account
                  </Button>
                </p>
              ) : null
            }
          >
            <AuthPageHeader description={description} title={title} />

            {session?.user ? (
              <AuthUserView className="justify-center" user={session.user} />
            ) : null}

            <Form {...form}>
              <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoFocus
                          disabled={isSubmitting}
                          placeholder="Acme Inc."
                          type="text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                  {submitLabel}
                </Button>
              </form>
            </Form>
          </AuthPageBody>
        </div>
      </main>
    </div>
  )
}
