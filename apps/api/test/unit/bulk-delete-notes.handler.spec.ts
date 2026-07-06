import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { ObjectId } from "mongodb"
import { BulkDeleteNotesHandler } from "@/modules/notes/commands/bulk-delete-notes.handler"
import { BulkDeleteNotesCommand } from "@/modules/notes/commands/bulk-delete-notes.command"
import { assertNoteAccessOrThrow } from "@/modules/notes/notes-access.util"
import type { BulkNoteMutationScope } from "@/modules/notes/note.scope"
import { NotesRepository } from "@/modules/notes/repositories/notes.repository"

describe("BulkDeleteNotesHandler", () => {
  let handler: BulkDeleteNotesHandler
  let repository: {
    deleteMany: jest.Mock
    findById: jest.Mock
    rejectBulkMutationMiss: jest.Mock
    deleteManyOrThrow: jest.Mock
  }

  const noteId = "507f1f77bcf86cd799439011"

  beforeEach(async () => {
    repository = {
      deleteMany: jest.fn(),
      findById: jest.fn(),
      rejectBulkMutationMiss: jest.fn(async (scope: BulkNoteMutationScope) => {
        for (const id of scope.ids) {
          const existing = await repository.findById(id)
          assertNoteAccessOrThrow(existing, scope.organizationId)
        }
        throw new NotFoundException()
      }),
      deleteManyOrThrow: jest.fn(async (scope: BulkNoteMutationScope) => {
        const uniqueValidIds = [
          ...new Set(scope.ids.filter((id: string) => ObjectId.isValid(id))),
        ]
        const deletedCount = await repository.deleteMany(scope)
        const hasInvalidId = scope.ids.some(
          (id: string) => !ObjectId.isValid(id)
        )
        if (hasInvalidId || deletedCount < uniqueValidIds.length) {
          await repository.rejectBulkMutationMiss(scope)
        }
        return deletedCount
      }),
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BulkDeleteNotesHandler,
        { provide: NotesRepository, useValue: repository },
      ],
    }).compile()

    handler = moduleRef.get(BulkDeleteNotesHandler)
  })

  it("returns deletedCount when every id is owned by the user", async () => {
    repository.deleteMany.mockResolvedValue(2)

    const result = await handler.execute(
      new BulkDeleteNotesCommand("org-1", "user-1", {
        ids: [noteId, "507f191e810c19729de860ea"],
      })
    )

    expect(result).toEqual({ deletedCount: 2 })
    expect(repository.findById).not.toHaveBeenCalled()
  })

  it("throws 404 when a note id does not exist", async () => {
    repository.deleteMany.mockResolvedValue(0)
    repository.findById.mockResolvedValue(null)

    await expect(
      handler.execute(
        new BulkDeleteNotesCommand("org-1", "user-1", { ids: [noteId] })
      )
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it("throws 403 when a note belongs to another user in the workspace", async () => {
    repository.deleteMany.mockResolvedValue(0)
    repository.findById.mockResolvedValue({
      _id: new ObjectId(noteId),
      organizationId: "org-1",
      userId: "user-2",
      title: "t",
      body: "b",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await expect(
      handler.execute(
        new BulkDeleteNotesCommand("org-1", "user-1", { ids: [noteId] })
      )
    ).rejects.toBeInstanceOf(ForbiddenException)
  })
})
