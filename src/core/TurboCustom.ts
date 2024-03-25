import fs from "fs/promises";
import path from "path";
import { MemCache } from "../utils/index.js";
import type { TurboException } from "./TurboException.js";
import type { TurboRequest } from "./TurboRequest.js";
import type { TurboResponse } from "./TurboResponse.js";
import { TurboRoute } from "./TurboRoute.js";

interface IParseUrlResult {
  pathname: string;
  search: string;
  searchParams: URLSearchParams;
}

export interface ICacheOptions {
  ttl: number;
  name: string;
}

export class TurboCustom {
  public parse(req: TurboRequest): IParseUrlResult {
    const sampleUrl = req.url?.startsWith("/") ? "http://a.b" : "http://a.b/";
    const { pathname, search, searchParams } = new URL(sampleUrl + req.url);
    return { pathname, search, searchParams };
  }

  public onError(err: TurboException, res: TurboResponse): void {
    res
      .setStatus(err.statusCode)
      .end(JSON.stringify({ success: false, code: err.statusCode, status: err.message, data: null }));
  }

  public onSuccess(res: TurboResponse, data: any): void {
    const statusCode = Number(res.useExtras<number>("code") || res.statusCode) || 200;
    const status = res.useExtras<string>("status") || "Request successful.";

    res.setStatus(statusCode).end(
      JSON.stringify({
        success: true,
        code: statusCode,
        status: status,
        data: data,
      }),
    );
  }

  public async scanRoutes(dirpath: string): Promise<TurboRoute[]> {
    // Read all files recursively from provided directory with whitelisted extensions
    const dirItems = await fs.readdir(dirpath || ".", { encoding: "utf8", recursive: true, withFileTypes: true });

    // Extract all Routes from scanned files inside specified directory.
    let routes: TurboRoute[] = [];
    for (let item of dirItems) {
      // continue if file is not whitelisted.
      const found =
        item.name.endsWith(".ts") ||
        item.name.endsWith(".js") ||
        item.name.endsWith(".cjs") ||
        item.name.endsWith(".mjs");
      if (!found) continue;

      // import TurboRoute from current file
      const filepath = path.join(item.path, item.name);
      const imported = await import(filepath);
      // Print warning and continue for invalid Route
      const routesFound = Object.values(imported).filter((item) => item instanceof TurboRoute) as TurboRoute[];
      if (routesFound.length === 0) {
        // console.warn(`${filepath} doesn't export a valid TurboRoute instance`);
        continue;
      }

      // add each route to our app
      routesFound.forEach((route) => routes.push(route));
    }

    return routes;
  }

  public async setCache(data: any, opts: ICacheOptions): Promise<void> {
    return MemCache.setCache(data, opts);
  }

  public async checkCache<TResult = any>(name: string): Promise<TResult | null> {
    return MemCache.checkCache(name);
  }
}
