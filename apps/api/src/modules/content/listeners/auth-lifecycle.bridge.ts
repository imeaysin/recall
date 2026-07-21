import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { setAuthUserDeletedHandler } from "@workspace/auth/server/lifecycle"
import { AppEvents } from "@/common/events"
import { UserDeletedEvent } from "@/modules/users/events/user-deleted.event"

@Injectable()
export class AuthLifecycleBridge implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  onModuleInit(): void {
    setAuthUserDeletedHandler(async (userId) => {
      this.eventEmitter.emit(
        AppEvents.USER_DELETED,
        new UserDeletedEvent(userId)
      )
    })
  }

  onModuleDestroy(): void {
    setAuthUserDeletedHandler(null)
  }
}
