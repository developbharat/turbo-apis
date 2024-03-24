import type { TurboRequest } from "./TurboRequest.js";
import { TurboRequestSchema } from "./TurboRequestSchema.js";
import type { TurboResponse } from "./TurboResponse.js";

export type IHTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "CONNECT" | "TRACE";

export type IHandleFunction = (req: TurboRequest, res: TurboResponse) => any | Promise<any>;

export interface ITurboRouteOptions {
  method: IHTTPMethod;
  pattern: string;
  schema?: TurboRequestSchema;
  middlewares?: IHandleFunction[];
  handle: IHandleFunction;
}

export class TurboRoute {
  constructor(options: ITurboRouteOptions) {
    this.method = options.method;
    this.pattern = options.pattern;
    this.schema = options.schema;
    this.middlewares = options.middlewares || [];
    this.handle = options.handle;
  }

  public method: IHTTPMethod;
  public pattern: string;
  public schema: TurboRequestSchema | undefined = undefined;
  public middlewares: IHandleFunction[] = [];
  public handle: IHandleFunction;
}

export const BuildRoute = (opts: ITurboRouteOptions) => new TurboRoute(opts);
