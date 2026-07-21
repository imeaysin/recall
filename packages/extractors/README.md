# `@workspace/extractors`

Per-source-type content extraction for CogniVault (NFR-8.2).

## Layout

```text
src/
  types.ts              ContentExtractor contract + ExtractionError
  extract.ts            resolveSourceType + extractContent orchestration
  adapters/             ARTICLE | YOUTUBE | PDF | IMAGE implementations
  lib/                  normalizeUrl, detectYoutubeVideoId, language hint
  index.ts              Public barrel
```

## Public API

```ts
import {
  extractContent,
  resolveSourceType,
  normalizeUrl,
  detectYoutubeVideoId,
  sha256Hex,
  ExtractionError,
} from "@workspace/extractors"
```

Ingestion calls `extractContent({ sourceType, url | buffer })` and must not import adapters directly.
