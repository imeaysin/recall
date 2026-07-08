import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { createLogger } from "@workspace/logger"
import { jobsEnv } from "@workspace/config/jobs"

export type NoteJobPayload =
  | { type: "note.created"; noteId: string; authorId?: string }
  | { type: "note.cron.sync"; timestamp: string }

@Injectable()
export class NotesCronProducer {
  private readonly logger = createLogger("NotesCronProducer")

  constructor(
    @InjectQueue(jobsEnv.JOBS_QUEUE_NAME)
    private readonly notesQueue: Queue<NoteJobPayload>
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.info("Running notes cron job...")

    await this.notesQueue.add(
      "note.cron.sync",
      {
        type: "note.cron.sync",
        timestamp: new Date().toISOString(),
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      }
    )
  }
}
