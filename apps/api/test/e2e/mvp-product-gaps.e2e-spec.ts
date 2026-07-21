import { type INestApplication } from "@nestjs/common"
import request from "supertest"
import { type App } from "supertest/types"
import { Types } from "mongoose"
import {
  ContentResponseSchema,
  ContentTrashListResponseSchema,
  TopicResponseSchema,
} from "@workspace/contracts"
import {
  ContentModel,
  ContentTrashModel,
  TopicModel,
  getDb,
} from "@workspace/db"
import { IngestionService } from "@/modules/ingestion/ingestion.service"
import {
  E2E_SESSION_HEADER,
  E2E_TEST_USER_ID,
} from "../mocks/workspace-auth-nestjs"
import { createE2eApp } from "./support/create-e2e-app"

const e2eUserFilter = { _id: new Types.ObjectId(E2E_TEST_USER_ID) }

const MINIMAL_PDF = Buffer.from(
  "%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n",
  "utf8"
)

describe("MVP product gaps (e2e)", () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    const created = await createE2eApp()
    app = created.app

    await getDb()
      .collection("user")
      .updateOne(
        e2eUserFilter,
        {
          $set: {
            email: "e2e-mvp@example.com",
            name: "E2E MVP User",
            emailVerified: true,
            dailyIngestionCount: 0,
            contentCount: 0,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      )

    const ingestion = created.moduleFixture.get(IngestionService)
    jest.spyOn(ingestion, "processContent").mockResolvedValue(undefined)
  })

  afterAll(async () => {
    await ContentModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await ContentTrashModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await TopicModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await getDb().collection("user").deleteOne(e2eUserFilter)
    await app?.close()
  })

  beforeEach(async () => {
    await ContentModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await ContentTrashModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await TopicModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await getDb()
      .collection("user")
      .updateOne(e2eUserFilter, {
        $set: { dailyIngestionCount: 0, contentCount: 0 },
      })
  })

  it("uploads a PDF as PENDING library content", async () => {
    const res = await request(app.getHttpServer())
      .post("/v1/content/file")
      .set(E2E_SESSION_HEADER, "1")
      .attach("file", MINIMAL_PDF, {
        filename: "note.pdf",
        contentType: "application/pdf",
      })
      .expect(201)

    const saved = ContentResponseSchema.parse(res.body.data)
    expect(saved).toMatchObject({
      userId: E2E_TEST_USER_ID,
      sourceType: "PDF",
      status: "PENDING",
      libraryStatus: "QUEUE",
    })
  })

  it("rejects non-PDF uploads", async () => {
    await request(app.getHttpServer())
      .post("/v1/content/file")
      .set(E2E_SESSION_HEADER, "1")
      .attach("file", Buffer.from("hello"), {
        filename: "note.txt",
        contentType: "text/plain",
      })
      .expect(400)
  })

  it("soft-deletes to trash, restores, and permanently deletes", async () => {
    const saveRes = await request(app.getHttpServer())
      .post("/v1/content/url")
      .set(E2E_SESSION_HEADER, "1")
      .send({ url: "https://example.com/mvp-trash" })
      .expect(201)

    const contentId = ContentResponseSchema.parse(saveRes.body.data).id

    await request(app.getHttpServer())
      .delete(`/v1/content/${contentId}`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(204)

    const trashRes = await request(app.getHttpServer())
      .get("/v1/content/trash")
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    const trash = ContentTrashListResponseSchema.parse(trashRes.body.data)
    expect(trash.items).toHaveLength(1)
    expect(trash.items[0]?.originalContentId).toBe(contentId)

    const trashId = trash.items[0]?.id
    expect(trashId).toBeTruthy()

    const restoredRes = await request(app.getHttpServer())
      .post(`/v1/content/trash/${trashId}/restore`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    const restored = ContentResponseSchema.parse(restoredRes.body.data)
    expect(restored.id).toBe(contentId)

    await request(app.getHttpServer())
      .get(`/v1/content/${contentId}`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    await request(app.getHttpServer())
      .delete(`/v1/content/${contentId}/permanent`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(204)

    await request(app.getHttpServer())
      .get(`/v1/content/${contentId}`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(404)
  })

  it("regenerates completed content by clearing edit flags", async () => {
    const saveRes = await request(app.getHttpServer())
      .post("/v1/content/url")
      .set(E2E_SESSION_HEADER, "1")
      .send({ url: "https://example.com/mvp-regen" })
      .expect(201)

    const contentId = ContentResponseSchema.parse(saveRes.body.data).id

    await ContentModel.updateOne(
      { _id: contentId, userId: E2E_TEST_USER_ID },
      {
        $set: {
          status: "COMPLETED",
          title: "User title",
          titleEditedByUser: true,
          summary: "User summary",
          summaryEditedByUser: true,
        },
      }
    )

    const regenRes = await request(app.getHttpServer())
      .post(`/v1/content/${contentId}/regenerate`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    const regenerated = ContentResponseSchema.parse(regenRes.body.data)
    expect(regenerated).toMatchObject({
      status: "PENDING",
      titleEditedByUser: false,
      summaryEditedByUser: false,
    })
  })

  it("creates, renames, merges, and deletes user topics", async () => {
    const createA = await request(app.getHttpServer())
      .post("/v1/topics")
      .set(E2E_SESSION_HEADER, "1")
      .send({ name: "JavaScript" })
      .expect(201)

    const topicA = TopicResponseSchema.parse(createA.body.data)
    expect(topicA.isUserCreated).toBe(true)
    expect(topicA.isRoot).toBe(false)

    const createB = await request(app.getHttpServer())
      .post("/v1/topics")
      .set(E2E_SESSION_HEADER, "1")
      .send({ name: "JS" })
      .expect(201)

    const topicB = TopicResponseSchema.parse(createB.body.data)

    const renameRes = await request(app.getHttpServer())
      .patch(`/v1/topics/${topicA.id}`)
      .set(E2E_SESSION_HEADER, "1")
      .send({ name: "TypeScript" })
      .expect(200)

    expect(TopicResponseSchema.parse(renameRes.body.data).name).toBe(
      "TypeScript"
    )

    const mergeRes = await request(app.getHttpServer())
      .post(`/v1/topics/${topicB.id}/merge`)
      .set(E2E_SESSION_HEADER, "1")
      .send({ intoTopicId: topicA.id })
      .expect(200)

    expect(TopicResponseSchema.parse(mergeRes.body.data).id).toBe(topicA.id)

    const listRes = await request(app.getHttpServer())
      .get("/v1/topics")
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    const listedIds = listRes.body.data.items.map(
      (item: { id: string }) => item.id
    )
    expect(listedIds).toContain(topicA.id)
    expect(listedIds).not.toContain(topicB.id)

    await request(app.getHttpServer())
      .delete(`/v1/topics/${topicA.id}`)
      .set(E2E_SESSION_HEADER, "1")
      .send({ confirm: true })
      .expect(204)

    const afterDelete = await request(app.getHttpServer())
      .get("/v1/topics")
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    expect(
      afterDelete.body.data.items.some(
        (item: { id: string }) => item.id === topicA.id
      )
    ).toBe(false)
  })
})
