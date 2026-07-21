/**
 * Jest stub — real Better Auth Nest wiring is mocked via @workspace/auth/nestjs.
 * Lifecycle hooks are no-ops in e2e unless a test registers a handler.
 */
export type UserDeletedHandler = (userId: string) => Promise<void>

export const authLifecycleHooks: {
  onUserDeleted: UserDeletedHandler | null
} = {
  onUserDeleted: null,
}

export function setAuthUserDeletedHandler(
  handler: UserDeletedHandler | null
): void {
  authLifecycleHooks.onUserDeleted = handler
}
