export class TurboContext {
  private extras: Map<string, any> = new Map();

  public setExtras<TValue = any>(name: string, value: TValue): TurboContext {
    this.extras.set(name, value);
    return this;
  }

  public useExtras<TValue = any>(name: string): TValue | null {
    return (this.extras.get(name) as TValue | undefined) || null;
  }
}
