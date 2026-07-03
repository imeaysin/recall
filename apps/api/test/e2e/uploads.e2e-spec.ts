import { type INestApplication } from "@nestjs/common"
import request from "supertest"
import { type App } from "supertest/types"
import { DomainErrorCode } from "@workspace/contracts"
import { createE2eApp } from "./support/create-e2e-app"
import { E2E_USER } from "./support/permissive.guard"

describe("UploadsController (e2e)", () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    ;({ app } = await createE2eApp())
  })

  afterAll(async () => {
    await app?.close()
  })

  it("POST /v1/uploads stores a file", () => {
    return request(app.getHttpServer())
      .post("/v1/uploads")
      .attach("file", Buffer.from("hello"), {
        filename: "test.txt",
        contentType: "text/plain",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          success: true,
          statusCode: 201,
          data: {
            path: expect.stringContaining(
              `${E2E_USER.activeOrganizationId}/${E2E_USER.id}/`
            ),
            url: expect.any(String),
          },
        })
      })
  })

  it("POST /v1/uploads without file returns 400", () => {
    return request(app.getHttpServer())
      .post("/v1/uploads")
      .expect(400)
      .expect((res) => {
        expect(res.body).toMatchObject({
          success: false,
          statusCode: 400,
          code: DomainErrorCode.FILE_REQUIRED,
          message: "File is required",
        })
      })
  })
})
