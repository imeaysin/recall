import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { LocalStorageProvider } from "../src/providers/local"

describe("LocalStorageProvider", () => {
  let basePath: string
  let previousCwd: string

  afterEach(async () => {
    if (previousCwd) {
      process.chdir(previousCwd)
      previousCwd = ""
    }
    if (basePath) {
      await rm(basePath, { recursive: true, force: true })
    }
  })

  it("uploads a file and returns a public URL", async () => {
    basePath = await mkdtemp(join(tmpdir(), "theo-storage-"))
    const provider = new LocalStorageProvider({
      provider: "local",
      basePath,
      baseUrl: "http://localhost:4000/uploads",
    })

    const result = await provider.upload({
      path: "org/user/test.txt",
      body: Buffer.from("hello"),
      contentType: "text/plain",
    })

    expect(result.path).toBe("org/user/test.txt")
    expect(result.url).toBe("http://localhost:4000/uploads/org/user/test.txt")

    const onDisk = await readFile(join(basePath, "org/user/test.txt"), "utf8")
    expect(onDisk).toBe("hello")
  })

  it("uploads with a relative basePath like ./uploads", async () => {
    basePath = await mkdtemp(join(tmpdir(), "theo-storage-"))
    await mkdir(join(basePath, "uploads"), { recursive: true })
    previousCwd = process.cwd()
    process.chdir(basePath)

    const provider = new LocalStorageProvider({
      provider: "local",
      basePath: "./uploads",
      baseUrl: "http://localhost:4000/uploads",
    })

    const result = await provider.upload({
      path: "org/user/nested.txt",
      body: Buffer.from("nested"),
      contentType: "text/plain",
    })

    expect(result.path).toBe("org/user/nested.txt")
    const onDisk = await readFile(
      join(basePath, "uploads", "org/user/nested.txt"),
      "utf8"
    )
    expect(onDisk).toBe("nested")
  })

  it("rejects path traversal", async () => {
    basePath = await mkdtemp(join(tmpdir(), "theo-storage-"))
    const provider = new LocalStorageProvider({
      provider: "local",
      basePath,
      baseUrl: "http://localhost:4000/uploads",
    })

    await expect(
      provider.upload({
        path: "../escape.txt",
        body: Buffer.from("nope"),
        contentType: "text/plain",
      })
    ).rejects.toMatchObject({ code: "INVALID_PATH" })
  })
})
