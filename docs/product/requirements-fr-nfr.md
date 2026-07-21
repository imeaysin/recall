# CogniVault — Functional & Non-Functional Requirements (Final, v2.0)

Aligned to the final database design and system design. Every requirement below maps to a concrete field, index, or flow already specified — nothing here is aspirational beyond what the schema supports.

---

## Part 1 — Functional Requirements (FR)

### FR-1 Authentication & Account Management

| ID     | Requirement                                                                                                                                                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1.1 | The system shall authenticate users exclusively via OAuth 2.0 (Google, GitHub) — no password storage.                                                                                                                                                |
| FR-1.2 | The system shall link multiple OAuth providers to a single account when the provider-reported email matches an existing user, rather than creating a duplicate account.                                                                              |
| FR-1.3 | The system shall issue a short-lived JWT access token (15 min) and a long-lived refresh token (30 days) on successful login.                                                                                                                         |
| FR-1.4 | The system shall track active sessions per device (user agent, IP, issued date) and allow the user to view and revoke individual sessions.                                                                                                           |
| FR-1.5 | The system shall support "log out everywhere," invalidating all issued refresh tokens instantly via a token-version bump.                                                                                                                            |
| FR-1.6 | The system shall permanently and irreversibly delete a user's account and all associated data (content, topics, vectors, chats, sessions) within one user-initiated request, per GDPR "right to be forgotten," bypassing the soft-delete/trash flow. |
| FR-1.7 | The system shall auto-expire refresh token sessions after their TTL without requiring a manual cleanup job.                                                                                                                                          |

### FR-2 Universal Content Ingestion

| ID      | Requirement                                                                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-2.1  | The system shall accept standard web article URLs.                                                                                                                                       |
| FR-2.2  | The system shall accept YouTube URLs and extract available caption transcripts.                                                                                                          |
| FR-2.3  | The system shall accept uploaded PDF and EPUB documents up to a configured size limit (default 15MB), rejecting oversized files before processing begins.                                |
| FR-2.4  | The system shall accept PNG/JPG image uploads and extract text via OCR.                                                                                                                  |
| FR-2.5  | The system shall never persist raw uploaded file bytes; files are processed from memory/temp storage and discarded immediately after text extraction.                                    |
| FR-2.6  | The system shall normalize submitted URLs (strip tracking parameters, lowercase, remove trailing slashes) before deduplication checks.                                                   |
| FR-2.7  | The system shall reject a duplicate save of a URL already active in the user's library and return the existing item instead of creating a new one.                                       |
| FR-2.8  | The system shall allow re-saving a URL that was previously deleted and purged from trash.                                                                                                |
| FR-2.9  | The system shall detect near-duplicate content (same text, different URL — e.g., syndicated articles) via content hashing and flag it as a possible duplicate without blocking the save. |
| FR-2.10 | The system shall respond to a content-save request within 500ms by persisting a `PENDING` record and returning its ID, without waiting for extraction or AI processing to complete.      |
| FR-2.11 | The system shall enforce a per-user daily ingestion cap and reject new saves with a clear error once the cap is reached, resetting at UTC midnight.                                      |
| FR-2.12 | The system shall detect the content's language and surface it to the user as metadata.                                                                                                   |
| FR-2.13 | The system shall fail gracefully (structured error code, no partial/garbage data) when a YouTube video has no available captions.                                                        |

### FR-3 AI-Driven Parsing & Metadata Generation

| ID     | Requirement                                                                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-3.1 | The system shall generate a clean, standardized title for ingested content via LLM.                                                                                   |
| FR-3.2 | The system shall generate a concise summary of the content's core concepts.                                                                                           |
| FR-3.3 | The system shall extract 3–5 categorical topics from the content.                                                                                                     |
| FR-3.4 | The system shall proceed without forcing a padded topic list when fewer than 3 genuine topics are identifiable, marking the content as orphaned instead.              |
| FR-3.5 | The system shall chunk extracted text (~500 tokens, 50-token overlap) and generate vector embeddings for each chunk.                                                  |
| FR-3.6 | The system shall record which embedding model generated each vector, to support future model migrations without corrupting similarity search.                         |
| FR-3.7 | The system shall never overwrite a title or summary that the user has manually edited, even when content is re-processed.                                             |
| FR-3.8 | The system shall allow a user to explicitly trigger re-generation of AI metadata for a given item, overriding FR-3.7 only on that explicit action.                    |
| FR-3.9 | The system shall defer AI processing (not fail it) when the shared AI provider's rate/quota limit has been reached, and automatically resume once quota is available. |

