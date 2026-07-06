import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { ObjectId } from "mongodb"
import type { NoteResponse } from "@workspace/contracts"
import { UpdateNoteHandler } from "@/modules/notes/commands/update-note.handler"
import { UpdateNoteCommand } from "@/modules/notes/commands/update-note.command"
import { assertNoteAccessOrThrow } from "@/modules/notes/notes-access.util"
import { NotesRepository } from "@/modules/notes/repositories/notes.repository"

describe("UpdateNoteHandler", () => {
  let handler: UpdateNoteHandler
  let repository: {
    update: jest.Mock
    findById: jest.Mock
    rejectMutationMiss: jest.Mock
  }

  beforeEach(async () => {
    repository = {
      update: jest.fn(),
      findById: jest.fn(),
      rejectMutationMiss: jest.fn(async (scope) => {
        const existing = await repository.findById(scope.noteId)
        assertNoteAccessOrThrow(existing, scope.organizationId)
      }),
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateNoteHandler,
        { provide: NotesRepository, useValue: repository },
      ],
    }).compile()

    handler = moduleRef.get(UpdateNoteHandler)
  })

  it("updates and returns the note when scoped correctly", async () => {
    const now = new Date("2026-01-01T00:00:00.000Z")
    const noteId = new ObjectId("507f1f77bcf86cd799439011")
    const updated = {
      _id: noteId,
      organizationId: "org-1",
      userId: "user-1",
      title: "Updated",
      body: "Body",
      createdAt: now,
      updatedAt: now,
    }
    repository.update.mockResolvedValue(updated)

    const result = await handler.execute(
      new UpdateNoteCommand("org-1", "user-1", "note-1", {
        title: "Updated",
      })
    )

    expect(repository.findById).not.toHaveBeenCalled()
    expect(result).toEqual({
      id: noteId.toString(),
      organizationId: "org-1",
      userId: "user-1",
      title: "Updated",
      body: "Body",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    } satisfies NoteResponse)
  })

  it("throws 404 when the note does not exist", async () => {
    repository.update.mockResolvedValue(null)
    repository.findById.mockResolvedValue(null)

    await expect(
      handler.execute(
        new UpdateNoteCommand("org-1", "user-1", "note-1", { title: "x" })
      )
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it("throws 403 when the note belongs to another user in the same workspace", async () => {
    repository.update.mockResolvedValue(null)
    repository.findById.mockResolvedValue({
      _id: new ObjectId("507f1f77bcf86cd799439011"),
      organizationId: "org-1",
      userId: "user-2",
      title: "t",
      body: "b",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await expect(
      handler.execute(
        new UpdateNoteCommand("org-1", "user-1", "note-1", { title: "x" })
      )
    ).rejects.toBeInstanceOf(ForbiddenException)
  })
})
