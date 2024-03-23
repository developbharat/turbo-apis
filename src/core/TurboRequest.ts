import { IncomingMessage } from "http";
import type { Socket } from "net";

export class TurboRequest extends IncomingMessage {
  // private custom: TurboCustom | null = null;

  protected setInitialOptions(_options: TurboCore.ITurboSetInitialOptions) {
    // this.custom = options.custom;
  }

  public params: Record<string, any> = {};

  constructor(socket: Socket) {
    super(socket);
  }

  public async parse(): Promise<{ customFormat: any }> {
    return { customFormat: "this data is of custom format." };
  }
}
