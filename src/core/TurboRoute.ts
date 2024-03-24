import { TurboRequestSchema } from "./TurboRequestSchema.js";

export interface ITurboRouteOptions {
  method: TurboCore.IHTTPMethod;
  pattern: string;
  schema?: TurboRequestSchema;
  middlewares?: TurboCore.IHandleFunction[];
  handle: TurboCore.IHandleFunction;
}

export class TurboRoute {
  constructor(options: ITurboRouteOptions) {
    this.method = options.method;
    this.pattern = options.pattern;
    this.schema = options.schema;
    this.middlewares = options.middlewares || [];
    this.handle = options.handle;
  }

  public method: TurboCore.IHTTPMethod;
  public pattern: string;
  public schema: TurboRequestSchema | undefined = undefined;
  public middlewares: TurboCore.IHandleFunction[] = [];
  public handle: TurboCore.IHandleFunction;
}

export const BuildRoute = (opts: ITurboRouteOptions) => new TurboRoute(opts);