### FR-4 Knowledge Graph Mapping

| ID     | Requirement                                                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-4.1 | The system shall maintain one root node per user, from which all topic nodes descend.                                                                                                       |
| FR-4.2 | The system shall create a topic node for each distinct extracted topic, deduplicated per user by normalized name.                                                                           |
| FR-4.3 | The system shall create bidirectional links between content and its associated topic nodes.                                                                                                 |
| FR-4.4 | The system shall link content with zero identified topics directly to the user's root node as an isolated/orphan node.                                                                      |
| FR-4.5 | The system shall recompute a content item's orphan status whenever its topic links change, whether by AI extraction or manual edit.                                                         |
| FR-4.6 | The system shall allow a user to manually create, rename, or delete topic nodes.                                                                                                            |
| FR-4.7 | The system shall allow a user to merge two topic nodes (e.g., "JS" into "JavaScript"), migrating all content links to the surviving node and tombstoning the merged one.                    |
| FR-4.8 | The system shall prevent deletion of AI-generated (non-user-created) topic nodes directly; such topics are hidden from the graph once their content count reaches zero rather than deleted. |
| FR-4.9 | The system shall assign each topic node a stable, deterministic display color derived from its name, consistent across sessions.                                                            |

### FR-5 Conversational AI Interface (RAG)

| ID      | Requirement                                                                                                                                                                        |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-5.1  | The system shall provide a chat interface that answers questions using only the requesting user's saved content.                                                                   |
| FR-5.2  | The system shall enforce tenant isolation at the vector search query level (not application logic alone) so no query can retrieve another user's data.                             |
| FR-5.3  | The system shall support single-document summarization requests scoped to one saved item.                                                                                          |
| FR-5.4  | The system shall support cross-document synthesis requests spanning multiple saved items.                                                                                          |
| FR-5.5  | The system shall return direct, clickable citations linking each claim back to its source content in the user's library.                                                           |
| FR-5.6  | The system shall degrade gracefully and inform the user when no relevant content exists for a query, rather than fabricating an answer.                                            |
| FR-5.7  | The system shall persist chat history per conversation, paginated, and support retrieving older messages on demand.                                                                |
| FR-5.8  | The system shall cap the conversational context (recent message count + retrieved chunks) sent to the AI provider per request, regardless of total conversation or library length. |
| FR-5.9  | The system shall flag citations pointing to since-deleted source content as "source removed" rather than producing a dead or broken link.                                          |
| FR-5.10 | The system shall surface a data-quality caveat on answers drawn from non-English or mixed-language sources.                                                                        |
| FR-5.11 | The system shall allow a user to view, rename, and delete individual chat conversations.                                                                                           |

### FR-6 Content Management & UI

| ID      | Requirement                                                                                                                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-6.1  | The system shall allow users to toggle content between "Read Later" (Queue) and "Completed" (Archive) states.                                                                                        |
| FR-6.2  | The system shall allow users to manually edit AI-generated titles and summaries.                                                                                                                     |
| FR-6.3  | The system shall allow users to manually add or remove topic links on a content item.                                                                                                                |
| FR-6.4  | The system shall visually render the knowledge graph with pan, zoom, and click-to-view-content interactions.                                                                                         |
| FR-6.5  | The system shall soft-delete content on user deletion, moving a full snapshot to a recoverable trash state.                                                                                          |
| FR-6.6  | The system shall allow users to restore soft-deleted content, re-establishing its prior topic links (recreating any topic that no longer exists).                                                    |
| FR-6.7  | The system shall permanently purge trashed content — and its associated vector data — automatically after 30 days.                                                                                   |
| FR-6.8  | The system shall allow users to permanently delete content immediately, bypassing the 30-day trash retention, on explicit confirmation.                                                              |
| FR-6.9  | The system shall display real-time processing status (Pending / Extracting / Generating Metadata / Mapping Graph / Embedding / Completed / Failed) for each item.                                    |
| FR-6.10 | The system shall display a targeted, human-readable error and a retry action when ingestion fails, differentiated by failure cause (extraction, quota, unsupported format, file too large, timeout). |
| FR-6.11 | The system shall allow a user to manually retry failed ingestion, restarting the pipeline from the beginning.                                                                                        |

