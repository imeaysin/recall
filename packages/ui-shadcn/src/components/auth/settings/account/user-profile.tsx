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

const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
})

type UserProfileValues = z.infer<typeof userProfileSchema>

export type UserProfileProps = {
  className?: string
  onSubmit?: (values: UserProfileValues) => Promise<void> | void
  isPending?: boolean
}

export function UserProfile({
  className,
  onSubmit,
  isPending = false,
}: UserProfileProps) {
  const { data: session, isPending: isSessionPending } = useAuthSession()

  const form = useForm<UserProfileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: { name: "" },
  })

  useEffect(() => {
    if (session?.user) {
      form.reset({ name: session.user.name ?? "" })
    }
  }, [session?.user, form])

  const isSubmitting = form.formState.isSubmitting || isPending
  const hasSession = !isSessionPending && !!session

  async function handleSubmit(values: UserProfileValues) {
    await onSubmit?.(values)
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Profile</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card className={cn(className)}>
            <CardContent className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    {hasSession ? (
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="name"
                          disabled={isSubmitting}
                          placeholder="Your name"
                          type="text"
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
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
