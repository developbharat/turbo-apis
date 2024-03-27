import { MemCache } from "../utils/index.js";
import type { TurboContext } from "./TurboContext.js";
import type { TurboException } from "./TurboException.js";
import type { TurboRequest } from "./TurboRequest.js";
import type { TurboResponse } from "./TurboResponse.js";

export interface IParseUrlResult {
  pathname: string;
  search: string;
  searchParams: URLSearchParams;
}

export interface ICacheOptions {
  ttl: number;
  name: string;
}

export interface ITurboCustom {
  parse(req: TurboRequest): IParseUrlResult;
  onError(err: TurboException, res: TurboResponse, context: TurboContext): void;
  onSuccess(res: TurboResponse, context: TurboContext, data: any): void;
  setCache(data: any, opts: ICacheOptions): Promise<void>;
  checkCache<TResult = any>(name: string): Promise<TResult | null>;
}

export class TurboCustom implements ITurboCustom {
  public parse(req: TurboRequest): IParseUrlResult {
    const sampleUrl = req.url?.startsWith("/") ? "http://a.b" : "http://a.b/";
    const { pathname, search, searchParams } = new URL(sampleUrl + req.url);
    return { pathname, search, searchParams };
  }

  public onError(err: TurboException, res: TurboResponse, _context: TurboContext): void {
    res
      .setStatus(err.statusCode)
      .end(JSON.stringify({ success: false, code: err.statusCode, status: err.message, data: null }));
  }

  public onSuccess(res: TurboResponse, context: TurboContext, data: any): void {
    const statusCode = Number(context.useExtras<number>("code") || res.statusCode) || 200;
    const status = context.useExtras<string>("status") || "Request successful.";

    res.setStatus(statusCode).end(
      JSON.stringify({
        success: true,
        code: statusCode,
        status: status,
        data: data,
      }),
    );
  }

  public async setCache(data: any, opts: ICacheOptions): Promise<void> {
    return MemCache.setCache(data, opts);
  }

  public async checkCache<TResult = any>(name: string): Promise<TResult | null> {
    return MemCache.checkCache(name);
  }
}