### FR-7 Background Processing & Reliability

| ID     | Requirement                                                                                                                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-7.1 | The system shall process content ingestion asynchronously such that the initiating API request is never blocked on extraction, AI calls, or embedding generation.                                                     |
| FR-7.2 | The system shall atomically claim a pending job such that no two workers/processes can process the same item concurrently.                                                                                            |
| FR-7.3 | The system shall detect jobs stuck mid-processing (e.g., due to a crash or restart) and automatically requeue them after a defined staleness threshold.                                                               |
| FR-7.4 | The system shall retry a failed processing step up to a fixed limit before marking the item permanently failed, resuming from the last completed step rather than restarting the whole pipeline on automatic retries. |
| FR-7.5 | The system shall preserve partially completed embedding work (already-embedded chunks) across a retry rather than regenerating from scratch.                                                                          |
| FR-7.6 | The system shall log every processing attempt (step, outcome, duration, error) to a retryable audit trail, retained for a fixed window for debugging purposes.                                                        |

### FR-8 Administration & Quota Governance

| ID     | Requirement                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-8.1 | The system shall track AI provider request and token usage globally, per day, separated by call type (metadata generation vs. embedding).                          |
| FR-8.2 | The system shall halt initiating new AI calls once the shared daily/rate quota is reached, deferring queued work rather than allowing calls to fail unpredictably. |
| FR-8.3 | The system shall enforce a per-user daily ingestion ceiling independent of the global quota, to prevent a single user from starving others.                        |

---

## Part 2 — Non-Functional Requirements (NFR)

### NFR-1 Security & Privacy

| ID      | Requirement                                                                                                                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1.1 | All data access shall enforce strict per-tenant isolation via `userId` scoping on every query, including vector search filters — a query shall never return another user's data under any condition. |
| NFR-1.2 | Authentication shall use OAuth 2.0 for identity and JWT for API authorization; no plaintext credentials are ever stored.                                                                             |
| NFR-1.3 | Refresh tokens shall be stored only as irreversible hashes; a database compromise alone shall not permit session impersonation.                                                                      |
| NFR-1.4 | Access tokens shall expire within 15 minutes; refresh tokens shall expire and be purged automatically within 30 days of issuance.                                                                    |
| NFR-1.5 | All data in transit shall be encrypted via HTTPS/TLS between client, API, database, and AI provider.                                                                                                 |
| NFR-1.6 | File uploads shall be validated by MIME type and size before processing to prevent resource-exhaustion attacks.                                                                                      |
| NFR-1.7 | Account deletion shall be permanent, complete, and irreversible across all collections within a bounded time, satisfying data-protection "right to be forgotten" obligations.                        |
| NFR-1.8 | The system shall never log or persist raw file contents beyond the extraction step.                                                                                                                  |

### NFR-2 Performance

| ID      | Requirement                                                                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-2.1 | Text-based URL ingestion shall complete extraction, metadata generation, and graph mapping within 10 seconds under normal AI provider latency. |
| NFR-2.2 | The content-save API endpoint shall return a processing acknowledgment within 500ms regardless of source type or size.                         |
| NFR-2.3 | The knowledge graph UI shall sustain 60 FPS while rendering up to 2,000 concurrent nodes using WebGL/Canvas rendering.                         |
| NFR-2.4 | RAG chat queries shall return a response within 5 seconds under normal AI provider latency, excluding cases deferred by quota limits.          |
| NFR-2.5 | Library list views shall load without requiring per-item population/join queries, via denormalized topic snapshots.                            |

### NFR-3 Reliability & Availability

