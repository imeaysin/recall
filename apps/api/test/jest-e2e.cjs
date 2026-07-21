process.env.SKIP_ENV_VALIDATION ??= "true"

/** @type {import("jest").Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testTimeout: 60000,
  testMatch: ["<rootDir>/e2e/**/*.e2e-spec.ts"],
  setupFilesAfterEnv: ["<rootDir>/e2e/jest-e2e.setup.ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../src/$1",
    "^@workspace/auth/nestjs$": "<rootDir>/mocks/workspace-auth-nestjs.ts",
    "^@workspace/auth/server/lifecycle$":
      "<rootDir>/mocks/workspace-auth-lifecycle.ts",
    "^@workspace/extractors$": "<rootDir>/mocks/workspace-extractors.ts",
    "^@workspace/ai$": "<rootDir>/mocks/workspace-ai.ts",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@nestjs|rxjs|uuid|@workspace)/)",
  ],
}
