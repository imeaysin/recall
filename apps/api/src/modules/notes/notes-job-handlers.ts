import { createLogger } from "@workspace/logger"
import type { JobQueue } from "@workspace/jobs"

const logger = createLogger("NotesJobs")

export function registerNotesJobHandlers(queue: JobQueue) {
  queue.register("note.created", (payload) => {
    logger.info(payload, "note created (async side effect)")
  })
}
