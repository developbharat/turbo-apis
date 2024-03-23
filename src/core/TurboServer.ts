import http from "http";
import { Trouter as Router, type Methods } from "trouter";
import { TurboCustom } from "./TurboCustom.js";
import { TurboException } from "./TurboException.js";
import { TurboRequest } from "./TurboRequest.js";
import { TurboResponse } from "./TurboResponse.js";
import { TurboRoute } from "./TurboRoute.js";

function lead(x: string) {
  return x.startsWith("/") ? x : "/" + x;
}

function value(x: string) {
  let y = x.indexOf("/", 1);
  return y > 1 ? x.substring(0, y) : x;
}

export class TurboServer extends Router<TurboRoute> {
  public server: TurboCore.ITurboServerOptions["server"];
  public custom: TurboCustom = new TurboCustom();

  constructor(opts: TurboCore.ITurboServerOptions = {}) {
    super();
    this.server = opts.server;
    this.handler = this.handler.bind(this);
  }

  public async scanRoutes(dirpath: string): Promise<void> {
    // scan and add each found route to our app
    const routes = await this.custom.scanRoutes(dirpath);
    routes.forEach((route) => this.add(route.method, route.pattern, route));
  }

  public add(method: TurboCore.IHTTPMethod, pattern: string, route: TurboRoute) {
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

  private async executeHandle(
    req: TurboRequest,
    res: TurboResponse,
    handle: TurboCore.IHandleFunction,
  ): Promise<boolean> {
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
    // parse url and set initial options for request and response.
    const parsedUrl = this.custom.parse(request);
    request["setInitialOptions"]({ custom: this.custom });
    response["setInitialOptions"]({ custom: this.custom });

    // find turbo route for current request
    const method = request.method?.toUpperCase() as Methods;
    const { params, handlers } = this.find(method, parsedUrl.pathname);

    // handle route not found case.
    if (handlers.length !== 1) {
      return this.custom.onError(new TurboException(404, `Route not found for path: ${parsedUrl.pathname}`), response);
    }

    // prepare request for further processing
    request.params = params;

    // invoke middlewares
    const route = handlers.shift()!;
    for (let middleware of route.middlewares) {
      const shallContinue = await this.executeHandle(request, response, middleware);
      if (!shallContinue) return;
    }

    // execute request handle
    await this.executeHandle(request, response, route.handle);
  }
}

export const turbo = (opts: TurboCore.ITurboServerOptions = {}) => new TurboServer(opts);
