export class ContentIngestionRequestedEvent {
  constructor(
    public readonly contentId: string,
    public readonly userId: string
  ) {}
}
