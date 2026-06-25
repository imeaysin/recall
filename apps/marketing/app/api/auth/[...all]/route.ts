import { getAuth } from "@workspace/auth"
import { toNextJsHandler } from "@workspace/auth/nextjs"

const auth = await getAuth()

export const { GET, POST } = toNextJsHandler(auth)
