export class ListNotesQuery {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string
  ) {}
}
