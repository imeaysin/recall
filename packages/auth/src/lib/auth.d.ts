import type { Auth as BetterAuthInstance } from "better-auth"

export declare function createAuth(): BetterAuthInstance
export declare function getAuth(): Promise<BetterAuthInstance>
export type Auth = BetterAuthInstance
