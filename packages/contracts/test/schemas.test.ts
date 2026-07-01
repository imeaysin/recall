import { describe, expect, it } from "vitest"
import {
  CreateNoteSchema,
  NoteResponseSchema,
  UploadResponseSchema,
} from "../src/index"

describe("CreateNoteSchema", () => {
  it("accepts valid input", () => {
    const parsed = CreateNoteSchema.parse({ title: "Hello" })
    expect(parsed.body).toBe("")
  })

  it("rejects empty title", () => {
    expect(() => CreateNoteSchema.parse({ title: "  " })).toThrow()
  })
})

describe("NoteResponseSchema", () => {
  it("requires ISO date strings", () => {
    const note = NoteResponseSchema.parse({
      id: "1",
      organizationId: "org1",
      userId: "u1",
      title: "Test",
      body: "",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    })
    expect(note.title).toBe("Test")
  })
})

describe("UploadResponseSchema", () => {
  it("accepts upload result shape", () => {
    const result = UploadResponseSchema.parse({
      path: "user/file.png",
      url: "http://localhost/uploads/user/file.png",
    })
    expect(result.path).toBe("user/file.png")
  })
})
