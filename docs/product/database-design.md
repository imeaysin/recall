# Recall — Final Database Design & System Design (v2.0)

This supersedes v1.0. Two changes drove the revision, both edge cases the first pass missed:

1. **Embedded chat messages will blow past MongoDB's 16MB document cap** on a heavy user — `messages` is split into its own collection.
2. **Single OAuth provider per user** breaks the moment someone signs in with Google, then later hits "Continue with GitHub" using the same email — `User` now supports multiple linked providers.

Ten collections total: `users`, `sessions`, `content`, `topics`, `vector_chunks`, `chats`, `chat_messages`, `ingestion_jobs`, `api_usage`, `content_trash`.

---

## Part 1 — Database Design (Row Format)

### 1.1 `users`

| Field                     | Type                                                                          | Required | Default  | Notes / Edge Cases                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_id`                     | ObjectId                                                                      | ✓        | auto     |                                                                                                                                                       |
| `email`                   | string                                                                        | ✓        | —        | lowercase, trimmed, unique. Source of truth for identity across providers                                                                             |
| `emailVerified`           | boolean                                                                       | ✓        | `false`  | OAuth providers usually confirm this on first login                                                                                                   |
| `name`                    | string                                                                        | ✓        | —        |                                                                                                                                                       |
| `avatarUrl`               | string                                                                        | ✗        | —        |                                                                                                                                                       |
| `providers`               | array of `{provider: 'google'\|'github', providerId: string, linkedAt: Date}` | ✓        | `[]`     | **Edge case:** same email, second provider → push to array instead of rejecting login                                                                 |
| `refreshTokenVersion`     | number                                                                        | ✓        | `0`      | Incremented on password/security reset or "log out everywhere" — invalidates all previously issued refresh tokens instantly without a blacklist table |
| `contentCount`            | number                                                                        | ✓        | `0`      | Denormalized; used to enforce free-tier ingestion caps                                                                                                |
| `dailyIngestionCount`     | number                                                                        | ✓        | `0`      | Reset by cron at UTC midnight — throttles Gemini free-tier quota per user                                                                             |
| `dailyIngestionResetAt`   | Date                                                                          | ✓        | now      |                                                                                                                                                       |
| `plan`                    | enum `'FREE'`                                                                 | ✓        | `'FREE'` | Reserved field — costs nothing today, avoids a breaking migration if you ever add a paid tier                                                         |
| `isDeleted`               | boolean                                                                       | ✓        | `false`  | Soft delete for GDPR "right to be forgotten" flow (see §2.3)                                                                                          |
| `deletedAt`               | Date                                                                          | ✗        | —        |                                                                                                                                                       |
| `createdAt` / `updatedAt` | Date                                                                          | ✓        | auto     |                                                                                                                                                       |

**Indexes:** `{ email: 1 }` unique · `{ "providers.provider": 1, "providers.providerId": 1 }` unique, sparse

---

### 1.2 `sessions` (refresh tokens)

| Field              | Type               | Required | Default | Notes / Edge Cases                                                                     |
| ------------------ | ------------------ | -------- | ------- | -------------------------------------------------------------------------------------- |
| `_id`              | ObjectId           | ✓        | auto    |                                                                                        |
| `userId`           | ObjectId → `users` | ✓        | —       |                                                                                        |
| `refreshTokenHash` | string             | ✓        | —       | Never store raw token — SHA-256 hash only, so a DB read alone can't impersonate a user |
| `tokenVersion`     | number             | ✓        | —       | Must match `user.refreshTokenVersion` at validation time; mismatch = silently revoked  |
| `userAgent`        | string             | ✗        | —       | Shown to user as "active devices"                                                      |
| `ipAddress`        | string             | ✗        | —       |                                                                                        |
| `expiresAt`        | Date               | ✓        | —       | 30 days                                                                                |
| `createdAt`        | Date               | ✓        | auto    |                                                                                        |

**Indexes:** `{ userId: 1 }` · `{ expiresAt: 1 }` **TTL index, expireAfterSeconds: 0** — Mongo auto-purges expired sessions, zero cron cost

---

### 1.3 `content`

| Field                          | Type                                                                                               | Required | Default   | Notes / Edge Cases                                                                                                                                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_id`                          | ObjectId                                                                                           | ✓        | auto      |                                                                                                                                                                                                                                            |
| `userId`                       | ObjectId → `users`                                                                                 | ✓        | —         | Every query filters on this first (tenant isolation)                                                                                                                                                                                       |
| `sourceType`                   | enum `ARTICLE\|YOUTUBE\|PDF\|IMAGE`                                                                | ✓        | —         |                                                                                                                                                                                                                                            |
| `sourceUrl`                    | string                                                                                             | ✓*       | —         | *Not required for `PDF`/`IMAGE` (see `sourceFileMeta`)                                                                                                                                                                                     |
| `normalizedUrl`                | string                                                                                             | ✓*       | —         | Lowercased, tracking params stripped (`utm_*`, `fbclid`, etc.), trailing slash removed. **This, not `sourceUrl`, is the dedup key** — otherwise `example.com/a?utm_source=x` and `example.com/a` are treated as different saves            |
| `contentHash`                  | string                                                                                             | ✗        | —         | SHA-256 of extracted text. Catches the case where **two different URLs are the same article** (syndicated/mirrored content, AMP vs canonical) — flagged as `possibleDuplicateOf` rather than silently merged, since the user may want both |
| `possibleDuplicateOfContentId` | ObjectId                                                                                           | ✗        | —         | Set when `contentHash` matches an existing doc with a different URL                                                                                                                                                                        |
| `sourceFileMeta`               | object `{ originalName, mimeType, sizeBytes }`                                                     | ✗        | —         | For PDF/IMAGE only. Raw bytes are **never persisted** — processed from a temp buffer and discarded post-extraction to respect the 512MB M0 cap                                                                                             |
| `title`                        | string                                                                                             | ✗        | —         | AI-generated                                                                                                                                                                                                                               |
| `titleEditedByUser`            | boolean                                                                                            | ✓        | `false`   | **Edge case (FR-5.2):** if true, a background re-ingestion (e.g. manual "regenerate" action) must NOT overwrite this field                                                                                                                 |
| `summary`                      | string                                                                                             | ✗        | —         |                                                                                                                                                                                                                                            |
| `summaryEditedByUser`          | boolean                                                                                            | ✓        | `false`   | Same protection as above                                                                                                                                                                                                                   |
| `wordCount`                    | number                                                                                             | ✗        | —         |                                                                                                                                                                                                                                            |
| `language`                     | string                                                                                             | ✗        | —         | ISO 639-1, detected — embeddings/RAG quality degrades silently on mixed-language libraries otherwise; surfaced in UI as a caveat                                                                                                           |
| `topicRefs`                    | ObjectId[] → `topics`                                                                              | ✓        | `[]`      | Adjacency list                                                                                                                                                                                                                             |
| `topicSnapshot`                | array `{topicId, name}`                                                                            | ✓        | `[]`      | Denormalized, max 5 items — avoids populate() on every library list render                                                                                                                                                                 |
| `isOrphan`                     | boolean                                                                                            | ✓        | `false`   | True only while `topicRefs` is empty. Recomputed on every manual topic add/remove, not just at ingestion time                                                                                                                              |
| `status`                       | enum (see §2.2 for full state machine)                                                             | ✓        | `PENDING` |                                                                                                                                                                                                                                            |
| `processingStep`               | enum `EXTRACT\|METADATA\|GRAPH\|EMBED`                                                             | ✗        | —         | **Edge case:** if a job fails at `EMBED`, retry resumes from `EMBED`, not from `EXTRACT` — avoids re-spending a Gemini metadata call on transient embedding failures                                                                       |
| `retryCount`                   | number                                                                                             | ✓        | `0`       |                                                                                                                                                                                                                                            |
| `lockedAt`                     | Date                                                                                               | ✗        | —         | Set atomically when a worker claims the job; see §2.4                                                                                                                                                                                      |
| `lockedBy`                     | string                                                                                             | ✗        | —         | Process/instance ID — useful if you ever run >1 API instance                                                                                                                                                                               |
| `errorMessage`                 | string                                                                                             | ✗        | —         |                                                                                                                                                                                                                                            |
| `errorCode`                    | enum `EXTRACTION_FAILED\|AI_QUOTA_EXCEEDED\|AI_ERROR\|UNSUPPORTED_FORMAT\|FILE_TOO_LARGE\|TIMEOUT` | ✗        | —         | Structured, not just free text — lets the UI show a targeted retry hint                                                                                                                                                                    |
| `libraryStatus`                | enum `QUEUE\|ARCHIVE`                                                                              | ✓        | `QUEUE`   |                                                                                                                                                                                                                                            |
| `isDeleted`                    | boolean                                                                                            | ✓        | `false`   | Soft delete → `content_trash` flow, see §1.10                                                                                                                                                                                              |
| `deletedAt`                    | Date                                                                                               | ✗        | —         |                                                                                                                                                                                                                                            |
| `createdAt` / `updatedAt`      | Date                                                                                               | ✓        | auto      |                                                                                                                                                                                                                                            |

