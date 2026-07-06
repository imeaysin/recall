import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { ObjectId } from "mongodb"
import { DeleteNoteHandler } from "@/modules/notes/commands/delete-note.handler"
import { DeleteNoteCommand } from "@/modules/notes/commands/delete-note.command"
import { assertNoteAccessOrThrow } from "@/modules/notes/notes-access.util"
import { NotesRepository } from "@/modules/notes/repositories/notes.repository"

describe("DeleteNoteHandler", () => {
  let handler: DeleteNoteHandler
  let repository: {
    delete: jest.Mock
    findById: jest.Mock
    rejectMutationMiss: jest.Mock
  }

  beforeEach(async () => {
    repository = {
      delete: jest.fn(),
      findById: jest.fn(),
      rejectMutationMiss: jest.fn(async (scope) => {
        const existing = await repository.findById(scope.noteId)
        assertNoteAccessOrThrow(existing, scope.organizationId)
      }),
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteNoteHandler,
        { provide: NotesRepository, useValue: repository },
      ],
    }).compile()

    handler = moduleRef.get(DeleteNoteHandler)
  })

  it("deletes when the note belongs to the user in the workspace", async () => {
    repository.delete.mockResolvedValue(true)

    await expect(
      handler.execute(new DeleteNoteCommand("org-1", "user-1", "note-1"))
    ).resolves.toBeUndefined()

    expect(repository.findById).not.toHaveBeenCalled()
  })

  it("throws 404 when the note does not exist", async () => {
    repository.delete.mockResolvedValue(false)
    repository.findById.mockResolvedValue(null)

    await expect(
      handler.execute(new DeleteNoteCommand("org-1", "user-1", "note-1"))
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it("throws 404 when the note belongs to another workspace", async () => {
    repository.delete.mockResolvedValue(false)
    repository.findById.mockResolvedValue({
      _id: new ObjectId("507f1f77bcf86cd799439011"),
      organizationId: "org-2",
      userId: "user-1",
      title: "t",
      body: "b",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await expect(
      handler.execute(new DeleteNoteCommand("org-1", "user-1", "note-1"))
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it("throws 403 when the note belongs to another user in the same workspace", async () => {
    repository.delete.mockResolvedValue(false)
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
      handler.execute(new DeleteNoteCommand("org-1", "user-1", "note-1"))
    ).rejects.toBeInstanceOf(ForbiddenException)
  })
})
