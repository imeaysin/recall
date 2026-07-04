/// <reference types="jest" />

import "reflect-metadata"
import "./support/mocks/register"

jest.mock("@workspace/auth", () => ({
  getAuth: jest.fn(() => ({})),
}))
