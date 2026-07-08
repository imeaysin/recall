import { Test, type TestingModule } from "@nestjs/testing"
import { ObjectId } from "mongodb"
import type { NoteResponse } from "@workspace/contracts"
import { getQueueToken } from "@nestjs/bullmq"
import { jobsEnv } from "@workspace/config/jobs"
import { CreateNoteHandler } from "@/modules/notes/commands/create-note.handler"
import { CreateNoteCommand } from "@/modules/notes/commands/create-note.command"
import { NotesRepository } from "@/modules/notes/repositories/notes.repository"

describe("CreateNoteHandler", () => {
  let handler: CreateNoteHandler
  let repository: { insert: jest.Mock }
  let jobQueue: { add: jest.Mock }

  beforeEach(async () => {
    repository = { insert: jest.fn() }
    jobQueue = { add: jest.fn() }

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateNoteHandler,
        { provide: NotesRepository, useValue: repository },
        { provide: getQueueToken(jobsEnv.JOBS_QUEUE_NAME), useValue: jobQueue },
      ],
    }).compile()

    handler = moduleRef.get(CreateNoteHandler)
  })

  it("inserts a note scoped to workspace and user", async () => {
    const now = new Date("2026-01-01T00:00:00.000Z")
    const noteId = new ObjectId("507f1f77bcf86cd799439011")
    const created = {
      _id: noteId,
      organizationId: "org-1",
      userId: "user-1",
      title: "Hello",
      body: "World",
      createdAt: now,
      updatedAt: now,
    }
    repository.insert.mockResolvedValue(created)

    const result = await handler.execute(
      new CreateNoteCommand("org-1", "user-1", {
        title: "Hello",
        body: "World",
      })
    )

    expect(repository.insert).toHaveBeenCalledWith({
      organizationId: "org-1",
      userId: "user-1",
      title: "Hello",
      body: "World",
    })
    expect(result).toEqual({
      id: noteId.toString(),
      organizationId: "org-1",
      userId: "user-1",
      title: "Hello",
      body: "World",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    } satisfies NoteResponse)
    expect(jobQueue.add).toHaveBeenCalledWith(
      "note.created",
      {
        type: "note.created",
        noteId: noteId.toString(),
        authorId: "user-1",
      },
      expect.any(Object)
    )
  })
})
