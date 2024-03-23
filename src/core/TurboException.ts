export class TurboException extends Error {
  constructor(public readonly statusCode: number, content: string) {
    super(content);
  }
}
