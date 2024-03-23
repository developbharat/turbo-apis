declare namespace TurboCore {
  export interface IParseUrlResult {
    pathname: string;
    search: string;
    searchParams: URLSearchParams;
  }

  export interface ITurboServerOptions {
    server?: import("http").Server;
  }

  export interface ICacheOptions {
    ttl: number;
    name: string;
  }

  export type IHTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "CONNECT" | "TRACE";

  export type IHandleFunction = (req: TurboRequest, res: TurboResponse) => any | Promise<any>;

  export interface ITurboRouteOptions {
    method: IHTTPMethod;
    pattern: string;
    middlewares: TurboCore.IHandleFunction[];
    handle: TurboCore.IHandleFunction;
  }

  export interface ITurboSetInitialOptions {
    custom: TurboCustom;
  }
}
