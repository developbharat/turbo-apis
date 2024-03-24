import { IncomingMessage } from "http";
import type { Socket } from "net";
import type { ITurboRequestSchemaData, TurboRequestSchema } from "./TurboRequestSchema.js";
import { TurboException } from "./TurboException.js";

export class TurboRequest extends IncomingMessage {
  private data: string = "";
  private sanitisedData: ITurboRequestSchemaData = { headers: {}, params: {}, data: {} };

  constructor(socket: Socket) {
    super(socket);
  }

  protected async sanitiseAndValidate<THeaders, TParams, TData>(
    params: Record<string, any>,
    schema: TurboRequestSchema,
  ): Promise<ITurboRequestSchemaData<THeaders, TParams, TData>> {
    // Parse Request body
    const isJsonRequest = this.headers["content-type"] === "application/json";
    const body = await this.useBody(isJsonRequest ? "json" : "text");

    // Validate Request data
    const data: ITurboRequestSchemaData = { headers: this.headers, params: params, data: body };
    const validation = schema.isInvalid(data);
    if (validation !== null) throw validation;

    // sanitise request data if request is valid.
    return schema.sanitize(data);
  }

  public useSanitisedData<TResult = unknown>(): TResult {
    return this.sanitisedData as TResult;
  }

  public async useBody(format: "text" | "json" = "json") {
    // parse body if not already parsed.
    if (this.data === "") this.data = await this.parseRequestData();

    // return parsed data
    switch (format) {
      case "text":
        return this.data;
      case "json":
        return JSON.parse(this.data);
      default:
        return this.data;
    }
  }

  private async parseRequestData(): Promise<string> {
    if (["POST", "PUT", "PATCH"].includes(this.method!.toUpperCase())) {
      return new Promise<string>((resolve, reject) => {
        let parsed: string = "";
        const onData = (chunk: any) => (parsed += chunk.toString());
        const onError = (ex: Error) => reject(new TurboException(500, ex.message));
        const onEnd = () => resolve(parsed);

        this.on("data", onData);
        this.on("end", onEnd);
        this.on("error", onError);
      });
    }
    return "";
  }
}
