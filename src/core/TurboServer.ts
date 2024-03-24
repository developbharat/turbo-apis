import { DefaultErrorFunction, SetErrorFunction } from "@sinclair/typebox/errors";
import http from "http";
import { Trouter as Router, type Methods } from "trouter";
import { TurboCustom } from "./TurboCustom.js";
import { TurboException } from "./TurboException.js";
import { TurboRequest } from "./TurboRequest.js";
import { TurboResponse } from "./TurboResponse.js";
import { TurboRoute, type IHTTPMethod, type IHandleFunction } from "./TurboRoute.js";

export interface ITurboServerOptions {
  server?: import("http").Server;
}

function lead(x: string) {
  return x.startsWith("/") ? x : "/" + x;
}

function value(x: string) {
  let y = x.indexOf("/", 1);
  return y > 1 ? x.substring(0, y) : x;
}

// set custom error handler for typebox validator
SetErrorFunction((ex) => {
  console.log({ ex });
  // Remove starting / from path and replace with dots(.)
  ex.path = ex.path.startsWith("/") ? ex.path.slice(1) : ex.path;
  ex.path = ex.path.split("/").join(".");

  // Build meaningful error based on default exception message.
  const exceptionText = DefaultErrorFunction(ex).toLowerCase();
  return `${ex.path} is ${exceptionText} but found ${ex.value}`;
});

export class TurboServer extends Router<TurboRoute> {
  public server: ITurboServerOptions["server"];
  public custom: TurboCustom = new TurboCustom();

  constructor(opts: ITurboServerOptions = {}) {
    super();
    this.server = opts.server;
    this.handler = this.handler.bind(this);
  }

  public async scanRoutes(dirpath: string): Promise<void> {
    // scan and add each found route to our app
    const routes = await this.custom.scanRoutes(dirpath);
    routes.forEach((route) => this.add(route.method, route.pattern, route));
  }

  public override add(method: IHTTPMethod, pattern: string, route: TurboRoute) {
    let base = lead(value(pattern));

    // raise exception if route with same pattern already exists.
    const exists = this.find(method, pattern);
    if (exists.handlers.length >= 1)
      throw new Error(
        `Cannot mount ".${method.toLowerCase()}('${lead(
          pattern,
        )}')" because a Turbo route at '${base}' already exists with same pattern!`,
      );

    // add route to Trouter
    return super.add(method, pattern, route);
  }

  // TODO: expose this method to utilise your system resources
  // efficiently this will configure os max connections limit and
  // make other optimisations to efficiently use hardware resources.
  // Check: https://stackoverflow.com/questions/410616/increasing-the-maximum-number-of-tcp-ip-connections-in-linux
  // public optimise(): Turbo {
  //   throw new Error("We will implement this method in future")
  // }

  public listen(
    port: number = 4000,
    hostname: string = "127.0.0.1",
    callback?: () => void,
    maxConnections?: number,
  ): TurboServer {
    this.server =
      this.server ||
      http.createServer(
        {
          IncomingMessage: TurboRequest,
          ServerResponse: TurboResponse,
        },
        this.handler,
      );
    if (!callback) callback = () => console.log(`Server started at http://${hostname}:${port}`);
    this.server.listen(port, hostname, maxConnections, callback);
    return this;
  }

  private async executeHandle(req: TurboRequest, res: TurboResponse, handle: IHandleFunction): Promise<boolean> {
    // exit if res.end is already called.
    if (res.writableEnded) return false;

    try {
      await handle(req, res);
    } catch (ex) {
      ex = ex instanceof TurboException ? ex : new TurboException(500, ex.message);
      this.custom.onError(ex, res);
      if (!res.writableEnded) res.end();
    }

    // should i continue now.
    return res.writableEnded ? false : true;
  }

  private async handler(request: TurboRequest, response: TurboResponse): Promise<any> {
    try {
      // parse url and set initial options for request and response.
      const parsedUrl = this.custom.parse(request);
      response["setInitialOptions"]({ custom: this.custom });

      // find turbo route for current request
      const method = request.method?.toUpperCase() as Methods;
      const { params, handlers } = this.find(method, parsedUrl.pathname);

      // handle route not found case.
      if (handlers.length !== 1) throw new TurboException(404, `Route not found for path: ${parsedUrl.pathname}`);

      // We can have atmost 1 route per path, hence extract first route
      const route = handlers.shift()!;

      // Validate and sanitise Request data
      if (!!route.schema) {
        const data = await request["sanitiseAndValidate"](params, route.schema);
        request["sanitisedData"] = data;
      }

      // invoke middlewares
      for (let middleware of route.middlewares) {
        const shallContinue = await this.executeHandle(request, response, middleware);
        if (!shallContinue) return;
      }

      // execute request handle
      await this.executeHandle(request, response, route.handle);
    } catch (ex) {
      const exception: TurboException =
        ex instanceof TurboException ? ex : new TurboException(500, (ex as Error).message);
      return this.custom.onError(exception, response);
    }
  }
}

export const BuildTurbo = (opts: ITurboServerOptions = {}) => new TurboServer(opts);
