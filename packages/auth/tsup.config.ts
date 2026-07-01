import { defineConfig, type Format, type Options } from "tsup"

const external = [
  "better-auth",
  "@better-auth/passkey",
  "@nestjs/common",
  "@nestjs/core",
  "@tanstack/react-query",
  "@workspace/config",
  "@workspace/contracts",
  "@workspace/db",
  "@workspace/email",
  "expo-secure-store",
  "jose",
  "mongodb",
  "react",
]

const format: Format[] = ["esm", "cjs"]

const shared = {
  format,
  splitting: false,
  sourcemap: true,
  minify: false,
  treeshake: true,
  external,
}

export default defineConfig((options): Options | Options[] => [
  {
    ...shared,
    entry: {
      auth: "src/lib/auth.ts",
    },
    treeshake: false,
    dts: false,
    clean: !options.watch,
    onSuccess:
      "cp src/lib/auth.d.ts dist/auth.d.ts && cp src/lib/auth.d.ts dist/auth.d.cts",
  },
  {
    ...shared,
    entry: {
      "auth-client": "src/lib/auth-client.ts",
      "permissions/platform": "src/permissions/platform/index.ts",
      "permissions/organization": "src/permissions/organization/index.ts",
      "types/auth": "src/types/auth.ts",
      "types/organization": "src/types/organization.ts",
      "adapters/nestjs/index": "src/adapters/nestjs/index.ts",
      "adapters/mobile/expo-client": "src/adapters/mobile/expo-client.ts",
      "react/index": "src/react/index.ts",
    },
    dts: true,
    clean: false,
  },
])
