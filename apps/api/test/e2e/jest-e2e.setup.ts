import "reflect-metadata"
import "./support/better-auth-mocks"
import "../support/mocks/jose"

jest.mock("@workspace/auth", () => ({
  getAuth: jest.fn(() => ({})),
}))

jest.mock("@thallesp/nestjs-better-auth", () => ({
  AuthModule: {
    forRootAsync: () => ({
      module: class AuthModuleE2eStub {},
    }),
  },
}))
