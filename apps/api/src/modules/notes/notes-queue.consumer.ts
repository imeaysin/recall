import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Job } from "bullmq"
import { createLogger } from "@workspace/logger"
import { jobsEnv } from "@workspace/config/jobs"
import type { NoteJobPayload } from "./notes-cron.producer"

const logger = createLogger("NotesConsumer")

@Processor(jobsEnv.JOBS_QUEUE_NAME)
export class NotesQueueConsumer extends WorkerHost {
  async process(job: Job<NoteJobPayload, void, string>): Promise<void> {
    logger.info(
      { jobId: job.id, name: job.name, data: job.data },
      "Processing note job"
    )

    switch (job.data.type) {
      case "note.created":
        logger.info(job.data, "note created (async side effect)")
        break
      case "note.cron.sync":
        logger.info(job.data, "cron sync executed")
        break
      default:
        logger.warn(job.data as Record<string, unknown>, "Unknown job type")
    }
  }
}
