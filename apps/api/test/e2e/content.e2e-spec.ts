import { type INestApplication } from "@nestjs/common"
import request from "supertest"
import { type App } from "supertest/types"
import { ContentResponseSchema } from "@workspace/contracts"
import { ContentModel, getDb } from "@workspace/db"
import { IngestionService } from "@/modules/ingestion/ingestion.service"
import {
  E2E_SESSION_HEADER,
  E2E_TEST_USER_ID,
} from "../mocks/workspace-auth-nestjs"
import { createE2eApp } from "./support/create-e2e-app"

describe("ContentController (e2e)", () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    const created = await createE2eApp()
    app = created.app

    await getDb()
      .collection("user")
      .updateOne(
        { id: E2E_TEST_USER_ID },
        {
          $set: {
            id: E2E_TEST_USER_ID,
            email: "e2e@example.com",
            name: "E2E User",
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
    await getDb().collection("user").deleteOne({ id: E2E_TEST_USER_ID })
    await app?.close()
  })

  beforeEach(async () => {
    await ContentModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await getDb()
      .collection("user")
      .updateOne(
        { id: E2E_TEST_USER_ID },
        { $set: { dailyIngestionCount: 0, contentCount: 0 } }
      )
  })

  it("returns 401 without e2e session header", async () => {
    await request(app.getHttpServer()).get("/v1/content").expect(401)
  })

  it("saves URL, lists, gets, updates, and soft-deletes content", async () => {
    const saveRes = await request(app.getHttpServer())
      .post("/v1/content/url")
      .set(E2E_SESSION_HEADER, "1")
      .send({ url: "https://example.com/cognivault-e2e" })
      .expect(201)

    const saved = ContentResponseSchema.parse(saveRes.body.data)
    expect(saved).toMatchObject({
      userId: E2E_TEST_USER_ID,
      sourceType: "ARTICLE",
      status: "PENDING",
      libraryStatus: "QUEUE",
    })

    const contentId = saved.id

    const dedupeRes = await request(app.getHttpServer())
      .post("/v1/content/url")
      .set(E2E_SESSION_HEADER, "1")
      .send({ url: "https://example.com/cognivault-e2e" })
      .expect(201)

    const deduped = ContentResponseSchema.parse(dedupeRes.body.data)
    expect(deduped.id).toBe(contentId)

    const listRes = await request(app.getHttpServer())
      .get("/v1/content")
      .set(E2E_SESSION_HEADER, "1")
      .query({ libraryStatus: "QUEUE" })
      .expect(200)

    expect(listRes.body.data.items).toHaveLength(1)
    expect(listRes.body.data.items[0].id).toBe(contentId)

    const getRes = await request(app.getHttpServer())
      .get(`/v1/content/${contentId}`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    expect(getRes.body.data.id).toBe(contentId)

    const patchRes = await request(app.getHttpServer())
      .patch(`/v1/content/${contentId}`)
      .set(E2E_SESSION_HEADER, "1")
      .send({ title: "E2E title", libraryStatus: "ARCHIVE" })
      .expect(200)

    const patched = ContentResponseSchema.parse(patchRes.body.data)
    expect(patched).toMatchObject({
      title: "E2E title",
      titleEditedByUser: true,
      libraryStatus: "ARCHIVE",
    })

    await request(app.getHttpServer())
      .delete(`/v1/content/${contentId}`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(204)

    await request(app.getHttpServer())
      .get(`/v1/content/${contentId}`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(404)
  })
})
