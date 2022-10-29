import { container } from "@sapphire/pieces";

export class ListenerManager {
   private client = container.client;

   public hasListeners(listenerId: string) {
      if (this.client.listenerCount(listenerId) > 0) return true;
      else return false;
   }

   public emit(listenerId: string, ...args: unknown[]) {
      this.client.emit(listenerId, ...args);
   }
}
