import { Types } from "mongoose"
import { chunkText, type AiClient } from "@workspace/ai"
import { VectorChunkModel } from "@workspace/db"

export type EmbedContentInput = {
  readonly ai: AiClient
  readonly userId: string
  readonly contentId: string
  readonly text: string
}

export async function embedContentChunks(
  input: EmbedContentInput
): Promise<void> {
  const existingChunks = await VectorChunkModel.countDocuments({
    contentId: input.contentId,
  })
  const chunks = chunkText(input.text)
  const toEmbed = chunks.slice(existingChunks)
  if (toEmbed.length === 0) return

  const { embeddings, embeddingModel } = await input.ai.embed(toEmbed)
  await VectorChunkModel.insertMany(
    toEmbed.map((text, index) => ({
      userId: input.userId,
      contentId: new Types.ObjectId(input.contentId),
      chunkIndex: existingChunks + index,
      text,
      tokenCount: Math.ceil(text.length / 4),
      embedding: embeddings[index],
      embeddingModel,
    }))
  )
}
