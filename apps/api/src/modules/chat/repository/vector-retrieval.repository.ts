import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import { VectorChunkModel, type IVectorChunk } from "@workspace/db"
import type { VectorChunkEntity } from "../domain"
import { CHAT_RETRIEVAL_CANDIDATE_LIMIT } from "../domain"
import { mapVectorChunkDoc } from "./chat-message.mapper"

@Injectable()
export class VectorRetrievalRepository {
  async loadCandidates(input: {
    readonly userId: string
    readonly contentId?: string
  }): Promise<readonly VectorChunkEntity[]> {
    const filter: { userId: string; contentId?: Types.ObjectId } = {
      userId: input.userId,
    }
    if (input.contentId) {
      if (!isValidObjectId(input.contentId)) return []
      filter.contentId = new Types.ObjectId(input.contentId)
    }
    const docs = await VectorChunkModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(CHAT_RETRIEVAL_CANDIDATE_LIMIT)
      .lean<IVectorChunk[]>()
    return docs.map(mapVectorChunkDoc)
  }
}
