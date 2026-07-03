import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common"
import { ZodValidationException } from "nestjs-zod"
import { z, ZodError } from "zod"
import { DomainErrorCode, HttpErrorCode } from "@workspace/contracts"
import { StorageError } from "@workspace/storage"
import {
  buildErrorEnvelope,
  resolveClientMessage,
  resolveErrorCode,
  resolveFieldErrors,
  resolveHttpStatus,
} from "../../src/common/filters/http-exception.utils"

describe("http-exception.utils", () => {
  it("maps Zod validation failures to VALIDATION_FAILED with field errors", () => {
    const schema = z.object({ title: z.string().min(1) }).strict()
    let exception: ZodValidationException | undefined

    try {
      schema.parse({ title: "" })
    } catch (error) {
      if (!(error instanceof ZodError)) {
        throw error
      }
      exception = new ZodValidationException(error)
    }

    expect(exception).toBeDefined()
    expect(resolveHttpStatus(exception)).toBe(HttpStatus.BAD_REQUEST)
    expect(resolveErrorCode(exception, HttpStatus.BAD_REQUEST)).toBe(
      HttpErrorCode.VALIDATION_FAILED
    )
    expect(resolveClientMessage(exception, HttpStatus.BAD_REQUEST)).toBe(
      "Validation failed"
    )
    expect(resolveFieldErrors(exception)).toEqual([
      expect.objectContaining({ field: "title" }),
    ])
  })

  it("reads machine-readable codes from HttpException cause", () => {
    const exception = new NotFoundException("Note not found", {
      cause: DomainErrorCode.NOTE_NOT_FOUND,
    })

    expect(resolveErrorCode(exception, HttpStatus.NOT_FOUND)).toBe(
      DomainErrorCode.NOTE_NOT_FOUND
    )
    expect(resolveClientMessage(exception, HttpStatus.NOT_FOUND)).toBe(
      "Note not found"
    )
  })

  it("falls back to default HTTP codes when cause is missing", () => {
    const exception = new ForbiddenException("Not allowed")

    expect(resolveErrorCode(exception, HttpStatus.FORBIDDEN)).toBe(
      HttpErrorCode.FORBIDDEN
    )
  })

  it("builds the unified error envelope", () => {
    const exception = new BadRequestException("File is required", {
      cause: DomainErrorCode.FILE_REQUIRED,
    })

    const envelope = buildErrorEnvelope(exception, HttpStatus.BAD_REQUEST, {
      url: "/v1/uploads",
    })

    expect(envelope).toMatchObject({
      success: false,
      statusCode: 400,
      code: DomainErrorCode.FILE_REQUIRED,
      message: "File is required",
      path: "/v1/uploads",
      errors: null,
    })
    expect(envelope.timestamp).toEqual(expect.any(String))
  })

  it("masks internal server errors", () => {
    const envelope = buildErrorEnvelope(
      new Error("database timeout"),
      HttpStatus.INTERNAL_SERVER_ERROR,
      { url: "/v1/notes" }
    )

    expect(envelope).toMatchObject({
      success: false,
      statusCode: 500,
      code: HttpErrorCode.INTERNAL_SERVER_ERROR,
      message: "An unexpected server error occurred.",
      errors: null,
    })
  })

  it("maps StorageError INVALID_PATH to 400 with domain code", () => {
    const exception = new StorageError(
      "Path traversal detected",
      "INVALID_PATH"
    )

    expect(resolveHttpStatus(exception)).toBe(HttpStatus.BAD_REQUEST)
    expect(resolveErrorCode(exception, HttpStatus.BAD_REQUEST)).toBe(
      DomainErrorCode.INVALID_FILE_PATH
    )
    expect(resolveClientMessage(exception, HttpStatus.BAD_REQUEST)).toBe(
      "Path traversal detected"
    )
  })

  it("maps StorageError FILE_NOT_FOUND to 404", () => {
    const exception = new StorageError("File not found", "FILE_NOT_FOUND")

    expect(resolveHttpStatus(exception)).toBe(HttpStatus.NOT_FOUND)
    expect(resolveErrorCode(exception, HttpStatus.NOT_FOUND)).toBe(
      DomainErrorCode.FILE_NOT_FOUND
    )
  })
})