**Indexes:**
`{ userId: 1, libraryStatus: 1, isDeleted: 1, createdAt: -1 }` (library list)
`{ userId: 1, normalizedUrl: 1 }` unique, partial filter `{ isDeleted: false }` (dedup, but allows re-saving a previously trashed URL)
`{ status: 1, updatedAt: 1 }` (stale-job scanner, not user-scoped)
`{ userId: 1, contentHash: 1 }` sparse

---

### 1.4 `topics`

| Field                     | Type                   | Required | Default | Notes / Edge Cases                                                                                                                                                                                                                                                                 |
| ------------------------- | ---------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_id`                     | ObjectId               | ✓        | auto    |                                                                                                                                                                                                                                                                                    |
| `userId`                  | ObjectId → `users`     | ✓        | —       |                                                                                                                                                                                                                                                                                    |
| `name`                    | string                 | ✓        | —       | Display casing, e.g. "Machine Learning"                                                                                                                                                                                                                                            |
| `normalizedName`          | string                 | ✓        | —       | lowercase, trimmed, punctuation-stripped — dedup key                                                                                                                                                                                                                               |
| `contentRefs`             | ObjectId[] → `content` | ✓        | `[]`    | Adjacency list                                                                                                                                                                                                                                                                     |
| `contentCount`            | number                 | ✓        | `0`     | Denormalized counter — drives node radius in the FR-5.3 graph render without a `$size` aggregation on every load                                                                                                                                                                   |
| `isUserCreated`           | boolean                | ✓        | `false` | True if the user manually created/renamed rather than AI-extracted                                                                                                                                                                                                                 |
| `mergedIntoTopicId`       | ObjectId               | ✗        | —       | **Edge case:** AI extracts near-duplicate topics ("JS" vs "JavaScript") across sessions since it has no memory of prior topic names. Rather than silent auto-merge (risky), the user gets a "merge suggestion" UI action that sets this tombstone field and migrates `contentRefs` |
| `color`                   | string                 | ✗        | —       | Assigned deterministically from `normalizedName` hash — stable across graph re-renders                                                                                                                                                                                             |
| `createdAt` / `updatedAt` | Date                   | ✓        | auto    |                                                                                                                                                                                                                                                                                    |

**Indexes:** `{ userId: 1, normalizedName: 1 }` unique · `{ userId: 1, contentCount: -1 }` (top-topics widget)

---

### 1.5 `vector_chunks`

| Field            | Type                 | Required | Default                | Notes / Edge Cases                                                                                                                                                                                                               |
| ---------------- | -------------------- | -------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_id`            | ObjectId             | ✓        | auto                   |                                                                                                                                                                                                                                  |
| `userId`         | ObjectId → `users`   | ✓        | —                      | **Hard filter on every `$vectorSearch` call — this is the NFR-1.1 tenant-isolation boundary, not application-layer logic alone**                                                                                                 |
| `contentId`      | ObjectId → `content` | ✓        | —                      |                                                                                                                                                                                                                                  |
| `chunkIndex`     | number               | ✓        | —                      | Ordering within the source doc, used to reconstruct context window around a matched chunk                                                                                                                                        |
| `text`           | string               | ✓        | —                      | ~500 tokens, 50-token overlap with neighbor chunks                                                                                                                                                                               |
| `tokenCount`     | number               | ✓        | —                      | Used for RAG prompt-budget accounting                                                                                                                                                                                            |
| `embedding`      | number[] (768)       | ✓        | —                      | `text-embedding-004`                                                                                                                                                                                                             |
| `embeddingModel` | string               | ✓        | `"text-embedding-004"` | **Edge case:** if you ever switch embedding models, mixed-dimension/model vectors in one index corrupt similarity scores. This field lets a migration script identify and re-embed stale chunks rather than silently mixing them |
| `createdAt`      | Date                 | ✓        | auto                   |                                                                                                                                                                                                                                  |