| ID      | Requirement                                                                                                                                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-3.1 | Background processing shall survive an application restart or cold-start without losing or duplicating work, via atomic job claiming and stale-job recovery.                                                    |
| NFR-3.2 | The system shall tolerate the hosting platform's free-tier idle-sleep behavior without leaving jobs permanently stuck.                                                                                          |
| NFR-3.3 | No single point of failure shall cause silent data loss; all destructive operations (delete) shall be soft by default with a recovery window, except where legally required to be immediate (account deletion). |
| NFR-3.4 | Multi-document state changes that must be atomic (e.g., full account deletion cascade) shall use database transactions to prevent partial-completion states.                                                    |

### NFR-4 Scalability

| ID      | Requirement                                                                                                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-4.1 | The system architecture shall allow horizontal scaling of the API/worker layer without requiring code changes to the ingestion pipeline.                                            |
| NFR-4.2 | Database collections shall remain within the free-tier storage ceiling (512MB) through active lifecycle management: raw file discard, trash TTL purge, and job-log TTL purge.       |
| NFR-4.3 | Chat message storage shall scale independently of per-conversation document size limits by storing messages as discrete, indexed records rather than embedded arrays.               |
| NFR-4.4 | The system shall operate within a single logical vector search index shared across all users and content, filtered per query, to remain within free-tier vector index count limits. |

### NFR-5 Cost Constraint ("Zero-Cost")

| ID      | Requirement                                                                                                                                                                            |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-5.1 | The system shall operate entirely within free-tier limits of all third-party services (MongoDB Atlas M0, Gemini API, Vercel, Render/Fly.io) under normal expected load.                |
| NFR-5.2 | The system shall not depend on any paid infrastructure component (no dedicated Redis, no paid object storage, no paid vector database, no paid graph database) for core functionality. |
| NFR-5.3 | The system shall proactively throttle its own AI usage to stay within the third-party free-tier's rate and daily quotas rather than relying on the provider to reject overages.        |

### NFR-6 Data Integrity & Consistency

| ID      | Requirement                                                                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-6.1 | Concurrent duplicate-save attempts for the same URL shall resolve idempotently (return existing item) rather than producing duplicate records or unhandled errors.            |
| NFR-6.2 | Concurrent topic-creation attempts for the same normalized name shall resolve to a single topic node without duplication.                                                     |
| NFR-6.3 | A content item deleted mid-processing shall not be resurrected by an in-flight background job completing afterward.                                                           |
| NFR-6.4 | Denormalized counters (topic content counts, user content counts, chat message counts) shall remain consistent with their source-of-truth collections under normal operation. |
| NFR-6.5 | Vector embeddings for a given content item shall be fully removed whenever that item is permanently deleted, with no orphaned vectors remaining searchable.                   |

### NFR-7 Usability

| ID      | Requirement                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-7.1 | Processing status shall be visible to the user in real time (via polling) at each pipeline stage, not only as a binary pending/done state. |
| NFR-7.2 | Failure states shall present a specific, actionable reason rather than a generic error.                                                    |
| NFR-7.3 | Destructive actions (permanent delete, account deletion, non-user-created topic changes) shall require explicit user confirmation.         |
| NFR-7.4 | AI-generated content quality caveats (e.g., detected non-English source) shall be visible at the point of use, not buried in settings.     |

### NFR-8 Maintainability & Extensibility

| ID      | Requirement                                                                                                                                                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-8.1 | The AI provider integration shall be abstracted behind a provider-agnostic interface, allowing the underlying LLM/embedding model to be swapped without changes to calling code.             |
| NFR-8.2 | Content extraction logic shall be abstracted per source type behind a common extractor interface, allowing new source types to be added without modifying the ingestion orchestration logic. |
| NFR-8.3 | Embedding records shall retain the generating model's identity to support safe, incremental re-embedding migrations.                                                                         |
| NFR-8.4 | Shared types, database schemas, and business logic shall be centralized in monorepo packages, consumed by the API (and any future worker process) without duplication.                       |

### NFR-9 Compliance

| ID      | Requirement                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-9.1 | The system shall support full, verifiable erasure of a user's personal data on request, in line with GDPR-style data-subject rights. |
| NFR-9.2 | The system shall not retain raw uploaded documents or images beyond the minimum time needed for text extraction.                     |
| NFR-9.3 | Debug/audit logs containing processing details shall auto-expire on a fixed retention window rather than accumulating indefinitely.  |
