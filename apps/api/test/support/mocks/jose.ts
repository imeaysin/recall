jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(() => jest.fn()),
}))