**Indexes:** `{ contentId: 1 }` (cascade delete lookup) · `{ userId: 1 }` (used as the Atlas Vector Search pre-filter field — must be defined in the search index, not just a normal index) · **Atlas Vector Search index** on `embedding` (768 dims, cosine), filter fields `userId`, `contentId`

---

### 1.6 `chats`

| Field                     | Type               | Required | Default      | Notes / Edge Cases                               |
| ------------------------- | ------------------ | -------- | ------------ | ------------------------------------------------ |
| `_id`                     | ObjectId           | ✓        | auto         |                                                  |
| `userId`                  | ObjectId → `users` | ✓        | —            |                                                  |
| `title`                   | string             | ✓        | `"New Chat"` | Auto-set from the first question, first 60 chars |
| `lastMessageAt`           | Date               | ✓        | auto         |                                                  |
| `messageCount`            | number             | ✓        | `0`          | Denormalized                                     |
| `isDeleted`               | boolean            | ✓        | `false`      |                                                  |
| `createdAt` / `updatedAt` | Date               | ✓        | auto         |                                                  |

**Indexes:** `{ userId: 1, isDeleted: 1, lastMessageAt: -1 }`

---

### 1.7 `chat_messages` _(split out from `chats.messages` — see rationale above)_

| Field               | Type                                             | Required | Default | Notes / Edge Cases                                           |
| ------------------- | ------------------------------------------------ | -------- | ------- | ------------------------------------------------------------ |
| `_id`               | ObjectId                                         | ✓        | auto    |                                                              |
| `chatId`            | ObjectId → `chats`                               | ✓        | —       |                                                              |
| `userId`            | ObjectId → `users`                               | ✓        | —       | Denormalized for direct tenant-scoped queries without a join |
| `role`              | enum `user\|assistant`                           | ✓        | —       |                                                              |
| `text`              | string                                           | ✓        | —       |                                                              |
| `citations`         | array `{contentId, title, sourceUrl, chunkText}` | ✓        | `[]`    |                                                              |
| `retrievedChunkIds` | ObjectId[]                                       | ✗        | `[]`    | Kept for debugging/re-ranking, not shown to user             |
| `tokensUsed`        | number                                           | ✗        | —       | Quota accounting                                             |
| `createdAt`         | Date                                             | ✓        | auto    |                                                              |

