process.env.SKIP_ENV_VALIDATION ??= "true"

module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/unit/**/*.spec.ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s", "!**/*.spec.ts"],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/test/jest-setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@workspace/auth/nestjs$": "<rootDir>/test/mocks/workspace-auth-nestjs.ts",
    "^@workspace/auth/server/lifecycle$":
      "<rootDir>/test/mocks/workspace-auth-lifecycle.ts",
    "^@workspace/extractors$": "<rootDir>/test/mocks/workspace-extractors.ts",
    "^@workspace/ai$": "<rootDir>/test/mocks/workspace-ai.ts",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@nestjs|rxjs|uuid|@workspace)/)",
  ],
}
