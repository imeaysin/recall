import { Injectable } from "@nestjs/common"
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

@Injectable()
export class ContentTempFileStore {
  private readonly rootDir = join(tmpdir(), "cognivault-content")

  async savePdf(input: {
    readonly contentId: string
    readonly buffer: Buffer
  }): Promise<void> {
    await mkdir(this.rootDir, { recursive: true })
    await writeFile(this.pathFor(input.contentId), input.buffer)
  }

  async takePdf(contentId: string): Promise<Buffer | null> {
    const path = this.pathFor(contentId)
    try {
      const buffer = await readFile(path)
      await unlink(path).catch(() => undefined)
      return buffer
    } catch {
      return null
    }
  }

  async discard(contentId: string): Promise<void> {
    await unlink(this.pathFor(contentId)).catch(() => undefined)
  }

  private pathFor(contentId: string): string {
    return join(this.rootDir, `${contentId}.pdf`)
  }
}