**Indexes:** `{ chatId: 1, createdAt: 1 }` (paginated fetch, oldest-first for context reconstruction, reversed for display)

**Edge case handled by the split:** unbounded embedded arrays risk hitting Mongo's 16MB document limit on a chat with thousands of turns, and every message-append would rewrite the whole array. As a separate collection, appends are cheap inserts and pagination (`limit(50).sort({createdAt: -1})`) is a native indexed query instead of slicing an in-memory array.

---

### 1.8 `ingestion_jobs` _(audit/retry log — distinct from `content.status`)_

| Field           | Type                                   | Required | Default               | Notes / Edge Cases                                                                    |
| --------------- | -------------------------------------- | -------- | --------------------- | ------------------------------------------------------------------------------------- |
| `_id`           | ObjectId                               | ✓        | auto                  |                                                                                       |
| `contentId`     | ObjectId → `content`                   | ✓        | —                     |                                                                                       |
| `userId`        | ObjectId → `users`                     | ✓        | —                     |                                                                                       |
| `attemptNumber` | number                                 | ✓        | —                     |                                                                                       |
| `step`          | enum `EXTRACT\|METADATA\|GRAPH\|EMBED` | ✓        | —                     |                                                                                       |
| `outcome`       | enum `SUCCESS\|FAILED`                 | ✓        | —                     |                                                                                       |
| `durationMs`    | number                                 | ✗        | —                     | Used to tune the NFR-2.1 10s budget                                                   |
| `errorMessage`  | string                                 | ✗        | —                     |                                                                                       |
| `createdAt`     | Date                                   | ✓        | auto, **TTL 30 days** | Debugging log, not user-facing — auto-expires so it never competes with the 512MB cap |

