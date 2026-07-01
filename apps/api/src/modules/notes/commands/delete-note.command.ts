export class DeleteNoteCommand {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly noteId: string
  ) {}
}
