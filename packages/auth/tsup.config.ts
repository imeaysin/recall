import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/access/index.ts",
    "src/server/index.ts",
    "src/server/lifecycle.ts",
    "src/server/nest/index.ts",
    "src/client/web.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: true,
  sourcemap: true,
  external: [
    "better-auth",
    "@thallesp/nestjs-better-auth",
    "@nestjs/common",
    "@nestjs/core",
    "react",
    "mongodb",
    "mongoose",
    "@workspace/config",
  ],
})