**Indexes:** `{ contentId: 1, createdAt: -1 }` · `{ createdAt: 1 }` TTL, expireAfterSeconds: 2592000

**Why this exists separately from `content.status`:** `content.status` answers "what's happening now"; `ingestion_jobs` answers "why did this fail three times" — conflating them means either bloating `Content` with a growing attempts array (16MB risk again) or losing history on each retry.

---

### 1.9 `api_usage` _(Gemini free-tier quota governor)_

| Field                | Type                                  | Required | Default | Notes / Edge Cases                                                                                |
| -------------------- | ------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `_id`                | ObjectId                              | ✓        | auto    |                                                                                                   |
| `date`               | string `YYYY-MM-DD`                   | ✓        | —       | UTC day bucket                                                                                    |
| `provider`           | enum `GEMINI_FLASH\|GEMINI_EMBEDDING` | ✓        | —       | Tracked separately — metadata calls and embedding calls have independent free-tier RPM/RPD limits |
| `requestCount`       | number                                | ✓        | `0`     | Atomically `$inc`'d per call                                                                      |
| `tokenCount`         | number                                | ✓        | `0`     |                                                                                                   |
| `quotaExceededCount` | number                                | ✓        | `0`     | Times a 429 was hit — alerting signal                                                             |

**Indexes:** `{ date: 1, provider: 1 }` unique

**Edge case this exists for:** Gemini Flash's free tier caps requests-per-minute _and_ requests-per-day globally for your API key — not per-user. Without a global counter, one heavy user's ingestion burst silently starves every other user's chat requests with opaque 429s. Every AI call in `packages/ai` increments this first and short-circuits to a `DEFERRED` job status (retried next cron tick) if the daily/minute ceiling is already hit, rather than letting the call fail mid-pipeline.

---

### 1.10 `content_trash` _(soft-delete recycle bin)_

| Field               | Type     | Required | Default           | Notes / Edge Cases                                                                                              |
| ------------------- | -------- | -------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `_id`               | ObjectId | ✓        | auto              |                                                                                                                 |
| `originalContentId` | ObjectId | ✓        | —                 |                                                                                                                 |
| `userId`            | ObjectId | ✓        | —                 |                                                                                                                 |
| `snapshot`          | object   | ✓        | —                 | Full copy of the `Content` doc at delete time, for one-click restore                                            |
| `deletedAt`         | Date     | ✓        | auto              |                                                                                                                 |
| `purgeAt`           | Date     | ✓        | `deletedAt + 30d` | **TTL index** — auto-hard-deletes after 30 days, which also cascades a cleanup job for orphaned `vector_chunks` |

**Indexes:** `{ purgeAt: 1 }` TTL, expireAfterSeconds: 0 · `{ userId: 1, deletedAt: -1 }`

**Edge case:** a user who deletes a saved article and immediately regrets it (common in read-later apps) shouldn't lose it instantly — but you also can't keep soft-deleted docs forever on a 512MB cluster. 30-day TTL balances both.

---

## Part 2 — System Design (Every Flow, Every Edge Case)

### 2.1 Full Component Diagram

