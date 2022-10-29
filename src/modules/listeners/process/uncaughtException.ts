import { err, Listener, ListenerOptions } from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { catchNewError } from "lib/errors/errorHandling";

@ApplyOptions<ListenerOptions>({
   emitter: process,
   event: "uncaughtException",
})
export default class extends Listener {
   public run(error: Error): void {
      if (error.message && error.message.includes("Unknown interaction")) return;

      catchNewError(error);
   }
}
