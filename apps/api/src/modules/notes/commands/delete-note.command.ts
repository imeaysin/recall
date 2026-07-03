import type { NoteMutationScope } from "../note.scope"

export class DeleteNoteCommand {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly noteId: string
  ) {}

  get scope(): NoteMutationScope {
    return {
      organizationId: this.organizationId,
      userId: this.userId,
      noteId: this.noteId,
    }
  }
}