```
                     ┌────────────────────┐
                     │   Vercel (Free)     │
                     │   Next.js Frontend  │
                     └──────────┬───────────┘
                                │ HTTPS / JWT (access token, 15min)
                                ▼
                     ┌────────────────────────────┐
                     │  Render / Fly.io (Free)     │
                     │  NestJS API — single dyno   │
                     │  ┌──────────────────────┐   │
                     │  │ Controllers           │   │
                     │  │ AuthGuard (JWT+refresh)│  │
                     │  │ EventEmitter2 (queue) │   │
                     │  │ @nestjs/schedule cron  │  │
                     │  │  ├─ stale-job scanner  │  │
                     │  │  ├─ daily quota reset  │  │
                     │  │  └─ trash purge sweep  │  │
                     │  └──────────────────────┘   │
                     └──────────┬───────────────────┘
                                │
                                ▼
                     ┌────────────────────────────┐
                     │  MongoDB Atlas M0 (Free)    │
                     │  users · sessions · content │
                     │  topics · vector_chunks     │
                     │  chats · chat_messages      │
                     │  ingestion_jobs · api_usage │
                     │  content_trash              │
                     │  + Atlas Vector Search index│
                     └──────────┬───────────────────┘
                                │
                                ▼
                     ┌────────────────────────────┐
                     │  Google Gemini API (Free)   │
                     │  gemini-1.5-flash            │
                     │  text-embedding-004          │
                     └────────────────────────────┘
```

### 2.2 Ingestion State Machine (full, with failure/retry paths)

```
PENDING
   │  worker atomically claims job:
   │  findOneAndUpdate({_id, status:'PENDING'}, {status:'EXTRACTING', lockedAt: now})
   │  ↑ atomicity here prevents two workers double-processing the same doc
   ▼
EXTRACTING ──(extractor throws)──► FAILED { errorCode: EXTRACTION_FAILED }
   │ success                                    │
   ▼                                    retryCount < 3?
METADATA ──(Gemini quota hit)──► DEFERRED ──► requeued next cron tick
   │ success        │                          (checks api_usage first)
   │        (Gemini error, retryCount<3)
   │                └──► retry from METADATA (processingStep preserved)
   ▼
GRAPH ──(topic upsert race / duplicate key)──► retry read-then-write, max 3x
   │ success
   ▼
EMBEDDING ──(embedding API fails mid-batch)──► partial chunks kept,
   │ success                                     resume from last chunkIndex
   ▼                                             on retry (not from zero)
COMPLETED

Any step, retryCount ≥ 3  ──►  FAILED (terminal, user sees "Retry" button
                                which resets retryCount to 0 and re-enters
                                at PENDING, not at the failed step — user-
                                triggered retries are cheap enough that full
                                restart is safer than resuming stale state)
```

**Stale-job scanner (cron, every 60s):**

```
find({ status: { $in: ['EXTRACTING','METADATA','GRAPH','EMBEDDING'] },
       lockedAt: { $lt: now - 5min } })
→ worker likely crashed mid-step → reset to PENDING, retryCount++, clear lockedAt
```

This is what makes the free-tier dyno's cold-sleep/restart behavior safe — nothing is ever silently stuck.

### 2.3 Cascade Deletes (every direction)

