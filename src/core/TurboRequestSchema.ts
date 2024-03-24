import { Type, type TProperties, type TSchema, type TObject } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import { TurboException } from "./TurboException.js";

export type ITurboRequestSchema = {
  headers: TObject;
  params: TObject;
  data: TObject;
};

export interface IRouteSchemaOptions {
  headers?: TProperties;
  params?: TProperties;
  data?: TSchema;
}

export interface ITurboRequestSchemaData<THeaders = unknown, TParams = unknown, TData = unknown> {
  headers: THeaders;
  params: TParams;
  data: TData;
}

export class TurboRequestSchema {
  private schema: TSchema;
  private checkFunc: <TValue = any>(value: TValue) => Boolean;

  constructor(options?: IRouteSchemaOptions) {
    this.schema = this.optionsToSchema(options);
    this.checkFunc = TypeCompiler.Compile(this.schema)["checkFunc"];
  }

  private optionsToSchema(options: IRouteSchemaOptions = {}): TSchema {
    return Type.Required(
      Type.Object({
        headers: Type.Required(Type.Object(options.headers || {})),
        params: Type.Required(Type.Object(options.params || {})),
        data: !!options.data ? Type.Required(options.data) : Type.Any(),
      }),
    );
  }

  public sanitize<THeaders, TParams, TData>(
    data: ITurboRequestSchemaData,
  ): ITurboRequestSchemaData<THeaders, TParams, TData> {
    return Value.Clean(this.schema, data) as ITurboRequestSchemaData<THeaders, TParams, TData>;
  }

  public isInvalid(data: ITurboRequestSchemaData): TurboException | null {
    // Return Exception if data is invalid
    if (this.checkFunc(data) === false) {
      const error = Value.Errors(this.schema, data).First()!;
      return new TurboException(400, error.message || "Invalid Request data detected.");
    }

    // Return false otherwise
    return null;
  }
}

export const BuildRequestSchema = (options?: IRouteSchemaOptions) => new TurboRequestSchema(options);
