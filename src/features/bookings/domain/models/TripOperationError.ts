export class TripOperationError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "TripOperationError";
  }
}
