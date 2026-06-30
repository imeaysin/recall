import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      "max-params": ["error", 2],
      "no-nested-ternary": "error",
    },
  },
]
