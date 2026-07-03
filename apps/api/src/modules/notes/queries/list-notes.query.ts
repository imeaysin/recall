import type { NoteActorScope } from "../note.scope"

export class ListNotesQuery {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string
  ) {}

  get scope(): NoteActorScope {
    return {
      organizationId: this.organizationId,
      userId: this.userId,
    }
  }
}
