import { Injectable } from "@nestjs/common"
import type {
  CreateTopic,
  MergeTopic,
  TopicListQuery,
  TopicResponse,
  UpdateTopic,
} from "@workspace/contracts"
import { TopicCommandRepository, TopicQueryRepository } from "./repository"
import {
  TopicMergeInvalidException,
  TopicNotFoundException,
  TopicNotUserCreatedException,
  TopicRootProtectedException,
  type TopicActorScope,
  type TopicMutationScope,
} from "./domain"
import { toTopicResponse } from "./dto"

@Injectable()
export class TopicsService {
  constructor(
    private readonly queryRepo: TopicQueryRepository,
    private readonly commandRepo: TopicCommandRepository
  ) {}

  async list(
    scope: TopicActorScope,
    query: TopicListQuery = {}
  ): Promise<{ items: TopicResponse[] }> {
    const items = await this.queryRepo.listForUser(scope.userId, query)
    return { items: items.map(toTopicResponse) }
  }

  async create(
    scope: TopicActorScope,
    input: CreateTopic
  ): Promise<TopicResponse> {
    const entity = await this.commandRepo.createUserTopic({
      userId: scope.userId,
      name: input.name,
    })
    return toTopicResponse(entity)
  }

  async rename(
    scope: TopicMutationScope,
    input: UpdateTopic
  ): Promise<TopicResponse> {
    const existing = await this.queryRepo.findByIdForUser(scope)
    if (!existing) throw new TopicNotFoundException()
    if (this.queryRepo.isRootEntity(existing)) {
      throw new TopicRootProtectedException()
    }

    const updated = await this.commandRepo.renameUserTopic({
      userId: scope.userId,
      topicId: scope.topicId,
      name: input.name,
    })
    if (!updated) throw new TopicNotFoundException()
    return toTopicResponse(updated)
  }

  async remove(scope: TopicMutationScope): Promise<void> {
    const existing = await this.queryRepo.findByIdForUser(scope)
    if (!existing) throw new TopicNotFoundException()
    if (this.queryRepo.isRootEntity(existing)) {
      throw new TopicRootProtectedException()
    }
    if (!existing.isUserCreated) {
      throw new TopicNotUserCreatedException()
    }

    const ok = await this.commandRepo.deleteUserTopic({
      userId: scope.userId,
      topicId: scope.topicId,
    })
    if (!ok) throw new TopicNotFoundException()
  }

  async merge(
    scope: TopicMutationScope,
    input: MergeTopic
  ): Promise<TopicResponse> {
    const source = await this.queryRepo.findByIdForUser(scope)
    if (!source) throw new TopicNotFoundException()
    if (this.queryRepo.isRootEntity(source)) {
      throw new TopicRootProtectedException()
    }
    if (source.mergedIntoTopicId) {
      throw new TopicMergeInvalidException("Source topic is already merged")
    }

    const merged = await this.commandRepo.mergeTopics({
      userId: scope.userId,
      sourceTopicId: scope.topicId,
      intoTopicId: input.intoTopicId,
    })
    if (!merged) throw new TopicNotFoundException("Target topic not found")
    return toTopicResponse(merged)
  }
}