| User action                                                           | Cascade effect                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Delete one `Content`                                                  | Soft-delete (`isDeleted:true`) → snapshot into `content_trash` → **immediately** remove its `_id` from every `topics.contentRefs` it's in, decrement `contentCount`; if a topic's `contentCount` hits 0, the topic is **not** deleted (user may re-save into it later) but is hidden from the graph unless `isUserCreated` — actual `vector_chunks` deletion is deferred to the `content_trash` TTL purge (30d), so restore is instant and cheap |
| Restore from trash                                                    | Re-insert `Content` from `snapshot`, `isDeleted:false`, re-push into prior `topics.contentRefs`; if a referenced topic was itself deleted in the meantime, silently create a fresh one with the same `normalizedName`                                                                                                                                                                                                                            |
| Permanently delete `Content` (explicit "delete forever" or trash TTL) | Cascade delete all `vector_chunks` where `contentId` matches; remove any `chat_messages.citations` entries referencing it (citation text stays, link becomes dead — flagged client-side as "source removed")                                                                                                                                                                                                                                     |
| Delete a `Topic`                                                      | Only allowed if `isUserCreated` and the user explicitly confirms; strips `topicId` from every referencing `Content.topicRefs`/`topicSnapshot`, recomputes `isOrphan` on each                                                                                                                                                                                                                                                                     |
| Delete `User` account (GDPR)                                          | Transactional cascade (Mongo multi-doc transaction, supported on M0 since it's a replica set): delete all `content`, `topics`, `vector_chunks`, `chats`, `chat_messages`, `sessions`, `ingestion_jobs` for that `userId`; **do not** soft-delete — this path bypasses `content_trash` entirely since "right to be forgotten" must be immediate and permanent                                                                                     |

### 2.4 Concurrency & Race Conditions

| Scenario                                                                                                                                       | Handling                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two browser tabs save the same URL simultaneously                                                                                              | Unique partial index on `{userId, normalizedUrl, isDeleted:false}` — second insert throws `E11000`, caught in the controller, returns the existing `contentId` instead of an error (idempotent save)                                                                                                                       |
| Two ingestion steps try to upsert the same new `Topic` concurrently (rare, but possible with parallel `EventEmitter2` handlers on burst-saves) | `findOneAndUpdate({userId, normalizedName}, {$setOnInsert:{...}}, {upsert:true})` — atomic; on the unique-index conflict, the loser's write becomes a no-op read-then-link rather than an error                                                                                                                            |
| User edits a title while a background re-ingestion is mid-flight                                                                               | `titleEditedByUser`/`summaryEditedByUser` flags checked **before** any write in the `METADATA` step; if true, that field is skipped, only `topics`/`embedding` proceed                                                                                                                                                     |
| User deletes content while it's still `EXTRACTING`                                                                                             | Delete sets `isDeleted:true` immediately (soft-delete doesn't care about status); the in-flight worker's final write is guarded by `updateOne({_id, isDeleted:false}, ...)` — if the doc was deleted mid-processing, the update matches zero docs and the worker discards its result instead of resurrecting a deleted doc |

### 2.5 Free-Tier Quota Protection (beyond §1.9)

- **Per-user daily ingestion cap** (`users.dailyIngestionCount`) — e.g. 50/day — prevents one user from exhausting the shared Gemini key's daily quota for everyone else. Returns `429 { code: 'DAILY_LIMIT_REACHED' }` at the controller, before a job is even created.
- **Chat context budget** — only the last 6 `chat_messages` + top-6 retrieved chunks are sent per RAG call, capping token spend regardless of how long a conversation or how large the library gets.
- **MongoDB Atlas M0 vector search limits** — M0/M2/M10 clusters cap you at a small number of Search indexes (historically 3) and modest QPS; this is why there's exactly **one** vector index (filtered by `userId`/`contentId` at query time) rather than a per-user or per-topic index.

### 2.6 Data Integrity Guards Not Yet Covered

- **Zero-topic AI extraction**: if Gemini returns fewer than 3 topics (FR-2.3 expects 3–5) for terse content, `isOrphan:true` is set rather than forcing a padded/fake topic list.
- **Non-English / mixed-language content**: `language` field is surfaced in the UI as a quality caveat on RAG answers ("this source may be less accurate — detected language: X") rather than silently degrading trust.
- **YouTube videos with captions disabled**: extractor fails fast with `errorCode: EXTRACTION_FAILED`, no fallback OCR-of-thumbnail hack — avoids silently ingesting garbage.
- **PDF/image size limits**: enforced at the Multer/controller layer (e.g., 15MB cap) before any processing starts — protects the free dyno's memory ceiling, not just storage.
- **Duplicate content across different URLs** (`possibleDuplicateOfContentId`): surfaced as a non-blocking UI hint, never auto-merged, since two URLs of "the same" article can have meaningfully different text (paywalled excerpt vs. full mirror).
