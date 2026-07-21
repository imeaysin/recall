/**
 * Nest registers callbacks here so Better Auth user-delete hooks can emit
 * domain events without coupling createAuth() to Nest DI.
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
