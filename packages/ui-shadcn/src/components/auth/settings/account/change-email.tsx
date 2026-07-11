"use client"

import { useAuthSession } from "@workspace/auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import {
  Card,
  CardContent,
  CardFooter,
} from "@workspace/ui-shadcn/components/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui-shadcn/components/form"
import { Input } from "@workspace/ui-shadcn/components/input"
import { Skeleton } from "@workspace/ui-shadcn/components/skeleton"
import { cn } from "@workspace/ui-shadcn/lib/utils"

const changeEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
})

type ChangeEmailValues = z.infer<typeof changeEmailSchema>

export type ChangeEmailProps = {
  className?: string
  onSubmit?: (values: ChangeEmailValues) => Promise<void> | void
  isPending?: boolean
}

export function ChangeEmail({
  className,
  onSubmit,
  isPending = false,
}: ChangeEmailProps) {
  const { data: session, isPending: isSessionPending } = useAuthSession()

  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: "" },
  })

  useEffect(() => {
    if (session?.user) {
      form.reset({ email: session.user.email ?? "" })
    }
  }, [session?.user, form])

  const isSubmitting = form.formState.isSubmitting || isPending
  const hasSession = !isSessionPending && !!session

  async function handleSubmit(values: ChangeEmailValues) {
    await onSubmit?.(values)
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Change email</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card className={cn(className)}>
            <CardContent className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    {hasSession ? (
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="email"
                          disabled={isSubmitting}
                          placeholder="you@example.com"
                          type="email"
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
                Update email
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
