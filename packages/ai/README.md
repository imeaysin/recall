# `@workspace/ai`

Provider-agnostic AI surface for CogniVault (NFR-8.1), with a Gemini adapter.

## Layout

```text
src/
  types.ts                 AiClient contract, usage store, errors, constants
  errors.ts                Map provider failures → AiProviderError
  factory.ts               createGeminiAiClient()
  chunk.ts                 Pure text chunking (FR-3.5)
  quota-gate.ts            Daily request cap before provider calls
  adapters/gemini/         Gemini LLM + embeddings (@ai-sdk/google)
  index.ts                 Public barrel
```

## Public API

```ts
import {
  createGeminiAiClient,
  chunkText,
  type AiClient,
  type AiUsageStore,
  AiProviderError,
  AiQuotaExceededError,
} from "@workspace/ai"
```

Call sites inject an `AiUsageStore` (API: `MongoAiUsageStore`) and never import adapter internals.

## Config

`@workspace/config/ai` — `GEMINI_API_KEY`, `GEMINI_FLASH_MODEL`, `GEMINI_EMBEDDING_MODEL`, daily caps.
