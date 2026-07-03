import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/nest.ts", "src/context.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  // Pino transports spawn worker threads and must resolve `pino` / `pino-pretty` at runtime.
  external: ["pino", "pino-pretty", "@nestjs/common"],
})
