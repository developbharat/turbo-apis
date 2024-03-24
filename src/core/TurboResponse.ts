import { IncomingMessage, ServerResponse } from "http";
import type { ICacheOptions, TurboCustom } from "./TurboCustom.js";

export interface ITurboSetInitialOptions {
  custom: TurboCustom;
}

export class TurboResponse<Request extends IncomingMessage = IncomingMessage> extends ServerResponse<Request> {
  private custom: TurboCustom | undefined = undefined;
  private extras: Map<string, any> = new Map();

  protected setInitialOptions(options: ITurboSetInitialOptions) {
    this.custom = options.custom;
  }

  public setExtras<TValue = any>(name: string, value: TValue): TurboResponse {
    this.extras.set(name, value);
    return this;
  }

  public useExtras<TValue = any>(name: string): TValue | null {
    return (this.extras.get(name) as TValue | undefined) || null;
  }

  public setStatus(code: number, status: string = ""): TurboResponse {
    this.statusCode = code;
    if (!!status) this.statusMessage = status;
    return this;
  }

  public json<TData = any>(data: TData): TurboResponse {
    this.setHeader("content-type", "application/json");
    this.custom?.onSuccess(this, data);
    return this;
  }

  public async cache<TResult = any>(options: ICacheOptions, func: () => TResult | Promise<TResult>): Promise<TResult> {
    // check if data exists in cache.
    const cachedContent = await this.custom?.checkCache(options.name);
    if (cachedContent !== null) return cachedContent as TResult;

    // store content in cache and return data.
    const result = await func();
    this.custom?.setCache(result, options);
    return result as TResult;
  }
}
