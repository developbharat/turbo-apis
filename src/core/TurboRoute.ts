export class TurboRoute {
  constructor(options: TurboCore.ITurboRouteOptions) {
    this.method = options.method;
    this.pattern = options.pattern;
    this.middlewares = options.middlewares;
    this.handle = options.handle;
  }

  public method: TurboCore.IHTTPMethod;
  public pattern: string;
  public middlewares: TurboCore.IHandleFunction[] = [];
  public handle: TurboCore.IHandleFunction;
}

export const Route = (opts: TurboCore.ITurboRouteOptions) => new TurboRoute(opts);
