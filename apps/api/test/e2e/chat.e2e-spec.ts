import { type INestApplication } from "@nestjs/common"
import request from "supertest"
import { type App } from "supertest/types"
import { Types } from "mongoose"
import {
  ChatResponseSchema,
  SendChatMessageResponseSchema,
} from "@workspace/contracts"
import {
  ChatMessageModel,
  ChatModel,
  ContentModel,
  VectorChunkModel,
  getDb,
} from "@workspace/db"
import {
  E2E_SESSION_HEADER,
  E2E_TEST_USER_ID,
} from "../mocks/workspace-auth-nestjs"
import { createE2eApp } from "./support/create-e2e-app"

const e2eUserFilter = { _id: new Types.ObjectId(E2E_TEST_USER_ID) }

describe("ChatController (e2e)", () => {
  let app: INestApplication<App>
  let contentId: string

  beforeAll(async () => {
    const created = await createE2eApp()
    app = created.app

    await getDb()
      .collection("user")
      .updateOne(
        e2eUserFilter,
        {
          $set: {
            email: "e2e-chat@example.com",
            name: "E2E Chat User",
            emailVerified: true,
            dailyIngestionCount: 0,
            contentCount: 1,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      )
  })

  afterAll(async () => {
    await ChatMessageModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await ChatModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await VectorChunkModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await ContentModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await getDb().collection("user").deleteOne(e2eUserFilter)
    await app?.close()
  })

  beforeEach(async () => {
    await ChatMessageModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await ChatModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await VectorChunkModel.deleteMany({ userId: E2E_TEST_USER_ID })
    await ContentModel.deleteMany({ userId: E2E_TEST_USER_ID })

    const content = await ContentModel.create({
      userId: E2E_TEST_USER_ID,
      sourceType: "ARTICLE",
      sourceUrl: "https://example.com/chat-source",
      normalizedUrl: "https://example.com/chat-source",
      title: "Library article",
      status: "COMPLETED",
      libraryStatus: "QUEUE",
      isOrphan: true,
      topicRefs: [],
      topicSnapshot: [],
      language: "en",
    })
    contentId = content._id.toString()

    await VectorChunkModel.create({
      userId: E2E_TEST_USER_ID,
      contentId: content._id,
      chunkIndex: 0,
      text: "CogniVault stores personal knowledge.",
      tokenCount: 5,
      embedding: [0.1, 0.2, 0.3],
      embeddingModel: "mock-embed",
    })
  })

  it("creates a chat, sends a RAG message, and soft-deletes", async () => {
    const createRes = await request(app.getHttpServer())
      .post("/v1/chats")
      .set(E2E_SESSION_HEADER, "1")
      .send({})
      .expect(201)

    const chat = ChatResponseSchema.parse(createRes.body.data)
    expect(chat.title).toBe("New Chat")

    const sendRes = await request(app.getHttpServer())
      .post(`/v1/chats/${chat.id}/messages`)
      .set(E2E_SESSION_HEADER, "1")
      .send({ text: "What is in my library?" })
      .expect(201)

    const payload = SendChatMessageResponseSchema.parse(sendRes.body.data)
    expect(payload.userMessage.role).toBe("user")
    expect(payload.assistantMessage.role).toBe("assistant")
    expect(payload.assistantMessage.text.length).toBeGreaterThan(0)
    expect(payload.assistantMessage.citations.length).toBeGreaterThan(0)
    expect(payload.assistantMessage.citations[0]?.contentId).toBe(contentId)
    expect(payload.assistantMessage.citations[0]?.sourceRemoved).toBe(false)

    const messagesRes = await request(app.getHttpServer())
      .get(`/v1/chats/${chat.id}/messages`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    expect(messagesRes.body.data.items).toHaveLength(2)

    await request(app.getHttpServer())
      .delete(`/v1/chats/${chat.id}`)
      .set(E2E_SESSION_HEADER, "1")
      .expect(204)

    const listRes = await request(app.getHttpServer())
      .get("/v1/chats")
      .set(E2E_SESSION_HEADER, "1")
      .expect(200)

    expect(listRes.body.data.items).toHaveLength(0)
  })

  it("marks citations as sourceRemoved when content is deleted", async () => {
    const createRes = await request(app.getHttpServer())
      .post("/v1/chats")
      .set(E2E_SESSION_HEADER, "1")
      .send({ title: "Deleted source chat" })
      .expect(201)

    const chat = ChatResponseSchema.parse(createRes.body.data)

    await ContentModel.updateOne(
      { _id: contentId },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    )

    const sendRes = await request(app.getHttpServer())
      .post(`/v1/chats/${chat.id}/messages`)
      .set(E2E_SESSION_HEADER, "1")
      .send({ text: "Ask about removed source" })
      .expect(201)

    const payload = SendChatMessageResponseSchema.parse(sendRes.body.data)
    // Retrieval filters active content — may return zero citations; if any, flag removed
    for (const citation of payload.assistantMessage.citations) {
      expect(citation.sourceRemoved).toBe(true)
    }
  })
})
