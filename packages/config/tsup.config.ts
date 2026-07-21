import { defineConfig } from "tsup"

export default defineConfig((options) => ({
  entry: {
    index: "src/index.ts",
    "server/index": "src/server/index.ts",
    "server/database": "src/server/database.ts",
    "server/email": "src/server/email.ts",
    "server/storage": "src/server/storage.ts",
    "server/ai": "src/server/ai.ts",
    "server/ingestion": "src/server/ingestion.ts",
    "client/index": "src/client/index.ts",
    "public/index": "src/public/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: !options.watch,
  splitting: false,
  sourcemap: true,
  minify: false,
  treeshake: true,
}))
