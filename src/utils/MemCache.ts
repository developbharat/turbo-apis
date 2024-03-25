import type { ICacheOptions } from "../core/TurboCustom.js";
import { DateTime } from "./DateTime.js";

interface IMemCache<TData = any> {
  expiresAt: Date;
  data: TData;
}

export class MemCache {
  private static cache = new Map<string, IMemCache>();
  private static expiresCheckStarted: boolean = false;

  private static isExpired(expiresAt: Date): boolean {
    return expiresAt.getTime() < new DateTime().getTime();
  }

  private static cleanExpiredEntries() {
    if (this.expiresCheckStarted) return;

    setInterval(() => {
      for (const [key, value] of this.cache.entries()) {
        if (this.isExpired(value.expiresAt)) this.cache.delete(key);
      }
    }, 5000);
  }

  public static setCache<TData = any>(data: TData, opts: ICacheOptions): void {
    const expiresAt: Date = new DateTime().addMilliSeconds(opts.ttl);
    this.cache.set(opts.name, { expiresAt: expiresAt, data: data });

    // start expiration checks to remove unwanted keys if not yet started.
    if (!this.expiresCheckStarted) this.cleanExpiredEntries();
  }

  public static checkCache<TResult = unknown>(name: string): TResult | null {
    const value = this.cache.get(name);

    // return null incase value is expired or not found
    if (!value || this.isExpired(value.expiresAt)) return null;
    return value.data as TResult;
  }
}
