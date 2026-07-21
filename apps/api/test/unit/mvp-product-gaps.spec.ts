import {
  cosineSimilarity,
  selectTopSimilarChunks,
} from "@/modules/chat/domain/cosine-similarity"
import { parseTrashSnapshot } from "@/modules/content/repository/content-lifecycle-trash-parse"

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1)
  })

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0)
  })
})

describe("selectTopSimilarChunks", () => {
  it("returns the highest scoring chunks", () => {
    const chunks = [
      {
        id: "a",
        userId: "u",
        contentId: "c1",
        chunkIndex: 0,
        text: "alpha",
        embedding: [1, 0],
      },
      {
        id: "b",
        userId: "u",
        contentId: "c2",
        chunkIndex: 0,
        text: "beta",
        embedding: [0.9, 0.1],
      },
      {
        id: "c",
        userId: "u",
        contentId: "c3",
        chunkIndex: 0,
        text: "gamma",
        embedding: [0, 1],
      },
    ]
    const top = selectTopSimilarChunks({
      queryEmbedding: [1, 0],
      chunks,
      topK: 2,
    })
    expect(top.map((chunk) => chunk.id)).toEqual(["a", "b"])
  })
})

describe("parseTrashSnapshot", () => {
  it("reads title and topic snapshots", () => {
    const parsed = parseTrashSnapshot({
      title: "Hello",
      sourceType: "ARTICLE",
      topicSnapshot: [{ topicId: "t1", name: "JS" }],
    })
    expect(parsed.title).toBe("Hello")
    expect(parsed.sourceType).toBe("ARTICLE")
    expect(parsed.topicSnapshot).toEqual([{ topicId: "t1", name: "JS" }])
  })
})
